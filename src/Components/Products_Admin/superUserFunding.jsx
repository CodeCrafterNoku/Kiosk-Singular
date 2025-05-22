// import React, { useState, useEffect } from 'react';

// const SuperUserFunding = () => {
//     const [users, setUsers] = useState([]);
//     const [filteredUsers, setFilteredUsers] = useState([]);
//     const [selectedUserId, setSelectedUserId] = useState('');
//     const [amountToAdd, setAmountToAdd] = useState('');
//     const [error, setError] = useState('');
//     const [searchTerm, setSearchTerm] = useState('');

//     useEffect(() => {
//         fetchUsers();
//     }, []);

//     const fetchUsers = async () => {
//         try {
//             const response = await fetch('http://localhost:5279/api/users');
//             if (!response.ok) throw new Error("Failed to fetch users");
//             const data = await response.json();
//             setUsers(data); // Set the complete user data
//             setFilteredUsers(data); // Initialize filtered users
//         } catch (error) {
//             console.error("Error fetching users:", error);
//             setError("Could not load users.");
//         }
//     };

//     const handleSearchChange = (e) => {
//         const value = e.target.value;
//         setSearchTerm(value);

//         // Filter users based on search input
//         const filtered = users.filter(user => 
//             user.name.toLowerCase().includes(value.toLowerCase())
//         );
//         setFilteredUsers(filtered);
//     };

//     const handleFund = async () => {
//         if (!selectedUserId || !amountToAdd) {
//             setError("Please select a user and enter an amount.");
//             return;
//         }

//         const requestBody = {
//             userId: selectedUserId,
//             amount: Number(amountToAdd)
//         };

//         try {
//             const response = await fetch('http://localhost:5279/api/wallet/funduser', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(requestBody)
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || "Funding failed");
//             }

//             alert("Funds added successfully!");
//             setAmountToAdd('');
//             setSelectedUserId('');
//             setSearchTerm(''); // Clear search on success
//             setFilteredUsers(users); // Reset filtered users
//         } catch (error) {
//             console.error("Error funding user:", error);
//             setError(error.message);
//         }
//     };

//     return (
//         <div>
//             <h2>Fund User Account</h2>
//             {error && <div className="error">{error}</div>}
            
//             <input
//                 type="text"
//                 placeholder="Search user by name"
//                 value={searchTerm}
//                 onChange={handleSearchChange} // Handle search input
//             />

//             <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
//                 <option value="">Select User</option>
//                 {filteredUsers.map(user => (
//                     <option key={user.userID} value={user.userID}>{user.name}</option>
//                 ))}
//             </select>
//             <input
//                 type="number"
//                 placeholder="Enter amount"
//                 value={amountToAdd}
//                 onChange={(e) => setAmountToAdd(e.target.value)}
//             />
//             <button onClick={handleFund}>Fund</button>
//         </div>
//     );
// };

// export default SuperUserFunding;