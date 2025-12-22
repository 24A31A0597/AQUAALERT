# 🌊 Aqua Alert – Water Safety Monitoring Platform

Aqua Alert is a real-time, community-driven water hazard monitoring platform designed to enhance public safety through official alerts, user-reported hazards, and interactive map visualization.

---

## 📌 Overview

Aqua Alert enables communities and authorities to collaborate in identifying, reporting, and responding to water-related hazards such as flooding, contamination, and extreme weather events.

The platform combines real-time alerts, crowdsourced hazard reporting, and interactive geospatial visualization to create a reliable early-warning and awareness system.

---

## ✨ Key Features

✔ Official emergency alerts released by administrators  
✔ Community hazard reporting (user & guest supported)  
✔ Verified and unverified hazard classification  
✔ Interactive hazard map with clustering and severity-based colors  
✔ Emergency alerts dashboard for critical situations  
✔ Community dashboard for public reports and discussions  
✔ Multi-language support (English, Telugu, Hindi, etc.)  
✔ Firebase-powered real-time data synchronization  

---

## 🚨 Hazard Severity Levels

| Severity | Color | Description |
|--------|------|-------------|
| Low | 🟢 Green | Minor concern |
| Medium | 🟡 Yellow | Moderate risk |
| High | 🟠 Orange | Significant risk |
| Critical | 🔴 Red | Immediate danger |

---

## 🗺️ Interactive Hazard Map

- Displays official and user-reported hazards
- Marker clustering for dense regions
- Color-coded markers based on severity
- Verified and unverified badges on hazard details
- Zoom-based cluster expansion for clarity

---

## 🧑‍🤝‍🧑 User Roles & Access

### 👤 Guest Users
- Can report hazards anonymously
- Limited dashboard access

### 👥 Registered Users
- Report hazards with identity
- View hazard map and dashboards
- Participate in community reporting

### 🛠️ Admin
- Release official emergency alerts
- Manage active and resolved alerts
- Monitor system-wide hazard activity

---

## 🛠️ Technologies Used

- Frontend: React + Vite + TypeScript + Tailwind CSS  
- Backend: Firebase Realtime Database  
- Authentication: Firebase Auth  
- Maps: Leaflet / OpenStreetMap  
- Internationalization: i18n  
- Deployment: Vercel  

---

## 📂 Project Structure

```text
aqua-alert/
 ├── public/
 │   └── index.html
 │
 ├── src/
 │   ├── components/
 │   │   ├── Header.tsx
 │   │   ├── Footer.tsx
 │   │   ├── LanguageSelector.tsx
 │   │   ├── VerificationBadge.tsx
 │   │   └── ...
 │   │
 │   ├── contexts/
 │   │   ├── AuthContext.tsx
 │   │   └── NotificationContext.tsx
 │   │
 │   ├── i18n/
 │   │   ├── en.json
 │   │   ├── te.json
 │   │   └── hi.json
 │   │
 │   ├── pages/
 │   │   ├── Home.tsx
 │   │   ├── HazardMap.tsx
 │   │   ├── ReportHazard.tsx
 │   │   ├── EmergencyAlerts.tsx
 │   │   ├── Community.tsx
 │   │   ├── Education.tsx
 │   │   ├── Profile.tsx
 │   │   ├── AdminDashboard.tsx
 │   │   ├── Login.tsx
 │   │   └── Register.tsx
 │   │
 │   ├── routes/
 │   │   ├── AdminRoute.tsx
 │   │   └── PrivateRoute.tsx
 │   │
 │   ├── firebase.js
 │   ├── main.tsx
 │   └── App.tsx
 │
 ├── package.json
 ├── package-lock.json
 ├── tailwind.config.js
 ├── vite.config.ts
 ├── tsconfig.json
 └── README.md

```

---

## 🚀 Getting Started

```bash
git clone https://github.com/your-username/aqua-alert.git
cd aqua-alert
npm install
npm run dev

```

---

## 🔐 Environment Setup

Create a Firebase project and add your configuration inside:
```js
src/firebase.js
⚠️ Do not expose API keys in public repositories.
Use environment variables for production deployments.

```

---

## 📈 Future Enhancements

Real IoT sensor integration
AI-based hazard verification
Push notifications for emergencies
Advanced analytics dashboard
Mobile application version

---

## 📝 License
This project is open-source and available under the MIT License.

---

## 🙌 Acknowledgements
OpenStreetMap contributors
Firebase & Vercel
Community testers and contributors

---

## ⭐ Support
If you like this project, give it a ⭐ on GitHub and help spread awareness for safer communities 🌍

---
