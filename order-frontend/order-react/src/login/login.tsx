import type { FormEvent } from 'react';
import './login.css'
import { loginAction } from './actions/login.action';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from './store/auth.store';

export const Login = () => {
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const { setIsAuthenticated } = useAuthStore();

    const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;

        const response = await loginAction(username, password);
        const credentials = btoa(`${username}:${password}`);

        if (response) {
            sessionStorage.setItem('credentials', credentials);
            sessionStorage.setItem('username', username);
            setIsAuthenticated(true);
            navigate('/orders');
        }
        else {
            setError("Invalid credentials");
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>Login</h1>
                <p className="subtitle">Please enter your credentials to access the Orders API</p>

                <form className="login-form" onSubmit={handleLogin}>
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

                    {error && <div className="error-message">
                        {error}
                    </div>}

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
