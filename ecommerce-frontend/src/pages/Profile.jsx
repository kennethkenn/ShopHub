import { useEffect, useState } from 'react';
import api from '../services/api';
import Spinner from '../components/Spinner';
import './Profile.css';

function Profile({ user, setUser, showToast }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [profileForm, setProfileForm] = useState({
        firstName: '',
        lastName: '',
        phone: ''
    });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users/me');
            setProfile(response.data);
            setProfileForm({
                firstName: response.data.firstName || '',
                lastName: response.data.lastName || '',
                phone: response.data.phone || ''
            });
        } catch (error) {
            showToast('Failed to load profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            setSavingProfile(true);
            const response = await api.put('/users/me', profileForm);
            setProfile(response.data);

            const updatedUser = {
                ...user,
                id: response.data.id,
                firstName: response.data.firstName,
                lastName: response.data.lastName,
                email: response.data.email,
                role: response.data.role,
                phone: response.data.phone,
                enabled: response.data.enabled
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            showToast('Profile updated successfully', 'success');
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to update profile', 'error');
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword.length < 6) {
            showToast('New password must be at least 6 characters', 'error');
            return;
        }

        try {
            setSavingPassword(true);
            await api.put('/users/me/password', passwordForm);
            setPasswordForm({ currentPassword: '', newPassword: '' });
            showToast('Password changed successfully', 'success');
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to change password', 'error');
        } finally {
            setSavingPassword(false);
        }
    };

    if (loading) {
        return <Spinner fullPage />;
    }

    return (
        <div className="profile-page">
            <div className="container">
                <h1>My Profile</h1>

                <div className="profile-grid">
                    <form className="card profile-card" onSubmit={handleProfileSubmit}>
                        <h2>Personal Information</h2>
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" value={profile?.email || ''} disabled />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>First Name</label>
                                <input
                                    type="text"
                                    value={profileForm.firstName}
                                    onChange={(e) => setProfileForm((prev) => ({ ...prev, firstName: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <input
                                    type="text"
                                    value={profileForm.lastName}
                                    onChange={(e) => setProfileForm((prev) => ({ ...prev, lastName: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Phone</label>
                            <input
                                type="tel"
                                value={profileForm.phone}
                                onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                                placeholder="+1 555 123 4567"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                            {savingProfile ? 'Saving...' : 'Save Profile'}
                        </button>
                    </form>

                    <form className="card profile-card" onSubmit={handlePasswordSubmit}>
                        <h2>Change Password</h2>
                        <div className="form-group">
                            <label>Current Password</label>
                            <input
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-outline" disabled={savingPassword}>
                            {savingPassword ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Profile;
