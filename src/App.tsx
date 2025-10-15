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

function App() {
  const { currentUser, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showLanding, setShowLanding] = useState(true);

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
        <div className="flex-1 flex pb-20 pl-8 pr-4 gap-3">
          {/* Left sidebar with online users */}
          <div className="flex-shrink-0 pt-12">
            <CanvasControls />
          </div>
          
          {/* Canvas area with toolbar */}
          <div className="flex flex-col items-center">
            <ShapeToolbar />
            <div className="relative flex-shrink-0">
              <Canvas />
              <ZoomControls />
            </div>
          </div>
        </div>
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
