#!/usr/bin/env python3
"""Apply migration SQL to Supabase via REST API (pg-transaction)."""
import os
import sys
import json
import urllib.request
import urllib.error

# Load env
env = {}
for f in ["/home/z/my-project/.env", "/home/z/my-project/.env.local"]:
    if os.path.exists(f):
        with open(f) as fp:
            for line in fp:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip('"').strip("'")

SUPABASE_URL = env.get("SUPABASE_URL") or env.get("NEXT_PUBLIC_SUPABASE_URL")
SERVICE_KEY = env.get("SUPABASE_SERVICE_ROLE_KEY")
if not SUPABASE_URL or not SERVICE_KEY:
    print("ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    sys.exit(1)

print(f"Supabase URL: {SUPABASE_URL}")
print(f"Service key: {SERVICE_KEY[:20]}...{SERVICE_KEY[-10:]}")

# Read SQL
sql_path = "/home/z/my-project/upload/codigo-01/supabase/migrations/20260903090000_admin_expansion.sql"
with open(sql_path) as f:
    sql = f.read()

print(f"\nSQL size: {len(sql)} bytes")

# Use the /rest/v1/rpc endpoint to execute raw SQL via a custom function
# Actually, Supabase doesn't expose raw SQL execution via REST by default.
# We need to use the pg-meta or apply via psql.
# Let's try the query endpoint at /rest/v1/ with POST and Preheader 'transaction'
# Or use Supabase Management API.

# Best approach: split SQL into individual statements and execute via /rest/v1/rpc
# But that won't work for DDL.

# Try direct connection via the database URL using psycopg2 or supabase-py
try:
    import psycopg2
    print("\nUsing psycopg2 for direct DB connection...")
except ImportError:
    print("\npsycopg2 not available. Trying alternative...")
    psycopg2 = None

if psycopg2:
    # Need direct Postgres connection string
    # Format: postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
    # We don't have the password. Let's try another approach.
    pass

# Alternative: split SQL into individual statements and execute each via Supabase's RPC
# Actually, Supabase has a /pg/query endpoint under the Management API (not the data API)
# But that requires the project's service role and a different URL.

# Best approach: Use fetch() in browser, or use the postgres connection directly.
# Since we don't have DB password, let's try yet another way:
# Use the supabase-py client to execute raw SQL via .rpc() with a custom function.

# Let's create a temporary function first, then call it.
# Actually, we can't CREATE FUNCTION via RPC.

# The cleanest approach is to use the Supabase SQL Editor endpoint
# at https://api.supabase.com/v1/projects/{ref}/database/query
# This requires the user's personal access token, which we don't have.

# Alternative: Execute each statement individually via the /rest/v1/ endpoint
# This won't work for DDL though.

# Let's try with psycopg2 using the connection string from env if available.
conn_string = env.get("DATABASE_URL") or env.get("POSTGRES_URL") or env.get("SUPABASE_DB_URL")
print(f"\nConnection string: {conn_string or 'NOT FOUND'}")

if not conn_string:
    # Try to construct from project ref
    project_ref = "jckkbsluvbejioyrlcfo"
    db_password = env.get("SUPABASE_DB_PASSWORD") or env.get("POSTGRES_PASSWORD")
    if db_password:
        conn_string = f"postgresql://postgres.{project_ref}:{db_password}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"
        print(f"Constructed: {conn_string}")

if conn_string and psycopg2:
    try:
        conn = psycopg2.connect(conn_string)
        conn.autocommit = True
        cur = conn.cursor()
        cur.execute(sql)
        print("\n✅ Migration applied successfully!")
        cur.close()
        conn.close()
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ psycopg2 error: {e}")

# Fallback: Use Supabase's REST API to split into statements and try
# We can use the /rest/v1/rpc endpoint, but only for queries, not DDL.

# Last resort: print instructions for manual application
print("\n⚠️ Could not apply migration automatically.")
print("Please apply manually via Supabase Dashboard > SQL Editor:")
print(f"  File: {sql_path}")
print("\nOr use the Supabase CLI:")
print("  supabase db push")
sys.exit(1)
