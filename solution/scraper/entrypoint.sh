#!/bin/sh

echo "Waiting for PostgreSQL..."
until pg_isready -h postgres -p 5432 -U f1_sgcan; do
  sleep 3
done

echo "PostgreSQL is ready! Running migrations..."
alembic upgrade head

echo "Starting FastAPI..."
exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload
