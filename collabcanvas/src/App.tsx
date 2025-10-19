import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { CanvasProvider } from './contexts/CanvasContext';
import LandingPage from './components/Landing/LandingPage';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Navbar from './components/Layout/Navbar';
import Canvas from './components/Canvas/Canvas';
import CanvasControls from './components/Canvas/CanvasControls';
import ShapeToolbar from './components/Canvas/ShapeToolbar';
import ZoomControls from './components/Canvas/ZoomControls';
import ExportControls from './components/Canvas/ExportControls';
import SnapToGridToggle from './components/Canvas/SnapToGridToggle';
import ConnectionStatus from './components/Layout/ConnectionStatus';

function App() {
  const { currentUser, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  const [snapToGridEnabled, setSnapToGridEnabled] = useState(true);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page if not logged in and showLanding is true
  if (!currentUser && showLanding) {
    return (
      <LandingPage onGetStarted={() => setShowLanding(false)} />
    );
  }

  // Show auth forms if not logged in
  if (!currentUser) {
    return isLogin ? (
      <Login onSwitchToSignup={() => setIsLogin(false)} />
    ) : (
      <Signup onSwitchToLogin={() => setIsLogin(true)} />
    );
  }

  // Show canvas if logged in
  return (
    <CanvasProvider>
      <div className="min-h-screen flex flex-col bg-gray-100">
        <div className="py-3">
          <Navbar />
        </div>
        
        {/* Full-width canvas area */}
        <div className="flex-1 relative">
          <Canvas snapToGridEnabled={snapToGridEnabled} />
          
          {/* Floating UI Elements */}
          <div className="absolute top-4 left-4 z-10">
            <CanvasControls />
          </div>
          
          {/* Export Controls - Top Right */}
          <div className="absolute top-4 right-4 z-10">
            <ExportControls />
          </div>
          
          {/* Shape Toolbar - Center Bottom - Responsive positioning */}
          <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 z-10 max-w-full px-2">
            <ShapeToolbar />
          </div>
          
          {/* Snap-to-Grid Toggle - Bottom Left */}
          <div className="absolute bottom-4 left-4 z-10">
            <SnapToGridToggle 
              enabled={snapToGridEnabled}
              onToggle={setSnapToGridEnabled}
            />
          </div>
          
          {/* Zoom Controls - Bottom Right */}
          <div className="absolute bottom-4 right-4 z-10">
            <ZoomControls />
          </div>
          
        </div>
        
        {/* Connection Status Indicator */}
        <ConnectionStatus />
      </div>
    </CanvasProvider>
  );
}

function AppWithAuth() {
  return (
    <App />
  );
}

export default AppWithAuth;
