"""
User Check - Validates Snowflake connection using test NPIs

This script tests if the provided user email and role can successfully connect to Snowflake
and retrieve data using three test NPI numbers. If at least one NPI returns data,
the login information is correct and VPN is connected.
"""

import os
import sys
from pathlib import Path
import snowflake.connector
import pandas as pd
import json

# Test NPIs to validate connection
TEST_NPIS = ['1497385595', '1598486185', '1699260810']

def check_user_connection(user_email, role, force_refresh=False):
    """
    Check if user credentials can connect to Snowflake and retrieve data
    
    Args:
        user_email: User email address (e.g., "dhruv.bhattacharjee@zocdoc.com")
        role: Snowflake role (e.g., "PROVIDER_DATA_OPS_PUNE_ROLE" or "PROD_OPS_PUNE_ROLE")
        force_refresh: If True, forces fresh authentication (bypasses any cached sessions)
    
    Returns:
        dict with keys:
            - success: bool - True if at least one NPI returned data
            - message: str - Success or error message
            - tested_npis: list - List of NPIs that were tested
            - results: dict - Results for each NPI (npi: success/failure)
    """
    try:
        # Connect to Snowflake using SSO (external browser authentication)
        # Note: force_refresh flag is passed to indicate fresh authentication is needed
        # The external browser authenticator will open a new browser window for authentication
        # Each connection attempt will require fresh authentication
        conn = snowflake.connector.connect(
            user=user_email,
            account="OLIKNSY-ZOCDOC_001",
            warehouse="USER_QUERY_WH",
            database='CISTERN',
            schema='PROVIDER_PREFILL',
            role=role,
            authenticator='externalbrowser'
        )
        
        results = {}
        success_count = 0
        
        try:
            cs = conn.cursor()
            
            # Test each NPI
            for npi in TEST_NPIS:
                try:
                    query = f"""
                    SELECT * FROM merged_provider
                    WHERE NPI:value::string = '{npi}'
                    """
                    cs.execute(query)
                    query_results = cs.fetchall()
                    
                    if query_results and len(query_results) > 0:
                        results[npi] = "success"
                        success_count += 1
                    else:
                        results[npi] = "no_data"
                except Exception as e:
                    results[npi] = f"error: {str(e)}"
            
            cs.close()
            
            # If at least one NPI returned data, connection is successful
            if success_count > 0:
                return {
                    "success": True,
                    "message": f"Connection successful! Retrieved data for {success_count} out of {len(TEST_NPIS)} test NPIs.",
                    "tested_npis": TEST_NPIS,
                    "results": results,
                    "success_count": success_count
                }
            else:
                return {
                    "success": False,
                    "message": "Connection established but no data found for any test NPIs. VPN may not be connected or NPIs may not exist.",
                    "tested_npis": TEST_NPIS,
                    "results": results,
                    "success_count": 0
                }
                
        except Exception as e:
            return {
                "success": False,
                "message": f"Query execution failed: {str(e)}",
                "tested_npis": TEST_NPIS,
                "results": {},
                "error": str(e)
            }
        finally:
            conn.close()
            
    except snowflake.connector.errors.DatabaseError as e:
        error_str = str(e)
        # Check for SSO authentication mismatch error
        if "differs from the user currently logged in at the IDP" in error_str or "user you were trying to authenticate as differs" in error_str:
            return {
                "success": False,
                "message": "SSO Authentication Mismatch: The user logged into your browser/IDP is different from the email you entered. Please log out of your current browser session and log back in with the correct account, or use a different browser/incognito window.",
                "tested_npis": TEST_NPIS,
                "results": {},
                "error": error_str,
                "error_type": "sso_mismatch"
            }
        return {
            "success": False,
            "message": f"Database connection failed: {error_str}",
            "tested_npis": TEST_NPIS,
            "results": {},
            "error": error_str
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Unexpected error: {str(e)}",
            "tested_npis": TEST_NPIS,
            "results": {},
            "error": str(e)
        }

if __name__ == '__main__':
    # For testing purposes
    # Get the project root directory (parent of Logics folder)
    LOGICS_DIR = Path(__file__).parent
    PROJECT_ROOT = LOGICS_DIR.parent
    SRC_DIR = PROJECT_ROOT / 'src'
    DATA_DIR = SRC_DIR / 'data'
    USER_INFO_FILE = DATA_DIR / 'userInfo.json'
    
    # Read default values from userInfo.json
    default_email = None
    default_role = None
    if USER_INFO_FILE.exists():
        try:
            with open(USER_INFO_FILE, 'r') as f:
                user_info = json.load(f)
                default_email = user_info.get('email')
                default_role = user_info.get('role')
        except Exception as e:
            print(f"Warning: Could not read userInfo.json: {str(e)}")
    
    if len(sys.argv) >= 3:
        user_email = sys.argv[1]
        role = sys.argv[2]
        result = check_user_connection(user_email, role)
        print(json.dumps(result, indent=2))
    elif default_email and default_role:
        # Use values from userInfo.json if no command-line arguments provided
        print(f"Using credentials from userInfo.json: {default_email} / {default_role}")
        result = check_user_connection(default_email, default_role)
        print(json.dumps(result, indent=2))
    else:
        print("Usage: python usercheck.py <user_email> <role>")
        if default_email and default_role:
            print(f"Example: python usercheck.py {default_email} {default_role}")
        else:
            print("Example: python usercheck.py abc.xyz@zocdoc.com PROD_OPS_PUNE_ROLE")

