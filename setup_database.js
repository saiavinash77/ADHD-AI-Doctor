import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:3c2aec854c1e8116b54d2c7d039169aa@ryht7h4q.us-east.database.insforge.app:5432/insforge?sslmode=require';

const schemaSql = `
-- Create table
CREATE TABLE IF NOT EXISTS results (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "totalScore" INTEGER NOT NULL,
    probability TEXT NOT NULL,
    "partAScore" INTEGER NOT NULL,
    "isPartAPositive" BOOLEAN NOT NULL,
    "inattentionScore" INTEGER NOT NULL,
    "hyperactivityScore" INTEGER NOT NULL,
    responses JSONB NOT NULL,
    age INTEGER,
    country TEXT,
    gender TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Drop old policies to avoid duplicates
DROP POLICY IF EXISTS "Allow anonymous or authenticated insert" ON results;
DROP POLICY IF EXISTS "Allow users to select their own results" ON results;
DROP POLICY IF EXISTS "Allow users to delete their own results" ON results;

-- Recreate policies using standard PostgREST auth mappings
CREATE POLICY "Allow anonymous or authenticated insert" 
    ON results FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow users to select their own results" 
    ON results FOR SELECT 
    USING (
        "userId" = auth.uid()::text 
        OR "userId" = (coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{"sub":""}')::jsonb ->> 'sub')
    );

CREATE POLICY "Allow users to delete their own results" 
    ON results FOR DELETE 
    USING (
        "userId" = auth.uid()::text 
        OR "userId" = (coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{"sub":""}')::jsonb ->> 'sub')
    );

-- Create optimized index
CREATE INDEX IF NOT EXISTS results_user_id_idx ON results("userId");
`;

async function main() {
  console.log('Connecting to PostgreSQL database...');
  const client = new pg.Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Successfully connected to Postgres.');
    
    console.log('Executing database migrations...');
    await client.query(schemaSql);
    console.log('Results table and security policies successfully initialized or verified.');
    
  } catch (err) {
    console.error('Error executing database migrations:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
