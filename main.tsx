import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/globals.css";
import { ApiService } from "./services/ApiService";

// Initialize API service with better error handling
const initializeApp = async () => {
  console.log("Initializing application...");
  
  // First, check if the browser is online
  if (!navigator.onLine) {
    console.log("Browser reports offline status, starting in mock mode");
    ApiService.setMockMode(true);
  } else {
    try {
      // Try to connect to the API with multiple endpoints
      const endpoints = ['/health', '/api/status', '/'];
      let connected = false;
      
      for (const endpoint of endpoints) {
        try {
          // Try a quick health check with a short timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2500);
          
          const response = await fetch(`${ApiService.getApiBaseUrl()}${endpoint}`, {
            method: 'GET',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json, text/plain, */*'
            },
            signal: controller.signal,
            cache: 'no-cache', // Ensure we don't use a cached response
            mode: process.env.NODE_ENV !== 'production' ? 'cors' : undefined,
          });
          
          clearTimeout(timeoutId);
          
          // Even a 404 means server is running
          if (response.ok || response.status === 404) {
            connected = true;
            console.log(`API server is available at ${endpoint}, starting in API mode`);
            ApiService.setMockMode(false);
            break;
          }
        } catch (endpointError) {
          console.warn(`Health check failed for endpoint ${endpoint}`);
          // Continue to try next endpoint
        }
      }
      
      if (!connected) {
        console.log("API server unavailable on any endpoint, starting in mock mode");
        ApiService.setMockMode(true);
      }
    } catch (error) {
      console.error("Error during API initialization:", error);
      console.log("Starting in mock mode due to initialization error");
      ApiService.setMockMode(true);
    }
  }
  
  // Render the app regardless of API availability
  const rootElement = document.getElementById("root");
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } else {
    console.error("Root element not found");
  }
};

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
  console.error('Unhandled promise rejection:', event.reason);
  
  // If it's a fetch error, we can handle it gracefully
  if (
    event.reason instanceof TypeError && 
    (event.reason.message.includes('fetch') || event.reason.message.includes('network'))
  ) {
    console.warn('Network request failed, application will use mock data');
    ApiService.setMockMode(true);
  }
});

// Start the application
initializeApp().catch(error => {
  console.error("Fatal error during application initialization:", error);
  // We still want to render the app even if initialization fails
  const rootElement = document.getElementById("root");
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
});