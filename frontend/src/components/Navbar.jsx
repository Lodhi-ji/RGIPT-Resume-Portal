import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          College Resume Portal
        </Link>

        <div className="navbar-menu">
          {user && (
            <>
              <Link to="/" className="navbar-link">
                Dashboard
              </Link>
              
              {user.role === 'student' && (
                <>
                  <Link to="/profile" className="navbar-link">
                    Profile
                  </Link>
                  <Link to="/resumes" className="navbar-link">
                    Resumes
                  </Link>
                </>
              )}

              <div className="navbar-user">
                <span className="user-name">{user.name}</span>
                <span className="user-role">{user.role}</span>
              </div>

              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
