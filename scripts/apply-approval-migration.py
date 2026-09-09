#!/usr/bin/env python3
"""Aplica a migration via conexão direta ao Postgres do Supabase."""
import psycopg2
import sys

# Tentar várias conexões
configs = [
    # Session mode pooler
    {
        "host": "aws-0-sa-east-1.pooler.supabase.com",
        "port": 5432,
        "database": "postgres",
        "user": "postgres.jckkbsluvbejioyrlcfo",
        "password": "Silva88677488",
    },
    # Transaction mode pooler
    {
        "host": "aws-0-sa-east-1.pooler.supabase.com",
        "port": 6543,
        "database": "postgres",
        "user": "postgres.jckkbsluvbejioyrlcfo",
        "password": "Silva88677488",
    },
    # Direct connection
    {
        "host": "db.jckkbsluvbejioyrlcfo.supabase.co",
        "port": 5432,
        "database": "postgres",
        "user": "postgres",
        "password": "Silva88677488",
    },
]

conn = None
for i, cfg in enumerate(configs):
    print(f"Tentativa {i+1}: {cfg['user']}@{cfg['host']}:{cfg['port']}")
    try:
        conn = psycopg2.connect(**cfg, connect_timeout=10)
        print(f"  ✅ Conectado!")
        break
    except Exception as e:
        print(f"  ❌ {str(e)[:200]}")

if not conn:
    print("\n❌ Não foi possível conectar. Preciso da senha do banco.")
    sys.exit(1)

# Lê a migration SQL
with open("/home/z/my-project/scripts/migration-approval-portal.sql") as f:
    sql = f.read()

print(f"\nExecutando migration ({len(sql)} bytes)...")

# psycopg2 pode executar múltiplos statements de uma vez
cur = conn.cursor()
try:
    # Execute the entire script. Use autocommit para DDL
    conn.autocommit = True
    cur.execute(sql)
    print("✅ Migration executada com sucesso!")
except Exception as e:
    print(f"❌ Erro: {str(e)[:500]}")
    # Tenta statement por statement
    print("\nTentando statement por statement...")
    conn.autocommit = True
    statements = []
    current = []
    in_dollar = False
    for line in sql.split("\n"):
        current.append(line)
        if "$$" in line:
            in_dollar = not in_dollar
        elif not in_dollar and line.strip().endswith(";"):
            stmt = "\n".join(current).strip()
            if stmt and not all(l.strip().startswith("--") or not l.strip() for l in stmt.split("\n")):
                statements.append(stmt)
            current = []
    
    ok = 0
    errors = []
    for i, stmt in enumerate(statements, 1):
        try:
            cur.execute(stmt)
            ok += 1
        except Exception as e:
            err = str(e)
            if "already exists" in err.lower():
                ok += 1
            else:
                first_line = stmt.split("\n")[0][:80]
                errors.append((i, first_line, err[:200]))
    
    print(f"\n✅ {ok} OK / {len(errors)} erros")
    for i, line, err in errors[:10]:
        print(f"  [{i}] {line}")
        print(f"      {err}")
finally:
    cur.close()
    conn.close()

# Verificação
print("\nVerificando tabelas...")
conn2 = psycopg2.connect(**configs[1] if not configs[1].get('port') == 6543 else configs[0])
conn2.autocommit = True
cur2 = conn2.cursor()
cur2.execute("""
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND (table_name LIKE 'approval%' OR table_name = 'additional_services')
    ORDER BY table_name
""")
tables = [r[0] for r in cur2.fetchall()]
print(f"Tabelas do portal: {tables}")
cur2.close()
conn2.close()
