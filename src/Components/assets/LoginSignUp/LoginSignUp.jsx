import React, { useState } from 'react';
import './LoginSignUp.css';
import email_icon from '../email.svg';
import password_icon from '../password.svg';
import user_icon from '../person.svg';
import phone_icon from '../phone.svg';
import role_icon from '../role.svg';
import { useNavigate } from 'react-router-dom';

const LoginSignUp = () => {
    const [action, setAction] = useState('Sign Up');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phoneNumber: '',
        roleID: ''
    });
    const [userId, setUserId] = useState(null);
    const [loginError, setLoginError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoginError('');
        setLoading(true);
    
        try {
            const url = action === 'Sign Up'
                ? 'http://localhost:5279/api/User'
                : 'http://localhost:5279/api/User/login';
    
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(
                    action === 'Sign Up'
                        ? formData
                        : { email: formData.email, password: formData.password }
                )
            });
    
            if (!response.ok) {
                const contentType = response.headers.get('Content-Type');
                let errorData;
            
                if (contentType && contentType.includes('application/json')) {
                    errorData = await response.json();
                } else {
                    errorData = await response.text();
                }
            
                // Use response.status to give user-friendly error messages
                if (response.status === 422) {
                    throw new Error("This user already exists. Try logging in.");
                } else if (response.status === 400) {
                    throw new Error("Registration failed. Please ensure all required fields are filled correctly.");
                } else {
                    // Fallback for other errors
                    throw new Error(errorData.message || errorData || `HTTP error! status: ${response.status}`);
                }
            }
            
    
            const data = await response.json();
            console.log(`${action} successful!`);
            console.log('Server response:', data);
    
            if (action === 'Login') {
                setUserId(data.userId);
                setFormData({ ...formData, password: '' });
    
                if (data.role === 7 || data.role === "7") {
                    navigate('/user/products');
                } else if (data.role === 8 || data.role === "8") {
                    navigate('/admin/products');
                } else {
                    alert("Invalid role");
                }
            } else {
                // alert("Sign Up successful! You can now log in.");
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    phoneNumber: '',
                    roleID: ''
                });
                setAction("Login");
            }
    
        } catch (error) {
            console.error('Error:', error);
    
            if (typeof error === 'object' && error.message) {
                setLoginError(error.message);
            } else if (typeof error === 'string') {
                setLoginError(error);
            } else {
                setLoginError("Sign-up failed.Some details may not meet the requirements.");
            }
        } finally {
            setLoading(false);
        }
    };
    
    

    const handleUpdateUser = async () => {
        if (!userId) return;

        try {
            const response = await fetch(`http://localhost:5279/api/user/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Update failed');
            }

            alert('User updated successfully!');
        } catch (error) {
            console.error('Error:', error.message);
            alert(`Error: ${error.message}`);
        }
    };

    const handleDeleteUser = async () => {
        if (!userId) return;

        try {
            const response = await fetch(`http://localhost:5279/api/user/${userId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Delete failed');
            }

            alert('User deleted successfully!');
            setUserId(null);
        } catch (error) {
            console.error('Error:', error.message);
            alert(`Error: ${error.message}`);
        }
    };

    return (
        <div className='container login-background'>
            {loading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                </div>
            )}
            <div className='header'>
                <h1 className='text'>{action}</h1>
                <div className='underline'></div>
                <div className='form-container'>
                    <form onSubmit={handleSubmit}>
                        {action === "Sign Up" && (
                            <div className='input'>
                                <img src={user_icon} alt="user icon" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Name"
                                    required
                                />
                            </div>
                        )}
                        <div className='input'>
                            <img src={email_icon} alt="email icon" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email"
                                required
                            />
                        </div>
                        <div className='input'>
                            <img src={password_icon} alt="password icon" />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Password"
                                required
                            />
                        </div>
                        {action === "Sign Up" && (
                            <div className='input'>
                                <img src={phone_icon} alt="phone icon" />
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    placeholder="Phone number"
                                    required
                                />
                            </div>
                        )}
                        {action === "Sign Up" && (
                            <div className='input'>
                                <img src={role_icon} alt="role icon" />
                                <select
                                    name="roleID"
                                    value={formData.roleID}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Role</option>
                                    <option value="7">User</option>
                                    <option value="8">Admin</option>
                                </select>
                            </div>
                        )}
                        <div className='submit-container'>
                            <button type="submit" className="submit" disabled={loading}>
                                {loading ? 'Loading...' : (action === 'Sign Up' ? 'Sign Up' : 'Login')}
                            </button>
                            {action === "Login" && userId && (
                                <>
                                    <button type="button" onClick={handleUpdateUser} className="submit">
                                        Update User
                                    </button>
                                    <button type="button" onClick={handleDeleteUser} className="submit gray">
                                        Delete User
                                    </button>
                                </>
                            )}
                        </div>
                    </form>
                    {action === "Login" && (
                        <div className="forgot-password">
                            Lost Password? <span>Click here!</span>
                        </div>
                    )}
                    {loginError && (
                        <div className="error-message">
                            {loginError}
                        </div>
                    )}
                    <div className='toggle-container'>
                        <div
                            className={action === "Login" ? "submit gray" : "submit"}
                            onClick={() => setAction("Sign Up")}
                        >
                            Sign Up
                        </div>
                        <div
                            className={action === "Sign Up" ? "submit gray" : "submit"}
                            onClick={() => setAction("Login")}
                        >
                            Login
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginSignUp;
