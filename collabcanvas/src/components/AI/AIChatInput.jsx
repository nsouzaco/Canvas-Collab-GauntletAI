import React, { useState, useRef, useEffect } from 'react';
import { parseShapeCommand, getCommandSuggestions } from '../../services/openai';
import { testOpenAIKey, testEnvironmentVariables } from '../../utils/testOpenAI';
import { AIAssistantPersistence } from '../../utils/persistence';

const AIChatInput = ({ onShapeCreate, isVisible, onToggle, canvasMetadata = { name: '', description: '' } }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
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
      // Add user message to conversation history
      const userMessage = { role: 'user', content: input.trim() };
      const updatedHistory = [...conversationHistory, userMessage];
      
      // Keep only last 10 messages to avoid overwhelming the API
      const trimmedHistory = updatedHistory.slice(-10);
      setConversationHistory(trimmedHistory);

      const parsedCommand = await parseShapeCommand(input.trim(), trimmedHistory, canvasMetadata);
      
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
      const result = await onShapeCreate(parsedCommand, input.trim(), trimmedHistory);
      
      // Add AI response to conversation history
      if (result && result.message) {
        const aiMessage = { role: 'assistant', content: result.message };
        setConversationHistory(prev => [...prev.slice(-9), aiMessage]); // Keep last 10 messages
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
            placeholder="Try: 'create a persona card' or 'add app features'"
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
              <span>
                {input.toLowerCase().includes('persona') || input.toLowerCase().includes('feature') || 
                 input.toLowerCase().includes('user story') || input.toLowerCase().includes('pain point') ||
                 input.toLowerCase().includes('competitive') ? 'Generating content...' : 'Processing...'}
              </span>
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

      {/* Quick Commands */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs font-medium text-gray-500 mb-2">Quick Commands</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSuggestionClick('Create a persona card')}
            disabled={isLoading}
            className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🎭 Persona
          </button>
          <button
            onClick={() => handleSuggestionClick('Add feature cards')}
            disabled={isLoading}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ⭐ Features
          </button>
          <button
            onClick={() => handleSuggestionClick('Create user story card')}
            disabled={isLoading}
            className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📖 User Story
          </button>
          <button
            onClick={() => handleSuggestionClick('Add pain points')}
            disabled={isLoading}
            className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ⚠️ Pain Points
          </button>
          <button
            onClick={() => handleSuggestionClick('Create red circle')}
            disabled={isLoading}
            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🔴 Circle
          </button>
          <button
            onClick={() => handleSuggestionClick('Create blue rectangle')}
            disabled={isLoading}
            className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🟦 Rectangle
          </button>
          <button
            onClick={() => handleSuggestionClick('Add sticky note')}
            disabled={isLoading}
            className="px-3 py-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 text-xs rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📝 Note
          </button>
          <button
            onClick={() => handleSuggestionClick('Create todo list')}
            disabled={isLoading}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✅ Todo List
          </button>
        </div>
      </div>

    </div>
  );
};

export default AIChatInput;
