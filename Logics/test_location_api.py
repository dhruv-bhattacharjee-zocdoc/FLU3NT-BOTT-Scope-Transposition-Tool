"""
Test script to fetch location details from API and see all available fields
"""

import requests
import json

# API Endpoint
LOCATION_API = 'https://provider-reference-v1.east.zocdoccloud.com/provider-reference/v1/practice/location~batchGet'

# Sample Practice Cloud ID
PRACTICE_CLOUD_ID = 'pt_7gzlz71zrUWLpb31Rir9Rh'

# Current fields we're fetching
CURRENT_LOCATION_FIELDS = [
    'is_virtual', 'Location Type', 'address_1', 'address_2', 'city', 'state', 'zip',
    'monolith_location_id', 'location_id', 'virtual_visit_type',
    'software', 'software_id', 'hide_on_profile', 'phone', 'email_addresses'
]

def fetch_location_details(cloud_id):
    """
    Fetch location details for a cloud practice ID and return full response
    """
    url = LOCATION_API
    headers = {
        'accept': 'application/json',
        'Content-Type': 'application/json'
    }
    data = {"practice_ids": [cloud_id]}
    
    try:
        response = requests.post(url, headers=headers, json=data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            return result
        else:
            print(f"Failed to fetch locations. Status code: {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"Error fetching locations: {str(e)}")
        return None


def analyze_response(response_data):
    """
    Analyze the API response and identify all available fields
    """
    if not response_data:
        print("No response data to analyze")
        return
    
    print("=" * 80)
    print("API RESPONSE ANALYSIS")
    print("=" * 80)
    print(f"\nFull JSON Response:\n")
    print(json.dumps(response_data, indent=2))
    
    practice_locations = response_data.get('practice_locations', [])
    
    if not practice_locations:
        print("\n⚠️  No locations found in response")
        return
    
    print(f"\n\nFound {len(practice_locations)} location(s)")
    print("=" * 80)
    
    # Analyze all fields in each location
    all_fields = set()
    field_types = {}
    field_examples = {}
    
    for idx, location in enumerate(practice_locations):
        print(f"\n--- Location {idx + 1} ---")
        for key, value in location.items():
            all_fields.add(key)
            
            # Track field types
            value_type = type(value).__name__
            if key not in field_types:
                field_types[key] = value_type
            elif field_types[key] != value_type:
                field_types[key] = f"{field_types[key]} or {value_type}"
            
            # Store example value
            if key not in field_examples:
                if isinstance(value, (list, dict)):
                    field_examples[key] = json.dumps(value)
                else:
                    field_examples[key] = str(value)
            
            # Print field with value
            if isinstance(value, (list, dict)):
                print(f"  {key}: {json.dumps(value)}")
            else:
                print(f"  {key}: {value}")
    
    # Compare with current fields
    print("\n" + "=" * 80)
    print("FIELD COMPARISON")
    print("=" * 80)
    
    # Remove 'Location Type' from current fields as it's derived, not from API
    current_api_fields = [f for f in CURRENT_LOCATION_FIELDS if f != 'Location Type']
    
    print(f"\nCurrent fields we're fetching ({len(current_api_fields)}):")
    for field in current_api_fields:
        status = "✓" if field in all_fields else "✗ NOT FOUND"
        print(f"  {status} {field}")
    
    print(f"\n\nAll fields available in API response ({len(all_fields)}):")
    for field in sorted(all_fields):
        status = "✓ FETCHING" if field in current_api_fields else "✗ MISSING"
        field_type = field_types.get(field, 'unknown')
        example = field_examples.get(field, 'N/A')
        if len(example) > 50:
            example = example[:47] + "..."
        print(f"  {status} {field} ({field_type}): {example}")
    
    # Identify missing fields
    missing_fields = all_fields - set(current_api_fields)
    if missing_fields:
        print(f"\n\n⚠️  MISSING FIELDS ({len(missing_fields)}):")
        for field in sorted(missing_fields):
            field_type = field_types.get(field, 'unknown')
            example = field_examples.get(field, 'N/A')
            if len(example) > 100:
                example = example[:97] + "..."
            print(f"  - {field} ({field_type}): {example}")
    else:
        print("\n\n✓ All available fields are being fetched!")


if __name__ == '__main__':
    print(f"Fetching location details for Practice Cloud ID: {PRACTICE_CLOUD_ID}")
    print("=" * 80)
    
    response = fetch_location_details(PRACTICE_CLOUD_ID)
    
    if response:
        analyze_response(response)
    else:
        print("Failed to fetch location details")

