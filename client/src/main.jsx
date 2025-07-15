import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App.jsx';
import './index.css';

import { AuthProvider } from '../context/AuthContext.jsx';
import { ChatProvider } from '../context/ChatContext.jsx';
import { OtpProvider } from '../context/OtpContext.jsx';

const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <OtpProvider>
      <BrowserRouter>
        <AuthProvider>
          <ChatProvider>
            <App />
          </ChatProvider>
        </AuthProvider>
      </BrowserRouter>
    </OtpProvider>
  </React.StrictMode>
);
