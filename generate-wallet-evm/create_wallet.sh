#!/bin/bash

# Configuration
NUM_ACCOUNTS=500  # Number of accounts to create
PASSWORD_FILE="passwords.txt"
ACCOUNTS_FILE="accounts.txt"

# Create password file if it doesn't exist
if [ ! -f "$PASSWORD_FILE" ]; then
    echo "Creating password file..."
    echo "your_secure_password" > "$PASSWORD_FILE"
fi

# Clear or create accounts file
> "$ACCOUNTS_FILE"

# Check if geth is installed
if ! command -v geth &> /dev/null; then
    echo "Error: geth is not installed"
    echo "Please install geth first using:"
    echo "sudo apt-get install ethereum    # For Ubuntu/Debian"
    echo "brew install ethereum            # For MacOS"
    exit 1
fi

# Function to create account
create_account() {
    local account_num=$1
    echo "Creating account #$account_num..."
    
    # Create new account and capture the output
    local output=$(geth account new --password "$PASSWORD_FILE" --datadir ./ 2>&1)
}

# Main loop to create accounts
echo "Starting account creation process..."
for ((i=1; i<=NUM_ACCOUNTS; i++)); do
    create_account $i
    
    # Add small delay between account creations
    sleep 1
done

# Final summary
echo -e "\nAccount creation completed!"
echo "Created $NUM_ACCOUNTS accounts"
echo "Accounts are stored in: $ACCOUNTS_FILE"
echo "Passwords are stored in: $PASSWORD_FILE"
echo -e "\nIMPORTANT: Make sure to backup your keystore folder and password file securely!"
