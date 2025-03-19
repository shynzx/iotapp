// src/routers/ProtectedRoute.tsx
import React, { JSX } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = Boolean(localStorage.getItem("token")); // o la lógica que uses para autenticar

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
