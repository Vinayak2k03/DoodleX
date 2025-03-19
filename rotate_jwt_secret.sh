#!/bin/bash

# Generate new JWT secret
NEW_JWT_SECRET=$(openssl rand -base64 32)

# Update docker-compose.prod.yml with the new secret
sed -i "s/JWT_SECRET=.*/JWT_SECRET=$NEW_JWT_SECRET/g" docker-compose.prod.yml

# Update .env file with new secret
sed -i "s/^JWT_SECRET=.*/JWT_SECRET=$NEW_JWT_SECRET/" .env

# Restart services to use the new secret
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d

# Log rotation date
echo "JWT secret rotated on $(date)" >> /var/log/secret_rotation.log

# Output the new secret (for backup purposes)
echo "New JWT secret: $NEW_JWT_SECRET"
echo "Please store this securely and then remove this output from your terminal history!"
