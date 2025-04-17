#!/bin/bash
# filepath: /opt/doodlex/deploy.sh

# Pull latest changes
git pull

# Set environment variables (can be defined in a .env file)
export DB_USER=postgres
export DB_PASSWORD=your_secure_password
export DB_NAME=postgres
export DATABASE_URL=postgresql://postgres:your_secure_password@postgres:5432/postgres
export JWT_SECRET=OEMjrCoLQ6PaQfqS7VlM+exyhh4dCdsS9F9PiDz6MEI=
export GOOGLE_API_KEY=your_google_api_key
export NEXT_PUBLIC_BACKEND_URL=https://staging.doodlex.vinayaknagar.tech/api/v1
export NEXT_PUBLIC_WS_URL=wss://staging.doodlex.vinayaknagar.tech/ws

# Build and start containers using production config
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Clean up unused images
docker image prune -f
