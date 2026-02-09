/*
  # Add Subscription System

  1. Changes to Existing Tables
    - `profiles`
      - Add `subscription_tier` column (text, default 'free')
        Tracks the user's current subscription tier for fast lookups

  2. New Tables
    - `subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles, unique per user)
      - `tier` (text) - free, pro, or premium
      - `status` (text) - active, canceled, past_due, trialing
      - `credits_per_month` (integer) - monthly credit allotment based on tier
      - `current_period_start` (timestamptz) - billing period start
      - `current_period_end` (timestamptz) - billing period end
      - `stripe_customer_id` (text, nullable) - for future Stripe integration
      - `stripe_subscription_id` (text, nullable) - for future Stripe integration
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  3. Security
    - Enable RLS on `subscriptions` table
    - Authenticated users can only read their own subscription
    - Authenticated users can only update their own subscription

  4. Automation
    - Trigger to auto-create a free subscription when a new profile is created
    - Backfill existing profiles with free subscriptions

  5. Important Notes
    - Free tier: 50 credits/month
    - Pro tier: 500 credits/month
    - Premium tier: unlimited credits (-1 sentinel value)
    - Stripe fields are nullable and reserved for future payment integration
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_tier'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_tier text NOT NULL DEFAULT 'free';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) UNIQUE,
  tier text NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'premium')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  credits_per_month integer NOT NULL DEFAULT 50,
  current_period_start timestamptz DEFAULT now(),
  current_period_end timestamptz DEFAULT (now() + interval '30 days'),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Users can read own subscription'
  ) THEN
    CREATE POLICY "Users can read own subscription"
      ON subscriptions FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Users can update own subscription'
  ) THEN
    CREATE POLICY "Users can update own subscription"
      ON subscriptions FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

INSERT INTO subscriptions (user_id, tier, status, credits_per_month)
SELECT id, 'free', 'active', 50
FROM profiles
WHERE id NOT IN (SELECT user_id FROM subscriptions)
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION create_subscription_for_new_profile()
RETURNS trigger AS $$
BEGIN
  INSERT INTO subscriptions (user_id, tier, status, credits_per_month)
  VALUES (NEW.id, 'free', 'active', 50);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_profile_created_subscription'
  ) THEN
    CREATE TRIGGER on_profile_created_subscription
      AFTER INSERT ON profiles
      FOR EACH ROW
      EXECUTE FUNCTION create_subscription_for_new_profile();
  END IF;
END $$;
