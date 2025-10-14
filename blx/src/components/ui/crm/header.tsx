"use client";

import React from "react";

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6">
            <div className="logo">
              <h2>M.U.S</h2>
            </div>
          </div>
          <div className="col-md-6 text-end">
            <nav className="main-nav">
              <ul className="nav-list">
                <li>
                  <a href="/">Home</a>
                </li>
                <li>
                  <a href="/login">Login</a>
                </li>
                <li>
                  <a href="/register">Register</a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
