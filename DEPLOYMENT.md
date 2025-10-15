# CollabCanvas Deployment Guide

## ✅ Deployed Successfully!

Your app is now live at:
- **Production URL**: https://collabcanvas-be0n16ahk-natalyscst-gmailcoms-projects.vercel.app

## 🔧 Important: Set Environment Variables

Your app won't work properly until you add the Firebase environment variables to Vercel.

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/natalyscst-gmailcoms-projects/collabcanvas
2. Click on **Settings** tab
3. Click on **Environment Variables** in the left sidebar

### Step 2: Add These Variables
Add each of these environment variables (copy from your `.env` file):

```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com
```

**Important**: 
- Set these for **Production**, **Preview**, and **Development** environments
- Click **Save** after adding each variable

### Step 3: Redeploy
After adding the environment variables:
1. Go back to the **Deployments** tab
2. Click on the latest deployment
3. Click the **⋯** (three dots) menu
4. Select **Redeploy**

OR run this command:
```bash
cd /Users/nat/CanvasCollab/collabcanvas && vercel --prod --yes
```

### Step 4: Configure Firebase
Make sure your Firebase project allows your Vercel domain:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **collabcanvas-71e95**
3. Go to **Authentication** > **Settings** > **Authorized domains**
4. Add these domains:
   - `collabcanvas-be0n16ahk-natalyscst-gmailcoms-projects.vercel.app`
   - `collabcanvas.vercel.app` (if you set up a custom domain)

## 🚀 Features Deployed

✅ **User Authentication** - Email/password + Google sign-in
✅ **Real-time Collaboration** - Multiple users can edit simultaneously
✅ **Canvas Operations** - Pan, zoom, reset view
✅ **Shape Creation** - Rectangles, circles, and text elements
✅ **Shape Manipulation** - Drag, resize, delete, edit text
✅ **Position Sync** - Real-time updates across all users
✅ **Selection Tracking** - See who's editing what
✅ **User Presence** - See who's online

## 📊 Deployment Stats

- Build time: ~36 seconds
- Bundle size: 1.19 MB (315 KB gzipped)
- Framework: Vite + React
- Hosting: Vercel

## 🔄 Future Deployments

To deploy updates:
```bash
cd /Users/nat/CanvasCollab/collabcanvas
npm run build  # Test build locally
vercel --prod --yes  # Deploy to production
```

## 🛠️ Troubleshooting

### App shows blank page
- Check if environment variables are set in Vercel dashboard
- Check browser console for errors
- Verify Firebase domain is authorized

### Authentication not working
- Verify Firebase config in Vercel environment variables
- Check Firebase authorized domains include Vercel URL

### Real-time sync not working
- Check Firebase Realtime Database rules
- Verify Firestore security rules
- Check browser console for permission errors

## 📝 Next Steps

1. ✅ Add environment variables to Vercel
2. ✅ Authorize Vercel domain in Firebase
3. ✅ Test the deployed app
4. 🔄 Set up custom domain (optional)
5. 🔄 Set up monitoring/analytics (optional)

Enjoy your live CollabCanvas app! 🎨✨

