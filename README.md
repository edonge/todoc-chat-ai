# Integrated Parenting Support Platform

An integrated platform for parenting records and AI-powered consultation. This project is a monorepo containing a FastAPI backend and a React (Vite) frontend.

## Project Structure

The project is organized as a monorepo with two main packages:

-   `./frontend/`: The Vite + React + TypeScript frontend application.
-   `./backend/`: The FastAPI + Python backend API.

## Tech Stack

-   **Frontend**:
    -   React
    -   Vite
    -   TypeScript
    -   Shadcn/ui & Tailwind CSS
-   **Backend**:
    -   Python 3.12
    -   FastAPI
    -   SQLAlchemy
    -   PostgreSQL
-   **Deployment**:
    -   Configured for Vercel.

---

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v20.x or later recommended)
-   [Python](https://www.python.org/) (v3.12 or later)
-   [PostgreSQL](https://www.postgresql.org/) running locally
-   [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <your-repository-name>
```

### 2. Backend Setup

First, set up and run the backend server.

```bash
# Navigate to the backend directory
cd backend

# Create and activate a Python virtual environment
python3 -m venv venv
source venv/bin/activate
# On Windows, use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create a .env file for environment variables
cp .env.example .env  # If you have an example file, otherwise create a new one
```

Open the `.env` file and configure your database connection. By default, the application looks for `postgresql://user:password@localhost/todoc`.

**`.env` file example:**
```
DATABASE_URL="postgresql://user:password@localhost/todoc"
GEMINI_API_KEY="your-google-ai-api-key"
```

Now, run the backend server:
```bash
# The server will run on http://localhost:8000
uvicorn app.main:app --reload --port 8000
```
The application will automatically create the database tables on its first run. You can view the API documentation at `http://localhost:8000/docs`.

### 3. Frontend Setup

In a **new terminal window**, set up and run the frontend application.

```bash
# Navigate to the frontend directory from the project root
cd frontend

# Install dependencies
npm install

# Run the development server
# The server will run on http://localhost:3000
npm run dev
```
The frontend application will now be running and connected to your local backend via a proxy.

## Deployment

This project is configured for deployment on [Vercel](https://vercel.com/).

The `vercel.json` file in the root directory contains the necessary configuration to build and deploy both the frontend and backend from the monorepo.

To deploy, simply push your code to the connected GitHub/GitLab/Bitbucket repository. Vercel will automatically trigger a new deployment.