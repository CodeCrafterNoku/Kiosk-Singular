import { useState } from 'react';
import { FiHeart, FiMenu } from 'react-icons/fi';
import { FaShoppingCart } from 'react-icons/fa';
import { AiOutlineUser } from 'react-icons/ai';
import { MdLightMode } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import './Nav.css';

function Nav({ name }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMenuItemClick = (action) => {
    console.log(action);
    setDrawerOpen(false); // Close the drawer after an action
    if (action === 'Logout') {
      // ✅ Navigate to login
      navigate('/');
    }
  };



  return (
    <nav>
    <div className="logo-container">
      <img src="/singular.png" alt="Company Logo" className="logo" />
     
    </div>
      <div className="profile-container">
      <a href="#">
          <MdLightMode className="nav-icons" />
        </a>
        <a href="#">
          <FiHeart className="nav-icons" />
        </a>
        <a href="#">
          <FaShoppingCart className="nav-icons" />
        </a>
        <a href="#">
          <AiOutlineUser className="nav-icons" />
        </a>
        <a href="#" className="menu-icon" onClick={toggleDrawer}>
          <FiMenu className="nav-icons" />
        </a>

      </div>

      {drawerOpen && (
        <div className={`drawer ${drawerOpen ? 'open' : ''}`}>
          <ul>
            <li onClick={() => handleMenuItemClick('View Orders')}>View Orders</li>
            <li onClick={() => handleMenuItemClick('Account Settings')}>Account Settings</li>
            <li onClick={() => handleMenuItemClick('Logout')}>Logout</li>
          </ul>
        </div>
      )}
    </nav>
  );
}

export default Nav;