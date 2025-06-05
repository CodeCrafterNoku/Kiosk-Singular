import React, { useState, useEffect } from 'react';
import './accountSettings.css';
import { toast } from 'react-toastify';

const AccountSettings = ({ userId }) => {
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: ''
    });

    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`http://localhost:5279/api/user/${userId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }
                const data = await response.json();
                setUserData({
                    name: data.name,
                    email: data.email,
                    phoneNumber: data.phoneNumber,
                    password: '',
                    confirmPassword: ''
                });
            } catch (error) {
                console.error('Error fetching user data:', error);
                setErrorMessage('Could not load user data.');
            }
        };

        fetchUserData();
    }, [userId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData({ ...userData, [name]: value });
    };

const handleSubmit = async (e) => {
    e.preventDefault();
    if (userData.password !== userData.confirmPassword) {
        setErrorMessage("Passwords do not match.");
        return;
    }

    try {
        // First fetch the current user data
        const currentUserResponse = await fetch(`http://localhost:5279/api/user/${userId}`);
        if (!currentUserResponse.ok) {
            throw new Error('Failed to fetch current user data');
        }
        const currentUser = await currentUserResponse.json();

        // Prepare the update with all required fields
        const updatedUser = {
            userID: userId,
            name: currentUser.name,
            email: currentUser.email,
            phoneNumber: currentUser.phoneNumber,
            accountBalance: currentUser.accountBalance,
            accountActive: currentUser.accountActive,
            isEmailVerified: currentUser.isEmailVerified,
            roleID: currentUser.roleID,
            password: userData.password // Only the password changes
        };

        const response = await fetch(`http://localhost:5279/api/user/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedUser)
        });

        if (response.ok) {
            toast.success("Password updated successfully!");
        } else {
            const errorData = await response.json();
            setErrorMessage(errorData.message || "Failed to update password.");
        }
    } catch (error) {
        console.error('Error updating password:', error);
        setErrorMessage('Failed to update password.');
    }
};


    return (
        <div className="account-settings">
            <h2>Change Password</h2>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name</label>
                    <input
                        type="text"
                        name="name"
                        value={userData.name}
                        readOnly // Prevent editing
                    />
                </div>
                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={userData.email}
                        readOnly 
                    />
                </div>
                <div>
                    <label>Phone Number</label>
                    <input
                        type="text"
                        name="phoneNumber"
                        value={userData.phoneNumber}
                        readOnly 
                    />
                </div>
                <div>
                    <label>New Password</label>
                    <input
                        type="password"
                        name="password"
                        value={userData.password}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label>Confirm Password</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={userData.confirmPassword}
                        onChange={handleInputChange}
                    />
                </div>
                <button type="submit">Update Password</button>
            </form>
        </div>
    );
};

export default AccountSettings;