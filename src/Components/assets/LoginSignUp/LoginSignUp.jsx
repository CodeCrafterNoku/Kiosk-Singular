import React, { useState } from 'react';
import './LoginSignUp.css';
import email_icon from '../email.svg';
import password_icon from '../password.svg';
import user_icon from '../person.svg';
import phone_icon from '../phone.svg';
import role_icon from '../role.svg';
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';

const LoginSignUp = () => {
    const [userId, setUserId] = useState(() => localStorage.getItem('userId') || null);
    const [action, setAction] = useState('Sign Up');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phoneNumber: '',
        roleID: ''
    });
    const [loginError, setLoginError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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

            if (response.status === 422) {
                throw new Error("This user already exists. Try logging in.");
            } else if (response.status === 400) {
                throw new Error("Registration failed. Please ensure all required fields are filled correctly.");
            } else {
                throw new Error(errorData.message || errorData || `HTTP error! status: ${response.status}`);
            }
        }

        const data = await response.json();
        console.log(`${action} successful!`);
        console.log('Server response:', data);

        if (action === 'Login') {
            setUserId(data.userId);
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('roleID', data.role);

            setFormData({ ...formData, password: '' });

            // ✅ Check for existing wallet
            const walletResponse = await fetch(`http://localhost:5279/api/wallet/user/${data.userId}`);
            let walletID = 0;

            if (walletResponse.status === 404) {
                // ✅ Create wallet if it doesn't exist
                const walletData = {
                    userID: data.userId,
                    balance: 0,
                    lastUpdated: new Date().toISOString(),
                    userName: data.name || "New User"
                };

                const createWalletResponse = await fetch('http://localhost:5279/api/wallet', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(walletData),
                });

                if (!createWalletResponse.ok) {
                    const error = await createWalletResponse.text();
                    console.error("Wallet creation failed:", error);
                    throw new Error("Failed to create a new wallet.");
                }

                // Get the newly created wallet's ID
                const newWallet = await createWalletResponse.json();
                walletID = newWallet.walletID; // Use the correct property for wallet ID
            } else {
                const walletData = await walletResponse.json();
                walletID = walletData.walletID; // Use existing wallet ID
            }

            // ✅ Check for existing cart
            const cartResponse = await fetch(`http://localhost:5279/api/cart/user/${data.userId}`);
            if (cartResponse.status === 404) {
                // ✅ Create a new cart if it doesn't exist
                const createCartResponse = await fetch('http://localhost:5279/api/cart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userID: data.userId,
                        walletID: walletID, // Use the valid wallet ID
                        lastModified: new Date().toISOString(),
                        cartItems: [] // Include an empty array for CartItems
                    }),
                });

                if (!createCartResponse.ok) {
                    const error = await createCartResponse.text();
                    console.error("Cart creation failed:", error);
                    throw new Error("Failed to create a new cart.");
                }

                console.log("Cart created successfully.");
            }

            if (data.role === 7 || data.role === "7") {
                navigate('/user/products');
            } else if (data.role === 8 || data.role === "8") {
                navigate('/admin/products');
            } else {
                alert("Invalid role");
            }
        } else {
            // ✅ Call createWallet immediately after successful Sign Up
            await createWallet(data.userId, formData.name);

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
            setLoginError("Sign-up failed. Some details may not meet the requirements.");
        }
    } finally {
        setLoading(false);
    }
};

    // ** Create Wallet Function **
  const createWallet = async (userId, name) => {
        const walletData = {
            walletID: 0,
            userID: Number(userId),
            balance: 0,
            lastUpdated: new Date().toISOString(),
            userName: name || "New User" // ✅ fallback if name is not provided
        };

        try {
            const response = await fetch('http://localhost:5279/api/wallet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(walletData),
            });
    if (!response.ok) {
      const error = await response.text(); // 👈 change this line
      console.error("Wallet creation failed:", error); // ✅ more readable error
      throw new Error(error);
    }

            console.log("Wallet created successfully");
        } catch (error) {
            console.error("Error creating wallet:", error);
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
                        <div className='inputs'>
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
                            <div className="input password-input">
                                <img src={password_icon} alt="password icon" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Password"
                                    required
                                />
                                <span className="eye-toggle" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <IoEye /> : <IoEyeOff />}
                                </span>
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
                        </div>
                        <div className='submit-container'>
                            <button type="submit" className="submit" disabled={loading}>
                                {loading ? 'Loading...' : (action === 'Sign Up' ? 'Sign Up' : 'Login')}
                            </button>
                        </div>
                    </form>
                    {action === "Login" && (
                        <div className="forgot-password">
                            Forgot Password? <span>Click here!</span>
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