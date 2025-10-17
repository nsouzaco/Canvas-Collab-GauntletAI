// Test utility to verify OpenAI API key is loaded correctly
export const testOpenAIKey = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ OpenAI API key not found in environment variables');
    return false;
  }
  
  if (apiKey.startsWith('sk-')) {
    console.log('✅ OpenAI API key loaded successfully');
    console.log('🔑 Key starts with:', apiKey.substring(0, 10) + '...');
    return true;
  } else {
    console.error('❌ Invalid OpenAI API key format');
    return false;
  }
};

// Test function to verify environment variables
export const testEnvironmentVariables = () => {
  console.log('🔍 Testing environment variables...');
  
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
    } else {
      console.log(`✅ Found: ${varName}`);
    }
  });
  
  if (missingVars.length === 0) {
    console.log('🎉 All required environment variables are present!');
    return true;
  } else {
    console.error(`❌ Missing ${missingVars.length} environment variables`);
    return false;
  }
};
