#!/bin/bash

echo "🔧 Fixing Vercel Environment Variables..."
echo ""

# Remove all existing environment variables
echo "Removing old environment variables..."
vercel env rm VITE_FIREBASE_API_KEY production -y 2>/dev/null
vercel env rm VITE_FIREBASE_API_KEY preview -y 2>/dev/null
vercel env rm VITE_FIREBASE_AUTH_DOMAIN production -y 2>/dev/null
vercel env rm VITE_FIREBASE_AUTH_DOMAIN preview -y 2>/dev/null
vercel env rm VITE_FIREBASE_PROJECT_ID production -y 2>/dev/null
vercel env rm VITE_FIREBASE_PROJECT_ID preview -y 2>/dev/null
vercel env rm VITE_FIREBASE_STORAGE_BUCKET production -y 2>/dev/null
vercel env rm VITE_FIREBASE_STORAGE_BUCKET preview -y 2>/dev/null
vercel env rm VITE_FIREBASE_MESSAGING_SENDER_ID production -y 2>/dev/null
vercel env rm VITE_FIREBASE_MESSAGING_SENDER_ID preview -y 2>/dev/null
vercel env rm VITE_FIREBASE_APP_ID production -y 2>/dev/null
vercel env rm VITE_FIREBASE_APP_ID preview -y 2>/dev/null
vercel env rm VITE_FIREBASE_DATABASE_URL production -y 2>/dev/null
vercel env rm VITE_FIREBASE_DATABASE_URL preview -y 2>/dev/null

echo ""
echo "✅ Old variables removed"
echo ""
echo "Adding clean environment variables..."

# Add variables without newlines
printf "AIzaSyD0u-YikxSs4MplgOVf1IWBoETkzsa06s0" | vercel env add VITE_FIREBASE_API_KEY production
printf "AIzaSyD0u-YikxSs4MplgOVf1IWBoETkzsa06s0" | vercel env add VITE_FIREBASE_API_KEY preview

printf "collabcanvas-71e95.firebaseapp.com" | vercel env add VITE_FIREBASE_AUTH_DOMAIN production
printf "collabcanvas-71e95.firebaseapp.com" | vercel env add VITE_FIREBASE_AUTH_DOMAIN preview

printf "collabcanvas-71e95" | vercel env add VITE_FIREBASE_PROJECT_ID production
printf "collabcanvas-71e95" | vercel env add VITE_FIREBASE_PROJECT_ID preview

printf "collabcanvas-71e95.firebasestorage.app" | vercel env add VITE_FIREBASE_STORAGE_BUCKET production
printf "collabcanvas-71e95.firebasestorage.app" | vercel env add VITE_FIREBASE_STORAGE_BUCKET preview

printf "624493173361" | vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID production
printf "624493173361" | vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID preview

printf "1:624493173361:web:3442414f26cc35fd3a59d0" | vercel env add VITE_FIREBASE_APP_ID production
printf "1:624493173361:web:3442414f26cc35fd3a59d0" | vercel env add VITE_FIREBASE_APP_ID preview

printf "https://collabcanvas-71e95-default-rtdb.firebaseio.com" | vercel env add VITE_FIREBASE_DATABASE_URL production
printf "https://collabcanvas-71e95-default-rtdb.firebaseio.com" | vercel env add VITE_FIREBASE_DATABASE_URL preview

echo ""
echo "✅ Clean environment variables added!"
echo ""
echo "Redeploying..."
vercel --prod --yes

echo ""
echo "🎉 Done! Your app should now work correctly."

