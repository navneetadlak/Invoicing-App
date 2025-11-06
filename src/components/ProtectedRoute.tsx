import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { auth } = useAuth();
  if (!auth || !auth.user) return <Navigate to="/login" replace />;
  return children;
}
