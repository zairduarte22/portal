import json
import re
import sys

def parse_sql(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    tables = {}
    
    # Simple regex to find CREATE TABLE statements
    # This might need adjustment depending on the exact pg_dump format
    pattern = re.compile(r'CREATE TABLE ([a-zA-Z0-9_]+) \((.*?)\);', re.DOTALL | re.IGNORECASE)
    
    for match in pattern.finditer(content):
        table_name = match.group(1)
        columns_text = match.group(2)
        
        tables[table_name] = {}
        
        # Split by lines (assuming standard formatting)
        lines = columns_text.strip().split('\n')
        for line in lines:
            line = line.strip()
            if not line or line.startswith('--') or line.startswith('CONSTRAINT') or line.startswith('PRIMARY KEY') or line.startswith('UNIQUE') or line.startswith('FOREIGN KEY'):
                continue
            
            # Remove trailing comma
            if line.endswith(','):
                line = line[:-1]
                
            parts = line.split(maxsplit=2)
            if len(parts) >= 2:
                col_name = parts[0]
                if col_name.startswith('"') and col_name.endswith('"'):
                    col_name = col_name[1:-1]
                
                col_type = parts[1]
                # Try to extract the whole type definition
                tables[table_name][col_name] = line
                
    return tables

def main():
    prod_tables = parse_sql('estructura.sql')
    
    with open('schema_fondo_main.json', 'r', encoding='utf-8') as f:
        local_schema = json.load(f)
        
    local_tables = {}
    for col in local_schema:
        t_name = col['table_name']
        if t_name not in local_tables:
            local_tables[t_name] = {}
        local_tables[t_name][col['column_name']] = col
        
    # Compare
    missing_tables_in_prod = []
    missing_tables_in_local = []
    differences = []
    
    for table_name in local_tables:
        if table_name not in prod_tables:
            missing_tables_in_prod.append(table_name)
        else:
            for col_name in local_tables[table_name]:
                if col_name not in prod_tables[table_name]:
                    differences.append(f"Table {table_name}: Missing column {col_name} in production.")
                    
    for table_name in prod_tables:
        if table_name not in local_tables:
            missing_tables_in_local.append(table_name)
        else:
            for col_name in prod_tables[table_name]:
                if col_name not in local_tables[table_name]:
                    differences.append(f"Table {table_name}: Column {col_name} exists in production but not in local.")
                    
    print("=== Tables Missing in Production ===")
    for t in missing_tables_in_prod:
        print(t)
        
    print("\n=== Tables Missing in Local ===")
    for t in missing_tables_in_local:
        print(t)
        
    print("\n=== Column Differences ===")
    for d in differences:
        print(d)
        
if __name__ == "__main__":
    main()
