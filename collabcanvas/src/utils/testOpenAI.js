// Test utility to verify OpenAI API key is loaded correctly
export const testOpenAIKey = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    return false;
  }
  
  if (apiKey.startsWith('sk-')) {
    return true;
  } else {
    console.error('❌ Invalid OpenAI API key format');
    return false;
  }
};

// Test function to verify environment variables
export const testEnvironmentVariables = () => {
  
  const requiredVars = [
    'VITE_OPENAI_API_KEY',
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID'
  ];
  
  const missingVars = [];
  
  requiredVars.forEach(varName => {
    const value = import.meta.env[varName];
    if (!value) {
      missingVars.push(varName);
      console.error(`❌ Missing: ${varName}`);
    } 
  });
  
  if (missingVars.length === 0) {
    return true;
  } else {
    return false;
  }
};
