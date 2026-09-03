#!/usr/bin/env python3
"""Fix the destructuring pattern in admin pages."""
import re
import os
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
}

ADMIN_DIR = Path("/home/z/my-project/src/app/admin")

def fix_file(filepath):
    with open(filepath, "r") as f:
        content = f.read()
    original = content
    
    # Pattern: const { data } = await fetchAdminData<T>("table", { ... });
    # Or: const { data } = await fetchAdminData<T>("table", { ... })\n (no semicolon)
    # Or multi-line: const { data } = await fetchAdminData<T>("table", {\n  order: ...,\n  limit: N,\n});
    # Or single arg: const { data } = await fetchAdminData<T>("table")
    # Or with limit only: const { data } = await fetchAdminData<T>("table", N)
    
    # Multi-line pattern: const { data } = await fetchAdminData<T>("table", { ... })
    def replace_multiline(match):
        type_param = match.group(1)
        table = match.group(2)
        rest = match.group(3)
        # Extract limit
        limit_match = re.search(r'limit:\s*(\d+)', rest)
        limit = limit_match.group(1) if limit_match else "500"
        type_name = TABLE_TO_TYPE.get(table, table)
        return f'const data = await fetchAdminData<{type_param}>("{type_name}", {limit})'
    
    # Match multi-line patterns
    content = re.sub(
        r'const \{ data \} = await fetchAdminData<(\w+)>\("(\w+)",\s*\{([^}]+)\}\s*\)',
        replace_multiline,
        content,
        flags=re.DOTALL
    )
    
    # Single-arg pattern: const { data } = await fetchAdminData<T>("table")
    def replace_single(match):
        type_param = match.group(1)
        table = match.group(2)
        type_name = TABLE_TO_TYPE.get(table, table)
        return f'const data = await fetchAdminData<{type_param}>("{type_name}")'
    
    content = re.sub(
        r'const \{ data \} = await fetchAdminData<(\w+)>\("(\w+)"\)',
        replace_single,
        content
    )
    
    # Pattern with limit as second arg: const { data } = await fetchAdminData<T>("table", N)
    def replace_with_limit(match):
        type_param = match.group(1)
        table = match.group(2)
        limit = match.group(3)
        type_name = TABLE_TO_TYPE.get(table, table)
        return f'const data = await fetchAdminData<{type_param}>("{type_name}", {limit})'
    
    content = re.sub(
        r'const \{ data \} = await fetchAdminData<(\w+)>\("(\w+)",\s*(\d+)\)',
        replace_with_limit,
        content
    )
    
    # Also handle: const [t, s] = await Promise.all([fetchAdminData<T>("table", {...}), ...])
    # This pattern is harder. Let's just convert the inner call.
    # For now, just handle the array destructuring case for analytics/email/subscriptions/etc.
    # Pattern: const [a, b] = await Promise.all([fetchAdminData<T>("table", { ... }), ...])
    def replace_in_promise_all(match):
        # Find each fetchAdminData call inside Promise.all and replace it
        inner = match.group(0)
        def fix_call(m):
            type_param = m.group(1)
            table = m.group(2)
            rest = m.group(3) or ""
            limit_match = re.search(r'limit:\s*(\d+)', rest)
            limit = limit_match.group(1) if limit_match else "500"
            type_name = TABLE_TO_TYPE.get(table, table)
            return f'fetchAdminData<{type_param}>("{type_name}", {limit})'
        # Match: fetchAdminData<T>("table", {...})
        inner = re.sub(
            r'fetchAdminData<(\w+)>\("(\w+)",\s*\{([^}]*)\}\s*\)',
            fix_call,
            inner,
            flags=re.DOTALL
        )
        # Also: fetchAdminData<T>("table") - no args
        inner = re.sub(
            r'fetchAdminData<(\w+)>\("(\w+)"\)',
            lambda m: f'fetchAdminData<{m.group(1)}>("{TABLE_TO_TYPE.get(m.group(2), m.group(2))}")',
            inner
        )
        return inner
    
    # Match Promise.all([...]) blocks containing fetchAdminData calls
    content = re.sub(
        r'await Promise\.all\(\[[^\]]+\]\)',
        replace_in_promise_all,
        content,
        flags=re.DOTALL
    )
    
    # Also handle the case: const { data: dataVar } = await fetchAdminData<T>("table", {...})
    # Where data is renamed
    # This is rare, skip for now
    
    # Handle single-line pattern that survived: const { data } = await fetchAdminData<T>("table", { ... });
    # Single line (not multiline):
    content = re.sub(
        r'const \{ data \} = await fetchAdminData<(\w+)>\("(\w+)",\s*\{([^}]+)\}\)',
        replace_multiline,
        content
    )
    
    if content != original:
        with open(filepath, "w") as f:
            f.write(content)
        return True
    return False


def main():
    changed = 0
    for root, dirs, files in os.walk(ADMIN_DIR):
        for f in files:
            if f.endswith(".tsx"):
                filepath = os.path.join(root, f)
                if fix_file(filepath):
                    changed += 1
                    print(f"  ✓ {filepath}")
    print(f"\n{changed} files fixed")

if __name__ == "__main__":
    main()
