# DevTool - Issue Tracker

A simple issue and feature tracker built with Node.js, TypeScript, and Express.

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
- bcrypt (password hashing)
- jsonwebtoken (JWT authentication)
- http-status-codes

## Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/rudro1/devtool.git
   cd devtool
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
     JWT_SECRET=your-secret-key-change-this-in-production
     JWT_EXPIRES_IN=7d
     ```

4. **Start the development server**
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
