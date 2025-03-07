#!/bin/sh
# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 5

# Clean up any failed migrations
echo "Cleaning up any failed migrations..."
PGPASSWORD=postgres psql -h postgres -U postgres -d postgres -c "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;"

# Run migrations
echo "Running database migrations..."
cd /usr/src/app
pnpm run db:migrate

# Start the service
echo "Starting service..."
pnpm run start:http