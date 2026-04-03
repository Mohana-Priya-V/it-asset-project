#!/bin/bash

# Railway Database Initialization Script
# This script initializes the MySQL database on Railway
# Usage: ./scripts/railway-init-db.sh <DB_HOST> <DB_USER> <DB_PASSWORD>

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check arguments
if [ $# -lt 3 ]; then
    echo -e "${RED}Usage: $0 <DB_HOST> <DB_USER> <DB_PASSWORD>${NC}"
    echo ""
    echo "Example:"
    echo "  $0 containers-us-west-abc.railway.app myuser mypassword"
    echo ""
    echo "Get credentials from Railway:"
    echo "  1. Go to Railway Dashboard"
    echo "  2. Select MySQL service"
    echo "  3. Click 'Variables'"
    echo "  4. Copy MYSQLHOST, MYSQLUSER, MYSQLPASSWORD"
    exit 1
fi

DB_HOST=$1
DB_USER=$2
DB_PASSWORD=$3
DB_PORT=${4:-3306}

echo -e "${YELLOW}Railway Database Initialization${NC}"
echo "=================================="
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo "User: $DB_USER"
echo ""

# Test connection
echo -e "${YELLOW}Testing connection...${NC}"
if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Connection successful${NC}"
else
    echo -e "${RED}✗ Connection failed. Please check your credentials.${NC}"
    exit 1
fi

# Run init script
echo -e "${YELLOW}Initializing database...${NC}"
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" < "$(dirname "$0")/../server/db_init.sql"

# Verify
echo -e "${YELLOW}Verifying database...${NC}"
TABLES=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "USE itsm; SHOW TABLES;" 2>&1 | wc -l)

if [ "$TABLES" -gt 1 ]; then
    echo -e "${GREEN}✓ Database initialized successfully${NC}"
    echo ""
    echo "Tables created:"
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "USE itsm; SHOW TABLES;"
else
    echo -e "${RED}✗ Database initialization may have failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}Done! Your database is ready.${NC}"
echo ""
echo "Next steps:"
echo "1. Set environment variables in Railway backend:"
echo "   DB_HOST=$DB_HOST"
echo "   DB_USER=$DB_USER"
echo "   DB_PASSWORD=$DB_PASSWORD"
echo "   DB_PORT=$DB_PORT"
echo "   DB_NAME=itsm"
echo ""
echo "2. Deploy backend service"
echo "3. Test API: curl https://your-backend.railway.app/api/ping"
