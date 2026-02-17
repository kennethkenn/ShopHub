import { Navigate } from 'react-router-dom';
import Spinner from './Spinner';

function PublicRoute({ children, user, isHydrating = false }) {
    const token = localStorage.getItem('token');

    if (isHydrating) {
        return <Spinner fullPage />;
    }

    if (token && user) {
        return <Navigate to="/products" replace />;
    }

    return children;
}

export default PublicRoute;
