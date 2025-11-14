import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return children;
}

export function AdminRoute({ children }) {
  const { isAuthenticated, role } = useContext(AuthContext);

  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (role !== "admin") return <Navigate to="/" replace />;

  return children;
}

export function HotelRoute({ children }) {
  const { isAuthenticated, role } = useContext(AuthContext);

  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (role !== "hotel") return <Navigate to="/" replace />;

  return children;
}

export function ClientRoute({ children }) {
  const { isAuthenticated, role } = useContext(AuthContext);

  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (role !== "user") return <Navigate to="/" replace />;

  return children;
}
