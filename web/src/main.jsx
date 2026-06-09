import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { LatencyProvider } from './context/LatencyContext';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <LatencyProvider>
        <App />
      </LatencyProvider>
    </AuthProvider>
  </React.StrictMode>
);
