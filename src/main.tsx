console.log(
  "API KEY CHECK:",
  import.meta.env.VITE_FIREBASE_API_KEY
);
import "./firebase.js";
import i18n from './i18n/config';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { I18nextProvider } from 'react-i18next';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  </StrictMode>
);
