import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot,
  arrayUnion,
  arrayRemove,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  set, 
  onValue, 
  off, 
  push, 
  remove,
  update 
} from 'firebase/database';
import { db, rtdb } from './firebase';

const CANVAS_ID = 'global-canvas-v1';

// Subscribe to canvas changes
export const subscribeToShapes = (callback) => {
  const canvasRef = doc(db, 'canvas', CANVAS_ID);
  
  return onSnapshot(canvasRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      callback(data.shapes || []);
    } else {
      // Initialize canvas if it doesn't exist
      initializeCanvas();
      callback([]);
    }
  });
};

// Initialize canvas document
const initializeCanvas = async () => {
  const canvasRef = doc(db, 'canvas', CANVAS_ID);
  await setDoc(canvasRef, {
    canvasId: CANVAS_ID,
    shapes: [],
    lastUpdated: serverTimestamp()
  });
};

// Create a new shape
export const createShape = async (shapeData) => {
  try {
    const canvasRef = doc(db, 'canvas', CANVAS_ID);
    
    // First get current shapes
    const canvasDoc = await getDoc(canvasRef);
    const currentShapes = canvasDoc.exists() ? canvasDoc.data().shapes || [] : [];
    
    const now = new Date();
    const shape = {
      id: shapeData.id,
      type: shapeData.type,
      x: shapeData.x,
      y: shapeData.y,
      width: shapeData.width,
      height: shapeData.height,
      fill: shapeData.fill,
      createdBy: shapeData.createdBy,
      createdAt: now,
      lastModifiedBy: shapeData.createdBy,
      lastModifiedAt: now,
      isLocked: false,
      lockedBy: null
    };

    const updatedShapes = [...currentShapes, shape];
    
    await setDoc(canvasRef, {
      canvasId: CANVAS_ID,
      shapes: updatedShapes,
      lastUpdated: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error creating shape:', error);
    throw new Error('Failed to create shape. Please try again.');
  }
};

// Update an existing shape
export const updateShape = async (shapeId, updates) => {
  console.log('updateShape called with:', { shapeId, updates });
  
  const canvasRef = doc(db, 'canvas', CANVAS_ID);
  
  // First get current shapes
  const canvasDoc = await getDoc(canvasRef);
  if (!canvasDoc.exists()) {
    console.error('Canvas document does not exist');
    return;
  }
  
  const currentShapes = canvasDoc.data().shapes || [];
  const updatedShapes = currentShapes.map(shape => 
    shape.id === shapeId 
      ? { 
          ...shape, 
          ...updates, 
          lastModifiedAt: new Date(),
          lastModifiedBy: updates.lastModifiedBy || shape.lastModifiedBy
        }
      : shape
  );
  
  console.log('Updated shapes:', updatedShapes.find(s => s.id === shapeId));
  
  try {
    await setDoc(canvasRef, {
      ...canvasDoc.data(),
      shapes: updatedShapes,
      lastUpdated: serverTimestamp()
    });
    console.log('Firebase update successful');
  } catch (error) {
    console.error('Firebase update failed:', error);
    throw error;
  }
};

// Update shape selection state
export const updateShapeSelection = async (shapeId, userId, isSelected) => {
  const canvasRef = doc(db, 'canvas', CANVAS_ID);
  
  // First get current shapes
  const canvasDoc = await getDoc(canvasRef);
  if (!canvasDoc.exists()) return;
  
  const currentShapes = canvasDoc.data().shapes || [];
  const updatedShapes = currentShapes.map(shape => 
    shape.id === shapeId 
      ? { 
          ...shape, 
          selectedBy: isSelected ? userId : null,
          isSelected: isSelected
        }
      : shape
  );
  
  await setDoc(canvasRef, {
    ...canvasDoc.data(),
    shapes: updatedShapes,
    lastUpdated: serverTimestamp()
  });
};

// Clear all selections for a specific user
export const clearUserSelections = async (userId) => {
  const canvasRef = doc(db, 'canvas', CANVAS_ID);
  
  // First get current shapes
  const canvasDoc = await getDoc(canvasRef);
  if (!canvasDoc.exists()) {
    console.error('Canvas document does not exist for clearUserSelections');
    return;
  }
  
  const currentShapes = canvasDoc.data().shapes || [];
  const updatedShapes = currentShapes.map(shape => 
    shape.selectedBy === userId
      ? { 
          ...shape, 
          selectedBy: null,
          isSelected: false
        }
      : shape
  );
  
  try {
    await setDoc(canvasRef, {
      ...canvasDoc.data(),
      shapes: updatedShapes,
      lastUpdated: serverTimestamp()
    });
  } catch (error) {
    console.error('Error clearing user selections:', error);
    throw error;
  }
};

// Clear all locks for a specific user
export const clearUserLocks = async (userId) => {
  const canvasRef = doc(db, 'canvas', CANVAS_ID);
  
  // First get current shapes
  const canvasDoc = await getDoc(canvasRef);
  if (!canvasDoc.exists()) {
    console.error('Canvas document does not exist for clearUserLocks');
    return;
  }
  
  const currentShapes = canvasDoc.data().shapes || [];
  const updatedShapes = currentShapes.map(shape => 
    shape.lockedBy === userId
      ? { 
          ...shape, 
          isLocked: false,
          lockedBy: null
        }
      : shape
  );
  
  try {
    await setDoc(canvasRef, {
      ...canvasDoc.data(),
      shapes: updatedShapes,
      lastUpdated: serverTimestamp()
    });
  } catch (error) {
    console.error('Error clearing user locks:', error);
    throw error;
  }
};

// Delete a shape
export const deleteShape = async (shapeId) => {
  const canvasRef = doc(db, 'canvas', CANVAS_ID);
  
  // First get current shapes
  const canvasDoc = await getDoc(canvasRef);
  if (!canvasDoc.exists()) return;
  
  const currentShapes = canvasDoc.data().shapes || [];
  const updatedShapes = currentShapes.filter(shape => shape.id !== shapeId);
  
  await setDoc(canvasRef, {
    ...canvasDoc.data(),
    shapes: updatedShapes,
    lastUpdated: serverTimestamp()
  });
};

// Lock a shape
export const lockShape = async (shapeId, userId) => {
  await updateShape(shapeId, {
    isLocked: true,
    lockedBy: userId
  });
};

// Unlock a shape
export const unlockShape = async (shapeId) => {
  await updateShape(shapeId, {
    isLocked: false,
    lockedBy: null
  });
};

// ─────────────── Real-time Position Updates ───────────────

// Subscribe to real-time position updates for a specific shape
export const subscribeToShapePosition = (shapeId, callback) => {
  const positionRef = ref(rtdb, `positions/${shapeId}`);
  
  const unsubscribe = onValue(positionRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      callback({
        x: data.x,
        y: data.y,
        updatedBy: data.updatedBy,
        timestamp: data.timestamp
      });
    }
  });

  return unsubscribe;
};

// Update shape position in real-time (for live dragging)
export const updateShapePosition = async (shapeId, x, y, userId) => {
  const positionRef = ref(rtdb, `positions/${shapeId}`);
  
  try {
    await set(positionRef, {
      x,
      y,
      updatedBy: userId,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error updating real-time position:', error);
  }
};

// Clear real-time position when drag ends
export const clearShapePosition = async (shapeId) => {
  const positionRef = ref(rtdb, `positions/${shapeId}`);
  
  try {
    await remove(positionRef);
  } catch (error) {
    console.error('Error clearing real-time position:', error);
  }
};

// Subscribe to all real-time position updates
export const subscribeToAllPositions = (callback) => {
  const positionsRef = ref(rtdb, 'positions');
  
  const unsubscribe = onValue(positionsRef, (snapshot) => {
    if (snapshot.exists()) {
      const positions = snapshot.val();
      callback(positions);
    } else {
      callback({});
    }
  });

  return unsubscribe;
};
