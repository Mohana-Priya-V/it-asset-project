# Client (frontend)

React + Vite + TypeScript + Tailwind CSS.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and set your API URL:
   ```bash
   cp .env.example .env
   # Edit .env if your backend runs on a different URL than http://localhost:5000/api
   ```

3. Start dev server:
   ```bash
   npm run dev
   ```

## Environment variables

- `VITE_API_URL`: Backend API base URL (default: `http://localhost:5000/api`)

## Data Persistence & Syncing

The frontend automatically syncs all data with the MySQL database via the backend API:

- **DataContext**: Fetches assets, assignments, and issues from `/api` on mount
- **AuthContext**: Fetches users from `/api/users` on mount
- **UserManagement**: Calls `usersApi.create()` and `usersApi.update()` to persist user changes

When you create a new user, asset, or issue:
1. The frontend sends data to the backend via REST API
2. The backend stores it in MySQL database
3. Local state is updated with the new record

On page reload or backend restart:
- Contexts re-fetch all data from the backend
- Previously created records are restored from MySQL
- UI displays persistent data
