#!/usr/bin/env python3

import json
import os
import csv
from eth_keyfile import decode_keyfile_json
from eth_utils import to_checksum_address
from web3 import Web3

def extract_keystore_info(keystore_path, password):
    """Extract private key and address from a keystore file."""
    try:
        with open(keystore_path, 'r') as keyfile:
            keystore = json.load(keyfile)
            
        # Extract private key using the password
        private_key_bytes = decode_keyfile_json(keystore, password.encode())
        private_key = private_key_bytes.hex()
        
        # Get address from keystore
        address = keystore.get('address', '')
        if address:
            address = to_checksum_address(f"0x{address}")
            
        return {
            'address': address,
            'private_key': private_key,
            'filename': os.path.basename(keystore_path)
        }
    except Exception as e:
        return {
            'address': None,
            'private_key': None,
            'filename': os.path.basename(keystore_path),
            'error': str(e)
        }

def process_keystore_folder(folder_path, password_file, output_file):
    """Process all keystore files in a folder and save to CSV."""
    # Read password
    with open(password_file, 'r') as f:
        password = f.read().strip()
    
    # Prepare CSV file
    csv_headers = ['Address', 'Private Key', 'Filename']
    
    with open(output_file, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=csv_headers)
        writer.writeheader()
        
        # Process each file in the folder
        for filename in os.listdir(folder_path):
            if filename.startswith('UTC--'):  # Standard Ethereum keystore file prefix
                file_path = os.path.join(folder_path, filename)
                print(f"Processing {filename}...")
                
                result = extract_keystore_info(file_path, password)
                
                if result['address'] and result['private_key']:
                    writer.writerow({
                        'Address': result['address'],
                        'Private Key': result['private_key'],
                        'Filename': result['filename']
                    })
                    print(f"Successfully processed {filename}")
                else:
                    print(f"Error processing {filename}: {result.get('error', 'Unknown error')}")

def main():
    # Configuration
    KEYSTORE_FOLDER = "./keystore"  # Path to folder containing keystore files
    PASSWORD_FILE = "./passwords.txt"  # File containing the password
    OUTPUT_FILE = "wallet_details.csv"  # Output CSV file
    
    # Check if required paths exist
    if not os.path.exists(KEYSTORE_FOLDER):
        print(f"Error: Keystore folder '{KEYSTORE_FOLDER}' not found!")
        return
    
    if not os.path.exists(PASSWORD_FILE):
        print(f"Error: Password file '{PASSWORD_FILE}' not found!")
        return
    
    print("Starting keystore processing...")
    process_keystore_folder(KEYSTORE_FOLDER, PASSWORD_FILE, OUTPUT_FILE)
    print(f"\nProcessing complete! Results saved to {OUTPUT_FILE}")
    print("\nWARNING: The output file contains sensitive information.")
    print("Make sure to store it securely and delete when no longer needed!")

if __name__ == "__main__":
    main()
