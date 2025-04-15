import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
// import { UserContext } from '../../context/UserContext';
import { Book, Heart, Clock, ChefHat, Users, Edit, Trash, Plus, ChevronRight, X, Star, Filter, Utensils } from 'lucide-react';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const BreakfastRecipes = () => {
    const { isDarkMode } = useContext(ThemeContext);
    // const { user } = useContext(UserContext);
    const [user, setUser] = useState(null);

    const [breakfastRecipes, setBreakfastRecipes] = useState([]);
    const [savedRecipes, setSavedRecipes] = useState([]);
    const [likedRecipes, setLikedRecipes] = useState([]);
    const [activeTab, setActiveTab] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

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

    const [filterOptions, setFilterOptions] = useState({
        time: 'all',
        difficulty: 'all',
        dietary: 'all',
        showFilterPanel: false
    });
    const [recipeToAdd, setRecipeToAdd] = useState({
        title: '',
        time: '',
        difficulty: 'Easy',
        servings: 2,
        ingredients: [''],
        steps: [''],
        isVegetarian: false,
        image: ''
    });
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingRecipe, setEditingRecipe] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchBreakfastRecipes();
        if (user && Object.keys(user).length > 0) {
            fetchUserSavedRecipes();
            fetchUserLikedRecipes();
        }
    }, [user]);

    const fetchBreakfastRecipes = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/breakfast-recipes');
            if (!response.ok) throw new Error('Failed to fetch recipes');

            const data = await response.json();
            setBreakfastRecipes(data);

            // Initialize active tabs
            const initialTabs = {};
            data.forEach((_, index) => {
                initialTabs[index] = 'ingredients';
            });
            setActiveTab(initialTabs);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching breakfast recipes:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUserSavedRecipes = async () => {
        try {
            const response = await fetch(`/api/user-saved-recipes?email=${user.email}`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                // Map saved recipes to their indices
                const savedIndices = data.map(savedRecipe => {
                    const index = breakfastRecipes.findIndex(recipe => recipe._id === savedRecipe._id);
                    return index !== -1 ? index : null;
                }).filter(index => index !== null);

                setSavedRecipes(savedIndices);
            }
        } catch (error) {
            console.error('Error fetching saved recipes:', error);
        }
    };

    const fetchUserLikedRecipes = async () => {
        try {
            const response = await fetch(`/api/user-liked-recipes?email=${user.email}`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                // Map liked recipes to their indices
                const likedIndices = data.map(likedRecipe => {
                    const index = breakfastRecipes.findIndex(recipe => recipe._id === likedRecipe._id);
                    return index !== -1 ? index : null;
                }).filter(index => index !== null);

                setLikedRecipes(likedIndices);
            }
        } catch (error) {
            console.error('Error fetching liked recipes:', error);
        }
    };

    const handleTabChange = (index, tab) => {
        setActiveTab(prev => ({
            ...prev,
            [index]: tab
        }));
    };

    const handleSaveRecipe = async (recipe, index) => {
        if (!user || Object.keys(user).length === 0) {
            Swal.fire({
                title: 'Login Required',
                text: 'You must be logged in to save recipes',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Login',
                cancelButtonText: 'Cancel',
                background: isDarkMode ? '#1e1e1e' : '#ffffff',
                color: isDarkMode ? '#ffffff' : '#333333',
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/Login';
                }
            });
            return;
        }

        // Check if recipe is already saved
        const isAlreadySaved = savedRecipes.includes(index);

        if (isAlreadySaved) {
            // Show confirmation dialog for unsaving
            const result = await Swal.fire({
                title: 'Unsave Recipe?',
                text: 'Do you want to remove this recipe from your saved collection?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, unsave it',
                cancelButtonText: 'No, keep it',
                background: isDarkMode ? '#1e1e1e' : '#ffffff',
                color: isDarkMode ? '#ffffff' : '#333333',
            });

            if (!result.isConfirmed) {
                return; // User cancelled the unsave action
            }
        }

        try {
            const response = await fetch('/api/save-recipe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    recipeData: recipe,
                    email: user.email,
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.action === 'saved') {
                    Swal.fire({
                        title: 'Saved!',
                        text: 'Recipe has been saved to your collection',
                        icon: 'success',
                        background: isDarkMode ? '#1e1e1e' : '#ffffff',
                        color: isDarkMode ? '#ffffff' : '#333333',
                    });
                    setSavedRecipes([...savedRecipes, index]);
                } else {
                    Swal.fire({
                        title: 'Unsaved!',
                        text: 'Recipe has been removed from your collection',
                        icon: 'success',
                        background: isDarkMode ? '#1e1e1e' : '#ffffff',
                        color: isDarkMode ? '#ffffff' : '#333333',
                    });
                    setSavedRecipes(savedRecipes.filter(i => i !== index));
                }
            }
        } catch (error) {
            console.error('Error saving recipe:', error);
        }
    };

    const handleLikeRecipe = async (recipe, index) => {
        if (!user || Object.keys(user).length === 0) {
            Swal.fire({
                title: 'Login Required',
                text: 'You must be logged in to like recipes',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Login',
                cancelButtonText: 'Cancel',
                background: isDarkMode ? '#1e1e1e' : '#ffffff',
                color: isDarkMode ? '#ffffff' : '#333333',
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/Login';
                }
            });
            return;
        }

        // Check if recipe is already liked
        const isAlreadyLiked = likedRecipes.includes(index);

        if (isAlreadyLiked) {
            // Show confirmation dialog for unliking
            const result = await Swal.fire({
                title: 'Unlike Recipe?',
                text: 'Do you want to remove this recipe from your liked recipes?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, unlike it',
                cancelButtonText: 'No, keep it',
                background: isDarkMode ? '#1e1e1e' : '#ffffff',
                color: isDarkMode ? '#ffffff' : '#333333',
            });

            if (!result.isConfirmed) {
                return; // User cancelled the unlike action
            }
        }

        try {
            const response = await fetch('/api/like-recipe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    recipeData: recipe,
                    email: user.email,
                    action: isAlreadyLiked ? 'unlike' : 'like'
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.action === 'liked') {
                    Swal.fire({
                        title: 'Liked!',
                        text: 'Recipe has been added to your favorites',
                        icon: 'success',
                        background: isDarkMode ? '#1e1e1e' : '#ffffff',
                        color: isDarkMode ? '#ffffff' : '#333333',
                    });
                    setLikedRecipes([...likedRecipes, index]);
                } else {
                    Swal.fire({
                        title: 'Unliked!',
                        text: 'Recipe has been removed from your favorites',
                        icon: 'success',
                        background: isDarkMode ? '#1e1e1e' : '#ffffff',
                        color: isDarkMode ? '#ffffff' : '#333333',
                    });
                    setLikedRecipes(likedRecipes.filter(i => i !== index));
                }
            }
        } catch (error) {
            console.error('Error liking recipe:', error);
        }
    };

    const handleDeleteRecipe = async (recipeId) => {
        if (!user || Object.keys(user).length === 0 || !user.isAdmin) {
            Swal.fire({
                title: 'Access Denied',
                text: 'You must be an admin to delete recipes',
                icon: 'error',
                background: isDarkMode ? '#1e1e1e' : '#ffffff',
                color: isDarkMode ? '#ffffff' : '#333333',
            });
            return;
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This recipe will be permanently deleted!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            background: isDarkMode ? '#1e1e1e' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#333333',
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`/api/breakfast-recipes/${recipeId}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });

                if (response.ok) {
                    Swal.fire({
                        title: 'Deleted!',
                        text: 'Recipe has been deleted.',
                        icon: 'success',
                        background: isDarkMode ? '#1e1e1e' : '#ffffff',
                        color: isDarkMode ? '#ffffff' : '#333333',
                    });
                    fetchBreakfastRecipes();
                }
            } catch (error) {
                console.error('Error deleting recipe:', error);
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to delete recipe.',
                    icon: 'error',
                    background: isDarkMode ? '#1e1e1e' : '#ffffff',
                    color: isDarkMode ? '#ffffff' : '#333333',
                });
            }
        }
    };

    const handleEditRecipe = (recipe) => {
        setEditingRecipe({
            ...recipe,
            ingredients: [...recipe.ingredients],
            steps: [...recipe.steps]
        });
    };

    const handleUpdateRecipe = async () => {
        if (!user || !user.isAdmin) {
            Swal.fire({
                title: 'Access Denied',
                text: 'You must be an admin to update recipes',
                icon: 'error',
                background: isDarkMode ? '#1e1e1e' : '#ffffff',
                color: isDarkMode ? '#ffffff' : '#333333',
            });
            return;
        }

        try {
            const response = await fetch(`/api/breakfast-recipes/${editingRecipe._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(editingRecipe)
            });

            if (response.ok) {
                Swal.fire({
                    title: 'Updated!',
                    text: 'Recipe has been updated successfully.',
                    icon: 'success',
                    background: isDarkMode ? '#1e1e1e' : '#ffffff',
                    color: isDarkMode ? '#ffffff' : '#333333',
                });
                setEditingRecipe(null);
                fetchBreakfastRecipes();
            }
        } catch (error) {
            console.error('Error updating recipe:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update recipe.',
                icon: 'error',
                background: isDarkMode ? '#1e1e1e' : '#ffffff',
                color: isDarkMode ? '#ffffff' : '#333333',
            });
        }
    };

    const handleAddRecipe = async () => {
        if (!user || !user.isAdmin) {
            Swal.fire({
                title: 'Access Denied',
                text: 'You must be an admin to add recipes',
                icon: 'error',
                background: isDarkMode ? '#1e1e1e' : '#ffffff',
                color: isDarkMode ? '#ffffff' : '#333333',
            });
            return;
        }

        // Validate recipe data
        if (!recipeToAdd.title || recipeToAdd.ingredients.some(ing => !ing) || recipeToAdd.steps.some(step => !step)) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Please fill all required fields',
                icon: 'error',
                background: isDarkMode ? '#1e1e1e' : '#ffffff',
                color: isDarkMode ? '#ffffff' : '#333333',
            });
            return;
        }

        try {
            const response = await fetch('/api/breakfast-recipes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    ...recipeToAdd,
                    category: 'breakfast'
                })
            });

            if (response.ok) {
                Swal.fire({
                    title: 'Added!',
                    text: 'New breakfast recipe has been added.',
                    icon: 'success',
                    background: isDarkMode ? '#1e1e1e' : '#ffffff',
                    color: isDarkMode ? '#ffffff' : '#333333',
                });
                setShowAddForm(false);
                setRecipeToAdd({
                    title: '',
                    time: '',
                    difficulty: 'Easy',
                    servings: 2,
                    ingredients: [''],
                    steps: [''],
                    isVegetarian: false,
                    image: ''
                });
                fetchBreakfastRecipes();
            }
        } catch (error) {
            console.error('Error adding recipe:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to add recipe.',
                icon: 'error',
                background: isDarkMode ? '#1e1e1e' : '#ffffff',
                color: isDarkMode ? '#ffffff' : '#333333',
            });
        }
    };

    const handleAddIngredient = (isEdit = false) => {
        if (isEdit) {
            setEditingRecipe({
                ...editingRecipe,
                ingredients: [...editingRecipe.ingredients, '']
            });
        } else {
            setRecipeToAdd({
                ...recipeToAdd,
                ingredients: [...recipeToAdd.ingredients, '']
            });
        }
    };

    const handleAddStep = (isEdit = false) => {
        if (isEdit) {
            setEditingRecipe({
                ...editingRecipe,
                steps: [...editingRecipe.steps, '']
            });
        } else {
            setRecipeToAdd({
                ...recipeToAdd,
                steps: [...recipeToAdd.steps, '']
            });
        }
    };

    const handleRemoveIngredient = (index, isEdit = false) => {
        if (isEdit) {
            const updatedIngredients = [...editingRecipe.ingredients];
            updatedIngredients.splice(index, 1);
            setEditingRecipe({
                ...editingRecipe,
                ingredients: updatedIngredients
            });
        } else {
            const updatedIngredients = [...recipeToAdd.ingredients];
            updatedIngredients.splice(index, 1);
            setRecipeToAdd({
                ...recipeToAdd,
                ingredients: updatedIngredients
            });
        }
    };

    const handleRemoveStep = (index, isEdit = false) => {
        if (isEdit) {
            const updatedSteps = [...editingRecipe.steps];
            updatedSteps.splice(index, 1);
            setEditingRecipe({
                ...editingRecipe,
                steps: updatedSteps
            });
        } else {
            const updatedSteps = [...recipeToAdd.steps];
            updatedSteps.splice(index, 1);
            setRecipeToAdd({
                ...recipeToAdd,
                steps: updatedSteps
            });
        }
    };

    const handleInputChange = (field, value, isEdit = false) => {
        if (isEdit) {
            setEditingRecipe({
                ...editingRecipe,
                [field]: value
            });
        } else {
            setRecipeToAdd({
                ...recipeToAdd,
                [field]: value
            });
        }
    };

    const handleIngredientChange = (index, value, isEdit = false) => {
        if (isEdit) {
            const updatedIngredients = [...editingRecipe.ingredients];
            updatedIngredients[index] = value;
            setEditingRecipe({
                ...editingRecipe,
                ingredients: updatedIngredients
            });
        } else {
            const updatedIngredients = [...recipeToAdd.ingredients];
            updatedIngredients[index] = value;
            setRecipeToAdd({
                ...recipeToAdd,
                ingredients: updatedIngredients
            });
        }
    };

    const handleStepChange = (index, value, isEdit = false) => {
        if (isEdit) {
            const updatedSteps = [...editingRecipe.steps];
            updatedSteps[index] = value;
            setEditingRecipe({
                ...editingRecipe,
                steps: updatedSteps
            });
        } else {
            const updatedSteps = [...recipeToAdd.steps];
            updatedSteps[index] = value;
            setRecipeToAdd({
                ...recipeToAdd,
                steps: updatedSteps
            });
        }
    };

    const toggleFilterPanel = () => {
        setFilterOptions(prev => ({
            ...prev,
            showFilterPanel: !prev.showFilterPanel
        }));
    };

    const applyFilters = (recipes) => {
        const { time, difficulty, dietary } = filterOptions;
        return recipes.filter(recipe => {
            // Filter by time
            if (time !== 'all') {
                const minutes = parseInt(recipe.time);
                if (time === 'quick' && minutes > 15) return false;
                if (time === 'medium' && (minutes <= 15 || minutes > 30)) return false;
                if (time === 'long' && minutes <= 30) return false;
            }

            // Filter by difficulty
            if (difficulty !== 'all' && recipe.difficulty.toLowerCase() !== difficulty) return false;

            // Filter by dietary preference
            if (dietary === 'vegetarian' && !recipe.isVegetarian) return false;
            if (dietary === 'non-vegetarian' && recipe.isVegetarian) return false;

            // Apply search query
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const titleMatch = recipe.title.toLowerCase().includes(query);
                const ingredientMatch = recipe.ingredients.some(ing =>
                    ing.toLowerCase().includes(query)
                );

                return titleMatch || ingredientMatch;
            }

            return true;
        });
    };

    // Apply filters to recipes
    const filteredRecipes = applyFilters(breakfastRecipes);

    const heroVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.5
            }
        })
    };

    return (
        <div className={`brfst-recipes-container ${isDarkMode ? 'brfst-dark-mode' : 'brfst-light-mode'}`}>
            {/* 3D Hero Section with Parallax */}
            <motion.section
                className="brfst-hero-section"
                initial="hidden"
                animate="visible"
                variants={heroVariants}
            >
                <div className="brfst-hero-content">
                    <h1 className="brfst-hero-title">Morning Delights</h1>
                    <p className="brfst-hero-subtitle">Quick & Delicious Breakfast Recipes</p>
                    <p className="brfst-hero-description">
                        Start your day right with our collection of nutritious, time-saving breakfast recipes.
                        Perfect for busy mornings or lazy weekends - all tailored to your available ingredients!
                    </p>
                    <div className="brfst-hero-actions">
                        <button
                            className="brfst-hero-btn brfst-explore-btn"
                            onClick={() => document.getElementById('brfst-recipes-list').scrollIntoView({ behavior: 'smooth' })}
                        >
                            Explore Recipes <ChevronRight size={18} />
                        </button>
                        {user?.isAdmin && (
                            <button
                                className="brfst-hero-btn brfst-add-btn"
                                onClick={() => setShowAddForm(true)}
                            >
                                <Plus size={18} /> Add New Recipe
                            </button>
                        )}
                    </div>
                </div>
                <div className="brfst-hero-image-container">
                    <div className="brfst-hero-3d-image"></div>
                    <div className="brfst-hero-floating-elements">
                        <div className="brfst-floating-egg"></div>
                        <div className="brfst-floating-toast"></div>
                        <div className="brfst-floating-orange"></div>
                        <div className="brfst-floating-pancake"></div>
                    </div>
                </div>
            </motion.section>

            {/* Benefits of Breakfast Section */}
            <section className="brfst-benefits-section">
                <h2 className="brfst-section-title">Why Breakfast Matters</h2>
                <div className="brfst-benefits-grid">
                    <div className="brfst-benefit-card">
                        <div className="brfst-benefit-icon">
                            <div className="brfst-energy-icon"></div>
                        </div>
                        <h3>Boosts Energy</h3>
                        <p>A nutritious breakfast jumpstarts your metabolism and provides the energy you need to tackle your day.</p>
                    </div>
                    <div className="brfst-benefit-card">
                        <div className="brfst-benefit-icon">
                            <div className="brfst-brain-icon"></div>
                        </div>
                        <h3>Improves Focus</h3>
                        <p>Studies show that eating breakfast enhances concentration, memory and cognitive performance throughout the morning.</p>
                    </div>
                    <div className="brfst-benefit-card">
                        <div className="brfst-benefit-icon">
                            <div className="brfst-health-icon"></div>
                        </div>
                        <h3>Supports Health</h3>
                        <p>Regular breakfast eaters tend to have better overall nutrition, improved weight management, and lower risk of certain diseases.</p>
                    </div>
                    <div className="brfst-benefit-card">
                        <div className="brfst-benefit-icon">
                            <div className="brfst-habit-icon"></div>
                        </div>
                        <h3>Creates Routine</h3>
                        <p>Establishing a breakfast routine helps regulate your body's internal clock and promotes better sleep patterns.</p>
                    </div>
                </div>
            </section>

            {/* Search and Filter Section */}
            <section className="brfst-search-filter-section">
                <div className="brfst-search-container">
                    <input
                        type="text"
                        className="brfst-search-input"
                        placeholder="Search for recipes, ingredients..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="brfst-filter-container">
                    <button
                        className="brfst-filter-toggle-btn"
                        onClick={toggleFilterPanel}
                    >
                        <Filter size={18} /> Filters {filterOptions.showFilterPanel ? <X size={16} /> : <ChevronRight size={16} />}
                    </button>

                    <AnimatePresence>
                        {filterOptions.showFilterPanel && (
                            <motion.div
                                className="brfst-filter-panel"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="brfst-filter-group">
                                    <h4>Preparation Time</h4>
                                    <div className="brfst-filter-options">
                                        <button
                                            className={`brfst-filter-btn ${filterOptions.time === 'all' ? 'brfst-active' : ''}`}
                                            onClick={() => setFilterOptions({ ...filterOptions, time: 'all' })}
                                        >
                                            All
                                        </button>
                                        <button
                                            className={`brfst-filter-btn ${filterOptions.time === 'quick' ? 'brfst-active' : ''}`}
                                            onClick={() => setFilterOptions({ ...filterOptions, time: 'quick' })}
                                        >
                                            Quick (&lt;15min)
                                        </button>
                                        <button
                                            className={`brfst-filter-btn ${filterOptions.time === 'medium' ? 'brfst-active' : ''}`}
                                            onClick={() => setFilterOptions({ ...filterOptions, time: 'medium' })}
                                        >
                                            Medium (15-30min)
                                        </button>
                                        <button
                                            className={`brfst-filter-btn ${filterOptions.time === 'long' ? 'brfst-active' : ''}`}
                                            onClick={() => setFilterOptions({ ...filterOptions, time: 'long' })}
                                        >
                                            Longer (&gt;30min)
                                        </button>
                                    </div>
                                </div>

                                <div className="brfst-filter-group">
                                    <h4>Difficulty Level</h4>
                                    <div className="brfst-filter-options">
                                        <button
                                            className={`brfst-filter-btn ${filterOptions.difficulty === 'all' ? 'brfst-active' : ''}`}
                                            onClick={() => setFilterOptions({ ...filterOptions, difficulty: 'all' })}
                                        >
                                            All
                                        </button>
                                        <button
                                            className={`brfst-filter-btn ${filterOptions.difficulty === 'easy' ? 'brfst-active' : ''}`}
                                            onClick={() => setFilterOptions({ ...filterOptions, difficulty: 'easy' })}
                                        >
                                            Easy
                                        </button>
                                        <button
                                            className={`brfst-filter-btn ${filterOptions.difficulty === 'medium' ? 'brfst-active' : ''}`}
                                            onClick={() => setFilterOptions({ ...filterOptions, difficulty: 'medium' })}
                                        >
                                            Medium
                                        </button>
                                        <button
                                            className={`brfst-filter-btn ${filterOptions.difficulty === 'hard' ? 'brfst-active' : ''}`}
                                            onClick={() => setFilterOptions({ ...filterOptions, difficulty: 'hard' })}
                                        >
                                            Hard
                                        </button>
                                    </div>
                                </div>

                                <div className="brfst-filter-group">
                                    <h4>Dietary Preference</h4>
                                    <div className="brfst-filter-options">
                                        <button
                                            className={`brfst-filter-btn ${filterOptions.dietary === 'all' ? 'brfst-active' : ''}`}
                                            onClick={() => setFilterOptions({ ...filterOptions, dietary: 'all' })}
                                        >
                                            All
                                        </button>
                                        <button
                                            className={`brfst-filter-btn ${filterOptions.dietary === 'vegetarian' ? 'brfst-active' : ''}`}
                                            onClick={() => setFilterOptions({ ...filterOptions, dietary: 'vegetarian' })}
                                        >
                                            Vegetarian
                                        </button>
                                        <button
                                            className={`brfst-filter-btn ${filterOptions.dietary === 'non-vegetarian' ? 'brfst-active' : ''}`}
                                            onClick={() => setFilterOptions({ ...filterOptions, dietary: 'non-vegetarian' })}
                                        >
                                            Non-Vegetarian
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* Recipes List Section */}
            <section id="brfst-recipes-list" className="brfst-recipes-list-section">
                <h2 className="brfst-section-title">Our Breakfast Collection</h2>

                {isLoading ? (
                    <div className="brfst-loading">
                        <div className="brfst-spinner"></div>
                        <p>Loading delicious recipes...</p>
                    </div>
                ) : error ? (
                    <div className="brfst-error">
                        <p>Oops! Something went wrong: {error}</p>
                        <button onClick={fetchBreakfastRecipes} className="brfst-retry-btn">Try Again</button>
                    </div>
                ) : filteredRecipes.length === 0 ? (
                    <div className="brfst-no-results">
                        <div className="brfst-no-results-icon"></div>
                        <h3>No Recipes Found</h3>
                        <p>Try adjusting your filters or search query to find more recipes.</p>
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setFilterOptions({
                                    time: 'all',
                                    difficulty: 'all',
                                    dietary: 'all',
                                    showFilterPanel: false
                                });
                            }}
                            className="brfst-reset-filters-btn"
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    <div className="brfst-recipes-grid">
                        {filteredRecipes.map((recipe, index) => (
                            <motion.div
                                key={recipe._id || index}
                                className="brfst-recipe-card"
                                custom={index}
                                initial="hidden"
                                animate="visible"
                                variants={cardVariants}
                                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                            >
                                <div className="brfst-recipe-image-container">
                                    <div
                                        className="brfst-recipe-image"
                                        style={{ backgroundImage: `url(${recipe.image || '/images/default-breakfast.jpg'})` }}
                                    ></div>
                                    {recipe.isVegetarian && (
                                        <span className="brfst-veg-badge">Vegetarian</span>
                                    )}
                                </div>

                                <div className="brfst-recipe-content">
                                    <h3 className="brfst-recipe-title">{recipe.title}</h3>
                                    <div className="brfst-recipe-actions">
                                        <button
                                            className={`brfst-recipe-action-btn ${savedRecipes.includes(index) ? 'brfst-saved' : ''}`}
                                            onClick={() => handleSaveRecipe(recipe, index)}
                                        >
                                            <Book size={16} /> {savedRecipes.includes(index) ? 'Unsave' : 'Save'}
                                        </button>
                                        <button
                                            className={`brfst-recipe-action-btn ${likedRecipes.includes(index) ? 'brfst-liked' : ''}`}
                                            onClick={() => handleLikeRecipe(recipe, index)}
                                        >
                                            <Heart size={16} fill={likedRecipes.includes(index) ? 'red' : 'none'} />
                                            {likedRecipes.includes(index) ? 'Liked' : 'Like'}
                                        </button>
                                    </div>
                                    <div className="brfst-recipe-meta">
                                        <span className="brfst-recipe-time">
                                            <Clock size={14} /> {recipe.time}
                                        </span>
                                        <span className="brfst-recipe-difficulty">
                                            <ChefHat size={14} /> {recipe.difficulty}
                                        </span>
                                        <span className="brfst-recipe-servings">
                                            <Users size={14} /> {recipe.servings} servings
                                        </span>
                                    </div>

                                    <div className="brfst-recipe-details">
                                        <div
                                            className={`brfst-recipe-tab ${activeTab[index] !== 'instructions' ? 'brfst-recipe-tab-active' : ''}`}
                                            onClick={() => handleTabChange(index, 'ingredients')}
                                        >
                                            <Utensils size={14} /> Ingredients
                                        </div>
                                        <div
                                            className={`brfst-recipe-tab ${activeTab[index] === 'instructions' ? 'brfst-recipe-tab-active' : ''}`}
                                            onClick={() => handleTabChange(index, 'instructions')}
                                        >
                                            <ChefHat size={14} /> Instructions
                                        </div>
                                    </div>

                                    <div className={`brfst-recipe-panel ${activeTab[index] !== 'instructions' ? 'brfst-recipe-panel-active' : ''}`}>
                                        <ul className="brfst-ingredients-list">
                                            {recipe.ingredients.map((ing, i) => (
                                                <li key={i} className="brfst-ingredient-item">
                                                    <span className="brfst-ingredient-check"></span>
                                                    <span>{ing}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className={`brfst-recipe-panel ${activeTab[index] === 'instructions' ? 'brfst-recipe-panel-active' : ''}`}>
                                        <ol className="brfst-instructions-list">
                                            {recipe.steps.map((step, i) => (
                                                <li key={i} className="brfst-instruction-item">
                                                    <span className="brfst-step-number">{i + 1}</span>
                                                    <p>{step}</p>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>

                                    {user?.isAdmin && (
                                        <div className="brfst-recipe-admin-actions">
                                            <button
                                                className="brfst-admin-btn brfst-edit-btn"
                                                onClick={() => handleEditRecipe(recipe)}
                                            >
                                                <Edit size={14} /> Edit
                                            </button>
                                            <button
                                                className="brfst-admin-btn brfst-delete-btn"
                                                onClick={() => handleDeleteRecipe(recipe._id)}
                                            >
                                                <Trash size={14} /> Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>

            {/* Breakfast Tips Section */}
            <section className="brfst-tips-section">
                <h2 className="brfst-section-title">Breakfast Success Tips</h2>
                <div className="brfst-tips-container">
                    <div className="brfst-tip-card">
                        <div className="brfst-tip-number">01</div>
                        <h3>Prep the Night Before</h3>
                        <p>Set out non-perishable ingredients, pre-chop fruits, or prepare overnight oats to save precious morning minutes.</p>
                    </div>
                    <div className="brfst-tip-card">
                        <div className="brfst-tip-number">02</div>
                        <h3>Batch Cook on Weekends</h3>
                        <p>Make large portions of freezer-friendly options like pancakes, breakfast burritos or muffins for quick reheating.</p>
                    </div>
                    <div className="brfst-tip-card">
                        <div className="brfst-tip-number">03</div>
                        <h3>Balance Your Nutrients</h3>
                        <p>Aim for a mix of protein, healthy fats, and complex carbs to maintain energy levels until lunch.</p>
                    </div>
                    <div className="brfst-tip-card">
                        <div className="brfst-tip-number">04</div>
                        <h3>Stay Hydrated</h3>
                        <p>Begin your day with a glass of water before coffee or tea to rehydrate after a night's sleep.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="brfst-faq-section">
                <h2 className="brfst-section-title">Breakfast FAQs</h2>
                <div className="brfst-faq-container">
                    <div className="brfst-faq-item">
                        <h3>What makes a breakfast "nutritionally balanced"?</h3>
                        <p>A nutritionally balanced breakfast contains protein (eggs, Greek yogurt, protein powder), complex carbohydrates (whole grains, oats, fruit), and healthy fats (avocado, nuts, seeds). This combination provides sustained energy and keeps you feeling full longer.</p>
                    </div>
                    <div className="brfst-faq-item">
                        <h3>I don't have time to cook in the morning. What are my options?</h3>
                        <p>Try make-ahead options like overnight oats, chia pudding, or freezer breakfast sandwiches. Alternatively, simple options like Greek yogurt with fruit and granola or a protein smoothie can be ready in under 5 minutes.</p>
                    </div>
                    <div className="brfst-faq-item">
                        <h3>Is it truly important to eat breakfast?</h3>
                        <p>While individual needs vary, research suggests that breakfast can improve cognitive function, provide essential nutrients, and help regulate appetite throughout the day. If you practice intermittent fasting, consult with a healthcare professional to ensure it meets your needs.</p>
                    </div>
                    <div className="brfst-faq-item">
                        <h3>What breakfasts are best for weight management?</h3>
                        <p>Focus on protein-rich options (eggs, Greek yogurt, protein smoothies) paired with fiber (vegetables, fruits, whole grains) to promote satiety. Controlling portion sizes and limiting added sugars are also important for weight management.</p>
                    </div>
                </div>
            </section>

            {/* Add Recipe Form Modal */}
            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        className="brfst-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="brfst-modal-content"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                        >
                            <div className="brfst-modal-header">
                                <h2>Add New Breakfast Recipe</h2>
                                <button className="brfst-modal-close" onClick={() => setShowAddForm(false)}>
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="brfst-modal-body">
                                <div className="brfst-form-group">
                                    <label htmlFor="brfst-recipe-title" className="brfst-form-label">Recipe Title</label>
                                    <input
                                        id="brfst-recipe-title"
                                        type="text"
                                        className="brfst-form-input"
                                        placeholder="E.g., Fluffy Pancakes with Berries"
                                        value={recipeToAdd.title}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                    />
                                </div>

                                <div className="brfst-form-row">
                                    <div className="brfst-form-group">
                                        <label htmlFor="brfst-recipe-time" className="brfst-form-label">Preparation Time (mins)</label>
                                        <input
                                            id="brfst-recipe-time"
                                            type="text"
                                            className="brfst-form-input"
                                            placeholder="E.g., 15 mins"
                                            value={recipeToAdd.time}
                                            onChange={(e) => handleInputChange('time', e.target.value)}
                                        />
                                    </div>

                                    <div className="brfst-form-group">
                                        <label htmlFor="brfst-recipe-difficulty" className="brfst-form-label">Difficulty</label>
                                        <select
                                            id="brfst-recipe-difficulty"
                                            className="brfst-form-select"
                                            value={recipeToAdd.difficulty}
                                            onChange={(e) => handleInputChange('difficulty', e.target.value)}
                                        >
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>
                                    </div>

                                    <div className="brfst-form-group">
                                        <label htmlFor="brfst-recipe-servings" className="brfst-form-label">Servings</label>
                                        <input
                                            id="brfst-recipe-servings"
                                            type="number"
                                            className="brfst-form-input"
                                            min="1"
                                            value={recipeToAdd.servings}
                                            onChange={(e) => handleInputChange('servings', parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>

                                <div className="brfst-form-group">
                                    <div className="brfst-form-row brfst-align-center">
                                        <label className="brfst-form-label">Ingredients</label>
                                        <button
                                            type="button"
                                            className="brfst-add-item-btn"
                                            onClick={() => handleAddIngredient()}
                                        >
                                            <Plus size={16} /> Add Ingredient
                                        </button>
                                    </div>

                                    {recipeToAdd.ingredients.map((ing, idx) => (
                                        <div key={idx} className="brfst-form-row brfst-ingredient-row">
                                            <input
                                                type="text"
                                                className="brfst-form-input"
                                                placeholder="E.g., 2 cups flour"
                                                value={ing}
                                                onChange={(e) => handleIngredientChange(idx, e.target.value)}
                                            />
                                            {recipeToAdd.ingredients.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="brfst-remove-item-btn"
                                                    onClick={() => handleRemoveIngredient(idx)}
                                                >
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="brfst-form-group">
                                    <div className="brfst-form-row brfst-align-center">
                                        <label className="brfst-form-label">Instructions</label>
                                        <button
                                            type="button"
                                            className="brfst-add-item-btn"
                                            onClick={() => handleAddStep()}
                                        >
                                            <Plus size={16} /> Add Step
                                        </button>
                                    </div>

                                    {recipeToAdd.steps.map((step, idx) => (
                                        <div key={idx} className="brfst-form-row brfst-step-row">
                                            <span className="brfst-step-number">{idx + 1}</span>
                                            <textarea
                                                className="brfst-form-textarea"
                                                placeholder="Describe this step..."
                                                value={step}
                                                onChange={(e) => handleStepChange(idx, e.target.value)}
                                            ></textarea>
                                            {recipeToAdd.steps.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="brfst-remove-item-btn"
                                                    onClick={() => handleRemoveStep(idx)}
                                                >
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="brfst-form-group">
                                    <label htmlFor="brfst-recipe-image" className="brfst-form-label">Image URL</label>
                                    <input
                                        id="brfst-recipe-image"
                                        type="text"
                                        className="brfst-form-input"
                                        placeholder="https://example.com/image.jpg"
                                        value={recipeToAdd.image}
                                        onChange={(e) => handleInputChange('image', e.target.value)}
                                    />
                                </div>

                                <div className="brfst-form-group brfst-form-checkbox">
                                    <input
                                        id="brfst-recipe-vegetarian"
                                        type="checkbox"
                                        className="brfst-form-checkbox-input"
                                        checked={recipeToAdd.isVegetarian}
                                        onChange={(e) => handleInputChange('isVegetarian', e.target.checked)}
                                    />
                                    <label htmlFor="brfst-recipe-vegetarian" className="brfst-checkbox-label">
                                        Vegetarian Recipe
                                    </label>
                                </div>
                            </div>

                            <div className="brfst-modal-footer">
                                <button
                                    className="brfst-modal-btn brfst-cancel-btn"
                                    onClick={() => setShowAddForm(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="brfst-modal-btn brfst-save-btn"
                                    onClick={handleAddRecipe}
                                >
                                    Add Recipe
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Recipe Form Modal */}
            <AnimatePresence>
                {editingRecipe && (
                    <motion.div
                        className="brfst-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="brfst-modal-content"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                        >
                            <div className="brfst-modal-header">
                                <h2>Edit Recipe</h2>
                                <button className="brfst-modal-close" onClick={() => setEditingRecipe(null)}>
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="brfst-modal-body">
                                <div className="brfst-form-group">
                                    <label htmlFor="brfst-edit-title" className="brfst-form-label">Recipe Title</label>
                                    <input
                                        id="brfst-edit-title"
                                        type="text"
                                        className="brfst-form-input"
                                        value={editingRecipe.title}
                                        onChange={(e) => handleInputChange('title', e.target.value, true)}
                                    />
                                </div>

                                <div className="brfst-form-row">
                                    <div className="brfst-form-group">
                                        <label htmlFor="brfst-edit-time" className="brfst-form-label">Preparation Time (mins)</label>
                                        <input
                                            id="brfst-edit-time"
                                            type="text"
                                            className="brfst-form-input"
                                            value={editingRecipe.time}
                                            onChange={(e) => handleInputChange('time', e.target.value, true)}
                                        />
                                    </div>

                                    <div className="brfst-form-group">
                                        <label htmlFor="brfst-edit-difficulty" className="brfst-form-label">Difficulty</label>
                                        <select
                                            id="brfst-edit-difficulty"
                                            className="brfst-form-select"
                                            value={editingRecipe.difficulty}
                                            onChange={(e) => handleInputChange('difficulty', e.target.value, true)}
                                        >
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>
                                    </div>

                                    <div className="brfst-form-group">
                                        <label htmlFor="brfst-edit-servings" className="brfst-form-label">Servings</label>
                                        <input
                                            id="brfst-edit-servings"
                                            type="number"
                                            className="brfst-form-input"
                                            min="1"
                                            value={editingRecipe.servings}
                                            onChange={(e) => handleInputChange('servings', parseInt(e.target.value), true)}
                                        />
                                    </div>
                                </div>

                                <div className="brfst-form-group">
                                    <div className="brfst-form-row brfst-align-center">
                                        <label className="brfst-form-label">Ingredients</label>
                                        <button
                                            type="button"
                                            className="brfst-add-item-btn"
                                            onClick={() => handleAddIngredient(true)}
                                        >
                                            <Plus size={16} /> Add Ingredient
                                        </button>
                                    </div>

                                    {editingRecipe.ingredients.map((ing, idx) => (
                                        <div key={idx} className="brfst-form-row brfst-ingredient-row">
                                            <input
                                                type="text"
                                                className="brfst-form-input"
                                                value={ing}
                                                onChange={(e) => handleIngredientChange(idx, e.target.value, true)}
                                            />
                                            {editingRecipe.ingredients.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="brfst-remove-item-btn"
                                                    onClick={() => handleRemoveIngredient(idx, true)}
                                                >
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="brfst-form-group">
                                    <div className="brfst-form-row brfst-align-center">
                                        <label className="brfst-form-label">Instructions</label>
                                        <button
                                            type="button"
                                            className="brfst-add-item-btn"
                                            onClick={() => handleAddStep(true)}
                                        >
                                            <Plus size={16} /> Add Step
                                        </button>
                                    </div>

                                    {editingRecipe.steps.map((step, idx) => (
                                        <div key={idx} className="brfst-form-row brfst-step-row">
                                            <span className="brfst-step-number">{idx + 1}</span>
                                            <textarea
                                                className="brfst-form-textarea"
                                                value={step}
                                                onChange={(e) => handleStepChange(idx, e.target.value, true)}
                                            ></textarea>
                                            {editingRecipe.steps.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="brfst-remove-item-btn"
                                                    onClick={() => handleRemoveStep(idx, true)}
                                                >
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="brfst-form-group">
                                    <label htmlFor="brfst-edit-image" className="brfst-form-label">Image URL</label>
                                    <input
                                        id="brfst-edit-image"
                                        type="text"
                                        className="brfst-form-input"
                                        value={editingRecipe.image || ''}
                                        onChange={(e) => handleInputChange('image', e.target.value, true)}
                                    />
                                </div>

                                <div className="brfst-form-group brfst-form-checkbox">
                                    <input
                                        id="brfst-edit-vegetarian"
                                        type="checkbox"
                                        className="brfst-form-checkbox-input"
                                        checked={editingRecipe.isVegetarian}
                                        onChange={(e) => handleInputChange('isVegetarian', e.target.checked, true)}
                                    />
                                    <label htmlFor="brfst-edit-vegetarian" className="brfst-checkbox-label">
                                        Vegetarian Recipe
                                    </label>
                                </div>
                            </div>

                            <div className="brfst-modal-footer">
                                <button
                                    className="brfst-modal-btn brfst-cancel-btn"
                                    onClick={() => setEditingRecipe(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="brfst-modal-btn brfst-save-btn"
                                    onClick={handleUpdateRecipe}
                                >
                                    Update Recipe
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Popular Categories Section */}
            <section className="brfst-categories-section">
                <h2 className="brfst-section-title">Popular Breakfast Categories</h2>
                <div className="brfst-categories-container">
                    <div className="brfst-category-card">
                        <div className="brfst-category-image brfst-category-quick"></div>
                        <div className="brfst-category-content">
                            <h3>Quick & Easy</h3>
                            <p>Ready in 15 minutes or less - perfect for busy weekday mornings when time is limited.</p>
                        </div>
                    </div>

                    <div className="brfst-category-card">
                        <div className="brfst-category-image brfst-category-protein"></div>
                        <div className="brfst-category-content">
                            <h3>High-Protein</h3>
                            <p>Fuel your day with protein-packed breakfast options that keep hunger at bay all morning.</p>
                        </div>
                    </div>

                    <div className="brfst-category-card">
                        <div className="brfst-category-image brfst-category-vegan"></div>
                        <div className="brfst-category-content">
                            <h3>Plant-Based</h3>
                            <p>Delicious vegetarian and vegan breakfast recipes that don't compromise on flavor or nutrition.</p>
                        </div>
                    </div>

                    <div className="brfst-category-card">
                        <div className="brfst-category-image brfst-category-weekend"></div>
                        <div className="brfst-category-content">
                            <h3>Weekend Brunch</h3>
                            <p>Special recipes for when you have more time to enjoy a leisurely morning meal with family and friends.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Nutrition Facts Section */}
            <section className="brfst-nutrition-section">
                <h2 className="brfst-section-title">Breakfast Nutrition Facts</h2>
                <div className="brfst-nutrition-container">
                    <div className="brfst-nutrition-content">
                        <h3>The Science Behind Breakfast</h3>
                        <p>Research consistently shows that a nutritious breakfast can help:</p>
                        <ul className="brfst-nutrition-list">
                            <li>Improve cognitive function and memory</li>
                            <li>Reduce risk of mid-morning energy crashes</li>
                            <li>Support healthy weight management</li>
                            <li>Increase daily consumption of essential nutrients</li>
                            <li>Regulate blood sugar levels</li>
                        </ul>
                        <p>A balanced breakfast typically provides 20-25% of your daily caloric needs and should include:</p>
                        <div className="brfst-nutrition-macros">
                            <div className="brfst-nutrition-macro">
                                <div className="brfst-macro-icon brfst-protein-icon"></div>
                                <h4>Protein</h4>
                                <p>15-20g to support muscle health and satiety</p>
                            </div>
                            <div className="brfst-nutrition-macro">
                                <div className="brfst-macro-icon brfst-carb-icon"></div>
                                <h4>Carbs</h4>
                                <p>40-50g of complex carbohydrates for energy</p>
                            </div>
                            <div className="brfst-nutrition-macro">
                                <div className="brfst-macro-icon brfst-fat-icon"></div>
                                <h4>Healthy Fats</h4>
                                <p>10-15g to support nutrient absorption</p>
                            </div>
                        </div>
                    </div>
                    <div className="brfst-nutrition-visual">
                        <div className="brfst-nutrition-chart">
                            <div className="brfst-chart-protein"></div>
                            <div className="brfst-chart-carbs"></div>
                            <div className="brfst-chart-fats"></div>
                        </div>
                        <div className="brfst-nutrition-legend">
                            <div className="brfst-legend-item">
                                <span className="brfst-legend-color brfst-protein-color"></span>
                                <span>Protein</span>
                            </div>
                            <div className="brfst-legend-item">
                                <span className="brfst-legend-color brfst-carbs-color"></span>
                                <span>Carbs</span>
                            </div>
                            <div className="brfst-legend-item">
                                <span className="brfst-legend-color brfst-fats-color"></span>
                                <span>Fats</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Seasonal Suggestions Section */}
            <section className="brfst-seasonal-section">
                <h2 className="brfst-section-title">Seasonal Breakfast Suggestions</h2>
                <div className="brfst-seasonal-container">
                    <div className="brfst-seasonal-card">
                        <div className="brfst-seasonal-image brfst-spring-image"></div>
                        <div className="brfst-seasonal-content">
                            <h3>Spring</h3>
                            <p>Fresh asparagus omelets, strawberry smoothie bowls, and rhubarb compote with yogurt.</p>
                        </div>
                    </div>
                    <div className="brfst-seasonal-card">
                        <div className="brfst-seasonal-image brfst-summer-image"></div>
                        <div className="brfst-seasonal-content">
                            <h3>Summer</h3>
                            <p>Chilled overnight oats with berries, avocado toast, and tropical fruit salads.</p>
                        </div>
                    </div>
                    <div className="brfst-seasonal-card">
                        <div className="brfst-seasonal-image brfst-fall-image"></div>
                        <div className="brfst-seasonal-content">
                            <h3>Fall</h3>
                            <p>Pumpkin spice pancakes, apple cinnamon oatmeal, and sweet potato hash.</p>
                        </div>
                    </div>
                    <div className="brfst-seasonal-card">
                        <div className="brfst-seasonal-image brfst-winter-image"></div>
                        <div className="brfst-seasonal-content">
                            <h3>Winter</h3>
                            <p>Hot quinoa porridge, spiced pear baked oatmeal, and hearty breakfast stews.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="brfst-cta-section">
                <div className="brfst-cta-container">
                    <div className="brfst-cta-content">
                        <h2>Start Your Day Right</h2>
                        <p>Join thousands of happy breakfast enthusiasts who have transformed their mornings with our recipes.</p>
                        <div className="brfst-cta-buttons">
                            <button className="brfst-cta-btn brfst-primary-cta">
                                Explore More Recipes
                            </button>
                            <button className="brfst-cta-btn brfst-secondary-cta">
                                Share Your Creation
                            </button>
                        </div>
                    </div>
                    <div className="brfst-cta-image"></div>
                </div>
            </section>
        </div>
    );
};

export default BreakfastRecipes;