# Handoff: Phase 2 - Supabase Integration

**From:** Phase 1 (Vault Encryption - Complete)  
**To:** Phase 2 (Supabase Integration)  
**Date:** 2026-02-13 05:10 MST  
**Status:** Ready to begin

---

## ✅ Prerequisites (Phase 1 Complete)

- ✅ Vault encryption production-ready (PBKDF2 + AES-256-CTR + HMAC)
- ✅ All 22 screens implemented
- ✅ All 16 screens connected to stores
- ✅ Store infrastructure complete (Task, Vault, Settings, Brain)
- ✅ Component library complete (29/29 components)

---

## 🎯 Phase 2 Objectives

Integrate MobileClaw with Supabase backend for:
1. Task synchronization across devices
2. Encrypted vault storage (end-to-end encryption)
3. Real-time updates
4. Offline support
5. Conflict resolution

---

## 📋 Phase 2 Tasks

### Task 1: Supabase Schema Setup (30-60 minutes)

**Goal:** Create database schema for tasks and vault secrets

#### 1.1 Create Tables

**Tasks Table:**
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed')),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  category TEXT,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- RLS Policies
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);
```

**Vault Secrets Table:**
```sql
CREATE TABLE vault_secrets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('login', 'card', 'key', 'note')),
  name TEXT NOT NULL,
  encrypted_data TEXT NOT NULL, -- Contains encrypted JSON
  tags TEXT[], -- Array of tags
  favorite BOOLEAN DEFAULT FALSE,
  last_accessed TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_vault_secrets_user_id ON vault_secrets(user_id);
CREATE INDEX idx_vault_secrets_type ON vault_secrets(type);
CREATE INDEX idx_vault_secrets_tags ON vault_secrets USING GIN(tags);

-- RLS Policies
ALTER TABLE vault_secrets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own secrets"
  ON vault_secrets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own secrets"
  ON vault_secrets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own secrets"
  ON vault_secrets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own secrets"
  ON vault_secrets FOR DELETE
  USING (auth.uid() = user_id);
```

#### 1.2 Create Functions

**Updated At Trigger:**
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vault_secrets_updated_at
  BEFORE UPDATE ON vault_secrets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### Task 2: Update Task Store for Supabase (1-2 hours)

**File:** `/src/store/task.ts`

**Changes needed:**

#### 2.1 Add Supabase Client
```typescript
import { supabase } from '../lib/supabase';

interface TaskState {
  // ... existing state
  syncStatus: 'idle' | 'syncing' | 'error';
  lastSyncTime: number | null;
}
```

#### 2.2 Update `fetchTasks()`
```typescript
fetchTasks: async () => {
  set({ isLoading: true, syncStatus: 'syncing' });
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    set({ 
      tasks: data || [], 
      isLoading: false,
      syncStatus: 'idle',
      lastSyncTime: Date.now(),
    });
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    set({ isLoading: false, syncStatus: 'error' });
  }
}
```

#### 2.3 Update `addTask()`
```typescript
addTask: async (taskData) => {
  const { data, error } = await supabase
    .from('tasks')
    .insert([{
      title: taskData.title,
      description: taskData.description,
      status: taskData.status || 'active',
      priority: taskData.priority,
      category: taskData.category,
      due_date: taskData.dueDate,
    }])
    .select()
    .single();
  
  if (error) throw error;
  
  set((state) => ({
    tasks: [data, ...state.tasks],
  }));
}
```

#### 2.4 Add Real-Time Subscription
```typescript
// Add to store initialization
const subscription = supabase
  .channel('tasks-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'tasks',
  }, (payload) => {
    // Handle INSERT, UPDATE, DELETE
    // Update local state accordingly
  })
  .subscribe();
```

#### 2.5 Add Offline Support
```typescript
// Use optimistic updates
addTask: async (taskData) => {
  const optimisticTask = {
    id: `temp-${Date.now()}`,
    ...taskData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  // Add to local state immediately
  set((state) => ({ tasks: [optimisticTask, ...state.tasks] }));
  
  try {
    // Sync with server
    const { data, error } = await supabase.from('tasks').insert([taskData]).select().single();
    
    if (error) throw error;
    
    // Replace temp with real
    set((state) => ({
      tasks: state.tasks.map(t => t.id === optimisticTask.id ? data : t),
    }));
  } catch (error) {
    // Revert on error
    set((state) => ({
      tasks: state.tasks.filter(t => t.id !== optimisticTask.id),
    }));
    throw error;
  }
}
```

---

### Task 3: Update Vault Store for Supabase (2-3 hours)

**File:** `/src/store/vault.ts`

**Key Principle:** **END-TO-END ENCRYPTION**
- Encrypt data locally before sending to Supabase
- Decrypt data locally after receiving from Supabase
- Server never sees plaintext secrets

**Changes needed:**

#### 3.1 Update `addSecret()`
```typescript
addSecret: async (secretData) => {
  const { encryptionKey } = get();
  if (!encryptionKey) throw new Error('Vault is locked');
  
  // Encrypt sensitive data locally
  const sensitiveData = JSON.stringify({
    username: secretData.username,
    password: secretData.password,
    // ... all sensitive fields
  });
  const encryptedData = await encrypt(sensitiveData, encryptionKey);
  
  // Store encrypted data in Supabase
  const { data, error } = await supabase
    .from('vault_secrets')
    .insert([{
      type: secretData.type,
      name: secretData.name,
      encrypted_data: encryptedData, // ← Encrypted!
      tags: secretData.tags,
      favorite: secretData.favorite,
    }])
    .select()
    .single();
  
  if (error) throw error;
  
  // Update local state with metadata only
  set((state) => ({ secrets: [...state.secrets, data] }));
}
```

#### 3.2 Update `fetchSecrets()`
```typescript
fetchSecrets: async () => {
  const { encryptionKey } = get();
  if (!encryptionKey) throw new Error('Vault is locked');
  
  set({ isLoading: true });
  
  try {
    // Fetch encrypted secrets from Supabase
    const { data, error } = await supabase
      .from('vault_secrets')
      .select('*');
    
    if (error) throw error;
    
    // Store metadata (do NOT decrypt all secrets - decrypt on-demand)
    set({ 
      secrets: data || [],
      isLoading: false,
    });
  } catch (error) {
    console.error('Failed to fetch secrets:', error);
    set({ isLoading: false });
  }
}
```

#### 3.3 Decrypt On-Demand
```typescript
// Only decrypt when user views a secret
getDecryptedSecret: async (secretId: string) => {
  const { encryptionKey, secrets } = get();
  if (!encryptionKey) throw new Error('Vault is locked');
  
  const secret = secrets.find(s => s.id === secretId);
  if (!secret) return null;
  
  try {
    // Decrypt encrypted_data from Supabase
    const decryptedData = await decrypt(secret.encrypted_data, encryptionKey);
    const sensitiveFields = JSON.parse(decryptedData);
    
    return {
      ...secret,
      ...sensitiveFields,
    };
  } catch (error) {
    console.error('Failed to decrypt secret:', error);
    throw new Error('Failed to decrypt secret');
  }
}
```

---

### Task 4: Testing (1 day)

#### 4.1 Manual Testing Checklist
- [ ] Create task → Syncs to Supabase
- [ ] Update task → Syncs to Supabase
- [ ] Delete task → Syncs to Supabase
- [ ] Real-time sync (open 2 devices)
- [ ] Offline mode (airplane mode → works)
- [ ] Conflict resolution (edit same task on 2 devices)
- [ ] Add vault secret → Encrypted in Supabase
- [ ] View vault secret → Decrypts locally
- [ ] Update vault secret → Re-encrypts
- [ ] Delete vault secret → Removed from Supabase

#### 4.2 Security Verification
- [ ] Check Supabase database → All vault data encrypted
- [ ] No plaintext passwords in database
- [ ] RLS policies enforced (can't access other users' data)
- [ ] Encryption key never sent to server

#### 4.3 Performance Testing
- [ ] Large dataset (500+ tasks)
- [ ] Slow network (3G simulation)
- [ ] Offline sync queue
- [ ] Memory usage acceptable

---

## 📚 Reference Files

**Crypto Implementation:**
- `/src/lib/crypto.ts` - Encryption functions

**Stores:**
- `/src/store/task.ts` - Task store (needs Supabase integration)
- `/src/store/vault.ts` - Vault store (needs Supabase integration)

**Supabase Client:**
- `/src/lib/supabase.ts` - Supabase client configuration

**Design Spec:**
- `/root/.openclaw/workspace/projects/mobileclaw/design-spec.md`

**Integration Status:**
- `/root/.openclaw/workspace/projects/mobileclaw/INTEGRATION-STATUS-FINAL.md`

---

## 🚧 Known Considerations

### Authentication
Current status: Anonymous/demo mode  
**Recommendation:** Add Supabase Auth (email/password) before launching

### Conflict Resolution Strategy
**Recommendation:** Last-write-wins (LWW) based on `updated_at` timestamp
- Simple to implement
- Works well for most use cases
- Can upgrade to CRDT later if needed

### Encryption Key Management
**Current:** Key derived from password (in-memory only)  
**Future:** Consider master key rotation feature

### Rate Limiting
**Consideration:** Supabase has rate limits (check plan)  
**Mitigation:** Implement request batching if needed

---

## ✅ Success Criteria

Phase 2 is complete when:
- [ ] Tasks sync to/from Supabase
- [ ] Vault secrets sync encrypted to Supabase
- [ ] Real-time updates working
- [ ] Offline mode with optimistic updates
- [ ] No plaintext secrets in database
- [ ] RLS policies enforced
- [ ] All manual tests passing

---

## ⏱️ Estimated Timeline

**Task 1 (Schema):** 30-60 minutes  
**Task 2 (Task Sync):** 1-2 hours  
**Task 3 (Vault Sync):** 2-3 hours  
**Task 4 (Testing):** 1 day  

**Total:** 1.5-2 days

---

## 🎯 Next Agent Instructions

1. Read this handoff document
2. Review `/src/lib/crypto.ts` to understand encryption
3. Review `/src/store/vault.ts` to understand current implementation
4. Create Supabase schema (Task 1)
5. Update Task store (Task 2)
6. Update Vault store (Task 3)
7. Test everything (Task 4)
8. Update RALPH-STATUS.md with progress

---

*Handoff prepared: 2026-02-13 05:10 MST*  
*Ready for Phase 2: Supabase Integration*
