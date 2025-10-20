import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCanvases, deleteCanvas } from '../../services/canvas';
import { useAuth } from '../../contexts/AuthContext';
import CreateCanvasModal from './CreateCanvasModal';
import { Trash2, AlertTriangle } from 'lucide-react';

const CanvasDashboard = () => {
  const [canvases, setCanvases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, canvas: null });
  const [deleting, setDeleting] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadCanvases();
  }, []);

  const loadCanvases = async () => {
    try {
      setLoading(true);
      const canvasesData = await getAllCanvases();
      setCanvases(canvasesData);
    } catch (error) {
      console.error('Error loading canvases:', error);
      setError('Failed to load canvases. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCanvas = (canvasId) => {
    navigate(`/canvas/${canvasId}`);
  };

  const handleCanvasCreated = (canvasId) => {
    // Refresh the canvas list
    loadCanvases();
    // Navigate to the new canvas
    navigate(`/canvas/${canvasId}`);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCreatorName = (createdBy) => {
    // For now, we'll use a simple display name
    // In a real app, you'd fetch this from a users collection
    return createdBy === currentUser?.uid ? 'You' : 'Anonymous User';
  };

  const handleDeleteClick = (canvas) => {
    setDeleteConfirm({ show: true, canvas });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.canvas) return;
    
    try {
      setDeleting(true);
      await deleteCanvas(deleteConfirm.canvas.id);
      
      // Remove the canvas from local state
      setCanvases(prev => prev.filter(canvas => canvas.id !== deleteConfirm.canvas.id));
      
      // Close the confirmation dialog
      setDeleteConfirm({ show: false, canvas: null });
      
      console.log('Canvas deleted successfully');
    } catch (error) {
      console.error('Error deleting canvas:', error);
      setError('Failed to delete canvas. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ show: false, canvas: null });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading canvases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <h1 
              className="text-4xl font-bold text-blue-600 leading-tight mr-4" 
              style={{ fontFamily: "'Borel', cursive" }}
            >
              Startup Collab
            </h1>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Canvases</h2>
          <p className="text-gray-600">Collaborate on ideas and bring your startup visions to life</p>
        </div>

        {/* Create Canvas Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-xl flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Canvas
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Canvases Grid */}
        {canvases.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No canvases yet</h3>
            <p className="text-gray-500 mb-4">Create your first canvas to get started!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Create Your First Canvas
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {canvases.map((canvas) => (
              <div
                key={canvas.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 truncate pr-2">
                      {canvas.name || 'Untitled Canvas'}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {canvas.shapes?.length || 0} items
                      </span>
                      {canvas.createdBy === currentUser?.uid && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(canvas);
                          }}
                          className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors duration-200"
                          title="Delete canvas"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {canvas.description || 'No description available'}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>Created by {getCreatorName(canvas.createdBy)}</span>
                    <span>{formatDate(canvas.createdAt)}</span>
                  </div>
                  
                  <button
                    onClick={() => handleJoinCanvas(canvas.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                  >
                    Join Canvas
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Canvas Modal */}
        <CreateCanvasModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />

        {/* Delete Confirmation Dialog */}
        {deleteConfirm.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      Delete Canvas
                    </h3>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete "{deleteConfirm.canvas?.name || 'Untitled Canvas'}"? 
                    This action cannot be undone and will permanently remove the canvas and all its contents.
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleDeleteCancel}
                    disabled={deleting}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={deleting}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center"
                  >
                    {deleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Deleting...
                      </>
                    ) : (
                      'Delete Canvas'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CanvasDashboard;
