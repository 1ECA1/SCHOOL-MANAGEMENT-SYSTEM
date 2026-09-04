import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RoleRoute({ allowed, children }) {
  const { user } = useAuth();

  const role = user?.role?.toLowerCase();
  const allowedLower = allowed.map((r) => r.toLowerCase());

  if (!allowedLower.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default RoleRoute;
