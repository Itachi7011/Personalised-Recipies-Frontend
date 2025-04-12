import React, { useState, useContext, useEffect } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import Swal from 'sweetalert2';
import axios from "axios";

const LoginPage = () => {
    const { isDarkMode } = useContext(ThemeContext);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [user, setUser] = useState({ post: [] });

    const [isLoading, setIsLoading] = useState(false);
    const [formError, setFormError] = useState('');

    const UserDetails = async () => {
        try {
            const res = await fetch("/api/userProfile", {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            // Check if the response is successful
            if (!res.ok) {
                throw new Error(`Error during retrieve data - ${res.statusText}`);
            }

            // Log response for debugging
            const data = await res.json();
            console.log("Fetched user data:", data);

            setUser(data);
        } catch (err) {
            console.error("Error fetching user data:", err);
        }
    };

    useEffect(() => {
        UserDetails();
    }, []);

    // 3D rotation effect on card hover
    const [rotation, setRotation] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        const card = document.querySelector('.recipe-login-card');
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        setRotation({ x: rotateX, y: rotateY });
    };

    const resetRotation = () => {
        setRotation({ x: 0, y: 0 });
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        var bodyFormData = new FormData();
        bodyFormData.append("email", formData.email);
        bodyFormData.append("password", formData.password);

        try {
            const response = await axios.post(
                "/api/login",
                bodyFormData,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            await Swal.fire({
                icon: 'success',
                title: 'Success',
                text: response.data.message,
            });
            window.location.href = "/UserProfile";

        } catch (error) {
            if (error.response && error.response.status === 400) {
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.response.data.message,
                }).then(() => {
                    window.location.reload();
                });
            } else {
                console.log(error);
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'An unexpected error occurred',
                });
            }
        }
    };

    // Ingredients floating effect
    const [ingredients, setIngredients] = useState([]);

    useEffect(() => {
        const ingredientsList = [
            '🥑', '🍎', '🥦', '🍋', '🥕', '🍄', '🌽', '🧀',
            '🥚', '🍗', '🥩', '🍤', '🍚', '🍜', '🥗', '🍅'
        ];

        const newIngredients = ingredientsList.map((emoji, index) => ({
            id: index,
            emoji,
            size: Math.random() * 2 + 0.8, // Random size between 0.8 and 2.8em
            left: Math.random() * 100, // Random left position
            delay: Math.random() * 8, // Random animation delay
            duration: Math.random() * 10 + 15 // Random animation duration
        }));

        setIngredients(newIngredients);
    }, []);

    if (user && user.email) {
        return (
            <div className={`recipe-login-container ${isDarkMode ? 'recipe-dark-mode' : 'recipe-light-mode'}`}>
                <div className="recipe-login-card-wrapper">
                    <div className="recipe-login-card">
                        <div className="recipe-login-header">
                            <h1 className="recipe-login-title">Already Logged In</h1>
                            <p className="recipe-login-subtitle">You are already logged in as {user.email}</p>
                            <p>You must logout to access this page.</p>
                            <button 
                                className="recipe-login-button"
                                onClick={() => window.location.href = "/UserProfile"}
                            >
                                Go to Profile
                            </button>
                            <button 
                                className="recipe-login-button"
                                onClick={() => window.location.href = "/logout"}
                                style={{ marginTop: '10px', backgroundColor: '#ff4444' }}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`recipe-login-container ${isDarkMode ? 'recipe-dark-mode' : 'recipe-light-mode'}`}>
            {/* Floating ingredients background */}
            <div className="recipe-login-background">
                {ingredients.map(ingredient => (
                    <div
                        key={ingredient.id}
                        className="floating-ingredient"
                        style={{
                            fontSize: `${ingredient.size}em`,
                            left: `${ingredient.left}%`,
                            animationDelay: `${ingredient.delay}s`,
                            animationDuration: `${ingredient.duration}s`
                        }}
                    >
                        {ingredient.emoji}
                    </div>
                ))}
            </div>

            <div
                className="recipe-login-card-wrapper"
            // onMouseMove={handleMouseMove}
            // onMouseLeave={resetRotation}
            >
                <div
                    className="recipe-login-card"
                    style={{
                        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                    }}
                >
                    <div className="recipe-login-header">
                        <div className="recipe-login-logo">
                            <div className="recipe-logo-circle">
                                <span className="recipe-logo-icon">🍲</span>
                            </div>
                        </div>
                        <h1 className="recipe-login-title">Recipe Generator</h1>
                        <p className="recipe-login-subtitle">Based on your fridge inventory</p>
                    </div>

                    {formError && <div className="recipe-login-error">{formError}</div>}

                    <form className="recipe-login-form" onSubmit={handleLogin}>
                        <div className="recipe-form-group">
                            <label htmlFor="email" className="recipe-form-label">Email </label>
                            <div className="recipe-input-group">
                                <span className="recipe-input-icon">📧</span>
                                <input
                                    type="text"
                                    id="email"
                                    name="email"
                                    className="recipe-form-input"
                                    placeholder="Enter your email or username"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="recipe-form-group">
                            <label htmlFor="password" className="recipe-form-label">Password</label>
                            <div className="recipe-input-group">
                                <span className="recipe-input-icon">🔒</span>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    className="recipe-form-input"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="recipe-form-options">
                            <div className="recipe-remember-me">
                                <input
                                    type="checkbox"
                                    id="rememberMe"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor="rememberMe">Remember me</label>
                            </div>
                            <a href="#" className="recipe-forgot-password">Forgot password?</a>
                        </div>

                        <button
                            type="submit"
                            className={`recipe-login-button ${isLoading ? 'recipe-loading' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="recipe-loader">
                                    <div className="recipe-loader-dot"></div>
                                    <div className="recipe-loader-dot"></div>
                                    <div className="recipe-loader-dot"></div>
                                </div>
                            ) : 'Login'}
                        </button>
                    </form>

                    <div className="recipe-login-footer">
                        <p>Don't have an account? <a href="/Signup" className="recipe-signup-link">Sign up</a></p>
                        <p className="recipe-login-tagline">Discover recipes tailored to your ingredients</p>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default LoginPage;