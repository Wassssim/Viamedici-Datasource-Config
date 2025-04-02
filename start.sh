#!/bin/bash

# Check if docker-compose or docker compose is available
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
elif command -v docker &> /dev/null && docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"\else
    echo "Error: Docker Compose is not installed. Please install it before running this script."
    exit 1
fi

# Start the application
echo "Starting the application..."
$COMPOSE_CMD -f EditConfigApp.yml up -d

echo "Application started successfully!"