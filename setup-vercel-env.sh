#!/bin/bash

echo "🚀 Setting up Vercel Environment Variables..."
echo ""
echo "This script will help you add Firebase environment variables to Vercel."
echo ""

# Read the .env file and set each variable
while IFS= read -r line; do
  # Skip comments and empty lines
  if [[ $line =~ ^#.*$ ]] || [[ -z $line ]]; then
    continue
  fi
  
  # Extract variable name and value
  VAR_NAME=$(echo "$line" | cut -d '=' -f 1)
  VAR_VALUE=$(echo "$line" | cut -d '=' -f 2-)
  
  echo "Adding $VAR_NAME..."
  echo "$VAR_VALUE" | vercel env add "$VAR_NAME" production
  echo "$VAR_VALUE" | vercel env add "$VAR_NAME" preview
  
done < .env

echo ""
echo "✅ Environment variables added!"
echo ""
echo "Now redeploying to apply changes..."
vercel --prod --yes

echo ""
echo "🎉 Deployment complete!"
echo "Your app is live at: https://collabcanvas-be0n16ahk-natalyscst-gmailcoms-projects.vercel.app"

