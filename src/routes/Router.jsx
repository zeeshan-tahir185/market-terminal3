// src/routes/Router.jsx
import { Routes, Route } from 'react-router-dom';
import routes from './index';

const Router = () => {
  return (
    <Routes>
      {routes.map((route, index) => (
        <Route
          key={index}
          path={route.path}
          element={route.element}
        />
      ))}
    </Routes>
  );
};

export default Router;