# Welcome to your Lovable project

## Project info


## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**


Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:


## Repository layout after reorganization

- `client/`: frontend React app (Vite + TypeScript + Tailwind). Run `npm install` and `npm run dev` inside `client/` after moving files.
- `server/`: Flask backend scaffold (connects to MySQL). See `server/README.md` for setup.
- `scripts/move-frontend.ps1`: PowerShell helper to move frontend files into `client/` using `git mv`.

To perform the move automatically (recommended), run the PowerShell script from the repo root in a Git-enabled environment:

```powershell
.
scripts\move-frontend.ps1
```

After moving, review changes and commit them.

## Data Persistence & Backend Integration

The application now features full database persistence via MySQL:

- **Backend (Flask + SQLAlchemy)**: Automatically commits all create/update operations to MySQL with `engine.begin()` context manager
- **Frontend (React + Contexts)**: Fetches data from backend on mount, ensuring previously created records are restored
- **Sync Flow**: When creating data → API call → MySQL insert → local state update → persistent storage

When users are created in `UserManagement` or assets in `AssetManagement`:
1. Data is sent to `/api/users`, `/api/assets`, etc.
2. Backend saves to MySQL and returns the ID
3. Frontend updates local state
4. On reload: Contexts automatically fetch from backend, previously created records appear

No more data loss on restart or session termination.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
