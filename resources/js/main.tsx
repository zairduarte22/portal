import { createRoot } from "react-dom/client";
import App from "./app/App";
import "./styles/index.css";

// Global fetch override for Laravel Sanctum SPA Authentication
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  if (!config) config = {};
  
  // Ensure credentials are sent with every request
  config.credentials = 'include';
  
  // Extract CSRF token from cookies
  const match = document.cookie.match(new RegExp('(^|;\\s*)(XSRF-TOKEN)=([^;]*)'));
  const csrfToken = match ? decodeURIComponent(match[3]) : null;

  if (csrfToken && !['GET', 'HEAD', 'OPTIONS'].includes(config.method?.toUpperCase() || 'GET')) {
    config.headers = {
      ...config.headers,
      'X-XSRF-TOKEN': csrfToken,
      'Accept': 'application/json',
    };
  }

  return originalFetch(resource, config);
};

createRoot(document.getElementById("root")!).render(<App />);