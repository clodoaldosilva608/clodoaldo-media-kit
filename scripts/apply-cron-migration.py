#!/usr/bin/env python3
"""Apply cron recovery migration to Supabase clodoaldo project."""
import os
import sys
import urllib.request
import json

SUPABASE_URL = "https://jckkbsluvbejioyrlcfo.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impja2tic2x1dmJlamlveXJsY2ZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODIzMDI1OSwiZXhwIjoyMTAzODA2MjU5fQ.tj40ph8vsTCt10-knSs7-wdlsROwZCBXgaQUaAiVWeg"

SQL = """
ALTER TABLE public.abandoned_carts
  ADD COLUMN IF NOT EXISTS recovery_link text,
  ADD COLUMN IF NOT EXISTS recovery_attempted_at timestamptz;

CREATE INDEX IF NOT EXISTS abandoned_carts_recovery_pending_idx
  ON public.abandoned_carts (recovery_email_sent, recovered, created_at DESC)
  WHERE recovered = false AND recovery_email_sent = false;
"""

def main():
    url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
    # Use SQL endpoint via service role
    url2 = f"{SUPABASE_URL}/pg/query"
    
    # Use the SQL via REST endpoint (exec_sql rpc)
    payload = json.dumps({"query": SQL}).encode("utf-8")
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/rpc/exec_sql",
        data=payload,
        headers={
            "Content-Type": "application/json",
            "apikey": SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode()
            print("OK:", body)
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code}: {e.reason}")
        print(e.read().decode())
        # Try alternative: use the /pg endpoint (some Supabase projects expose it)
        print("\nTrying direct pg endpoint...")
        payload2 = json.dumps({"query": SQL}).encode("utf-8")
        req2 = urllib.request.Request(
            f"{SUPABASE_URL}/pg",
            data=payload2,
            headers={
                "Content-Type": "application/json",
                "apikey": SERVICE_ROLE_KEY,
                "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(req2, timeout=30) as resp:
                print("OK:", resp.read().decode())
        except Exception as e2:
            print(f"Also failed: {e2}")
            print("\nPlease apply SQL manually in Supabase SQL Editor:")
            print(SQL)

if __name__ == "__main__":
    main()
