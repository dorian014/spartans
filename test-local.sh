#!/bin/bash

# Local testing script for X Analytics Dashboard

echo "Starting local test server..."
echo "----------------------------------------"
echo "Dashboard will be available at:"
echo "  http://localhost:8000/"
echo ""
echo "Test credentials:"
echo "  Password: adminspartans"
echo ""
echo "Press Ctrl+C to stop the server"
echo "----------------------------------------"

# Start Python HTTP server
python3 -m http.server 8000 --bind localhost