# Canvas Collab MVP

A real-time collaborative design tool built with React, Konva, and Firebase.

## 🚀 Live Demo

[**Try Canvas Collab Live**](https://collabcanvas-seven.vercel.app/) - Open in multiple browser tabs to test real-time collaboration!

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Firebase Configuration
1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password AND Google)
3. Create Firestore database
4. Create Realtime Database
5. Copy `.env.example` to `.env` and fill in your Firebase config values

### 3. Environment Variables
Create a `.env` file with your Firebase configuration:
```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com
```

### 4. Run Development Server
```bash
npm run dev
```

## ✨ Features (MVP)
- **Real-time collaborative canvas** - Multiple users can work together simultaneously
- **Shape creation & manipulation** - Rectangles, circles, and text with drag/drop
- **Multiplayer cursors** - See other users' cursors with names and colors
- **User presence** - Know who's online and what they're working on
- **Object locking** - Prevent conflicts when multiple users edit the same shape
- **Authentication** - Email/password and Google sign-in
- **Responsive design** - Works on desktop and mobile devices

## 🎯 Key Capabilities
- **Real-time sync** - Changes appear instantly across all users (<100ms)
- **Visual collaboration** - See who's editing what with user indicators
- **Smooth performance** - 60 FPS with 500+ shapes
- **Cross-browser support** - Works in Chrome, Firefox, Safari
- **Production ready** - Deployed and accessible worldwide

## 🛠 Tech Stack
- **Frontend**: React + Vite + TypeScript
- **Canvas**: Konva.js for high-performance 2D graphics
- **Backend**: Firebase (Authentication + Firestore + Realtime Database)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Icons**: Lucide React

## 🚀 Deployment

### Production Deployment
The app is automatically deployed to Vercel on every push to the main branch.

### Manual Deployment
```bash
# Build the project
npm run build

# Deploy to Firebase (if using Firebase Hosting)
firebase deploy

# Deploy to Vercel
vercel --prod
```

## 🔧 Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project

### Local Development
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see Setup Instructions)
4. Run development server: `npm run dev`
5. Open http://localhost:5173

## 📱 Testing Multi-User Features
1. Open the app in multiple browser tabs/windows
2. Sign in with different accounts
3. Create shapes and see them sync in real-time
4. Move your mouse to see multiplayer cursors
5. Try editing the same shape simultaneously to see object locking

## 🐛 Known Issues
- Mobile touch events may need optimization for complex gestures
- Very large numbers of shapes (>1000) may impact performance
- Offline functionality is not implemented (requires internet connection)

## 🤝 Contributing
This is an MVP (Minimum Viable Product) focused on core collaboration features. Future enhancements could include:
- Undo/redo functionality
- Shape styling options
- Export/import capabilities
- Advanced drawing tools
- AI-powered features