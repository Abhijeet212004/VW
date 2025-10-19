# Parking App Backend

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Start PostgreSQL with Docker
```bash
docker-compose up -d
```

### 3. Generate Prisma Client & Run Migrations
```bash
npm run prisma:generate
npm run prisma:migrate
```

### 4. Start Development Server
```bash
npm run dev
```

## API Endpoints

### Auth/Onboarding Routes

#### Register User
```
POST /api/auth/register
Body: {
  "clerkId": "user_xxx",
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+919876543210",
  "profilePhoto": "https://..."
}
```

#### Get Profile
```
GET /api/auth/profile
Headers: {
  "Authorization": "Bearer <clerk_token>"
}
```

#### Update Profile
```
PATCH /api/auth/profile
Headers: {
  "Authorization": "Bearer <clerk_token>"
}
Body: {
  "name": "Updated Name",
  "phone": "+919999999999"
}
```

#### Delete Account
```
DELETE /api/auth/account
Headers: {
  "Authorization": "Bearer <clerk_token>"
}
```

## Database

PostgreSQL running in Docker on port 5432

Database: `parking_app`
User: `postgres`
Password: `password`

## Environment Variables

See `.env` file for configuration
