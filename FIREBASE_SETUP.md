# Firebase Authorization Setup

## 🔥 Add Vercel Domain to Firebase

Your app is deployed but Firebase needs to authorize the Vercel domain for authentication to work.

### Step 1: Go to Firebase Console
Visit: https://console.firebase.google.com/project/collabcanvas-71e95/authentication/settings

### Step 2: Add Authorized Domains
1. Scroll down to **Authorized domains** section
2. Click **Add domain**
3. Add these domains one by one:
   - `collabcanvas-cuuk8xx97-natalyscst-gmailcoms-projects.vercel.app`
   - `collabcanvas-be0n16ahk-natalyscst-gmailcoms-projects.vercel.app`
   - `collabcanvas.vercel.app` (if you set up custom domain later)

### Step 3: Check Database Rules (Optional)
Make sure your Firestore and Realtime Database have proper security rules.

#### Firestore Rules
Go to: https://console.firebase.google.com/project/collabcanvas-71e95/firestore/rules

Should look like:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /canvas/{canvasId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### Realtime Database Rules
Go to: https://console.firebase.google.com/project/collabcanvas-71e95/database/collabcanvas-71e95-default-rtdb/rules

Should look like:
```json
{
  "rules": {
    "presence": {
      "$uid": {
        ".read": true,
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

## ✅ After Setup

Once authorized domains are added, your app at these URLs will work:
- Production: https://collabcanvas-cuuk8xx97-natalyscst-gmailcoms-projects.vercel.app
- Previous: https://collabcanvas-be0n16ahk-natalyscst-gmailcoms-projects.vercel.app

Test the app by:
1. Opening the URL in a browser
2. Creating an account or signing in with Google
3. Creating shapes and testing real-time collaboration
4. Opening in another browser/tab to test multi-user features

Enjoy! 🎨✨

