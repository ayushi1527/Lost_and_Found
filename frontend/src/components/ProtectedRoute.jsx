// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, isAuth }) {
  if (!isAuth) {
    return <Navigate to="/login" />;
  }
  return children;
}
