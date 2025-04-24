import { FiHeart } from 'react-icons/fi';
import { FaShoppingCart } from 'react-icons/fa'; // Ensure this is correct
import { AiOutlineUser } from 'react-icons/ai'; // Corrected the import
import './Nav.css';


function Nav() {
  return (
    <nav>
      <div className="nav-container">
        <input type="text" className="search-input" placeholder="Search for food" />
      </div>
      <div className="profile-container">
        <a href="#">
          <FiHeart className="nav-icons" />
        </a>
        <a href="#">
          <FaShoppingCart className="nav-icons" />
        </a>
        <a href="#">
          <AiOutlineUser className="nav-icons" /> {/* Corrected the component name */}
        </a>
      </div>
    </nav>
  );
}

export default Nav;