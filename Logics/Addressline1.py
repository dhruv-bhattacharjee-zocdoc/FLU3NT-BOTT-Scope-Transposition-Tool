"""
Address Line 1 Handler - Handles cases where only Address Line 1 is mapped

When only Address Line 1 is mapped (and Address Line 2, City, State, ZIP are not mapped),
this module ensures that Address Line 1 is not split and remains whole in the Address Line 1 column.
"""

import pandas as pd


def should_skip_address_splitting(location_mappings):
    """
    Determine if Address Line 1 splitting should be skipped.
    
    Splitting should be skipped if:
    - Address Line 1 is mapped
    - AND Address Line 2 is NOT mapped
    - AND City is NOT mapped
    - AND State is NOT mapped
    - AND ZIP is NOT mapped
    
    Args:
        location_mappings: Dictionary mapping location column names (readable names) to source column names
                          e.g., {'Address Line 1': 'Address', 'City': 'City Name'}
    
    Returns:
        Boolean: True if splitting should be skipped, False otherwise
    """
    # Check if Address Line 1 is mapped
    has_address_line1 = 'Address Line 1' in location_mappings
    
    if not has_address_line1:
        # Address Line 1 is not mapped, so splitting logic doesn't apply
        return False
    
    # Check if other address components are mapped
    has_address_line2 = 'Address Line 2' in location_mappings
    has_city = 'City' in location_mappings
    has_state = 'State' in location_mappings
    has_zip = 'ZIP' in location_mappings
    
    # Skip splitting only if Address Line 1 is mapped AND all other components are NOT mapped
    should_skip = has_address_line1 and not has_address_line2 and not has_city and not has_state and not has_zip
    
    return should_skip


def process_address_line1_only(input_df, address_line1_source):
    """
    Process Address Line 1 when it's the only address component mapped.
    Keeps the entire Address Line 1 value without splitting.
    
    Args:
        input_df: DataFrame containing input data from Input.xlsx
        address_line1_source: Name of the source column for Address Line 1
    
    Returns:
        Tuple of (address_line1_values, address_line2_values)
        where address_line1_values contains the full address and address_line2_values is empty
    """
    if address_line1_source not in input_df.columns:
        # Column doesn't exist, return empty lists
        return ([''] * len(input_df), [''] * len(input_df))
    
    address_line1_values = []
    address_line2_values = []
    
    for idx, address_value in input_df[address_line1_source].items():
        # Keep the entire address as Address Line 1, no splitting
        if pd.isna(address_value) or address_value == '':
            address_line1_values.append('')
        else:
            # Keep the full address string, just strip whitespace
            address_str = str(address_value).strip()
            address_line1_values.append(address_str)
        
        # Address Line 2 remains empty
        address_line2_values.append('')
    
    return (address_line1_values, address_line2_values)


if __name__ == '__main__':
    # For testing purposes
    test_mappings_1 = {
        'Address Line 1': 'Address',
        'Practice ID': 'PracticeID'
    }
    test_mappings_2 = {
        'Address Line 1': 'Address',
        'Address Line 2': 'Address2',
        'City': 'CityName'
    }
    
    print(f"Test 1 (only Address Line 1): should_skip = {should_skip_address_splitting(test_mappings_1)}")
    print(f"Test 2 (Address Line 1 + others): should_skip = {should_skip_address_splitting(test_mappings_2)}")

