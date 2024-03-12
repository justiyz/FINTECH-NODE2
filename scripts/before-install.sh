#!/bin/bash

# Define paths
app_dir="/home/ubuntu/seedfi-backend-test/seedfi-backend-api"  # Change this to your app's directory
env_dir="/opt/vars/" 

# Remove present folder
rm -rf "$app_dir"

unzip /home/ubuntu/seedfi-backend-test/seedfi-app.zip -d "$app_dir"

# Restore .env file from backup directory to app folder
cp "$env_dir/dev-seedfi.env" "$app_dir/.env"

chown -R ubuntu:ubuntu "$app_dir"
