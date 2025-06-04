import React, { useState, useEffect } from 'react';
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
                console.log('Response Status:', response.status); // Log response status
                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }
                const data = await response.json();
                console.log('Fetched User Data:', data); // Log fetched data
                setUserData({
                    name: data.name,
                    email: data.email,
                    phoneNumber: data.phoneNumber,
                    password: '',
                    confirmPassword: ''
                });
            } catch (error) {
                console.error('Error fetching user data:', error);
                setErrorMessage('Could not load user data.'); // Display error message
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

        const updatedUser = {
            ...userData,
            userID: userId
        };

        try {
            const response = await fetch(`http://localhost:5279/api/user/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedUser)
            });

            if (response.ok) {
                toast.success("User updated successfully!");
            } else {
                const errorData = await response.json();
                setErrorMessage(errorData.message || "Failed to update user.");
            }
        } catch (error) {
            console.error('Error updating user data:', error);
            setErrorMessage('Failed to update user.');
        }
    };

    return (
        <div className="account-settings">
            <h2>Account Settings</h2>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name</label>
                    <input
                        type="text"
                        name="name"
                        value={userData.name}
                        onChange={handleInputChange}
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
                        onChange={handleInputChange}
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
                <button type="submit">Update</button>
            </form>
        </div>
    );
};

export default AccountSettings;