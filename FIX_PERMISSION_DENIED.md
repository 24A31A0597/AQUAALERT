# 🔐 URGENT: Fix Firebase Permission Denied Error

## The Problem
Your Firebase Realtime Database rules are set to **deny all writes**. This is why hazard reports cannot be submitted.

## ✅ THE SOLUTION (5 minutes)

### Step 1: Open Firebase Console
1. Go to: https://console.firebase.google.com/
2. **Login** with your Google account
3. Click on project: **aquaalert-ae2f7**

### Step 2: Navigate to Database Rules
1. In the left sidebar, under **"Build"**, click **"Realtime Database"**
2. You'll see your database with data
3. At the top, click the **"Rules"** tab (next to "Data" tab)

### Step 3: View Current Rules
You'll see something like this (this is WRONG):
```json
{
  "rules": {
    ".read": false,
    ".write": false
  }
}
```

### Step 4: Update the Rules
**DELETE EVERYTHING** and replace with this:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### Step 5: Publish
1. Click the **"Publish"** button (bottom right, blue button)
2. A dialog will popup saying "Are you sure you want to publish these changes?"
3. Click **"Publish"** again to confirm
4. Wait for the green success message: ✅ "Your security rules have been published"

### Step 6: Verify It Worked
1. Go back to your app: http://localhost:5175/test
2. Fill in Title and Description
3. Click "Submit Test"
4. You should see: ✅ Success! Report ID: [some-id]

---

## 🎯 Alternative: Specific Rules (More Secure)

If you want more controlled access, use these rules instead:

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
      ".write": true
    }
  }
}
```

This allows:
- ✅ Anyone can read all data
- ✅ Anyone can write to hazards/reports
- ✅ ESP32 can write sensor data
- ✅ Anyone can write alerts

---

## 🚨 Still Not Working?

### Check These:

1. **Did you click "Publish"?**
   - The rules won't apply until you publish them
   - Look for the green checkmark ✅

2. **Is the database URL correct?**
   - Should be: `aquaalert-ae2f7-default-rtdb.asia-southeast1.firebasedatabase.app`
   - Check your `.env` file in the project root

3. **Are you looking at the right project?**
   - Make sure it says "aquaalert-ae2f7" at the top of Firebase Console

4. **Try hard refresh:**
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

---

## 📸 Visual Guide

### What you should see in Firebase Console:

**Location to click:**
```
Firebase Console
  └─ aquaalert-ae2f7 (your project)
      └─ Build (left sidebar)
          └─ Realtime Database
              └─ [Rules] tab (click this)
```

**The Rules Editor:**
```
┌─────────────────────────────────────┐
│ Rules Editor                        │
├─────────────────────────────────────┤
│ {                                   │
│   "rules": {                        │
│     ".read": true,    ← MUST BE true│
│     ".write": true    ← MUST BE true│
│   }                                 │
│ }                                   │
└─────────────────────────────────────┘
            [Publish] ← Click this button
```

---

## ⏱️ Quick Checklist

- [ ] Opened Firebase Console
- [ ] Selected aquaalert-ae2f7 project
- [ ] Clicked "Realtime Database" 
- [ ] Clicked "Rules" tab
- [ ] Changed ".write": false to ".write": true
- [ ] Changed ".read": false to ".read": true
- [ ] Clicked "Publish" button
- [ ] Saw green success message
- [ ] Refreshed the app
- [ ] Tried submitting again

---

## 🎉 After Fixing

Once rules are published, immediately test:

1. Visit: http://localhost:5175/test
2. Submit a test report
3. Should see: ✅ Success! Report ID: xxx

Then try the full form:
1. Visit: http://localhost:5175/report
2. Fill out all fields
3. Submit
4. Should redirect to home page ✅

---

## ⚠️ Production Security Note

The rule `.write": true` allows ANYONE to write to your database.

**For production, use:**
```json
{
  "rules": {
    "hazards": {
      "reports": {
        ".read": true,
        ".write": "auth != null",
        "$reportId": {
          ".validate": "newData.hasChildren(['title', 'description', 'severity', 'location'])"
        }
      }
    }
  }
}
```

This requires:
- Users must be logged in to submit reports
- Reports must have required fields
- Anyone can read reports

But for now, just use `.write": true` to get it working!
