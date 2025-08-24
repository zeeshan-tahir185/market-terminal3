// src/routes/index.js
import NoteDetailPage from '../components/home/NoteDetailPage.jsx';
import HomePage from '../pages/HomePage.jsx'; // Verify this path
import NotFound from '../pages/NotFound.jsx'; // Verify this path

const routes = [
  { path: '/', element: <HomePage /> },
  { path: '/note/:id', element: <NoteDetailPage /> },
  { path: '*', element: <NotFound /> },
];

export default routes;