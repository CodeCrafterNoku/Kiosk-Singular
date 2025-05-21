import React, { useState, useEffect } from 'react';

const FundUser = ({ onClose }) => {
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [fundAmount, setFundAmount] = useState('');

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

    const fundUserWallet = async () => {
        const amountToAdd = Number(fundAmount);

        if (!selectedUserId || !fundAmount || isNaN(amountToAdd) || amountToAdd <= 0) {
            alert("Please select a user and enter a valid amount.");
            return;
        }

        const requestBody = {
            userID: Number(selectedUserId), // Use selected user ID
            balance: amountToAdd,
            walletID: 0, // Assuming this is a placeholder, adjust if necessary
            lastUpdated: new Date().toISOString(),
            userName: "string" // Replace with actual user name if needed
        };

        console.log("Request Body:", requestBody); // Log the request body for debugging

        try {
            const response = await fetch('http://localhost:5279/api/wallet/addfunds', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error response:", errorData); // Log the error response
                alert(`Failed to fund user wallet: ${errorData.message || response.statusText}`);
                return;
            }

            alert(`Successfully funded user wallet with R${amountToAdd}`);
            onClose(); // Close the modal after funding
        } catch (error) {
            console.error('Error funding user wallet:', error);
            alert('An error occurred while funding the user wallet.');
        }
    };

    return (
        <div className="fund-user-modal">
            <h3>Fund User Wallet</h3>
            <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
                <option value="">Select User</option>
                {users.map(user => (
                    <option key={user.userID} value={user.userID}>{user.name}</option>
                ))}
            </select>
            <input
                type="number"
                placeholder="Enter amount to fund"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
            />
            <button onClick={fundUserWallet}>Fund Wallet</button>
            <button onClick={onClose}>Close</button>
        </div>
    );
};

export default FundUser;