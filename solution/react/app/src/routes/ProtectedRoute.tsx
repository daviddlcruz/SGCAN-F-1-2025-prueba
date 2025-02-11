import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/auth";

const ProtectedRoute = () => {
    const { isAuthenticated } = useAuthStore();
  
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;