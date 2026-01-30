import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import mobileBackend from './services/mobileBackend'

// Inizializza il backend mobile prima di renderizzare l'app
mobileBackend.initialize().then(() => {
  console.log('Mobile backend initialized successfully');
  
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}).catch(error => {
  console.error('Failed to initialize mobile backend:', error);
  // Renderizza comunque l'app, potrebbe funzionare in modalità browser
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
