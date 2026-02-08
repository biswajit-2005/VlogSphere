import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { isAuthenticated, logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    <div className="logo">
                        <h1>VlogSphere</h1>
                    </div>
                    <nav className="nav">
                        <NavLink
                            to="/"
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        >
                            Home
                        </NavLink>
                        <NavLink
                            to="/add-vlog"
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        >
                            Add Vlog
                        </NavLink>

                        {isAuthenticated ? (
                            <button
                                onClick={handleLogout}
                                className="nav-link"
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                    fontWeight: 500
                                }}
                            >
                                Logout
                            </button>
                        ) : (
                            <>
                                <NavLink
                                    to="/login"
                                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                >
                                    Login
                                </NavLink>
                                <NavLink
                                    to="/signup"
                                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                >
                                    Sign Up
                                </NavLink>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
