import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

console.log(`Connecting to Supabase at: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseKey);

// SQL Migration
const migrationSQL = `
-- Add is_admin column to profiles table
ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Create index on is_admin for faster queries
CREATE INDEX idx_profiles_is_admin ON profiles(is_admin);
`;

async function runMigration() {
  try {
    console.log('Running migration...');

    // Use RPC to execute raw SQL (note: this requires a service role key)
    // Since we don't have it, we'll use the REST API admin endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/migrations_run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ sql: migrationSQL })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Migration completed successfully!');
    console.log(data);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n⚠️  Note: You need a Service Role Key from Supabase to run migrations via API.');
    console.log('Please follow these steps instead:');
    console.log('1. Go to: https://supabase.com/dashboard');
    console.log('2. Select your project and go to SQL Editor');
    console.log('3. Run the migration SQL manually');
    process.exit(1);
  }
}

runMigration();
