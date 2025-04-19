#!/bin/bash
# filepath: /opt/doodlex/deploy.sh

# Pull latest changes
git pull

# Source environment variables from .env file if it exists
ENV_FILE="/opt/doodlex/.env"
if [ -f "$ENV_FILE" ]; then
    echo "Loading environment variables from $ENV_FILE"
    # Use 'export' with 'set -a' to make variables available to docker-compose
    set -a
    source "$ENV_FILE"
    set +a
else
    echo "ERROR: Environment file $ENV_FILE not found. Exiting."
    exit 1
fi

# Optional: You can still export non-secret defaults or overrides here if needed
# export NODE_ENV=production # Example

# Build and start containers using production config
# Docker Compose will automatically pick up the exported variables
echo "Stopping existing containers..."
docker compose -f docker-compose.prod.yml down
echo "Building new images (if necessary)..."
docker compose -f docker-compose.prod.yml build --no-cache # Consider removing --no-cache for faster builds unless needed
echo "Starting new containers..."
docker compose -f docker-compose.prod.yml up -d

# Clean up unused images
echo "Cleaning up unused Docker images..."
docker image prune -f

echo "Deployment finished."