// =================================================================
// Central API Configuration
// =================================================================
// This is the central file for defining the backend (PHP API) URL.

/**
 * --- Setup for Local Development (XAMPP) ---
 * 
 * Use this URL when running the frontend (React) on its development server (Vite)
 * and the backend (PHP) on a local XAMPP server.
 * Make sure the path matches your project's folder name inside `htdocs`.
 * 
 * Example: If your project is in `xampp/htdocs/my-erp`, the URL would be `http://localhost/my-erp/api/`
 */
// export const API_BASE_URL = 'http://localhost/erp/api/';

/**
 * --- Setup for Production Deployment ---
 * 
 * When deploying the project to a live host or Vercel, use the following URL.
 * This assumes the `api` directory will be at the same level as the frontend files.
 * Uncomment the following line and ensure the local development URL is commented out.
 */
export const API_BASE_URL = 'https://r.mostafarashed.com/api/';