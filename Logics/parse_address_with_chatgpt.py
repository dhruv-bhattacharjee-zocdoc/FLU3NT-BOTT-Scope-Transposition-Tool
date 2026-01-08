"""
Address Parsing with ChatGPT API

This module takes Address Line 1 column values and uses ChatGPT API to parse them
into structured components: Address Line 1, Address Line 2, City, State, Zip.

Example:
    Input: "3723 West 12600 South, Suite 360 Riverton UT 84065"
    Output: "3723 West 12600 South,Suite 360,Riverton,UT,84065"
"""

import os
import requests
import json
from pathlib import Path
from typing import List, Tuple, Optional
import pandas as pd

# Directory paths
LOGICS_DIR = Path(__file__).parent
PROJECT_ROOT = LOGICS_DIR.parent
BACKEND_DIR = PROJECT_ROOT / 'backend'
EXCEL_FILES_DIR = BACKEND_DIR / 'Excel Files'

# OpenAI API Configuration
OPENAI_API_KEY = "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"
OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"

# Model to use
MODEL = "gpt-4o-mini"  # Using gpt-4o-mini for cost efficiency, can be changed to gpt-4 if needed


def parse_single_address(address: str) -> Optional[str]:
    """
    Parse a single address string using ChatGPT API.
    
    Args:
        address: The address string to parse (e.g., "3723 West 12600 South, Suite 360 Riverton UT 84065")
        
    Returns:
        Comma-separated string in format: "Address Line 1,Address Line 2,City,State,Zip"
        Returns None if parsing fails or address is empty
    """
    if not address or not str(address).strip():
        return None
    
    address_str = str(address).strip()
    
    # Prepare the prompt
    prompt = f"""Parse the following address into its components. Return ONLY a comma-separated string in this exact format:
Address Line 1,Address Line 2,City,State,Zip

Rules:
- Address Line 1: The street number and street name (e.g., "3723 West 12600 South")
- Address Line 2: Suite, apartment, unit, floor, or building number if present (e.g., "Suite 360"). If not present, leave empty.
- City: The city name (e.g., "Riverton")
- State: The state abbreviation (e.g., "UT")
- Zip: The ZIP code (e.g., "84065")

If any component is missing, leave it empty but keep the commas.

Address to parse: {address_str}

Return ONLY the comma-separated string, nothing else."""

    try:
        # Make API request
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": "You are an address parsing expert. Parse addresses accurately and return only comma-separated values in the format: Address Line 1,Address Line 2,City,State,Zip"
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0,  # Low temperature for consistent parsing
            "max_tokens": 200
        }
        
        response = requests.post(OPENAI_API_URL, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        
        result = response.json()
        
        # Extract the parsed address from the response
        if "choices" in result and len(result["choices"]) > 0:
            parsed_text = result["choices"][0]["message"]["content"].strip()
            
            # Clean up the response - remove any markdown formatting or extra text
            parsed_text = parsed_text.replace("```", "").strip()
            
            # Validate format (should have 4 commas for 5 components)
            parts = parsed_text.split(',')
            if len(parts) == 5:
                # Clean each part
                cleaned_parts = [part.strip() for part in parts]
                return ','.join(cleaned_parts)
            else:
                print(f"Warning: Unexpected format from API for address '{address_str}': {parsed_text}")
                return None
        else:
            print(f"Error: No choices in API response for address '{address_str}'")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"Error calling OpenAI API for address '{address_str}': {str(e)}")
        return None
    except json.JSONDecodeError as e:
        print(f"Error parsing API response for address '{address_str}': {str(e)}")
        return None
    except Exception as e:
        print(f"Unexpected error parsing address '{address_str}': {str(e)}")
        return None


def parse_addresses_batch(addresses: List[str], batch_size: int = 10) -> List[Optional[str]]:
    """
    Parse multiple addresses in batches to avoid rate limits.
    
    Args:
        addresses: List of address strings to parse
        batch_size: Number of addresses to process in each batch (default: 10)
        
    Returns:
        List of parsed addresses in format: "Address Line 1,Address Line 2,City,State,Zip"
        Returns None for addresses that failed to parse
    """
    results = []
    
    for i in range(0, len(addresses), batch_size):
        batch = addresses[i:i + batch_size]
        print(f"Processing batch {i // batch_size + 1} ({len(batch)} addresses)...")
        
        for address in batch:
            parsed = parse_single_address(address)
            results.append(parsed)
        
        # Small delay between batches to avoid rate limits
        if i + batch_size < len(addresses):
            import time
            time.sleep(0.5)
    
    return results


def parse_address_column_from_excel(column_name: str = "Address Line 1", input_file: Optional[str] = None) -> Tuple[List[str], List[str], List[str], List[str], List[str]]:
    """
    Parse Address Line 1 column from Input.xlsx and return separated components.
    
    Args:
        column_name: Name of the column containing addresses (default: "Address Line 1")
        input_file: Path to input Excel file (default: Input.xlsx in Excel Files directory)
        
    Returns:
        Tuple of 5 lists: (address_line1_list, address_line2_list, city_list, state_list, zip_list)
    """
    import pandas as pd
    
    if input_file is None:
        input_file = EXCEL_FILES_DIR / "Input.xlsx"
    else:
        input_file = Path(input_file)
    
    if not input_file.exists():
        raise FileNotFoundError(f"Input file not found: {input_file}")
    
    # Read the Excel file
    df = pd.read_excel(input_file)
    
    if column_name not in df.columns:
        raise ValueError(f"Column '{column_name}' not found in {input_file}")
    
    # Get unique addresses (to avoid duplicate API calls)
    unique_addresses = df[column_name].dropna().unique().tolist()
    
    print(f"Found {len(unique_addresses)} unique addresses to parse...")
    
    # Parse addresses
    parsed_results = parse_addresses_batch(unique_addresses)
    
    # Create mapping from address to parsed components
    address_to_components = {}
    for addr, parsed in zip(unique_addresses, parsed_results):
        if parsed:
            parts = parsed.split(',')
            if len(parts) == 5:
                address_to_components[addr] = {
                    'address_line1': parts[0].strip(),
                    'address_line2': parts[1].strip(),
                    'city': parts[2].strip(),
                    'state': parts[3].strip(),
                    'zip': parts[4].strip()
                }
            else:
                address_to_components[addr] = {
                    'address_line1': str(addr) if pd.notna(addr) else '',
                    'address_line2': '',
                    'city': '',
                    'state': '',
                    'zip': ''
                }
        else:
            # If parsing failed, use original address as Address Line 1
            address_to_components[addr] = {
                'address_line1': str(addr) if pd.notna(addr) else '',
                'address_line2': '',
                'city': '',
                'state': '',
                'zip': ''
            }
    
    # Map back to original dataframe order
    address_line1_list = []
    address_line2_list = []
    city_list = []
    state_list = []
    zip_list = []
    
    for idx, address_value in df[column_name].items():
        if pd.isna(address_value):
            address_line1_list.append('')
            address_line2_list.append('')
            city_list.append('')
            state_list.append('')
            zip_list.append('')
        else:
            addr_str = str(address_value).strip()
            components = address_to_components.get(addr_str, {
                'address_line1': addr_str,
                'address_line2': '',
                'city': '',
                'state': '',
                'zip': ''
            })
            address_line1_list.append(components['address_line1'])
            address_line2_list.append(components['address_line2'])
            city_list.append(components['city'])
            state_list.append(components['state'])
            zip_list.append(components['zip'])
    
    return (address_line1_list, address_line2_list, city_list, state_list, zip_list)


def process_file_and_create_output(input_file_path: str, output_file_path: Optional[str] = None):
    """
    Process an Excel/CSV file with 'Address Line 1' column and create output Excel file.
    
    Args:
        input_file_path: Path to input file (Excel or CSV)
        output_file_path: Path to output Excel file (optional, will auto-generate if not provided)
    """
    input_path = Path(input_file_path)
    
    if not input_path.exists():
        print(f"Error: File not found: {input_file_path}")
        return False
    
    # Determine file type
    file_ext = input_path.suffix.lower()
    
    try:
        # Read the file
        print(f"\nReading file: {input_path.name}...")
        if file_ext == '.csv':
            df = pd.read_csv(input_path)
        elif file_ext in ['.xlsx', '.xls']:
            df = pd.read_excel(input_path)
        else:
            print(f"Error: Unsupported file format. Please use .xlsx, .xls, or .csv")
            return False
        
        # Check if 'Address Line 1' column exists
        if 'Address Line 1' not in df.columns:
            print(f"Error: Column 'Address Line 1' not found in the file.")
            print(f"Available columns: {', '.join(df.columns.tolist())}")
            return False
        
        # Get all addresses
        addresses = df['Address Line 1'].dropna().astype(str).tolist()
        total_addresses = len(addresses)
        
        if total_addresses == 0:
            print("Error: No addresses found in 'Address Line 1' column.")
            return False
        
        print(f"Found {total_addresses} addresses to parse.")
        print("Starting batch processing...\n")
        
        # Parse addresses in batches
        parsed_results = []
        for i, address in enumerate(addresses, 1):
            print(f"Processing {i}/{total_addresses}: {address[:50]}...", end=' ')
            result = parse_single_address(address)
            
            if result:
                parts = result.split(',')
                if len(parts) == 5:
                    parsed_results.append({
                        'Address Line 1': parts[0].strip(),
                        'Address Line 2': parts[1].strip(),
                        'City': parts[2].strip(),
                        'State': parts[3].strip(),
                        'Zip': parts[4].strip()
                    })
                    print("✓")
                else:
                    # Fallback: use original address as Address Line 1
                    parsed_results.append({
                        'Address Line 1': address,
                        'Address Line 2': '',
                        'City': '',
                        'State': '',
                        'Zip': ''
                    })
                    print("⚠ (fallback)")
            else:
                # If parsing failed, use original address as Address Line 1
                parsed_results.append({
                    'Address Line 1': address,
                    'Address Line 2': '',
                    'City': '',
                    'State': '',
                    'Zip': ''
                })
                print("✗ (failed)")
            
            # Small delay to avoid rate limits
            if i < total_addresses:
                import time
                time.sleep(0.3)
        
        # Create output DataFrame
        output_df = pd.DataFrame(parsed_results)
        
        # Generate output file path if not provided
        if output_file_path is None:
            output_path = input_path.parent / f"{input_path.stem}_parsed.xlsx"
        else:
            output_path = Path(output_file_path)
        
        # Write to Excel
        print(f"\nWriting results to: {output_path.name}...")
        output_df.to_excel(output_path, index=False, engine='openpyxl')
        
        print(f"\n✓ Success! Parsed {total_addresses} addresses.")
        print(f"Output file: {output_path}")
        return True
        
    except Exception as e:
        print(f"\nError processing file: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    import sys
    
    print("=" * 60)
    print("Address Parser - ChatGPT API")
    print("=" * 60)
    print("\nSelect mode:")
    print("1. Interactive mode (enter addresses one by one)")
    print("2. File upload mode (parse addresses from Excel/CSV file)")
    print("\nType 'exit' or 'quit' to stop at any time.\n")
    
    # Main loop
    while True:
        try:
            mode = input("Select mode (1 or 2): ").strip()
            
            if mode.lower() in ['exit', 'quit', 'q']:
                print("\nExiting... Goodbye!")
                break
            
            if mode == '1':
                # Interactive mode
                print("\n" + "=" * 60)
                print("INTERACTIVE MODE")
                print("=" * 60)
                print("Enter addresses to parse. Type 'back' to return to menu.\n")
                
                while True:
                    try:
                        address = input("Enter address: ").strip()
                        
                        if address.lower() in ['exit', 'quit', 'q', 'back']:
                            if address.lower() == 'back':
                                print("\nReturning to main menu...\n")
                            break
                        
                        if not address:
                            print("Error: No address provided. Please enter an address.\n")
                            continue
                        
                        print(f"\nParsing address: {address}")
                        print("Calling ChatGPT API...")
                        
                        result = parse_single_address(address)
                        
                        if result:
                            parts = result.split(',')
                            print("\n" + "=" * 60)
                            print("PARSED RESULT:")
                            print("=" * 60)
                            print(f"Address Line 1: {parts[0]}")
                            print(f"Address Line 2: {parts[1]}")
                            print(f"City: {parts[2]}")
                            print(f"State: {parts[3]}")
                            print(f"Zip: {parts[4]}")
                            print("=" * 60)
                            print(f"\nComma-separated format:")
                            print(result)
                            print("\n")
                        else:
                            print("Error: Failed to parse the address. Please check the address format and try again.\n")
                    
                    except KeyboardInterrupt:
                        print("\n\nReturning to main menu...\n")
                        break
                    except Exception as e:
                        print(f"Error: {str(e)}\n")
                        continue
                
            elif mode == '2':
                # File upload mode
                print("\n" + "=" * 60)
                print("FILE UPLOAD MODE")
                print("=" * 60)
                print("The file must contain a column named 'Address Line 1'")
                print("Supported formats: .xlsx, .xls, .csv\n")
                
                file_path = input("Enter file path (or 'back' to return to menu): ").strip()
                
                if file_path.lower() in ['exit', 'quit', 'q', 'back']:
                    if file_path.lower() == 'back':
                        print("\nReturning to main menu...\n")
                    continue
                
                if not file_path:
                    print("Error: No file path provided.\n")
                    continue
                
                # Ask for output file path (optional)
                output_path = input("Enter output file path (press Enter for auto-generated name): ").strip()
                if not output_path:
                    output_path = None
                
                # Process the file
                success = process_file_and_create_output(file_path, output_path)
                
                if success:
                    print("\n" + "=" * 60)
                    print("File processing completed!")
                    print("=" * 60 + "\n")
                else:
                    print("\nFile processing failed. Please check the error messages above.\n")
            
            else:
                print("Invalid option. Please enter 1 or 2.\n")
        
        except KeyboardInterrupt:
            print("\n\nExiting... Goodbye!")
            break
        except Exception as e:
            print(f"Error: {str(e)}\n")
            continue

