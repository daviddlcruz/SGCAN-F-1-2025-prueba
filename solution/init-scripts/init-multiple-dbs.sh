#!/bin/bash
set -e

# Wait for Postgres to be ready
echo "Creating multiple databases..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE auth_db;
    CREATE DATABASE scraper_db;
    GRANT ALL PRIVILEGES ON DATABASE auth_db TO f1_sgcan;
    GRANT ALL PRIVILEGES ON DATABASE scraper_db TO f1_sgcan;
EOSQL

echo "Databases created successfully!"
