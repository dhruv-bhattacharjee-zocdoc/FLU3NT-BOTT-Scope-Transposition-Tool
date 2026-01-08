"""
List all available columns in the merged_provider Snowflake table

This script connects to Snowflake and lists all columns available in the merged_provider table.
This helps identify what other entities can be pulled along with FIRST_NAME, LAST_NAME, and SPECIALTIES.
"""

import sys
from pathlib import Path
import snowflake.connector
import json

# Get the project root directory (parent of Logics folder)
LOGICS_DIR = Path(__file__).parent
PROJECT_ROOT = LOGICS_DIR.parent
SRC_DIR = PROJECT_ROOT / 'src'
DATA_DIR = SRC_DIR / 'data'

def list_all_columns(user_email, role):
    """
    List all available columns in the merged_provider table
    
    Args:
        user_email: User email address for Snowflake connection
        role: Snowflake role for connection
    
    Returns:
        List of column names
    """
    try:
        # Connect to Snowflake
        conn = snowflake.connector.connect(
            user=user_email,
            account="OLIKNSY-ZOCDOC_001",
            warehouse="USER_QUERY_WH",
            database='CISTERN',
            schema='PROVIDER_PREFILL',
            role=role,
            authenticator='externalbrowser'
        )
        
        try:
            cs = conn.cursor()
            
            # Query to get column information
            # Using a test NPI to get actual column structure
            test_npi = '1497385595'  # One of the test NPIs
            
            query = f"""
            SELECT * FROM merged_provider
            WHERE NPI:value::string = '{test_npi}'
            LIMIT 1
            """
            
            cs.execute(query)
            results = cs.fetchall()
            
            if results:
                # Get column names from cursor description
                columns = [desc[0] for desc in cs.description]
                return columns
            else:
                print(f"Warning: No data found for test NPI {test_npi}")
                # Try to get column info from INFORMATION_SCHEMA
                query_schema = """
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = 'PROVIDER_PREFILL' 
                AND TABLE_NAME = 'MERGED_PROVIDER'
                ORDER BY ORDINAL_POSITION
                """
                cs.execute(query_schema)
                schema_results = cs.fetchall()
                if schema_results:
                    return [row[0] for row in schema_results]
                return []
            
        finally:
            cs.close()
            conn.close()
            
    except Exception as e:
        print(f"Error connecting to Snowflake: {str(e)}")
        raise

if __name__ == '__main__':
    # Read user email and role from userInfo.json
    user_info_path = DATA_DIR / 'userInfo.json'
    
    if not user_info_path.exists():
        print(f"Error: userInfo.json not found at {user_info_path}")
        print("Please ensure userInfo.json exists with 'email' and 'role' fields")
        sys.exit(1)
    
    try:
        with open(user_info_path, 'r') as f:
            user_info = json.load(f)
        
        user_email = user_info.get('email')
        role = user_info.get('role')
        
        if not user_email or not role:
            print("Error: 'email' and 'role' must be set in userInfo.json")
            sys.exit(1)
        
        print(f"Connecting to Snowflake as {user_email} with role {role}...")
        print("=" * 80)
        
        columns = list_all_columns(user_email, role)
        
        if columns:
            print(f"\nFound {len(columns)} columns in merged_provider table:\n")
            print("-" * 80)
            
            # Group columns by category (if we can identify patterns)
            for i, col in enumerate(columns, 1):
                print(f"{i:3d}. {col}")
            
            print("\n" + "=" * 80)
            print("\nCurrently extracted columns:")
            print("  - NPI")
            print("  - FIRST_NAME")
            print("  - LAST_NAME")
            print("  - SPECIALTIES")
            print("\nOther available columns that could be extracted:")
            other_cols = [col for col in columns if col not in ['NPI', 'FIRST_NAME', 'LAST_NAME', 'SPECIALTIES']]
            for col in other_cols:
                print(f"  - {col}")
        else:
            print("No columns found or unable to connect to Snowflake")
            
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

