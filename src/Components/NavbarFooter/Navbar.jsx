import { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiMoon, FiSun, FiUser, FiLogOut, FiBook, FiSearch, FiHome, FiSettings, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const RecipeNavbar = () => {
    const { isDarkMode, toggleTheme } = useContext(ThemeContext);
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [user, setUser] = useState({});

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

    // Handle scroll event to change navbar appearance
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Toggle dropdown
    const toggleDropdown = (dropdownName) => {
        if (activeDropdown === dropdownName) {
            setActiveDropdown(null);
        } else {
            setActiveDropdown(dropdownName);
        }
    };


    // Animation variants for menu
    const menuVariants = {
        closed: {
            opacity: 0,
            y: -20,
            transition: {
                staggerChildren: 0.05,
                staggerDirection: -1
            }
        },
        open: {
            opacity: 1,
            y: 0,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        closed: { opacity: 0, y: -10 },
        open: { opacity: 1, y: 0 }
    };

    const dropdownVariants = {
        closed: {
            opacity: 0,
            height: 0,
            transition: {
                duration: 0.2
            }
        },
        open: {
            opacity: 1,
            height: 'auto',
            transition: {
                duration: 0.2
            }
        }
    };


    const authOptions = [
        { name: 'Signup', path: '/Signup' },
        { name: 'Login', path: '/Login' }
    ];


    // Recipe categories for dropdown
    const recipeCategories = [
        { name: 'Breakfast', path: '/recipes/breakfast' },
        { name: 'Lunch', path: '/LunchRecipies' },
        { name: 'Dinner', path: '/DinnerRecipies' },
        { name: 'Desserts', path: '/desserts' },
        { name: 'Vegetarian', path: '/vegetarian' }
    ];

    // Profile options for dropdown
    const profileOptions = [
        { name: 'Account Settings', path: '/profile/settings' },
        { name: 'Saved Recipes', path: '/profile/saved' },
        { name: 'Meal Planner', path: '/profile/planner' }
    ];

    const handleLogout = async () => {
        // if (socket) {

        //     socket.emit("logout"); // Emit logout event

        // }

        const response = await fetch("/api/logout", {

            method: "GET",

            credentials: "include"

        });


        if (response.ok) {

            // Redirect to login page

            window.location.href = "/Login";

        } else {

            // Handle error

            console.error("Logout failed");

        }

    };

    if (user.userType == "Admin") {
        return ("")
    }

    return (
        <nav
            className={`recipe-navbar ${isDarkMode ? 'dark' : 'light'} ${scrolled ? 'recipe-navbar-scrolled' : ''
                }`}
        >
            <div className="recipe-navbar-container">
                {/* Logo and Brand */}
                <div className="recipe-navbar-brand">
                    <div className="recipe-logo-container">
                        <span className="recipe-logo-text">Recipe</span>
                        <span className="recipe-logo-dot">.</span>
                        <span className="recipe-logo-ai">AI</span>
                    </div>
                </div>

                {/* Desktop Menu */}
                <div className="recipe-navbar-links-desktop">
                    <a href="/" className="recipe-nav-link">
                        <FiHome />
                        <span>Home</span>
                    </a>

                    <div className="recipe-nav-dropdown-container">
                        <button
                            className="recipe-nav-link recipe-nav-dropdown-toggle"
                            onClick={() => toggleDropdown('recipes')}
                        >
                            <FiBook />
                            <span>Recipes</span>
                            {activeDropdown === 'recipes' ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                        <AnimatePresence>
                            {activeDropdown === 'recipes' && (
                                <motion.div
                                    className="recipe-nav-dropdown-menu"
                                    initial="closed"
                                    animate="open"
                                    exit="closed"
                                    variants={dropdownVariants}
                                >
                                    {recipeCategories.map((category) => (
                                        <a
                                            key={category.name}
                                            href={category.path}
                                            className="recipe-nav-dropdown-item"
                                        >
                                            {category.name}
                                        </a>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <a href="/search" className="recipe-nav-link">
                        <FiSearch />
                        <span>Search</span>
                    </a>

                    {
                        user && Object.keys(user).length > 0 ? (
                            <>
                                <div className="recipe-nav-dropdown-container">
                                    <button
                                        className="recipe-nav-link recipe-nav-dropdown-toggle"
                                        onClick={() => toggleDropdown('profile')}
                                    >
                                        <FiUser />
                                        <span>Profile</span>
                                        {activeDropdown === 'profile' ? <FiChevronUp /> : <FiChevronDown />}
                                    </button>
                                    <AnimatePresence>
                                        {activeDropdown === 'profile' && (
                                            <motion.div
                                                className="recipe-nav-dropdown-menu"
                                                initial="closed"
                                                animate="open"
                                                exit="closed"
                                                variants={dropdownVariants}
                                            >
                                                {profileOptions.map((option) => (
                                                    <a
                                                        key={option.name}
                                                        href={option.path}
                                                        className="recipe-nav-dropdown-item"
                                                    >
                                                        {option.name}
                                                    </a>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>) : (<>


                            </>)}





                    {
                        user && Object.keys(user).length > 0 ? (
                            <>

                            </>) : (<>
                                <div className="recipe-nav-dropdown-container">
                                    <button
                                        className="recipe-nav-link recipe-nav-dropdown-toggle"
                                        onClick={() => toggleDropdown('auth')}
                                    >
                                        <FiUser />
                                        <span>User</span>
                                        {activeDropdown === 'auth' ? <FiChevronUp /> : <FiChevronDown />}
                                    </button>
                                    <AnimatePresence>
                                        {activeDropdown === 'auth' && (
                                            <motion.div
                                                className="recipe-nav-dropdown-menu"
                                                initial="closed"
                                                animate="open"
                                                exit="closed"
                                                variants={dropdownVariants}
                                            >
                                                {authOptions.map((option) => (
                                                    <a
                                                        key={option.name}
                                                        href={option.path}
                                                        className="recipe-nav-dropdown-item"
                                                    >
                                                        {option.name}
                                                    </a>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                            </>)}


                    {
                        user && Object.keys(user).length > 0 ? (
                            <>
                                <a onClick={handleLogout} className="recipe-nav-link" style={{ cursor: "pointer" }}>
                                    <FiLogOut />
                                    <span>Logout</span>
                                </a>
                            </>) : (<>


                            </>)}




                </div>



                {/* Mobile Menu Button */}
                <div className="recipe-navbar-actions">
                    <button
                        className="recipe-theme-toggle"
                        onClick={toggleTheme}
                        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                    >
                        {isDarkMode ? <FiSun /> : <FiMoon />}
                    </button>

                    <button
                        className="recipe-menu-toggle"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label={isOpen ? "Close menu" : "Open menu"}
                        aria-expanded={isOpen}
                    >
                        {isOpen ? <FiX /> : <FiMenu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={`recipe-navbar-dropdown ${isDarkMode ? 'recipe-dark' : 'recipe-light'}`}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={menuVariants}
                    >
                        <motion.div className="recipe-navbar-links-mobile" variants={menuVariants}>
                            <motion.a href="/" className="recipe-nav-link-mobile" variants={itemVariants}>
                                <FiHome />
                                <span>Home</span>
                            </motion.a>

                            <motion.div className="recipe-mobile-dropdown-container" variants={itemVariants}>
                                <button
                                    className="recipe-nav-link-mobile recipe-mobile-dropdown-toggle"
                                    onClick={() => toggleDropdown('mobile-recipes')}
                                >
                                    <FiBook />
                                    <span>Recipes</span>
                                    {activeDropdown === 'mobile-recipes' ? <FiChevronUp /> : <FiChevronDown />}
                                </button>
                                <AnimatePresence>
                                    {activeDropdown === 'mobile-recipes' && (
                                        <motion.div
                                            className="recipe-mobile-dropdown-menu"
                                            initial="closed"
                                            animate="open"
                                            exit="closed"
                                            variants={dropdownVariants}
                                        >
                                            {recipeCategories.map((category) => (
                                                <a
                                                    key={`mobile-${category.name}`}
                                                    href={category.path}
                                                    className="recipe-mobile-dropdown-item"
                                                >
                                                    {category.name}
                                                </a>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            <motion.a href="/search" className="recipe-nav-link-mobile" variants={itemVariants}>
                                <FiSearch />
                                <span>Search Recipes</span>
                            </motion.a>

                            <motion.div className="recipe-mobile-dropdown-container" variants={itemVariants}>
                                <button
                                    className="recipe-nav-link-mobile recipe-mobile-dropdown-toggle"
                                    onClick={() => toggleDropdown('mobile-profile')}
                                >
                                    <FiUser />
                                    <span>Profile</span>
                                    {activeDropdown === 'mobile-profile' ? <FiChevronUp /> : <FiChevronDown />}
                                </button>
                                <AnimatePresence>
                                    {activeDropdown === 'mobile-profile' && (
                                        <motion.div
                                            className="recipe-mobile-dropdown-menu"
                                            initial="closed"
                                            animate="open"
                                            exit="closed"
                                            variants={dropdownVariants}
                                        >
                                            {profileOptions.map((option) => (
                                                <a
                                                    key={`mobile-${option.name}`}
                                                    href={option.path}
                                                    className="recipe-mobile-dropdown-item"
                                                >
                                                    {option.name}
                                                </a>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>



                            <motion.a href="/settings" className="recipe-nav-link-mobile" variants={itemVariants}>
                                <FiSettings />
                                <span>Settings</span>
                            </motion.a>
                            <motion.div className="recipe-mobile-dropdown-container" variants={itemVariants}>
                                <button
                                    className="recipe-nav-link-mobile recipe-mobile-dropdown-toggle"
                                    onClick={() => toggleDropdown('mobile-auth')}
                                >
                                    <FiUser />
                                    <span>User</span>
                                    {activeDropdown === 'mobile-auth' ? <FiChevronUp /> : <FiChevronDown />}
                                </button>
                                <AnimatePresence>
                                    {activeDropdown === 'mobile-auth' && (
                                        <motion.div
                                            className="recipe-mobile-dropdown-menu"
                                            initial="closed"
                                            animate="open"
                                            exit="closed"
                                            variants={dropdownVariants}
                                        >
                                            {authOptions.map((option) => (
                                                <a
                                                    key={`mobile-${option.name}`}
                                                    href={option.path}
                                                    className="recipe-mobile-dropdown-item"
                                                >
                                                    {option.name}
                                                </a>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                            <motion.a onClick={handleLogout} style={{ cursor: "pointer" }} className="recipe-nav-link-mobile recipe-logout" variants={itemVariants}>
                                <FiLogOut />
                                <span>Logout</span>
                            </motion.a>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default RecipeNavbar;