#!/usr/bin/env python3
"""
Refactor admin pages to use admin API endpoint instead of direct Supabase calls.

Transformations:
1. Replace `safeSelect<T>("table", { order, limit })` with `fetchAdminData<T>("type")`
2. Replace `supabase.from("table").update({...}).eq("id", x.id)` with `adminUpdate("table", x.id, {...})`
3. Replace `supabase.from("table").insert(payload)` with `adminInsert("table", payload)`
4. Replace `supabase.from("table").delete().eq("id", x.id)` with `adminDelete("table", x.id)`
5. Replace `supabase.from("table").upsert(payload)` with `adminUpsert("table", payload)`
6. Update imports to remove supabase-browser and safeSelect, add admin/data imports

The mapping between "table" and "type" is mostly identity, but for some pages it differs:
- orders → orders
- service_queue → queue
- quiz_leads → leads
- service_requests → briefings
- offers → offers
- analytics_events → analytics_events
- coupons → coupons
- testimonials → testimonials
- countdown_campaigns → countdown
- pixel_config → pixels
- whatsapp_config → whatsapp
- affiliates → affiliates
- email_templates → email_templates
- email_subscribers → email_subscribers
- subscription_plans → subscription_plans
- subscriptions → subscriptions
- notifications → notifications
- app_settings → app_settings
- abandoned_carts → abandoned_carts
"""

import re
import os
import sys
from pathlib import Path

TABLE_TO_TYPE = {
    "orders": "orders",
    "service_queue": "queue",
    "quiz_leads": "leads",
    "service_requests": "briefings",
    "offers": "offers",
    "analytics_events": "analytics_events",
    "coupons": "coupons",
    "testimonials": "testimonials",
    "countdown_campaigns": "countdown",
    "pixel_config": "pixels",
    "whatsapp_config": "whatsapp",
    "affiliates": "affiliates",
    "email_templates": "email_templates",
    "email_subscribers": "email_subscribers",
    "subscription_plans": "subscription_plans",
    "subscriptions": "subscriptions",
    "notifications": "notifications",
    "app_settings": "app_settings",
    "abandoned_carts": "abandoned_carts",
    "affiliate_sales": "affiliate_sales",
    "user_roles": "user_roles",
    "knowledge_items": "knowledge_items",
    "supporters": "supporters",
    "service_capacity": "service_capacity",
}

ADMIN_DIR = Path("/home/z/my-project/src/app/admin")

def transform_file(filepath: str) -> bool:
    with open(filepath, "r") as f:
        content = f.read()
    original = content

    # 1. Replace safeSelect call patterns
    # Pattern: safeSelect<Type>("table", { order: { column: "...", ascending: ... }, limit: N })
    # Or simpler: safeSelect<Type>("table", { order: {...}, limit: N })
    # Or just: safeSelect<Type>("table")
    # The fetchAdminData signature is just fetchAdminData<Type>("type", limit=500)
    
    def replace_safeselect(match):
        type_param = match.group(1)
        table = match.group(2)
        rest = match.group(3) or ""
        # Extract limit from rest if present
        limit_match = re.search(r'limit:\s*(\d+)', rest)
        limit = limit_match.group(1) if limit_match else "500"
        type_name = TABLE_TO_TYPE.get(table, table)
        return f'fetchAdminData<{type_param}>("{type_name}", {limit})'
    
    # Match: safeSelect<T>("table", {...}) or safeSelect<T>("table")
    content = re.sub(
        r'safeSelect<(\w+)>\(\s*"(\w+)"\s*(?:,\s*\{([^}]*)\})?\s*\)',
        replace_safeselect,
        content
    )
    # Also handle without type parameter: safeSelect("table", {...})
    def replace_safeselect_notype(match):
        table = match.group(1)
        rest = match.group(2) or ""
        limit_match = re.search(r'limit:\s*(\d+)', rest)
        limit = limit_match.group(1) if limit_match else "500"
        type_name = TABLE_TO_TYPE.get(table, table)
        return f'fetchAdminData("{type_name}", {limit})'
    content = re.sub(
        r'safeSelect\(\s*"(\w+)"\s*(?:,\s*\{([^}]*)\})?\s*\)',
        replace_safeselect_notype,
        content
    )

    # 2. Replace supabase.from("table").update(payload).eq("id", x.id)
    # Pattern: await supabase.from("TABLE").update(PAYLOAD).eq("id", ID)
    def replace_update(match):
        table = match.group(1)
        payload = match.group(2)
        id_expr = match.group(3)
        type_name = TABLE_TO_TYPE.get(table, table)
        return f'adminUpdate("{type_name}", {id_expr}, {payload})'
    content = re.sub(
        r'await supabase\.from\("(\w+)"\)\.update\(([^)]+(?:\([^)]*\))?[^)]*)\)\.eq\("id",\s*([^)]+)\)',
        replace_update,
        content
    )

    # 3. Replace supabase.from("table").insert(payload)
    def replace_insert(match):
        table = match.group(1)
        payload = match.group(2)
        type_name = TABLE_TO_TYPE.get(table, table)
        return f'adminInsert("{type_name}", {payload})'
    content = re.sub(
        r'await supabase\.from\("(\w+)"\)\.insert\(([^)]+(?:\([^)]*\))?[^)]*)\)(?!\s*\.select)',
        replace_insert,
        content
    )
    # Also handle insert(...).select().single() pattern - more complex
    content = re.sub(
        r'await supabase\.from\("(\w+)"\)\.insert\(([^)]+(?:\([^)]*\))?[^)]*)\)\.select\(\)\.single\(\)',
        lambda m: f'adminInsert("{TABLE_TO_TYPE.get(m.group(1), m.group(1))}", {m.group(2)})',
        content
    )

    # 4. Replace supabase.from("table").delete().eq("id", x.id)
    def replace_delete(match):
        table = match.group(1)
        id_expr = match.group(2)
        type_name = TABLE_TO_TYPE.get(table, table)
        return f'adminDelete("{type_name}", {id_expr})'
    content = re.sub(
        r'await supabase\.from\("(\w+)"\)\.delete\(\)\.eq\("id",\s*([^)]+)\)',
        replace_delete,
        content
    )

    # 5. Replace supabase.from("table").upsert(payload)
    content = re.sub(
        r'await supabase\.from\("(\w+)"\)\.upsert\(([^)]+(?:\([^)]*\))?[^)]*)\)',
        lambda m: f'adminUpsert("{TABLE_TO_TYPE.get(m.group(1), m.group(1))}", {m.group(2)})',
        content
    )

    # 6. Handle the `.then(() => {}, () => {})` cleanup pattern for fire-and-forget inserts
    # We can leave these as-is since they're now no-ops
    
    # 7. Update imports - remove supabase-browser, update admin/data import
    # Remove: import { supabase } from "@/lib/supabase-browser";
    content = re.sub(
        r'import\s*\{\s*supabase\s*\}\s*from\s*"@/lib/supabase-browser";?\n',
        '',
        content
    )
    # Update admin/data import to include new functions
    # If we used adminInsert/adminUpdate/adminDelete/adminUpsert, add them to imports
    needs_insert = 'adminInsert(' in content
    needs_update = 'adminUpdate(' in content
    needs_delete = 'adminDelete(' in content
    needs_upsert = 'adminUpsert(' in content
    needs_fetch = 'fetchAdminData(' in content
    
    needed = []
    if needs_fetch: needed.append('fetchAdminData')
    if needs_insert: needed.append('adminInsert')
    if needs_update: needed.append('adminUpdate')
    if needs_delete: needed.append('adminDelete')
    if needs_upsert: needed.append('adminUpsert')
    
    if needed:
        needed_str = ', '.join(needed)
        # Check if there's an existing admin/data import
        existing_import = re.search(r'import\s*\{([^}]+)\}\s*from\s*"@/lib/admin/data";', content)
        if existing_import:
            # Merge with existing
            existing_items = [s.strip() for s in existing_import.group(1).split(',')]
            all_items = sorted(set(existing_items + needed))
            content = re.sub(
                r'import\s*\{[^}]+\}\s*from\s*"@/lib/admin/data";',
                f'import {{ {", ".join(all_items)} }} from "@/lib/admin/data";',
                content
            )
        else:
            # Add new import after the first import line
            content = re.sub(
                r'(import [^\n]+;\n)',
                r'\1' + f'import {{ {needed_str} }} from "@/lib/admin/data";\n',
                content,
                count=1
            )

    # Remove now-unused imports (brl, timeAgo, etc. are still used)
    # We need to check what's still used
    
    if content != original:
        with open(filepath, "w") as f:
            f.write(content)
        return True
    return False


def main():
    admin_files = []
    for root, dirs, files in os.walk(ADMIN_DIR):
        for f in files:
            if f.endswith(".tsx"):
                admin_files.append(os.path.join(root, f))
    
    changed = 0
    for filepath in admin_files:
        if transform_file(filepath):
            changed += 1
            print(f"  ✓ {filepath}")
    
    print(f"\n{changed}/{len(admin_files)} files transformed")

if __name__ == "__main__":
    main()
