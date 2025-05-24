#!/bin/sh
# Check if nginx is running
curl -f http://localhost/ > /dev/null 2>&1 || exit 1
# Check if backend is running
curl -f http://localhost:3000/health > /dev/null 2>&1 || exit 1
echo "Health check passed" 