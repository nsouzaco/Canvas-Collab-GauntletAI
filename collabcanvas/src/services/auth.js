import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  updateProfile,
  GoogleAuthProvider 
} from 'firebase/auth';
import { auth } from './firebase';

const googleProvider = new GoogleAuthProvider();

// Sign up with email and password
export const signUp = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update the user's display name
    await updateProfile(user, {
      displayName: displayName
    });
    
    return { user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

// Sign in with email and password
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Get display name helper
export const getDisplayName = (user) => {
  if (user.displayName) {
    return user.displayName.length > 20 
      ? user.displayName.substring(0, 20) 
      : user.displayName;
  }
  
  // Extract email prefix if no display name
  const emailPrefix = user.email.split('@')[0];
  return emailPrefix.length > 20 
    ? emailPrefix.substring(0, 20) 
    : emailPrefix;
};
