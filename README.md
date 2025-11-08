# TechWagon - Complete Smart Parking & Ride Sharing Platform

TechWagon is a comprehensive platform that combines smart parking solutions with ride-sharing capabilities, featuring both mobile application and backend services.

## Project Structure

```
TechWagon/
├── backend/          # Node.js/TypeScript backend API
└── uber-clone/       # React Native mobile application
```

## 🚗 Backend (Node.js/TypeScript)

The backend provides RESTful APIs for:
- User authentication and management
- Vehicle registration and verification
- Smart parking spot management
- Booking and payment processing
- Real-time parking availability
- Computer vision integration for license plate recognition

### Key Features:
- **Prisma ORM** with PostgreSQL database
- **Clerk Authentication** integration
- **Vehicle Verification** with RTO API integration
- **Smart Parking Management** with real-time availability
- **Payment Processing** with Stripe integration
- **Computer Vision** for automated entry/exit detection

### Tech Stack:
- Node.js with TypeScript
- Prisma ORM
- PostgreSQL
- Express.js
- Clerk Auth
- Stripe Payments

## 📱 Mobile App (React Native/Expo)

The mobile application provides:
- User registration and authentication
- Vehicle management and verification
- Smart parking spot discovery
- Real-time navigation to parking spots
- In-app payments and booking management
- Ride-sharing capabilities
- QR code scanning for parking entry/exit

### Key Features:
- **Cross-platform** (iOS & Android)
- **Real-time Maps** integration
- **Smart Parking** booking and management
- **Ride Sharing** functionality
- **Payment Integration** with Stripe
- **QR Code** scanning for seamless parking
- **CarPlay Integration** for enhanced driving experience

### Tech Stack:
- React Native with Expo
- TypeScript
- React Navigation
- Maps integration
- Stripe Payments
- Clerk Authentication

## 🚀 Getting Started

### Backend Setup
```bash
cd backend
npm install
# Set up your .env file with database and API keys
npm run dev
```

### Mobile App Setup
```bash
cd uber-clone
npm install
npx expo start
```

## 🔧 Environment Variables

Both projects require environment variables for:
- Database connections
- Authentication providers
- Payment processing
- Maps and location services
- External API integrations

## 📄 License

This project is part of the TechWagon platform development.

## 🤝 Contributing

This is a comprehensive platform combining modern mobile development with robust backend services for smart parking and transportation solutions.