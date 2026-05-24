# DevPulse - Internal Tech Issue & Feature Tracker

A collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions.

## Live URL
Coming soon!

## Features
- User authentication (signup, login with JWT)
- Role-based access control (contributor, maintainer)
- Create, view, update, and delete issues
- Issue filtering and sorting
- Public access to view issues

## Tech Stack
- Node.js (LTS)
- TypeScript
- Express.js
- PostgreSQL (with pg driver)
- bcrypt (password hashing)
- jsonwebtoken (JWT authentication)
- http-status-codes

## Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd B7A2-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Update the variables in `.env`:
     ```
     PORT=3000
     DATABASE_URL=postgresql://username:password@localhost:5432/devpulse
     JWT_SECRET=your-secret-key-change-this-in-production
     JWT_EXPIRES_IN=7d
     ```

4. **Set up the database**
   - Create a PostgreSQL database named `devpulse`
   - Run the database schema script:
     ```bash
     npm run init-db
     ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Issues
- `POST /api/issues` - Create a new issue (authenticated)
- `GET /api/issues` - Get all issues (public, with optional filters)
- `GET /api/issues/:id` - Get a single issue (public)
- `PATCH /api/issues/:id` - Update an issue (authenticated)
- `DELETE /api/issues/:id` - Delete an issue (maintainer only)

## Database Schema Summary

### Users Table
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR(255) NOT NULL)
- `email` (VARCHAR(255) UNIQUE NOT NULL)
- `password` (VARCHAR(255) NOT NULL)
- `role` (VARCHAR(50) DEFAULT 'contributor', CHECK: contributor/maintainer)
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

### Issues Table
- `id` (SERIAL PRIMARY KEY)
- `title` (VARCHAR(150) NOT NULL)
- `description` (TEXT NOT NULL, CHECK: LENGTH >= 20)
- `type` (VARCHAR(50) NOT NULL, CHECK: bug/feature_request)
- `status` (VARCHAR(50) DEFAULT 'open', CHECK: open/in_progress/resolved)
- `reporter_id` (INTEGER NOT NULL)
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
