import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateStartupDetails } from '../../services/openai';
import { createCanvas, createShapeWithoutSelection } from '../../services/canvas';
import { useAuth } from '../../contexts/AuthContext';

const CreateCanvasModal = ({ isOpen, onClose }) => {
  const [startupIdea, setStartupIdea] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startupIdea.trim()) {
      setError('Please describe your startup idea');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Generate startup name and description using AI
      const { name, description } = await generateStartupDetails(startupIdea.trim());
      
      // Create the canvas
      const canvasId = await createCanvas(name, description, currentUser.uid);
      
      // Add the startup name and description as text elements on the canvas
      const now = Date.now();
      
      // Calculate center positioning
      const CANVAS_WIDTH = Math.min(1200, window.innerWidth - 300);
      const CANVAS_HEIGHT = 1000;
      const TITLE_WIDTH = 400;
      const DESCRIPTION_WIDTH = 600;
      
      // Add startup name as a text element (title style, centered)
      const nameShapeData = {
        id: `shape_${now}_name`,
        type: 'text',
        x: (CANVAS_WIDTH / 2) - (TITLE_WIDTH / 2), // Center horizontally
        y: CANVAS_HEIGHT * 0.3, // 30% from top
        width: TITLE_WIDTH,
        height: 80,
        fill: '#1F2937',
        text: name,
        textType: 'title',
        fontFamily: 'Helvetica',
        fontSize: 32,
        createdBy: currentUser.uid
      };
      
      // Add startup description as a text element (heading2 style, centered)
      const descriptionShapeData = {
        id: `shape_${now}_description`,
        type: 'text',
        x: (CANVAS_WIDTH / 2) - (DESCRIPTION_WIDTH / 2), // Center horizontally
        y: CANVAS_HEIGHT * 0.4, // 40% from top
        width: DESCRIPTION_WIDTH,
        height: 120,
        fill: '#6B7280',
        text: description,
        textType: 'heading2',
        fontFamily: 'Helvetica',
        fontSize: 18,
        createdBy: currentUser.uid
      };
      
      // Add both text elements to the canvas
      await createShapeWithoutSelection(canvasId, nameShapeData);
      await createShapeWithoutSelection(canvasId, descriptionShapeData);
      
      // Navigate to the new canvas
      navigate(`/canvas/${canvasId}`);
      onClose();
      setStartupIdea('');
    } catch (error) {
      console.error('Error creating canvas:', error);
      setError('Failed to create canvas. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setStartupIdea('');
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Create New Canvas</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="startupIdea" className="block text-sm font-medium text-gray-700 mb-2">
              What's your startup idea? 💡
            </label>
            <textarea
              id="startupIdea"
              value={startupIdea}
              onChange={(e) => setStartupIdea(e.target.value)}
              placeholder="Describe your startup idea in a few words... (e.g., 'A fitness app for busy moms', 'AI-powered language learning', 'Sustainable fashion marketplace')"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              disabled={isLoading}
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !startupIdea.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Canvas'
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 text-xs text-gray-500">
          <p>✨ We'll generate a catchy name and description for your startup idea using AI!</p>
        </div>
      </div>
    </div>
  );
};

export default CreateCanvasModal;
