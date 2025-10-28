#!/bin/bash

# Script to check error logs on o2switch server
# Run this via SSH on your o2switch server

echo "🔍 Checking error logs on o2switch server..."

# Common log locations on o2switch
LOG_LOCATIONS=(
    "/home/dije1636/logs/error_log"
    "/home/dije1636/logs/apache_error.log"
    "/home/dije1636/public_html/logs/error.log"
    "/home/dije1636/public_html/loftbarber/logs/error.log"
    "/var/log/apache2/error.log"
    "/var/log/httpd/error_log"
    "/usr/local/apache/logs/error_log"
)

echo "📂 Checking common log locations..."

for log in "${LOG_LOCATIONS[@]}"; do
    if [ -f "$log" ]; then
        echo "✅ Found log file: $log"
        echo "📄 Last 20 lines:"
        tail -20 "$log" | grep -i "loft\|500\|error" || echo "No recent LoftBarber errors found"
        echo "---"
    else
        echo "❌ Log not found: $log"
    fi
done

echo ""
echo "🔧 Checking Passenger logs (if available)..."
# Check for Passenger-specific logs
if [ -d "/home/dije1636/passenger" ]; then
    echo "Passenger directory found. Checking contents..."
    find /home/dije1636/passenger -name "*.log" -type f -exec tail -10 {} \; 2>/dev/null || echo "No Passenger logs found"
fi

echo ""
echo "📋 If no logs are found, try these commands:"
echo "# Check current directory for any .log files"
echo "find . -name '*.log' -type f -exec ls -la {} \;"
echo ""
echo "# Check for Node.js process errors"
echo "ps aux | grep node"
echo ""
echo "# Check recent system logs"
echo "dmesg | tail -20"
