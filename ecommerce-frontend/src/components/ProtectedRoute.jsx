import { Navigate } from 'react-router-dom';
import Spinner from './Spinner';

function ProtectedRoute({ children, user, isHydrating = false, requireAdmin = false }) {
    const token = localStorage.getItem('token');

    if (isHydrating) {
        return <Spinner fullPage />;
    }

    // Check if user is authenticated
    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    // Check if admin access is required
    if (requireAdmin && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default ProtectedRoute;
