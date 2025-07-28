# Wireflow Project

## Project Overview
Wireflow is a web application project consisting of a backend API and a frontend user interface. The project aims to provide functionalities related to wireframe management and AI-assisted code generation.

## Backend
- Built with Node.js and Express.js.
- Contains controllers for authentication and wireframe management.
- Routes are organized under the `backend/routes` directory.
- Models represent data entities such as users, wireframes, AI request logs, and generated code.
- Middleware for authentication is implemented.
- Database configuration and connection are handled in the `backend/config` directory.

## Frontend
- Built with React and TypeScript.
- Uses Vite as the build tool.
- Contains components and assets under `frontend/src`.
- Provides the user interface for interacting with the backend services.

## Current Functionality
- User authentication and authorization.
- Wireframe creation, management, and retrieval.
- AI request logging and generated code management.
- Frontend interface to interact with backend APIs.

## Getting Started

### Prerequisites
- Node.js (version 14 or higher recommended)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd wireflow_project_me
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. Start the frontend development server:
   ```bash
   cd ../frontend
   npm run dev
   ```

3. Open your browser and navigate to the frontend URL (usually `http://localhost:3000` or as specified by Vite).

## Technologies Used
- Node.js
- Express.js
- React
- TypeScript
- Vite
- MongoDB (assumed from models, please adjust if different)

## Notes
- Environment variables and database configuration should be set up as per the `.env.example` file in the backend directory.
- Further documentation and testing instructions to be added as the project evolves.
