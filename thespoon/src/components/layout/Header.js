import React, { Component } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header>
            <Link to="/" className="logo">
                <img className="site-logo" src="/images/logo.png" alt="logo" />
            </Link>
            <ul>
                <li>
                    <Link to="/login">Log In</Link>
                </li>
                <li>
                    <Link to="/signup">Sign Up</Link>
                </li>
            </ul>    
        </header>
    );
}

export default Header;