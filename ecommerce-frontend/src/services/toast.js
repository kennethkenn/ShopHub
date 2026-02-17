import { toast } from 'react-hot-toast';

const showToast = {
    success: (message) => toast.success(message),
    error: (message) => toast.error(message),
    loading: (message) => toast.loading(message),
};

export default showToast;
