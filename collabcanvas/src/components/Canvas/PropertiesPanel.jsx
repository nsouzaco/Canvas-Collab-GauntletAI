import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit3, Save } from 'lucide-react';

const PropertiesPanel = ({ selectedShape, onUpdateShape, onDeleteShape, onClose, isVisible }) => {
  const [localData, setLocalData] = useState({
    title: '',
    text: '',
    content: '',
    items: []
  });
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize local data when selectedShape changes
  useEffect(() => {
    if (selectedShape) {
      setLocalData({
        title: selectedShape.title || '',
        text: selectedShape.text || '',
        content: selectedShape.content || '',
        items: Array.isArray(selectedShape.items) ? [...selectedShape.items] : []
      });
      setHasChanges(false);
    }
  }, [selectedShape]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setLocalData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  // Handle list item changes
  const handleItemChange = (index, value) => {
    const currentItems = localData.items || [];
    const newItems = [...currentItems];
    newItems[index] = value;
    setLocalData(prev => ({
      ...prev,
      items: newItems
    }));
    setHasChanges(true);
  };

  // Add new list item
  const addListItem = () => {
    const currentItems = localData.items || [];
    const newItems = [...currentItems, 'New item'];
    setLocalData(prev => ({
      ...prev,
      items: newItems
    }));
    setHasChanges(true);
  };

  // Remove list item
  const removeListItem = (index) => {
    const currentItems = localData.items || [];
    const newItems = currentItems.filter((_, i) => i !== index);
    setLocalData(prev => ({
      ...prev,
      items: newItems
    }));
    setHasChanges(true);
  };

  // Save changes
  const handleSave = () => {
    if (selectedShape && hasChanges) {
      const updateData = {};
      
      // Update based on shape type
      if (selectedShape.type === 'stickyNote') {
        updateData.text = localData.text;
      } else if (selectedShape.type === 'card') {
        updateData.title = localData.title;
        if (localData.content) {
          updateData.content = localData.content;
        }
        if (localData.items && localData.items.length > 0) {
          updateData.items = localData.items;
        }
      } else if (selectedShape.type === 'list') {
        updateData.title = localData.title;
        updateData.items = localData.items;
      }

      onUpdateShape(selectedShape.id, updateData);
      setHasChanges(false);
      
      // Close the panel after saving
      onClose();
    }
  };

  // Auto-save on blur (for better UX)
  const handleBlur = () => {
    if (hasChanges) {
      handleSave();
    }
  };

  // Handle delete shape
  const handleDelete = () => {
    if (selectedShape && onDeleteShape) {
      onDeleteShape(selectedShape.id);
      onClose(); // Close the panel after deletion
    }
  };

  if (!isVisible || !selectedShape) {
    return null;
  }

  const isStickyNote = selectedShape.type === 'stickyNote';
  const isCard = selectedShape.type === 'card';
  const isList = selectedShape.type === 'list';

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          {isStickyNote && 'Sticky Note'}
          {isCard && 'Card'}
          {isList && 'List'}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-red-100 rounded-md transition-colors group"
            title="Delete shape"
          >
            <Trash2 className="w-5 h-5 text-red-500 group-hover:text-red-700" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            title="Close panel"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Title (for cards and lists) */}
        {(isCard || isList) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={localData.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              onBlur={handleBlur}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter title..."
            />
          </div>
        )}

        {/* Text Content (for sticky notes) */}
        {isStickyNote && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note Content
            </label>
            <textarea
              value={localData.text || ''}
              onChange={(e) => handleInputChange('text', e.target.value)}
              onBlur={handleBlur}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Enter your note..."
            />
          </div>
        )}

        {/* Content (for cards) */}
        {isCard && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              value={localData.content || ''}
              onChange={(e) => handleInputChange('content', e.target.value)}
              onBlur={handleBlur}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Enter card content..."
            />
          </div>
        )}

        {/* List Items (for cards and lists) */}
        {(isCard || isList) && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Items
              </label>
              <button
                onClick={addListItem}
                className="flex items-center gap-1 px-2 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>
            
            <div className="space-y-2">
              {(localData.items || []).map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item || ''}
                    onChange={(e) => handleItemChange(index, e.target.value)}
                    onBlur={handleBlur}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder={`Item ${index + 1}`}
                  />
                  <button
                    onClick={() => removeListItem(index)}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {(localData.items || []).length === 0 && (
                <p className="text-sm text-gray-500 italic text-center py-4">
                  No items yet. Click "Add Item" to get started.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-3">
        {hasChanges && (
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        )}
        
        {/* Separator */}
        {hasChanges && (
          <div className="border-t border-gray-300"></div>
        )}
        
        {/* Delete Button */}
        <button
          onClick={handleDelete}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium shadow-sm hover:shadow-md"
        >
          <Trash2 className="w-4 h-4" />
          Delete {isStickyNote ? 'Note' : isCard ? 'Card' : 'List'}
        </button>
      </div>
    </div>
  );
};

export default PropertiesPanel;
