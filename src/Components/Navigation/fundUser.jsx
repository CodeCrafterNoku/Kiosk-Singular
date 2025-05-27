import React, { useState, useEffect } from 'react';

const FundUser = ({ onClose }) => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedUserName, setSelectedUserName] = useState('');
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

    const handleUserSelect = (user) => {
        setSelectedUserId(user.userID);
        setSelectedUserName(user.name);
        setSearchTerm(user.name); // Show name in search bar
    };

    const fundUserWallet = async () => {
        const amountToAdd = Number(fundAmount);
        if (!selectedUserId || !fundAmount || isNaN(amountToAdd) || amountToAdd <= 0) {
            alert("Please select a user and enter a valid amount.");
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
                alert(`Failed to fund user wallet: ${errorData.message || response.statusText}`);
                return;
            }

            alert(`Successfully funded user wallet with R${amountToAdd}`);
            onClose();
        } catch (error) {
            console.error('Error funding user wallet:', error);
            alert('An error occurred while funding the user wallet.');
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fund-user-modal">
            <h3>Fund User Wallet</h3>

            {/* Search Bar */}
            <input
                type="text"
                placeholder="Search user by name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
                <ul style={{
                    maxHeight: '100px',
                    overflowY: 'auto',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '5px',
                    marginTop: '4px',
                    backgroundColor: '#fff',
                    zIndex: 10,
                    position: 'relative'
                }}>
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                            <li
                                key={user.userID}
                                onClick={() => handleUserSelect(user)}
                                style={{
                                    padding: '4px',
                                    cursor: 'pointer',
                                    backgroundColor: user.userID === selectedUserId ? '#00a69b' : 'white',
                                    color: user.userID === selectedUserId ? 'white' : '#333',
                                    borderBottom: '1px solid #eee'
                                }}
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
            <button onClick={fundUserWallet}>Fund Wallet</button>
            <button onClick={onClose}>Close</button>
        </div>
    );
};

export default FundUser;