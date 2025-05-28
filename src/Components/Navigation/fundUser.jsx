import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import Confetti from 'react-confetti';
import 'react-toastify/dist/ReactToastify.css';
import './fundUser.css';

const FundUser = ({ onClose }) => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedUserName, setSelectedUserName] = useState('');
    const [fundAmount, setFundAmount] = useState('');
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:5279/api/user');
            if (!response.ok) throw new Error("Failed to fetch users");
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const handleUserSelect = (user) => {
        setSelectedUserId(user.userID);
        setSelectedUserName(user.name);
        setSearchTerm(user.name); // Populate input field
    };

    const fundUserWallet = async () => {
        const amountToAdd = Number(fundAmount);
        if (!selectedUserId || !fundAmount || isNaN(amountToAdd) || amountToAdd <= 0) {
            toast.error("Please select a user and enter a valid amount.", { closeButton: false });
            return;
        }
        const requestBody = {
            userID: Number(selectedUserId),
            balance: amountToAdd,
            walletID: 0,
            lastUpdated: new Date().toISOString(),
            userName: selectedUserName || "string",
        };

        try {
            const response = await fetch('http://localhost:5279/api/wallet/addfunds', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json();
                toast.error(`Failed to fund user wallet: ${errorData.message || response.statusText}`, { closeButton: false });
                return;
            }

            setShowConfetti(true);
            toast.success(`Successfully funded user wallet with R${amountToAdd}`, { closeButton: false });
            setTimeout(() => {
                setShowConfetti(false);
                onClose();
            }, 3000);
        } catch (error) {
            console.error('Error funding user wallet:', error);
            toast.error('An error occurred while funding the user wallet.', { closeButton: false });
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fund-user-modal">
            {showConfetti && <Confetti />}
            <h3>Fund User Wallet</h3>

            {/* Search Bar */}
            <input
                type="text"
                placeholder="Search user by name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
                <ul className="user-list">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                            <li
                                key={user.userID}
                                onClick={() => handleUserSelect(user)}
                                className={user.userID === selectedUserId ? 'selected' : ''}
                            >
                                {user.name}
                            </li>
                        ))
                    ) : (
                        <li>No users found</li>
                    )}
                </ul>
            )}

                        {/* Amount input */}
            <input
                type="number"
                placeholder="Enter amount to fund"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
            />

            {/* Action buttons */}
            <button className="action-button" onClick={fundUserWallet}>Fund Wallet</button>
            <button className="action-button close" onClick={onClose}>Close</button>
            <ToastContainer />
        </div>
    );
};

export default FundUser;