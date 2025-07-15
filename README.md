# Travenor

Travenor is a full-stack travel and accommodation booking application built with React Native (Expo) for the frontend and Node.js/Express with MongoDB for the backend. It allows users to browse, search, and book destinations, manage their profile, and handle authentication (including Google sign-in and OTP-based flows).

---

## Table of Contents
- [Features](#features)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Frontend (Mobile App)](#frontend-mobile-app)
- [Backend (API Server)](#backend-api-server)
- [Usage](#usage)
- [Tech Stack](#tech-stack)
- [License](#license)

---

## Features
- User authentication (email/password, Google sign-in, OTP verification)
- Browse, search, and filter destinations
- Book destinations and view booking history
- Manage favorite places
- User profile management (edit profile, upload avatar, etc.)
- Notifications system
- Responsive and modern UI
- Location picker with map integration
- Price, category, and facility filters

---

## Project Structure

```
travenor-app/
  ├── app/                # React Native (Expo) frontend
  │   ├── auth/           # Authentication screens (sign in, sign up, OTP, etc.)
  │   ├── details/        # Destination details screen
  │   ├── edit-profile/   # Profile editing
  │   ├── notifications/  # Notifications screen
  │   ├── schedule/       # Booking/schedule screen
  │   ├── tabs/           # Main tab navigation (Home, Booked, Favourites, Profile)
  │   ├── pager.tsx       # Onboarding pager
  │   ├── index.tsx       # App entry point
  │   └── ...
  ├── backend/            # Node.js/Express backend API
  │   ├── config/         # Database config
  │   ├── controllers/    # API controllers
  │   ├── middlewares/    # Express middlewares
  │   ├── models/         # Mongoose models (User, GoogleUser, Destination)
  │   ├── routes/         # API routes
  │   ├── server.ts       # Main server file
  │   └── ...
  ├── components/         # Shared React Native components
  ├── store/              # Zustand state management
  ├── assets/             # Images and static assets
  ├── App.tsx             # Expo app entry
  ├── app.json            # Expo app config
  ├── package.json        # Project dependencies (frontend)
  └── ...
```

---

## Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- MongoDB instance (local or cloud)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

### 1. Clone the Repository
```bash
git clone <repo-url>
cd Travenor/travenor-app
```

### 2. Install Dependencies
#### Frontend
```bash
npm install
```
#### Backend
```bash
cd backend
npm install
```

### 3. Environment Variables
Create a `.env` file in `backend/` with the following:
```
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
EMAIL_USER=<your-email>
EMAIL_PASS=<your-email-password>
GOOGLE_WEB_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

### 4. Start the Backend Server
```bash
cd backend
npm run dev
```
The backend will run on `http://localhost:3000` by default.

### 5. Start the Frontend (Expo)
```bash
cd ..
expo start
```
Follow the Expo CLI instructions to run on Android/iOS simulator or a physical device.

---

## Frontend (Mobile App)
- Built with React Native (Expo)
- Uses Expo Router for navigation
- State management with Zustand
- Authentication via REST API and Google Sign-In
- Location picker with map (Leaflet in WebView)
- Modern UI with filterable destination list, booking, favorites, and profile management

### Main Screens
- **Onboarding Pager**: Welcome and intro slides
- **Authentication**: Sign in, sign up, OTP verification, forgot/reset password
- **Home**: Browse/search/filter destinations
- **Details**: View destination details, images, and book
- **Booked**: View and manage bookings
- **Favourites**: Manage favorite destinations
- **Profile**: View/edit user profile, logout
- **Notifications**: View app notifications

---

## Backend (API Server)
- Node.js with Express and TypeScript
- MongoDB with Mongoose
- JWT-based authentication
- Google OAuth2 integration
- Email/OTP for signup and password reset (via Nodemailer)
- RESTful API endpoints for users, destinations, bookings, favorites, and profile

### Key API Endpoints
- `POST /signup` - Register new user
- `POST /signin` - User login
- `POST /google/signin` - Google login/signup
- `POST /send-otp` - Send OTP to email
- `POST /verify-otp` - Verify OTP
- `POST /forgot-password` - Send OTP for password reset
- `POST /set-new-password` - Set new password after OTP
- `GET /fetch-destinations` - List all destinations
- `GET /destination/by-id/:id` - Get destination details
- `POST /user/book` - Book a destination
- `GET /user/booked` - Get user's bookings
- `POST /user/favorite` - Add to favorites
- `GET /user/favorites` - Get favorites
- `GET /user/profile` - Get user profile
- `POST /user/profile` - Update profile

---

## Usage
1. Register or sign in (email/password or Google)
2. Browse and search for destinations
3. Filter by category, price, rooms, facilities, and location
4. View details and book destinations
5. Manage your bookings and favorites
6. Edit your profile and view notifications

---

## Tech Stack
- **Frontend:** React Native, Expo, Expo Router, Zustand, AsyncStorage, WebView, Leaflet (map), Razorpay (payments)
- **Backend:** Node.js, Express, TypeScript, MongoDB, Mongoose, JWT, Passport, Nodemailer
- **Other:** Google OAuth2, Email/OTP, Expo CLI

---

## License
This project is licensed under the MIT License. 