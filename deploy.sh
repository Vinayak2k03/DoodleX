#!/bin/bash
set -e  # Exit immediately if a command exits with non-zero status

# Log deployment start with timestamp
echo "======================================"
echo "Starting deployment at $(date)"
echo "======================================"

# Navigate to project directory
cd /opt/doodlex

# Pull the latest changes
echo "Pulling latest code from repository..."
git pull

# Make sure we have the latest .env file
echo "Checking for .env file..."
if [ ! -f .env ]; then
  echo "ERROR: .env file is missing. Please create one."
  exit 1
fi

# Stop and remove existing containers
echo "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Clean up unused Docker resources
echo "Cleaning up Docker resources..."
docker system prune -f

# Rebuild and start containers
echo "Building and starting new containers..."
docker-compose -f docker-compose.prod.yml up -d --build

# Check if all containers are running
echo "Checking container status..."
sleep 10  # Wait for containers to start
docker-compose -f docker-compose.prod.yml ps

echo "======================================"
echo "Deployment completed at $(date)"
echo "======================================"