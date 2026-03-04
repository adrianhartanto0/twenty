#!/bin/bash
# init-db.sh
set -e

echo "Running db init"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL
    CREATE DATABASE "default" WITH OWNER postgres;
    CREATE DATABASE "test" WITH OWNER postgres;
EOSQL
