import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot,
  collection,
  query,
  orderBy,
  getDocs,
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

// Create a new canvas
export const createCanvas = async (name, description, createdBy) => {
  try {
    const canvasId = `canvas_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const canvasRef = doc(db, 'canvases', canvasId);
    
    const canvasData = {
      id: canvasId,
      name,
      description,
      createdBy,
      createdAt: serverTimestamp(),
      isPublic: true,
      shapes: []
    };
    
    await setDoc(canvasRef, canvasData);
    return canvasId;
  } catch (error) {
    console.error('Error creating canvas:', error);
    throw new Error('Failed to create canvas. Please try again.');
  }
};

// Get all canvases for dashboard
export const getAllCanvases = async () => {
  try {
    const canvasesRef = collection(db, 'canvases');
    const q = query(canvasesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting canvases:', error);
    throw new Error('Failed to load canvases. Please try again.');
  }
};

// Get a specific canvas
export const getCanvas = async (canvasId) => {
  try {
    const canvasRef = doc(db, 'canvases', canvasId);
    const canvasDoc = await getDoc(canvasRef);
    
    if (canvasDoc.exists()) {
      return { id: canvasDoc.id, ...canvasDoc.data() };
    } else {
      throw new Error('Canvas not found');
    }
  } catch (error) {
    console.error('Error getting canvas:', error);
    throw new Error('Failed to load canvas. Please try again.');
  }
};

// Delete a canvas
export const deleteCanvas = async (canvasId) => {
  try {
    const canvasRef = doc(db, 'canvases', canvasId);
    await deleteDoc(canvasRef);
    console.log('Canvas deleted successfully:', canvasId);
    return true;
  } catch (error) {
    console.error('Error deleting canvas:', error);
    throw new Error('Failed to delete canvas. Please try again.');
  }
};

// Subscribe to canvas changes
export const subscribeToShapes = (canvasId, callback) => {
  const canvasRef = doc(db, 'canvases', canvasId);
  
  return onSnapshot(canvasRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      callback(data.shapes || []);
    } else {
      callback([]);
    }
  });
};


// Create a new shape
export const createShape = async (canvasId, shapeData) => {
  try {
    const canvasRef = doc(db, 'canvases', canvasId);
    
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
      isLocked: true,
      lockedBy: shapeData.createdBy,
      isSelected: true,
      selectedBy: shapeData.createdBy
    };

    // Only add text fields for text shapes and when they are defined
    if (shapeData.type === 'text') {
      if (shapeData.text !== undefined) {
        shape.text = shapeData.text;
      }
      if (shapeData.textType !== undefined) {
        shape.textType = shapeData.textType;
      }
      if (shapeData.fontFamily !== undefined) {
        shape.fontFamily = shapeData.fontFamily;
      }
    }

    // Add card fields when they are defined
    if (shapeData.type === 'card') {
      if (shapeData.title !== undefined) {
        shape.title = shapeData.title;
      }
      if (shapeData.content !== undefined) {
        shape.content = shapeData.content;
      }
      if (shapeData.items !== undefined) {
        shape.items = shapeData.items;
      }
    }

    // Add list fields when they are defined
    if (shapeData.type === 'list') {
      if (shapeData.title !== undefined) {
        shape.title = shapeData.title;
      }
      if (shapeData.items !== undefined) {
        shape.items = shapeData.items;
      }
    }

    // Add sticky note text when defined
    if (shapeData.type === 'stickyNote' && shapeData.text !== undefined) {
      shape.text = shapeData.text;
    }

    const updatedShapes = [...currentShapes, shape];
    
    await setDoc(canvasRef, {
      shapes: updatedShapes,
      lastUpdated: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error creating shape:', error);
    throw new Error('Failed to create shape. Please try again.');
  }
};

// Create a new shape without auto-selecting (for bulk operations)
export const createShapeWithoutSelection = async (canvasId, shapeData) => {
  try {
    const canvasRef = doc(db, 'canvases', canvasId);
    
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
      lockedBy: null,
      isSelected: false,
      selectedBy: null
    };

    // Only add text fields for text shapes and when they are defined
    if (shapeData.type === 'text') {
      if (shapeData.text !== undefined) {
        shape.text = shapeData.text;
      }
      if (shapeData.textType !== undefined) {
        shape.textType = shapeData.textType;
      }
      if (shapeData.fontFamily !== undefined) {
        shape.fontFamily = shapeData.fontFamily;
      }
    }

    // Add card fields when they are defined
    if (shapeData.type === 'card') {
      if (shapeData.title !== undefined) {
        shape.title = shapeData.title;
      }
      if (shapeData.content !== undefined) {
        shape.content = shapeData.content;
      }
      if (shapeData.items !== undefined) {
        shape.items = shapeData.items;
      }
    }

    // Add list fields when they are defined
    if (shapeData.type === 'list') {
      if (shapeData.title !== undefined) {
        shape.title = shapeData.title;
      }
      if (shapeData.items !== undefined) {
        shape.items = shapeData.items;
      }
    }

    // Add sticky note text when defined
    if (shapeData.type === 'stickyNote' && shapeData.text !== undefined) {
      shape.text = shapeData.text;
    }

    const updatedShapes = [...currentShapes, shape];
    
    await setDoc(canvasRef, {
      shapes: updatedShapes,
      lastUpdated: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error creating shape:', error);
    throw new Error('Failed to create shape. Please try again.');
  }
};

// Update an existing shape
export const updateShape = async (canvasId, shapeId, updates) => {
  console.log(`🔄 canvas.js: updateShape called for shape ${shapeId} with updates:`, updates);
  
  const canvasRef = doc(db, 'canvases', canvasId);
  
  // First get current shapes
  const canvasDoc = await getDoc(canvasRef);
  if (!canvasDoc.exists()) {
    console.error('Canvas document does not exist');
    return;
  }
  
  const currentShapes = canvasDoc.data().shapes || [];
  const shapeToUpdate = currentShapes.find(shape => shape.id === shapeId);
  
  if (!shapeToUpdate) {
    console.error(`❌ canvas.js: Shape ${shapeId} not found in current shapes`);
    return;
  }
  
  console.log(`📝 canvas.js: Current shape data:`, shapeToUpdate);
  
  // Filter out undefined values from updates to prevent Firebase errors
  const filteredUpdates = Object.fromEntries(
    Object.entries(updates).filter(([_, value]) => value !== undefined)
  );

  const updatedShapes = currentShapes.map(shape => 
    shape.id === shapeId 
      ? { 
          ...shape, 
          ...filteredUpdates, 
          lastModifiedAt: new Date(),
          lastModifiedBy: updates.lastModifiedBy || shape.lastModifiedBy
        }
      : shape
  );
  
  console.log(`📝 canvas.js: Updated shape data:`, updatedShapes.find(shape => shape.id === shapeId));
  
  try {
    await setDoc(canvasRef, {
      ...canvasDoc.data(),
      shapes: updatedShapes,
      lastUpdated: serverTimestamp()
    });
    console.log(`✅ canvas.js: Successfully updated shape ${shapeId} in Firebase`);
  } catch (error) {
    console.error('❌ canvas.js: Firebase update failed:', error);
    throw error;
  }
};

// Update shape selection state
export const updateShapeSelection = async (canvasId, shapeId, userId, isSelected) => {
  const canvasRef = doc(db, 'canvases', canvasId);
  
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
export const clearUserSelections = async (canvasId, userId) => {
  const canvasRef = doc(db, 'canvases', canvasId);
  
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
export const clearUserLocks = async (canvasId, userId) => {
  const canvasRef = doc(db, 'canvases', canvasId);
  
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
export const deleteShape = async (canvasId, shapeId) => {
  const canvasRef = doc(db, 'canvases', canvasId);
  
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
export const lockShape = async (canvasId, shapeId, userId) => {
  await updateShape(canvasId, shapeId, {
    isLocked: true,
    lockedBy: userId
  });
};

// Unlock a shape
export const unlockShape = async (canvasId, shapeId) => {
  await updateShape(canvasId, shapeId, {
    isLocked: false,
    lockedBy: null
  });
};

// ─────────────── Real-time Position Updates ───────────────

// Subscribe to real-time position updates for a specific shape
export const subscribeToShapePosition = (canvasId, shapeId, callback) => {
  const positionRef = ref(rtdb, `positions/${canvasId}/${shapeId}`);
  
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

// Update shape position in real-time (for live dragging) with optimized throttling
export const updateShapePosition = async (canvasId, shapeId, x, y, userId) => {
  const positionRef = ref(rtdb, `positions/${canvasId}/${shapeId}`);
  
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
export const clearShapePosition = async (canvasId, shapeId) => {
  const positionRef = ref(rtdb, `positions/${canvasId}/${shapeId}`);
  
  console.log(`🗑️ clearShapePosition called for shape ${shapeId}`);
  try {
    await remove(positionRef);
    console.log(`✅ Real-time position removed from database for shape ${shapeId}`);
  } catch (error) {
    console.error('Error clearing real-time position:', error);
  }
};

// Subscribe to all real-time position updates with optimized handling
export const subscribeToAllPositions = (canvasId, callback) => {
  const positionsRef = ref(rtdb, `positions/${canvasId}`);
  let lastUpdateTime = 0;
  const updateThrottle = 16; // ~60 FPS
  
  const unsubscribe = onValue(positionsRef, (snapshot) => {
    const currentTime = Date.now();
    
    // Throttle updates to prevent excessive re-renders
    if (currentTime - lastUpdateTime < updateThrottle) {
      return;
    }
    
    lastUpdateTime = currentTime;
    
    if (snapshot.exists()) {
      const positions = snapshot.val();
      callback(positions);
    } else {
      callback({});
    }
  });

  return unsubscribe;
};
