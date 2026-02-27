# Fix Firebase Realtime Database Rules for Hazard Reporting

## Problem
Getting "Permission denied" when trying to submit hazard reports to Firebase.

## Solution

### Step 1: Open Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **aquaalert-ae2f7**
3. Click on **Realtime Database** (left sidebar under "Build")

### Step 2: Go to Rules Tab
1. Click the **"Rules"** tab at the top of the database editor
2. You'll see the current rules (they're likely too restrictive)

### Step 3: Update the Rules

**Current (restrictive) rules:**
```json
{
  "rules": {
    ".read": false,
    ".write": false
  }
}
```

**Replace with these rules:**
```json
{
  "rules": {
    "hazards": {
      "reports": {
        ".read": true,
        ".write": true
      }
    },
    "sensorData": {
      ".read": true,
      ".write": true
    },
    "alerts": {
      ".read": true,
      ".write": "root.child('users').child(auth.uid).exists()"
    }
  }
}
```

### Step 4: Publish the Rules
1. Click the **"Publish"** button (bottom right)
2. A dialog will appear asking to confirm
3. Click **"Publish"** again
4. Wait for the confirmation: "Rules were successfully published"

### Step 5: Test Again
1. Go back to your website (http://localhost:5175/)
2. Try submitting a hazard report again
3. It should work now! ✅

---

## Rule Breakdown

```json
"hazards": {
  "reports": {
    ".read": true,      // Anyone can read previous reports
    ".write": true      // Anyone can submit new reports
  }
},
"sensorData": {
  ".read": true,        // Anyone can read sensor data
  ".write": true        // Anyone can write sensor data (for ESP32)
},
"alerts": {
  ".read": true,        // Anyone can read alerts
  ".write": "root.child('users').child(auth.uid).exists()"  // Only logged-in users can write
}
```

---

## ⚠️ Security Note

The rules above allow **public writes**. For production:
- Use authentication tokens to verify users
- Add validation rules to ensure data quality
- Rate limit submissions to prevent spam

Example for production:
```json
{
  "rules": {
    "hazards": {
      "reports": {
        ".read": true,
        ".write": "auth.uid != null && root.child('users').child(auth.uid).exists()",
        ".validate": "newData.hasChildren(['hazardType', 'title', 'description', 'location'])"
      }
    }
  }
}
```

---

## Still Not Working?

1. **Check Database Location**: Your database URL is:
   ```
   https://aquaalert-ae2f7-default-rtdb.asia-southeast1.firebasedatabase.app
   ```

2. **Clear Cache**: Try clearing browser cache or hard refresh (Ctrl+Shift+R)

3. **Check Console**: Open browser console (F12) and look for detailed error messages

4. **Verify Rules**: Go back to Firebase Console and confirm rules were published (status should be green)

---

## Quick Copy-Paste

If you want to just allow everything for testing:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

⚠️ **Not recommended for production!** Only use for testing/development.
