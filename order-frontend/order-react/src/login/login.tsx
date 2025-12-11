import React from 'react'
import './login.css'

export const Login = () => {
    return (
        <div className="login-container">
            <div className="login-card">
                <h1>Login</h1>
                <p className="subtitle">Please enter your credentials to access the Orders API</p>

                <form className="login-form">
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            placeholder="Enter username"
                            required
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Enter password"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <div className="error-message">
        // Error goes here
                    </div>

                    <button type="submit" className="login-button">
                        <span>Login</span>
                    </button>
                </form>

                <div className="info-box">
                    <p><strong>Default credentials:</strong></p>
                    <p>Username: <code>admin</code></p>
                    <p>Password: <code>password</code></p>
                </div>
            </div>
        </div>

    )
}
