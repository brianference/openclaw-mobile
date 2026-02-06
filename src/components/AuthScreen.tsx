import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/auth';
import { useTheme, Theme } from '../store/theme';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp, isLoading } = useAuthStore();
  const { colors } = useTheme();
  const s = makeStyles(colors);

  const handleSubmit = async () => {
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (!isLogin && !displayName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const result = isLogin
      ? await signIn(email.trim(), password)
      : await signUp(email.trim(), password, displayName.trim());

    if (result.error) {
      setError(result.error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[s.container, { backgroundColor: colors.bg }]}
    >
      <ScrollView
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.header}>
          <View style={[s.logoContainer, { backgroundColor: colors.primaryBg }]}>
            <Ionicons name="flash" size={40} color={colors.primary} />
          </View>
          <Text style={[s.title, { color: colors.text }]}>OpenClaw</Text>
          <Text style={[s.subtitle, { color: colors.textDim }]}>
            {isLogin ? 'Welcome back' : 'Create your account'}
          </Text>
        </View>

        {error && (
          <View style={[s.errorBox, { backgroundColor: colors.errorLight }]}>
            <Ionicons name="alert-circle" size={18} color={colors.error} />
            <Text style={[s.errorText, { color: colors.error }]}>{error}</Text>
          </View>
        )}

        <View style={s.form}>
          {!isLogin && (
            <View style={s.inputGroup}>
              <Text style={[s.label, { color: colors.textDim }]}>Name</Text>
              <View style={[s.inputWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="person-outline" size={18} color={colors.textMuted} style={s.inputIcon} />
                <TextInput
                  style={[s.input, { color: colors.text }]}
                  placeholder="Your name"
                  placeholderTextColor={colors.textMuted}
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>
            </View>
          )}

          <View style={s.inputGroup}>
            <Text style={[s.label, { color: colors.textDim }]}>Email</Text>
            <View style={[s.inputWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="mail-outline" size={18} color={colors.textMuted} style={s.inputIcon} />
              <TextInput
                style={[s.input, { color: colors.text }]}
                placeholder="you@example.com"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
          </View>

          <View style={s.inputGroup}>
            <Text style={[s.label, { color: colors.textDim }]}>Password</Text>
            <View style={[s.inputWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={s.inputIcon} />
              <TextInput
                style={[s.input, { color: colors.text }]}
                placeholder="Min 6 characters"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[s.submitBtn, { backgroundColor: colors.primary }, isLoading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.submitText}>{isLogin ? 'Sign In' : 'Create Account'}</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={s.switchRow}>
          <Text style={[s.switchText, { color: colors.textDim }]}>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
          >
            <Text style={[s.switchLink, { color: colors.primary }]}>
              {isLogin ? 'Sign Up' : 'Sign In'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (colors: Theme) =>
  StyleSheet.create({
    container: { flex: 1 },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: 28,
      paddingVertical: 40,
    },
    header: { alignItems: 'center', marginBottom: 36 },
    logoContainer: {
      width: 80,
      height: 80,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    title: { fontSize: 30, fontWeight: '700', letterSpacing: -0.5 },
    subtitle: { fontSize: 16, marginTop: 6, lineHeight: 24 },
    errorBox: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      borderRadius: 12,
      marginBottom: 20,
      gap: 10,
    },
    errorText: { fontSize: 14, flex: 1, lineHeight: 20 },
    form: { gap: 18 },
    inputGroup: { gap: 6 },
    label: { fontSize: 13, fontWeight: '600', marginLeft: 4 },
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: 14,
      paddingHorizontal: 14,
      height: 52,
    },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: 16, height: '100%' },
    eyeBtn: { padding: 6 },
    submitBtn: {
      height: 52,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 6,
    },
    submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 28,
      gap: 6,
    },
    switchText: { fontSize: 14 },
    switchLink: { fontSize: 14, fontWeight: '600' },
  });
