// src/routes/index.js
import HomePage from '../pages/HomePage.jsx'; // Verify this path
import NotFound from '../pages/NotFound.jsx'; // Verify this path

const routes = [
  { path: '/', element: <HomePage /> },
  { path: '*', element: <NotFound /> },
];

export default routes;