import React, { useState, useContext, useRef, useEffect } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { FaGoogle, FaEnvelope, FaUser, FaKey, FaUtensils, FaBirthdayCake } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axios from 'axios';

const SignupPage = () => {
    const { isDarkMode } = useContext(ThemeContext);
    const [formData, setFormData] = useState({
        name: '',
        phoneNo: '',
        email: '',
        password: '',
        cpassword: '',
        cookingSkillLevel: 'intermediate',
        dietaryRestrictions: [],
        dateOfBirth: '',
    });

    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const foodModelRef = useRef(null);
    const [rotateModel, setRotateModel] = useState(0);
    const [user, setUser] = useState({ post: [] });

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

    useEffect(() => {
        const interval = setInterval(() => {
            setRotateModel(prev => (prev + 1) % 360);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    const nextPage = (e) => {
        if (e) e.preventDefault(); // Prevent form submission

        if (page === 1) {
            if (!formData.name || !formData.email || !formData.password || !formData.cpassword) {
                Swal.fire({
                    title: 'Please fill all required fields',
                    icon: 'warning',
                    background: isDarkMode ? '#1a1a1a' : '#fff',
                    color: isDarkMode ? '#fff' : '#333',
                });
                return false; // Return false to prevent page change
            }
        }
        setPage(page + 1);
    };

    const dietaryOptions = [
        'vegetarian', 'vegan', 'gluten-free', 'dairy-free',
        'nut-free', 'halal', 'kosher', 'keto', 'paleo'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDietaryChange = (option) => {
        setFormData(prev => {
            const current = [...prev.dietaryRestrictions];
            if (current.includes(option)) {
                return { ...prev, dietaryRestrictions: current.filter(item => item !== option) };
            } else {
                return { ...prev, dietaryRestrictions: [...current, option] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.cpassword) {
            Swal.fire({
                title: 'Passwords do not match!',
                icon: 'error',
                background: isDarkMode ? '#1a1a1a' : '#fff',
                color: isDarkMode ? '#fff' : '#333',
            });
            return;
        }

        setIsLoading(true);

        try {
            const bodyFormData = new FormData();
            // ... your form data preparation ...

            const response = await axios.post(
                "/api/newUserSignup",
                formData,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            Swal.fire({
                title: 'Account Created!',
                text: 'Welcome to your personalized recipe experience!',
                icon: 'success',
                background: isDarkMode ? '#1a1a1a' : '#fff',
                color: isDarkMode ? '#fff' : '#333',
            });

            // Reset form and loading state
            setFormData({
                name: '',
                phoneNo: '',
                email: '',
                password: '',
                cpassword: '',
                cookingSkillLevel: 'intermediate',
                dietaryRestrictions: [],
                dateOfBirth: '',
            });
            setPage(1);

        } catch (error) {
            console.error('Signup error:', error);
            Swal.fire({
                title: 'Signup Failed',
                text: error.response?.data?.message || 'An error occurred during signup',
                icon: 'error',
                background: isDarkMode ? '#1a1a1a' : '#fff',
                color: isDarkMode ? '#fff' : '#333',
            });
        } finally {
            setIsLoading(false); // This will always run
        }
    };
    const handleGoogleSignup = () => {
        setIsLoading(true);

        // Simulate Google auth
        setTimeout(() => {
            setIsLoading(false);
            // Google auth logic would go here
        }, 1500);
    };



    const prevPage = () => {
        setPage(page - 1);
    };

    // 3D Food model component (simplified SVG representation)
    const FoodModel = () => (
        <div
            ref={foodModelRef}
            className="food-model"
            style={{ transform: `rotateY(${rotateModel}deg)` }}
        >
            <svg viewBox="0 0 200 200" className="food-svg">
                <g>
                    <circle cx="100" cy="100" r="50" fill={isDarkMode ? "#ff6b6b" : "#ff4757"} />
                    <circle cx="100" cy="100" r="40" fill={isDarkMode ? "#1dd1a1" : "#00d2d3"} />
                    <circle cx="100" cy="100" r="30" fill={isDarkMode ? "#feca57" : "#feca57"} />
                    <circle cx="100" cy="100" r="20" fill={isDarkMode ? "#5f27cd" : "#5f27cd"} />
                    <circle cx="100" cy="100" r="10" fill={isDarkMode ? "#ff9ff3" : "#ff9ff3"} />
                </g>
            </svg>
        </div>
    );

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
        <div className={`signup-page-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
            <div className="signup-content-wrapper">
                <div className="signup-left-section">
                    <div className="signup-header">
                        <h1 className="signup-title">Personalized Recipe Generator</h1>
                        <p className="signup-subtitle">Create delicious meals based on what's in your fridge</p>
                    </div>

                    <div className="model-container">
                        <FoodModel />
                        <div className="floating-ingredients">
                            {['🥕', '🍅', '🥑', '🧀', '🥦'].map((emoji, index) => (
                                <div
                                    key={index}
                                    className={`signup-floating-item floating-item-${index + 1}`}
                                    style={{ animationDelay: `${index * 0.5}s` }}
                                >
                                    {emoji}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="signup-features">
                        <div className="feature-item">
                            <div className="feature-icon">🔍</div>
                            <div className="feature-text">
                                <h3>Smart Inventory Management</h3>
                                <p>Track what's in your kitchen and get personalized recipe suggestions</p>
                            </div>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">👨‍🍳</div>
                            <div className="feature-text">
                                <h3>AI-Powered Recommendations</h3>
                                <p>Recipes tailored to your diet, preferences, and available ingredients</p>
                            </div>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">🍽️</div>
                            <div className="feature-text">
                                <h3>Meal Planning Made Easy</h3>
                                <p>Plan your meals for the week and generate shopping lists automatically</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="signup-form-section">
                    <div className="signup-form-container">
                        <h2 className="form-title">Create Your Account</h2>

                        <div className="social-signup">
                            <button
                                type="button"
                                className="google-signup-btn"
                                onClick={handleGoogleSignup}
                                disabled={isLoading}
                            >
                                <FaGoogle /> Sign up with Google
                            </button>
                        </div>

                        <div className="signup-separator">
                            <span className="signup-separator-text">or</span>
                        </div>

                        <form onSubmit={handleSubmit} className="signup-form">
                            {page === 1 && (
                                <div className="signup-form-page">
                                    <div className="signup-input-group">
                                        <label htmlFor="name" className="signup-label">
                                            <FaUser className="signup-input-icon" />
                                            <span>Full Name</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            placeholder="John Doe"
                                            className="signup-input"
                                        />
                                    </div>

                                    <div className="signup-input-group">
                                        <label htmlFor="phoneNo" className="signup-label">
                                            <FaUser className="signup-input-icon" />
                                            <span>Phone No.</span>
                                        </label>
                                        <input
                                            type="number"
                                            id="phoneNo"
                                            name="phoneNo"
                                            value={formData.phoneNo}
                                            onChange={handleChange}
                                            required
                                            placeholder="johndoe123"
                                            className="signup-input"
                                        />
                                    </div>

                                    <div className="signup-input-group">
                                        <label htmlFor="email" className="signup-label">
                                            <FaEnvelope className="signup-input-icon" />
                                            <span>Email</span>
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="john@example.com"
                                            className="signup-input"
                                        />
                                    </div>

                                    <div className="signup-input-group">
                                        <label htmlFor="password" className="signup-label">
                                            <FaKey className="signup-input-icon" />
                                            <span>Password</span>
                                        </label>
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            placeholder="••••••••"
                                            minLength="8"
                                            className="signup-input"
                                        />
                                    </div>

                                    <div className="signup-input-group">
                                        <label htmlFor="cpassword" className="signup-label">
                                            <FaKey className="signup-input-icon" />
                                            <span>Confirm Password</span>
                                        </label>
                                        <input
                                            type="password"
                                            id="cpassword"
                                            name="cpassword"
                                            value={formData.cpassword}
                                            onChange={handleChange}
                                            required
                                            placeholder="••••••••"
                                            className="signup-input"
                                        />
                                    </div>
                                </div>
                            )}

                            {page === 2 && (
                                <div className="signup-form-page">
                                    <div className="signup-input-group">
                                        <label htmlFor="dateOfBirth" className="signup-label">
                                            <FaBirthdayCake className="signup-input-icon" />
                                            <span>Date Of Birth</span>
                                        </label>
                                        <input
                                            type="date"
                                            id="dateOfBirth"
                                            name="dateOfBirth"
                                            value={formData.age}
                                            onChange={handleChange}
                                            placeholder=""
                                            className="signup-input"
                                        />
                                    </div>

                                    <div className="signup-input-group select-group">
                                        <label htmlFor="cookingSkillLevel" className="signup-label">
                                            <FaUtensils className="signup-input-icon" />
                                            <span>Cooking Skill Level</span>
                                        </label>
                                        <select
                                            id="cookingSkillLevel"
                                            name="cookingSkillLevel"
                                            value={formData.cookingSkillLevel}
                                            onChange={handleChange}
                                            className="signup-select"
                                        >
                                            <option value="beginner">Beginner</option>
                                            <option value="intermediate">Intermediate</option>
                                            <option value="advanced">Advanced</option>
                                            <option value="chef">Chef</option>
                                        </select>
                                    </div>

                                    <div className="signup-input-group dietary-group">
                                        <label className="signup-label">
                                            <span>Dietary Restrictions (optional)</span>
                                        </label>
                                        <div className="signup-dietary-options">
                                            {dietaryOptions.map(option => (
                                                <label key={option} className="signup-dietary-option">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.dietaryRestrictions.includes(option)}
                                                        onChange={() => handleDietaryChange(option)}
                                                        className="signup-checkbox"
                                                    />
                                                    <span>{option.charAt(0).toUpperCase() + option.slice(1)}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="form-navigation">
                                {page > 1 && (
                                    <button
                                        type="button"
                                        onClick={prevPage}
                                        className="prev-btn"
                                    >
                                        Back
                                    </button>
                                )}

                                {page < 2 ? (
                                    <button
                                        type="button"
                                        onClick={nextPage}
                                        className="next-btn"
                                    >
                                        Next
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        className="submit-btn"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <div className="signup-loading-spinner"></div>
                                        ) : (
                                            'Create Account'
                                        )}
                                    </button>
                                )}
                            </div>
                        </form>

                        <div className="login-link">
                            Already have an account? <a href="/Login">Log in</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;