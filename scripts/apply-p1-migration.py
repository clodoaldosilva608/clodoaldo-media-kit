#!/usr/bin/env python3
"""Apply P1 audit migration to Supabase."""
import os, sys, urllib.parse, psycopg2

DATABASE_URL = "postgresql://postgres.pjetmhsevohaqtqfbxrr:Silva88677488@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"

sql_path = os.path.join(os.path.dirname(__file__), "migration-audit-p1.sql")
with open(sql_path) as f:
    sql = f.read()

print(f"[1/3] Connecting to Supabase…")
conn = psycopg2.connect(DATABASE_URL)
conn.autocommit = True
cur = conn.cursor()
print(f"[2/3] Applying migration ({len(sql)} chars)…")
cur.execute(sql)
print(f"[3/3] Done. Verifying tables:")
cur.execute("""
  SELECT 'lead_tasks' AS t, COUNT(*) FROM lead_tasks
  UNION ALL SELECT 'lead_history', COUNT(*) FROM lead_history
  UNION ALL SELECT 'audit_logs', COUNT(*) FROM audit_logs
  UNION ALL SELECT 'payment_events', COUNT(*) FROM payment_events
""")
for row in cur.fetchall():
    print(f"  • {row[0]}: {row[1]} rows")
cur.close()
conn.close()
print("OK")
