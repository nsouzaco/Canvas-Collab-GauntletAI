import React, { useState, useRef, useEffect } from 'react';
import { parseShapeCommand, getCommandSuggestions } from '../../services/openai';
import { testOpenAIKey, testEnvironmentVariables } from '../../utils/testOpenAI';
import { AIAssistantPersistence } from '../../utils/persistence';

const AIChatInput = ({ onShapeCreate, isVisible, onToggle }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);
  const inputRef = useRef(null);

  // Focus input when component becomes visible
  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible]);

  // Load cached AI state on mount
  useEffect(() => {
    const cachedState = AIAssistantPersistence.loadAIState();
    if (cachedState) {
      setSuggestions(cachedState.suggestions || getCommandSuggestions());
      setApiStatus(cachedState.apiStatus);
      if (cachedState.lastCommand) {
        setInput(cachedState.lastCommand);
      }
    } else {
      setSuggestions(getCommandSuggestions());
    }
  }, []);

  // Test API key on mount
  useEffect(() => {
    if (isVisible) {
      const hasKey = testOpenAIKey();
      const hasEnvVars = testEnvironmentVariables();
      const status = hasKey && hasEnvVars ? 'connected' : 'error';
      setApiStatus(status);
      
      // Save API status
      AIAssistantPersistence.saveAIState({
        apiStatus: status,
        suggestions: suggestions,
        isVisible: true
      });
    }
  }, [isVisible, suggestions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      const parsedCommand = await parseShapeCommand(input.trim());
      
      if (parsedCommand.error) {
        setError(parsedCommand.error);
        return;
      }

      // Remove confidence check - let LLM handle incomplete commands
      // if (parsedCommand.confidence < 0.3) {
      //   setError('Command not clear enough. Please try being more specific.');
      //   return;
      // }

      // Call the AI operation handler - LLM handles text extraction intelligently
      const result = await onShapeCreate(parsedCommand);
      
      // Show success message
      if (result && result.message) {
        console.log('✅ AI operation result:', result.message);
      }
      
      // Save the successful command and result
      AIAssistantPersistence.saveLastCommand(input.trim(), result);
      
      // Clear input on success
      setInput('');
      setShowSuggestions(false);
    } catch (err) {
      console.error('Error processing command:', err);
      setError('Failed to process command. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    setError('');
    setShowSuggestions(e.target.value.length > 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      setInput('');
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors z-50"
        title="Open AI Assistant"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">AI Assistant</h3>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Try: 'draw a red circle'"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-gray-400"
            disabled={isLoading}
          />
          
          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
              {suggestions
                .filter(suggestion => 
                  suggestion.toLowerCase().includes(input.toLowerCase())
                )
                .slice(0, 4)
                .map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none first:rounded-t-lg last:rounded-b-lg"
                  >
                    {suggestion}
                  </button>
                ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span>Generate</span>
            </>
          )}
        </button>
      </form>

    </div>
  );
};

export default AIChatInput;
