#!/bin/sh
echo "Starting Fake SMTP Server..."
echo "Frontend will be available on port 80"
echo "Backend API will be available on port 80/api"
supervisord -c /etc/supervisor/conf.d/supervisord.conf 