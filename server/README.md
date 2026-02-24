# Server (backend)

This folder contains a minimal Flask backend scaffold that connects to MySQL.

Setup (recommended):

```bash
python -m venv .venv
source .venv/bin/activate   # or .\.venv\Scripts\Activate.ps1 on Windows PowerShell
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your DB credentials
python app.py
```

The app exposes a basic endpoint at `/api/ping` and an example `/api/assets` which reads from an `assets` table.

Database initialization

1. Use the provided `db_init.sql` to create schema and seed data in MySQL Workbench.

2. Open MySQL Workbench, open a new SQL tab, load `server/db_init.sql`, and execute the script.

3. Update `.env` with your DB credentials to match the created `itsm` database.

Example `.env` keys:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=changeme
DB_NAME=itsm
PORT=5000
```
