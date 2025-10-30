// In frontend/src/components/Navbar.jsx

import React from 'react';
// 1. Import NavLink instead of Link
import { NavLink, useNavigate } from 'react-router-dom';

// 2. Import icons
import { 
  IoHomeOutline, 
  IoHomeSharp,
  IoPeopleOutline, 
  IoPeopleSharp,
  IoAddCircleOutline,
  IoAddCircleSharp,
  IoEllipsisHorizontalOutline,
  IoEllipsisHorizontalSharp
} from 'react-icons/io5'; // Using Ionicons v5

// 3. Import our new CSS module
import styles from './Navbar.module.css';

function Navbar() {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // This function is for NavLink to set the active style
  const getNavLinkClass = ({ isActive }) => 
    isActive ? styles.navLinkActive : styles.navLink;
  
  return (
    <nav className={styles.navbar}>
      <NavLink to="/" className={getNavLinkClass} end>
        {({ isActive }) => (
          <>
            {isActive ? <IoHomeSharp /> : <IoHomeOutline />}
            <span>Home</span>
          </>
        )}
      </NavLink>
      
      <NavLink to="/join-group" className={getNavLinkClass}>
        {({ isActive }) => (
          <>
            {isActive ? <IoPeopleSharp /> : <IoPeopleOutline />}
            <span>Join Group</span>
          </>
        )}
      </NavLink>

      <NavLink to="/create-group" className={getNavLinkClass}>
        {({ isActive }) => (
          <>
            {isActive ? <IoAddCircleSharp /> : <IoAddCircleOutline />}
            <span>Create</span>
          </>
        )}
      </NavLink>

      <NavLink to="/more" className={getNavLinkClass}>
        {({ isActive }) => (
          <>
            {isActive ? <IoEllipsisHorizontalSharp /> : <IoEllipsisHorizontalOutline />}
            <span>More</span>
          </>
        )}
      </NavLink>

      {/* We can move Logout to the "More" page later */}
      {/* {userInfo && (
        <button onClick={handleLogout}>Logout</button>
      )}
      */}
    </nav>
  );
}

export default Navbar;