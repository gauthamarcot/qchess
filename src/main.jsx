import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// This is the standard entry point for a Vite React app.
// It finds the 'root' div in index.html and tells React to render the App component inside it.
const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Fatal Error: The root element with id 'root' was not found in index.html. The application cannot be mounted.");
}