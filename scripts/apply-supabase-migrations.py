#!/usr/bin/env python3
"""
Aplica todas as migrations do Lovable ao novo projeto Supabase.

Estratégia:
- Conecta direto ao Postgres via psycopg2 (mais confiável que a API HTTP,
  que sofre bloqueio de WAF em sequências de DDL)
- Lê cada arquivo .sql na pasta de migrations (ordem cronológica pelo filename)
- Aplica via cursor.execute em uma transação por migration
- Em caso de erro: rollback, logar, mas continuar para a próxima
"""
import json
import os
import sys
import time
from pathlib import Path

import psycopg2

PROJECT_REF = "jckkbsluvbejioyrlcfo"
DB_PASSWORD = "Xusjft8uads8ctBunX3LRZWgRz97m0Ex"
DB_URL = f"postgresql://postgres.{PROJECT_REF}:{DB_PASSWORD}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"
MIGRATIONS_DIR = Path("/home/z/my-project/.tanstack-old/supabase/migrations")

def main():
    print(f"=== Conectando a {PROJECT_REF}.supabase.co (Postgres pooler) ===")
    try:
        conn = psycopg2.connect(DB_URL, connect_timeout=30)
        conn.autocommit = False
        print(f"✅ Conectado.")
    except Exception as e:
        print(f"❌ Erro de conexão: {e}")
        return 1

    # Lista migrations em ordem cronológica
    files = sorted(MIGRATIONS_DIR.glob("*.sql"))
    print(f"\n=== Encontradas {len(files)} migrations ===\n")

    success = 0
    failed = 0
    skipped = 0
    total_start = time.time()

    for i, fp in enumerate(files, 1):
        name = fp.name
        size = fp.stat().st_size
        print(f"[{i:02d}/{len(files)}] {name}  ({size} bytes)")

        sql = fp.read_text(encoding="utf-8")
        if not sql.strip():
            print(f"  ⚠️  Arquivo vazio — pulando")
            skipped += 1
            continue

        t0 = time.time()
        try:
            cur = conn.cursor()
            # Executa a migration inteira (psycopg2 permite multi-statement)
            cur.execute(sql)
            conn.commit()
            cur.close()
            elapsed = time.time() - t0
            print(f"  ✅ OK em {elapsed:.2f}s")
            success += 1
        except Exception as e:
            conn.rollback()
            elapsed = time.time() - t0
            err_msg = str(e)[:500]
            print(f"  ❌ FALHOU em {elapsed:.2f}s")
            print(f"     → {err_msg}")
            # Continua para a próxima migration
            # Decisão: erros de "already exists" são OK (idempotência),
            # outros erros serão reportados no final
            err_lower = err_msg.lower()
            if "already exists" in err_lower:
                print(f"     → (objeto já existe, continuando)")
            else:
                print(f"     → (continuando para mostrar todos os erros)")
            failed += 1
        print()

    total_elapsed = time.time() - total_start
    print(f"=== Resumo final ===")
    print(f"  ✅ Sucesso:    {success}/{len(files)}")
    print(f"  ❌ Falhou:     {failed}/{len(files)}")
    print(f"  ⏭️  Pulou:       {skipped}/{len(files)}")
    print(f"  ⏱️  Tempo total: {total_elapsed:.1f}s")

    # Verificação: listar tabelas criadas
    print(f"\n=== Verificação: tabelas em public ===")
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT tablename
            FROM pg_tables
            WHERE schemaname = 'public'
            ORDER BY tablename;
        """)
        tables = cur.fetchall()
        print(f"  → {len(tables)} tabelas em public:")
        for (t,) in tables:
            print(f"     • {t}")
        cur.close()
    except Exception as e:
        print(f"  ❌ {e}")

    # Verificação: policies RLS
    print(f"\n=== Verificação: RLS policies ===")
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT tablename, policyname
            FROM pg_policies
            WHERE schemaname = 'public'
            ORDER BY tablename, policyname;
        """)
        policies = cur.fetchall()
        print(f"  → {len(policies)} policies:")
        for tab, pol in policies[:30]:
            print(f"     • {tab}.{pol}")
        if len(policies) > 30:
            print(f"     ... e mais {len(policies)-30}")
        cur.close()
    except Exception as e:
        print(f"  ❌ {e}")

    # Verificação: triggers / functions
    print(f"\n=== Verificação: functions em public ===")
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT routine_name
            FROM information_schema.routines
            WHERE routine_schema = 'public'
            ORDER BY routine_name;
        """)
        funcs = cur.fetchall()
        print(f"  → {len(funcs)} functions:")
        for (f,) in funcs[:20]:
            print(f"     • {f}")
        if len(funcs) > 20:
            print(f"     ... e mais {len(funcs)-20}")
        cur.close()
    except Exception as e:
        print(f"  ❌ {e}")

    conn.close()
    return 0 if failed == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
