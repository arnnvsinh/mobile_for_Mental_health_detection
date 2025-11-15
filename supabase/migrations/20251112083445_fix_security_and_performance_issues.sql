/*
  # Fix Security and Performance Issues

  ## Overview
  This migration resolves multiple security and performance issues:
  1. Optimizes RLS policies to cache auth.uid() instead of re-evaluating per row
  2. Adds missing index on foreign key for health_metrics.device_id
  3. Removes unused indexes that were created prematurely

  ## Issues Fixed

  ### RLS Performance Optimization
  All RLS policies now use `(select auth.uid())` instead of direct `auth.uid()` calls.
  This caches the user ID at the statement level instead of re-evaluating per row,
  significantly improving query performance at scale.

  ### Foreign Key Indexing
  Added covering index on health_metrics(device_id) to support foreign key constraint
  and improve join performance.

  ### Index Cleanup
  Removed unused indexes created in initial schema. These will be recreated if queries
  demonstrate they are necessary.

  ## Security
  - Password compromise checking via HaveIBeenPwned integration is enabled at the
    authentication provider level (not required in migrations)
  - All RLS policies remain restrictive and properly enforce data access control
*/

-- Drop unused indexes to reduce maintenance overhead
DROP INDEX IF EXISTS idx_iot_devices_user_id;
DROP INDEX IF EXISTS idx_iot_devices_is_active;
DROP INDEX IF EXISTS idx_health_metrics_user_id;
DROP INDEX IF EXISTS idx_health_metrics_recorded_at;
DROP INDEX IF EXISTS idx_health_metrics_type;
DROP INDEX IF EXISTS idx_mood_entries_user_id;
DROP INDEX IF EXISTS idx_mood_entries_recorded_at;
DROP INDEX IF EXISTS idx_pattern_insights_user_id;
DROP INDEX IF EXISTS idx_pattern_insights_is_read;
DROP INDEX IF EXISTS idx_pattern_insights_severity;
DROP INDEX IF EXISTS idx_resources_category;
DROP INDEX IF EXISTS idx_user_resource_interactions_user_id;
DROP INDEX IF EXISTS idx_user_resource_interactions_resource_id;
DROP INDEX IF EXISTS idx_alert_history_user_id;
DROP INDEX IF EXISTS idx_alert_history_created_at;

-- Add covering index for foreign key on health_metrics
CREATE INDEX IF NOT EXISTS idx_health_metrics_device_id ON health_metrics(device_id);

-- Drop and recreate RLS policies for profiles with optimized auth.uid() calls
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

-- Drop and recreate RLS policies for iot_devices with optimized auth.uid() calls
DROP POLICY IF EXISTS "Users can view own devices" ON iot_devices;
CREATE POLICY "Users can view own devices"
  ON iot_devices FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own devices" ON iot_devices;
CREATE POLICY "Users can insert own devices"
  ON iot_devices FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own devices" ON iot_devices;
CREATE POLICY "Users can update own devices"
  ON iot_devices FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own devices" ON iot_devices;
CREATE POLICY "Users can delete own devices"
  ON iot_devices FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Drop and recreate RLS policies for health_metrics with optimized auth.uid() calls
DROP POLICY IF EXISTS "Users can view own health metrics" ON health_metrics;
CREATE POLICY "Users can view own health metrics"
  ON health_metrics FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own health metrics" ON health_metrics;
CREATE POLICY "Users can insert own health metrics"
  ON health_metrics FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- Drop and recreate RLS policies for mood_entries with optimized auth.uid() calls
DROP POLICY IF EXISTS "Users can view own mood entries" ON mood_entries;
CREATE POLICY "Users can view own mood entries"
  ON mood_entries FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own mood entries" ON mood_entries;
CREATE POLICY "Users can insert own mood entries"
  ON mood_entries FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own mood entries" ON mood_entries;
CREATE POLICY "Users can update own mood entries"
  ON mood_entries FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own mood entries" ON mood_entries;
CREATE POLICY "Users can delete own mood entries"
  ON mood_entries FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Drop and recreate RLS policies for pattern_insights with optimized auth.uid() calls
DROP POLICY IF EXISTS "Users can view own insights" ON pattern_insights;
CREATE POLICY "Users can view own insights"
  ON pattern_insights FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own insights" ON pattern_insights;
CREATE POLICY "Users can update own insights"
  ON pattern_insights FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Drop and recreate RLS policies for user_resource_interactions with optimized auth.uid() calls
DROP POLICY IF EXISTS "Users can view own resource interactions" ON user_resource_interactions;
CREATE POLICY "Users can view own resource interactions"
  ON user_resource_interactions FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own resource interactions" ON user_resource_interactions;
CREATE POLICY "Users can insert own resource interactions"
  ON user_resource_interactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- Drop and recreate RLS policies for alert_history with optimized auth.uid() calls
DROP POLICY IF EXISTS "Users can view own alerts" ON alert_history;
CREATE POLICY "Users can view own alerts"
  ON alert_history FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own alerts" ON alert_history;
CREATE POLICY "Users can update own alerts"
  ON alert_history FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));