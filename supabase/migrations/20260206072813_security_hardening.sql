/*
  # Security Hardening

  1. Security Fixes
    - Remove user UPDATE policy on subscriptions table
      Users should not be able to modify their own subscription tier or status.
      Subscription changes should only happen via service_role (admin/webhooks).
    - Add trigger to prevent users from modifying sensitive profile fields
      Users should only be able to update display_name and avatar_url.
      Credits and subscription_tier must only be changed by service_role.

  2. Changes
    - Drop permissive UPDATE policy on subscriptions for authenticated users
    - Create function to protect sensitive profile columns from client-side updates
    - Create trigger on profiles to enforce this protection

  3. Important Notes
    - Service role key bypasses RLS, so admin operations are unaffected
    - The edge function uses service_role for credit deduction (unchanged)
    - Users can still read their subscription (SELECT policy unchanged)
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'subscriptions' AND policyname = 'Users can update own subscription'
  ) THEN
    DROP POLICY "Users can update own subscription" ON subscriptions;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION protect_sensitive_profile_fields()
RETURNS trigger AS $$
BEGIN
  IF current_setting('role', true) != 'service_role' THEN
    NEW.credits := OLD.credits;
    NEW.subscription_tier := OLD.subscription_tier;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'protect_profile_sensitive_fields'
  ) THEN
    CREATE TRIGGER protect_profile_sensitive_fields
      BEFORE UPDATE ON profiles
      FOR EACH ROW
      EXECUTE FUNCTION protect_sensitive_profile_fields();
  END IF;
END $$;
