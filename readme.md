# Streamify

A modern language exchange platform that connects language learners worldwide through real-time chat and video calling. Built with React, Node.js, and Stream.io for seamless communication experiences.

## Description

Streamify is a full-stack web application designed to help language learners connect with native speakers and fellow learners. The platform features user authentication, friend matching based on language preferences, real-time messaging, and video calling capabilities. Users can create profiles with their native and target languages, discover compatible language partners, and engage in meaningful conversations to improve their language skills.

## Features

- **User Authentication**: Secure signup/login with JWT tokens
- **User Onboarding**: Complete profile setup with language preferences, bio, and location
- **Smart Matching**: Discover language partners based on complementary language skills
- **Friend System**: Send and manage friend requests
- **Real-time Chat**: Instant messaging powered by Stream Chat
- **Video Calling**: High-quality video calls using Stream Video SDK
- **Responsive Design**: Mobile-friendly interface with DaisyUI and Tailwind CSS
- **Theme Support**: Multiple UI themes for personalized experience

## Tech Stack

### Frontend
- **React 19** - Modern UI library
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Component library for Tailwind
- **Stream Chat React** - Real-time messaging components
- **Stream Video React SDK** - Video calling functionality
- **Zustand** - State management
- **React Query** - Server state management
- **Axios** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Stream Chat** - Chat backend service
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB database
- Stream.io account (for chat and video features)

### 1. Clone the repository
```bash
git clone https://github.com/kushGupta-15/Streamify.git
cd Streamify
```

### 2. Install dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd Backend
npm install

# Install frontend dependencies
cd ../Frontend
npm install
```

### 3. Environment Setup

#### Backend Environment (.env in Backend folder)
```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
STEAM_API_KEY=your_stream_api_key
STEAM_API_SECRET=your_stream_api_secret
JWT_SECRET_KEY=your_jwt_secret_key
NODE_ENV=development
```

#### Frontend Environment (.env in Frontend folder)
```env
VITE_STREAM_API_KEY=your_stream_api_key
```

### 4. Database Setup
Ensure your MongoDB database is running and accessible via the connection string in your backend .env file.

## Usage

### Development Mode

1. **Start the backend server:**
```bash
cd Backend
npm run dev
```
The backend will run on `http://localhost:5001`

2. **Start the frontend development server:**
```bash
cd Frontend
npm run dev
```
The frontend will run on `http://localhost:5173`

### Production Mode

1. **Build the application:**
```bash
npm run build
```

2. **Start the production server:**
```bash
npm start
```

### Using the Application

1. **Sign Up**: Create a new account with email and password
2. **Onboarding**: Complete your profile with:
   - Full name and bio
   - Native language
   - Language you want to learn
   - Location
3. **Discover**: Browse recommended language partners
4. **Connect**: Send friend requests to potential language partners
5. **Chat**: Start conversations with your friends
6. **Video Call**: Initiate video calls directly from chat

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/onboard` - Complete user onboarding

### Users
- `GET /api/users/recommended` - Get recommended language partners
- `GET /api/users/friends` - Get user's friends list
- `POST /api/users/friend-request` - Send friend request
- `GET /api/users/friend-requests` - Get incoming friend requests
- `PUT /api/users/friend-request/:id` - Accept/reject friend request

### Chat
- `GET /api/chat/token` - Get Stream chat token

## Project Structure

```
Streamify/
├── Backend/
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── lib/             # Utility functions
│   │   └── server.js        # Express server setup
│   ├── package.json
│   └── .env
├── Frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions
│   │   ├── store/           # State management
│   │   └── constants/       # App constants
│   ├── package.json
│   └── .env
├── package.json             # Root package.json
└── README.md
```




