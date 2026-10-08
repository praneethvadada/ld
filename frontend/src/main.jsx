import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/gelasio/latin-700.css';
import '@fontsource-variable/inter/wght.css';
import './styles/global.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
