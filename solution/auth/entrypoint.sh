#!/bin/sh

echo "Waiting for PostgreSQL..."
until pg_isready -h f1_postgres -p 5432 -U f1_sgcan; do
  sleep 3
done

echo "PostgreSQL is ready! Running EF Migrations..."
dotnet ef database update

echo "Starting .NET Service..."
exec dotnet watch run --urls=http://0.0.0.0:5001
