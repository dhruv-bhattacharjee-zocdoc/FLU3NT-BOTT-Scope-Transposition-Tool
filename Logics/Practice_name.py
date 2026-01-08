"""
Practice Name/ID Management Module

This module handles manual Practice ID entries and displays them in the Practice tile.
It extracts Practice IDs from manual entry and processes them for display.
It also calls the Zocdoc API to get practice information.
"""

import re
import requests
from pathlib import Path

# Directory paths
LOGICS_DIR = Path(__file__).parent
PROJECT_ROOT = LOGICS_DIR.parent
BACKEND_DIR = PROJECT_ROOT / 'backend'
EXCEL_FILES_DIR = BACKEND_DIR / 'Excel Files'

# API Endpoints
PRACTICE_IDS_API = 'https://provider-reference-v1.east.zocdoccloud.com/provider-reference/v1/practice/ids-by-monolith-ids~batchGet'
PRACTICE_DETAILS_API = 'https://provider-reference-v1.east.zocdoccloud.com/provider-reference/v1/practice~batchGet'


def extract_manual_practice_ids(manual_practice_ids_string):
    """
    Extract and parse manual Practice IDs from a string input.
    
    Supports comma, semicolon, or space-separated values.
    
    Args:
        manual_practice_ids_string: String containing Practice IDs separated by comma, semicolon, or space
        
    Returns:
        List of unique Practice IDs (as strings)
    """
    if not manual_practice_ids_string or not manual_practice_ids_string.strip():
        return []
    
    # Split by comma, semicolon, or whitespace
    parsed_ids = re.split(r'[,;\s]+', manual_practice_ids_string.strip())
    
    # Clean and filter IDs
    practice_ids = []
    for pid in parsed_ids:
        pid = pid.strip()
        if pid:
            # Remove .0 suffix if present
            pid = re.sub(r'\.0$', '', pid)
            if pid and pid not in practice_ids:
                practice_ids.append(pid)
    
    return practice_ids


def get_practice_ids_for_display(mappings_df=None, input_df=None, manual_practice_ids=''):
    """
    Get all Practice IDs (from mapped columns and manual entry) for display in the Practice tile.
    
    Args:
        mappings_df: DataFrame containing mappings from Mappings.xlsx (optional)
        input_df: DataFrame containing input data from Input.xlsx (optional)
        manual_practice_ids: String of manually entered Practice IDs (comma, semicolon, or space separated)
        
    Returns:
        Dictionary with:
            - 'practice_ids': List of Practice IDs from mapped column
            - 'manual_ids': List of manually entered Practice IDs
            - 'total_count': Total unique Practice IDs
            - 'display_text': Formatted text for display
    """
    practice_ids_from_column = []
    manual_ids = []
    
    # Extract Practice IDs from mapped column if mappings and input data are provided
    if mappings_df is not None and input_df is not None:
        # Find Practice ID mapping
        practice_id_column = None
        
        for _, row in mappings_df.iterrows():
            detected_as = str(row['Detected As']).strip()
            column_name = str(row['Column Name']).strip()
            
            # Handle multiple mappings (comma-separated in Detected As)
            detected_as_list = [d.strip() for d in detected_as.split(',')]
            
            for detected in detected_as_list:
                detected_normalized = detected.strip()
                
                # Check if this is Practice ID mapping
                if detected_normalized == 'Practice ID' or detected_normalized.lower() == 'practiceid' or detected_normalized.lower() == 'practice id':
                    practice_id_column = column_name
                    break
            
            if practice_id_column:
                break
        
        # Get Practice IDs from mapped column if exists
        if practice_id_column and practice_id_column in input_df.columns:
            practice_ids = input_df[practice_id_column].dropna().astype(str).str.strip()
            practice_ids = practice_ids[practice_ids != '']
            practice_ids = practice_ids.str.replace(r'\.0$', '', regex=True)
            practice_ids_from_column = practice_ids.unique().tolist()
    
    # Extract manual Practice IDs
    if manual_practice_ids and manual_practice_ids.strip():
        manual_ids = extract_manual_practice_ids(manual_practice_ids)
    
    # Combine and get unique values
    all_practice_ids = list(set(practice_ids_from_column + manual_ids))
    total_count = len(all_practice_ids)
    
    # Create display text
    if total_count == 0:
        display_text = "No Practice IDs"
    elif total_count == 1:
        display_text = f"1 Practice ID: {all_practice_ids[0]}"
    elif total_count <= 3:
        display_text = f"{total_count} Practice IDs: {', '.join(all_practice_ids)}"
    else:
        display_text = f"{total_count} Practice IDs: {', '.join(all_practice_ids[:3])}..."
    
    return {
        'practice_ids': practice_ids_from_column,
        'manual_ids': manual_ids,
        'all_ids': all_practice_ids,
        'total_count': total_count,
        'display_text': display_text
    }


def get_practice_info_from_api(practice_ids):
    """
    Call the Zocdoc API to get practice information for given Practice IDs.
    
    Args:
        practice_ids: List of Practice IDs (monolith IDs) as strings or integers
        
    Returns:
        Dictionary with:
            - 'success': Boolean indicating if API call was successful
            - 'data': List of practice information from API response
            - 'error': Error message if API call failed
            - 'practice_map': Dictionary mapping monolith_id -> cloud_id
    """
    if not practice_ids:
        return {
            'success': False,
            'data': [],
            'error': 'No Practice IDs provided',
            'practice_map': {}
        }
    
    # Convert all IDs to strings and filter out empty values
    practice_ids = [str(pid).strip() for pid in practice_ids if str(pid).strip()]
    
    if not practice_ids:
        return {
            'success': False,
            'data': [],
            'error': 'No valid Practice IDs provided',
            'practice_map': {}
        }
    
    url = PRACTICE_IDS_API
    headers = {
        'accept': 'application/json',
        'Content-Type': 'application/json'
    }
    data = {
        "monolith_practice_ids": practice_ids
    }
    
    try:
        response = requests.post(url, headers=headers, json=data, timeout=30)
        response.raise_for_status()
        
        api_data = response.json()
        
        # Create mapping of monolith_id -> cloud_id
        # API response can be a list directly or a dict with 'practice_ids' key
        practice_map = {}
        practice_list = []
        
        if isinstance(api_data, list):
            # Direct list response
            practice_list = api_data
        elif isinstance(api_data, dict):
            # Check for 'practice_ids' key (as seen in fetch_practice_locations.py)
            if 'practice_ids' in api_data:
                practice_list = api_data['practice_ids']
            # If it's a dict but no 'practice_ids' key, try to use the dict itself as a single item
            elif 'monolith_practice_id' in api_data or 'practice_id' in api_data:
                practice_list = [api_data]
        
        for item in practice_list:
            monolith_id = str(item.get('monolith_practice_id', ''))
            cloud_id = item.get('practice_id', '')
            if monolith_id:
                practice_map[monolith_id] = cloud_id
        
        return {
            'success': True,
            'data': practice_list,
            'error': None,
            'practice_map': practice_map
        }
    except requests.exceptions.RequestException as e:
        return {
            'success': False,
            'data': [],
            'error': f'API request failed: {str(e)}',
            'practice_map': {}
        }
    except Exception as e:
        return {
            'success': False,
            'data': [],
            'error': f'Unexpected error: {str(e)}',
            'practice_map': {}
        }


def get_practice_details_from_api(cloud_ids):
    """
    Call the Zocdoc API to get practice details (including name) for given Cloud IDs.
    
    Args:
        cloud_ids: List of Practice Cloud IDs (format: pt_xxxxx)
        
    Returns:
        Dictionary with:
            - 'success': Boolean indicating if API call was successful
            - 'data': List of practice details from API response
            - 'error': Error message if API call failed
            - 'practice_names': Dictionary mapping cloud_id -> practice_name
    """
    if not cloud_ids:
        return {
            'success': False,
            'data': [],
            'error': 'No Cloud IDs provided',
            'practice_names': {}
        }
    
    # Filter to only valid Cloud IDs (starting with 'pt_')
    valid_cloud_ids = [cid for cid in cloud_ids if str(cid).strip().startswith('pt_')]
    
    if not valid_cloud_ids:
        return {
            'success': False,
            'data': [],
            'error': 'No valid Cloud IDs provided (must start with pt_)',
            'practice_names': {}
        }
    
    url = PRACTICE_DETAILS_API
    headers = {
        'accept': 'application/json',
        'Content-Type': 'application/json'
    }
    data = {
        "practice_ids": valid_cloud_ids
    }
    
    try:
        response = requests.post(url, headers=headers, json=data, timeout=30)
        response.raise_for_status()
        
        api_data = response.json()
        
        # Extract practice names
        practice_names = {}
        practices_list = []
        
        if isinstance(api_data, dict) and 'practices' in api_data:
            practices_list = api_data['practices']
        elif isinstance(api_data, list):
            practices_list = api_data
        
        for practice in practices_list:
            cloud_id = practice.get('practice_id', '')
            practice_name = practice.get('name', '')
            if cloud_id and practice_name:
                practice_names[cloud_id] = practice_name
        
        return {
            'success': True,
            'data': practices_list,
            'error': None,
            'practice_names': practice_names
        }
    except requests.exceptions.RequestException as e:
        return {
            'success': False,
            'data': [],
            'error': f'API request failed: {str(e)}',
            'practice_names': {}
        }
    except Exception as e:
        return {
            'success': False,
            'data': [],
            'error': f'Unexpected error: {str(e)}',
            'practice_names': {}
        }


def get_practice_display_info(manual_practice_ids=''):
    """
    Get practice information for manual Practice IDs and format for display.
    This function chains two API calls:
    1. Convert monolith IDs to Cloud IDs (if needed)
    2. Get practice details (including name) from Cloud IDs
    
    If the entered IDs are already Cloud IDs (start with 'pt_'), it skips step 1.
    
    Args:
        manual_practice_ids: String of manually entered Practice IDs (comma, semicolon, or space separated)
                            Can be monolith IDs or Cloud IDs (starting with 'pt_')
        
    Returns:
        Dictionary with display information including API response and practice names
    """
    # Extract Practice IDs
    practice_ids = extract_manual_practice_ids(manual_practice_ids) if manual_practice_ids else []
    
    if not practice_ids:
        return {
            'practice_ids': [],
            'total_count': 0,
            'display_text': 'No Practice IDs',
            'api_success': False,
            'api_data': None,
            'practice_map': {},
            'practice_names': {}
        }
    
    # Check if entered IDs are Cloud IDs (start with 'pt_')
    cloud_ids_direct = [pid for pid in practice_ids if str(pid).strip().startswith('pt_')]
    monolith_ids = [pid for pid in practice_ids if not str(pid).strip().startswith('pt_')]
    
    practice_names = {}
    api_result = {'success': False, 'data': [], 'practice_map': {}}
    
    # If we have Cloud IDs directly, skip the first API call
    if cloud_ids_direct:
        # Directly use Cloud IDs for the second API call
        details_result = get_practice_details_from_api(cloud_ids_direct)
        if details_result['success']:
            practice_names = details_result['practice_names']
            api_result['success'] = True
            # Create a mock data structure for display
            for cloud_id in cloud_ids_direct:
                api_result['data'].append({
                    'monolith_practice_id': None,
                    'practice_id': cloud_id
                })
                api_result['practice_map'][cloud_id] = cloud_id
    
    # If we have monolith IDs, convert them to Cloud IDs first
    if monolith_ids:
        # Step 1: Call API to convert monolith IDs to Cloud IDs
        monolith_api_result = get_practice_info_from_api(monolith_ids)
        
        if monolith_api_result['success']:
            api_result['success'] = True
            api_result['data'].extend(monolith_api_result['data'])
            api_result['practice_map'].update(monolith_api_result['practice_map'])
            
            # Step 2: Get Cloud IDs from conversion and call second API
            converted_cloud_ids = list(monolith_api_result['practice_map'].values())
            if converted_cloud_ids:
                details_result = get_practice_details_from_api(converted_cloud_ids)
                if details_result['success']:
                    # Merge practice names
                    practice_names.update(details_result['practice_names'])
    
    # Format display text
    # Collect all Cloud IDs (from direct entry and conversion)
    all_cloud_ids = []
    if cloud_ids_direct:
        all_cloud_ids.extend(cloud_ids_direct)
    if api_result['practice_map']:
        all_cloud_ids.extend([cid for cid in api_result['practice_map'].values() if cid not in all_cloud_ids])
    
    if practice_names:
        # Show practice names if available
        practice_info = []
        for cloud_id in all_cloud_ids:
            if cloud_id in practice_names:
                practice_info.append(practice_names[cloud_id])
        
        if practice_info:
            # Show first few practices
            if len(practice_info) == 1:
                display_text = practice_info[0]
            elif len(practice_info) <= 2:
                display_text = ', '.join(practice_info)
            else:
                display_text = f"{', '.join(practice_info[:2])}... (+{len(practice_info) - 2} more)"
        else:
            # Fallback if no names found
            display_text = f"{len(practice_ids)} Practice ID(s): {', '.join(practice_ids[:3])}"
            if len(practice_ids) > 3:
                display_text += "..."
    elif api_result['success'] and api_result['data']:
        # Show Cloud IDs if conversion was successful but names not available
        practice_info = []
        for item in api_result['data']:
            cloud_id = item.get('practice_id', '')
            if cloud_id:
                practice_info.append(cloud_id)
        
        if practice_info:
            if len(practice_info) == 1:
                display_text = practice_info[0]
            elif len(practice_info) <= 2:
                display_text = ', '.join(practice_info)
            else:
                display_text = f"{', '.join(practice_info[:2])}... (+{len(practice_info) - 2} more)"
        else:
            display_text = f"{len(practice_ids)} Practice ID(s): {', '.join(practice_ids[:3])}"
            if len(practice_ids) > 3:
                display_text += "..."
    else:
        # Fallback to showing just IDs if API fails
        display_text = f"{len(practice_ids)} Practice ID(s): {', '.join(practice_ids[:3])}"
        if len(practice_ids) > 3:
            display_text += "..."
    
    return {
        'practice_ids': practice_ids,
        'total_count': len(practice_ids),
        'display_text': display_text,
        'api_success': api_result['success'],
        'api_data': api_result['data'],
        'practice_map': api_result['practice_map'],
        'practice_names': practice_names,
        'api_error': api_result.get('error')
    }


if __name__ == '__main__':
    # Test the functions
    test_manual = "12345, 67890; 11111 22222"
    result = extract_manual_practice_ids(test_manual)
    print(f"Extracted IDs: {result}")
    
    display_info = get_practice_ids_for_display(manual_practice_ids=test_manual)
    print(f"Display info: {display_info}")
    
    # Test API call
    api_info = get_practice_display_info(test_manual)
    print(f"API info: {api_info}")

