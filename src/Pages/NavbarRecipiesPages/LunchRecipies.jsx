import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaHeart, FaRegHeart, FaBookmark, FaRegBookmark, FaClock, FaUtensils, FaFire } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import { BiFilterAlt } from 'react-icons/bi';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { BsThreeDotsVertical } from 'react-icons/bs';

const LunchRecipes = () => {
    const { isDarkMode } = useContext(ThemeContext);
    const navigate = useNavigate();

    // States
    const [recipes, setRecipes] = useState([]);
    const [filteredRecipes, setFilteredRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        maxCookingTime: 30, // Default max cooking time for lunch recipes
        cuisineType: [],
        dietaryRestrictions: []
    });
    const [showFilters, setShowFilters] = useState(false);
    const [featuredRecipes, setFeaturedRecipes] = useState([]);
    const [quickRecipes, setQuickRecipes] = useState([]);
    const [popularRecipes, setPopularRecipes] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [editingRecipe, setEditingRecipe] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newRecipe, setNewRecipe] = useState({
        title: '',
        ingredients: [],
        steps: [],
        time: '',
        image: '',
        cuisineType: '',
        isVegetarian: false,
        calories: ''
    });
    const [ingredientInput, setIngredientInput] = useState('');
    const [stepInput, setStepInput] = useState('');

    const LoadingSpinner = () => {
        return (
            <div className="spinner-container">
                <div className="spinner">
                    <div className="spinner-circle"></div>
                    <div className="spinner-circle"></div>
                    <div className="spinner-circle"></div>
                    <div className="spinner-circle"></div>
                </div>
            </div>
        );
    };


    // Cuisine options
    const cuisineOptions = [
        'Italian', 'Mexican', 'Chinese', 'Indian', 'Mediterranean',
        'Japanese', 'French', 'Thai', 'American', 'Middle Eastern'
    ];

    // Dietary restriction options
    const dietaryOptions = [
        'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free'
    ];

    // Fetch recipes on component mount
    useEffect(() => {
        fetchRecipes();
        fetchUserData();
    }, []);

    // Apply filters whenever filters state changes
    useEffect(() => {
        applyFilters();
    }, [filters, recipes, searchTerm]);

    // Fetch user data
    const fetchUserData = async () => {
        try {
            const response = await axios.get('/api/user/profile', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setCurrentUser(response.data);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    // Fetch recipes from API
    const fetchRecipes = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/recipes/lunch');
            const recipesData = response.data;

            setRecipes(recipesData);
            setFilteredRecipes(recipesData);

            // Set featured recipes (random selection of 5)
            const shuffled = [...recipesData].sort(() => 0.5 - Math.random());
            setFeaturedRecipes(shuffled.slice(0, 5));

            // Set quick recipes (cooking time less than 15 minutes)
            setQuickRecipes(recipesData.filter(recipe =>
                parseInt(recipe.time.split(' ')[0]) <= 15
            ));

            // Set popular recipes (most liked)
            setPopularRecipes([...recipesData].sort((a, b) =>
                (b.likesCount || 0) - (a.likesCount || 0)
            ).slice(0, 6));

        } catch (error) {
            console.error('Error fetching recipes:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to load recipes. Please try again later.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } finally {
            setLoading(false);
        }
    };

    // Apply filters to recipes
    const applyFilters = () => {
        let filtered = [...recipes];

        // Apply search term
        if (searchTerm) {
            filtered = filtered.filter(recipe =>
                recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply cooking time filter
        filtered = filtered.filter(recipe => {
            const cookingTime = parseInt(recipe.time.split(' ')[0]);
            return cookingTime <= filters.maxCookingTime;
        });

        // Apply cuisine type filter
        if (filters.cuisineType.length > 0) {
            filtered = filtered.filter(recipe =>
                filters.cuisineType.includes(recipe.cuisineType)
            );
        }

        // Apply dietary restrictions filter
        if (filters.dietaryRestrictions.length > 0) {
            filtered = filtered.filter(recipe => {
                if (filters.dietaryRestrictions.includes('vegetarian') && !recipe.isVegetarian) {
                    return false;
                }
                // Add more dietary restriction checks as needed
                return true;
            });
        }

        setFilteredRecipes(filtered);
    };

    // Toggle like recipe
    const toggleLikeRecipe = async (recipeId) => {
        if (!currentUser) {
            Swal.fire({
                title: 'Please log in',
                text: 'You need to be logged in to like recipes',
                icon: 'info',
                confirmButtonText: 'OK'
            });
            return;
        }

        try {
            const isLiked = currentUser.likedRecipes?.some(r => r.recipeId === recipeId);

            if (isLiked) {
                await axios.delete(`/api/recipes/${recipeId}/unlike`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
            } else {
                await axios.post(`/api/recipes/${recipeId}/like`, {}, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
            }

            // Update UI immediately for better UX
            setRecipes(prevRecipes =>
                prevRecipes.map(recipe => {
                    if (recipe._id === recipeId) {
                        const likesCount = (recipe.likesCount || 0) + (isLiked ? -1 : 1);
                        return { ...recipe, likesCount };
                    }
                    return recipe;
                })
            );

            // Update user data
            fetchUserData();

        } catch (error) {
            console.error('Error toggling like:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update like status',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    // Toggle save recipe
    const toggleSaveRecipe = async (recipeId, title, image, sourceUrl) => {
        if (!currentUser) {
            Swal.fire({
                title: 'Please log in',
                text: 'You need to be logged in to save recipes',
                icon: 'info',
                confirmButtonText: 'OK'
            });
            return;
        }

        try {
            const isSaved = currentUser.savedRecipes?.some(r => r.recipeId === recipeId);

            if (isSaved) {
                await axios.delete(`/api/recipes/${recipeId}/unsave`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
            } else {
                await axios.post(`/api/recipes/${recipeId}/save`, {
                    title,
                    image,
                    sourceUrl
                }, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
            }

            // Update user data
            fetchUserData();

        } catch (error) {
            console.error('Error toggling save:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update saved status',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    // Add new recipe
    const handleAddRecipe = async () => {
        if (!newRecipe.title || !newRecipe.time || newRecipe.ingredients.length === 0 || newRecipe.steps.length === 0) {
            Swal.fire({
                title: 'Incomplete Information',
                text: 'Please fill in all required fields',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }

        try {
            const response = await axios.post('/api/recipes', newRecipe, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            setRecipes([...recipes, response.data]);
            setShowAddModal(false);
            setNewRecipe({
                title: '',
                ingredients: [],
                steps: [],
                time: '',
                image: '',
                cuisineType: '',
                isVegetarian: false,
                calories: ''
            });

            Swal.fire({
                title: 'Success!',
                text: 'Recipe added successfully',
                icon: 'success',
                confirmButtonText: 'OK'
            });

        } catch (error) {
            console.error('Error adding recipe:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to add recipe',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    // Edit recipe
    const handleEditRecipe = async () => {
        try {
            const response = await axios.put(`/api/recipes/${editingRecipe._id}`, editingRecipe, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            setRecipes(recipes.map(recipe =>
                recipe._id === editingRecipe._id ? response.data : recipe
            ));

            setEditingRecipe(null);

            Swal.fire({
                title: 'Success!',
                text: 'Recipe updated successfully',
                icon: 'success',
                confirmButtonText: 'OK'
            });

        } catch (error) {
            console.error('Error updating recipe:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update recipe',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    // Delete recipe
    const handleDeleteRecipe = async (recipeId) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'You will not be able to recover this recipe!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`/api/recipes/${recipeId}`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    });

                    setRecipes(recipes.filter(recipe => recipe._id !== recipeId));

                    Swal.fire({
                        title: 'Deleted!',
                        text: 'Your recipe has been deleted.',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    });

                } catch (error) {
                    console.error('Error deleting recipe:', error);
                    Swal.fire({
                        title: 'Error!',
                        text: 'Failed to delete recipe',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                }
            }
        });
    };

    // Add ingredient to new recipe
    const handleAddIngredient = () => {
        if (ingredientInput.trim()) {
            if (editingRecipe) {
                setEditingRecipe({
                    ...editingRecipe,
                    ingredients: [...editingRecipe.ingredients, ingredientInput]
                });
            } else {
                setNewRecipe({
                    ...newRecipe,
                    ingredients: [...newRecipe.ingredients, ingredientInput]
                });
            }
            setIngredientInput('');
        }
    };

    // Add step to new recipe
    const handleAddStep = () => {
        if (stepInput.trim()) {
            if (editingRecipe) {
                setEditingRecipe({
                    ...editingRecipe,
                    steps: [...editingRecipe.steps, stepInput]
                });
            } else {
                setNewRecipe({
                    ...newRecipe,
                    steps: [...newRecipe.steps, stepInput]
                });
            }
            setStepInput('');
        }
    };

    // Recipe card component
    const RecipeCard = ({ recipe, index }) => {
        const isLiked = currentUser?.likedRecipes?.some(r => r.recipeId === recipe._id);
        const isSaved = currentUser?.savedRecipes?.some(r => r.recipeId === recipe._id);

        return (
            <motion.div
                className={`lunch-recipe-card ${isDarkMode ? 'lunch-dark' : 'lunch-light'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
            >
                <div className="lunch-recipe-card-image-container">
                    <img
                        src={recipe.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                        alt={recipe.title}
                        className="lunch-recipe-card-image"
                    />
                    <div className="lunch-recipe-card-actions">
                        <button
                            className="lunch-recipe-card-action-btn lunch-like-btn"
                            onClick={() => toggleLikeRecipe(recipe._id)}
                            aria-label={isLiked ? "Unlike recipe" : "Like recipe"}
                        >
                            {isLiked ? <FaHeart className="lunch-liked" /> : <FaRegHeart />}
                            <span className="lunch-likes-count">{recipe.likesCount || 0}</span>
                        </button>
                        <button
                            className="lunch-recipe-card-action-btn lunch-save-btn"
                            onClick={() => toggleSaveRecipe(recipe._id, recipe.title, recipe.image, recipe.sourceUrl)}
                            aria-label={isSaved ? "Unsave recipe" : "Save recipe"}
                        >
                            {isSaved ? <FaBookmark className="lunch-saved" /> : <FaRegBookmark />}
                        </button>
                    </div>
                    {recipe.isVegetarian && (
                        <div className="lunch-veg-badge">
                            <span>Veg</span>
                        </div>
                    )}
                </div>

                <div className="lunch-recipe-card-content">
                    <h3 className="lunch-recipe-card-title">{recipe.title}</h3>

                    <div className="lunch-recipe-card-meta">
                        <div className="lunch-recipe-card-meta-item">
                            <FaClock className="lunch-recipe-card-meta-icon" />
                            <span>{recipe.time}</span>
                        </div>
                        {recipe.cuisineType && (
                            <div className="lunch-recipe-card-meta-item">
                                <FaUtensils className="lunch-recipe-card-meta-icon" />
                                <span>{recipe.cuisineType}</span>
                            </div>
                        )}
                        {recipe.calories && (
                            <div className="lunch-recipe-card-meta-item">
                                <FaFire className="lunch-recipe-card-meta-icon" />
                                <span>{recipe.calories} cal</span>
                            </div>
                        )}
                    </div>

                    <button
                        className="lunch-view-recipe-btn"
                        onClick={() => navigate(`/recipes/${recipe._id}`)}
                    >
                        View Recipe
                    </button>

                    {currentUser && currentUser.userType === 'Admin' && (
                        <div className="lunch-admin-actions">
                            <button
                                className="lunch-admin-action-btn lunch-edit-btn"
                                onClick={() => setEditingRecipe(recipe)}
                            >
                                <MdEdit />
                            </button>
                            <button
                                className="lunch-admin-action-btn lunch-delete-btn"
                                onClick={() => handleDeleteRecipe(recipe._id)}
                            >
                                <MdDelete />
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        );
    };

    return (
        <div className={`lunch-recipes-container ${isDarkMode ? 'lunch-dark' : 'lunch-light'}`}>
            <div className="lunch-header-section">
                <motion.div
                    className="lunch-header-content"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="lunch-page-title">Quick & Delicious Lunch Recipes</h1>
                    <p className="lunch-page-subtitle">
                        Discover perfect midday meals ready in 30 minutes or less,
                        tailored to fit your busy schedule and dietary preferences
                    </p>
                </motion.div>
            </div>

            {/* Featured Recipes Carousel */}
            <section className="lunch-featured-section">
                <h2 className="lunch-section-title">Featured Lunch Ideas</h2>
                <p className="lunch-section-description">
                    Hand-picked recipes perfect for a satisfying midday meal
                </p>

                {loading ? (
                    <LoadingSpinner />
                ) : (
                    <Splide
                        options={{
                            perPage: 3,
                            gap: '1rem',
                            pagination: false,
                            breakpoints: {
                                1024: { perPage: 2 },
                                768: { perPage: 1 }
                            }
                        }}
                        className="lunch-featured-carousel"
                    >
                        {featuredRecipes.map((recipe, index) => (
                            <SplideSlide key={recipe._id || index}>
                                <div className="lunch-featured-card">
                                    <div className="lunch-featured-img-container">
                                        <img
                                            src={recipe.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                                            alt={recipe.title}
                                            className="lunch-featured-img"
                                        />
                                    </div>
                                    <div className="lunch-featured-content">
                                        <h3 className="lunch-featured-title">{recipe.title}</h3>
                                        <div className="lunch-featured-meta">
                                            <span><FaClock /> {recipe.time}</span>
                                            {recipe.cuisineType && (
                                                <span><FaUtensils /> {recipe.cuisineType}</span>
                                            )}
                                        </div>
                                        <button
                                            className="lunch-featured-btn"
                                            onClick={() => navigate(`/recipes/${recipe._id}`)}
                                        >
                                            View Recipe
                                        </button>
                                    </div>
                                </div>
                            </SplideSlide>
                        ))}
                    </Splide>
                )}
            </section>

            {/* Search and Filters */}
            <section className="lunch-search-filter-section">
                <div className="lunch-search-box">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search lunch recipes..."
                        className="lunch-search-input"
                    />
                </div>

                <div className="lunch-filter-container">
                    <button
                        className="lunch-filter-toggle-btn"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <BiFilterAlt />
                        <span>Filter Recipes</span>
                    </button>

                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                className="lunch-filters-panel"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="lunch-filter-group">
                                    <h4 className="lunch-filter-title">Max Cooking Time</h4>
                                    <div className="lunch-slider-container">
                                        <input
                                            type="range"
                                            min="5"
                                            max="60"
                                            step="5"
                                            value={filters.maxCookingTime}
                                            onChange={(e) => setFilters({
                                                ...filters,
                                                maxCookingTime: parseInt(e.target.value)
                                            })}
                                            className="lunch-time-slider"
                                        />
                                        <span className="lunch-slider-value">{filters.maxCookingTime} mins</span>
                                    </div>
                                </div>

                                <div className="lunch-filter-group">
                                    <h4 className="lunch-filter-title">Cuisine Type</h4>
                                    <div className="lunch-checkbox-group">
                                        {cuisineOptions.map(cuisine => (
                                            <label key={cuisine} className="lunch-checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={filters.cuisineType.includes(cuisine)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setFilters({
                                                                ...filters,
                                                                cuisineType: [...filters.cuisineType, cuisine]
                                                            });
                                                        } else {
                                                            setFilters({
                                                                ...filters,
                                                                cuisineType: filters.cuisineType.filter(c => c !== cuisine)
                                                            });
                                                        }
                                                    }}
                                                    className="lunch-checkbox"
                                                />
                                                <span className="lunch-checkbox-text">{cuisine}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="lunch-filter-group">
                                    <h4 className="lunch-filter-title">Dietary Restrictions</h4>
                                    <div className="lunch-checkbox-group">
                                        {dietaryOptions.map(option => (
                                            <label key={option} className="lunch-checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={filters.dietaryRestrictions.includes(option)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setFilters({
                                                                ...filters,
                                                                dietaryRestrictions: [...filters.dietaryRestrictions, option]
                                                            });
                                                        } else {
                                                            setFilters({
                                                                ...filters,
                                                                dietaryRestrictions: filters.dietaryRestrictions.filter(r => r !== option)
                                                            });
                                                        }
                                                    }}
                                                    className="lunch-checkbox"
                                                />
                                                <span className="lunch-checkbox-text">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="lunch-filter-actions">
                                    <button
                                        className="lunch-filter-reset-btn"
                                        onClick={() => setFilters({
                                            maxCookingTime: 30,
                                            cuisineType: [],
                                            dietaryRestrictions: []
                                        })}
                                    >
                                        Reset Filters
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* Quick Lunch Ideas (Under 15 minutes) */}
            <section className="lunch-quick-section">
                <div className="lunch-section-header">
                    <h2 className="lunch-section-title">Quick Lunch Ideas (Under 15 mins)</h2>
                    <p className="lunch-section-description">
                        Perfect for busy weekdays when time is limited but you still want a delicious meal
                    </p>
                </div>

                {loading ? (
                    <LoadingSpinner />
                ) : (
                    <div className="lunch-quick-grid">
                        {quickRecipes.slice(0, 4).map((recipe, index) => (
                            <RecipeCard key={recipe._id || index} recipe={recipe} index={index} />
                        ))}
                    </div>
                )}

                {quickRecipes.length > 4 && (
                    <div className="lunch-view-more-container">
                        <button
                            className="lunch-view-more-btn"
                            onClick={() => navigate('/recipes/quick-lunch')}
                        >
                            View More Quick Lunch Ideas
                        </button>
                    </div>
                )}
            </section>

            {/* Quick Lunch Tips */}
            <section className="lunch-tips-section">
                <h2 className="lunch-section-title">Lunch Meal Prep Tips</h2>

                <div className="lunch-tips-grid">
                    <motion.div
                        className="lunch-tip-card"
                        whileHover={{ scale: 1.03 }}
                        transition={{ duration: 0.2 }}
                    >
                        <h3 className="lunch-tip-title">Batch Cooking</h3>
                        <p className="lunch-tip-text">
                            Dedicate 1-2 hours on weekends to prepare components for the week. Cook grains,
                            proteins, and roast vegetables that can be mixed and matched for varied lunches.
                        </p>
                    </motion.div>

                    <motion.div
                        className="lunch-tip-card"
                        whileHover={{ scale: 1.03 }}
                        transition={{ duration: 0.2 }}
                    >
                        <h3 className="lunch-tip-title">Smart Storage</h3>
                        <p className="lunch-tip-text">
                            Invest in quality containers that keep food fresh. Store dressings separately
                            and add just before eating to keep salads crisp and prevent sogginess.
                        </p>
                    </motion.div>

                    <motion.div
                        className="lunch-tip-card"
                        whileHover={{ scale: 1.03 }}
                        transition={{ duration: 0.2 }}
                    >
                        <h3 className="lunch-tip-title">Repurpose Leftovers</h3>
                        <p className="lunch-tip-text">
                            Transform dinner leftovers into exciting lunch options. Last night's roast chicken
                            can become today's wrap, salad topping, or sandwich filling.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Main Recipes Grid */}
            <section className="lunch-main-section">
                <div className="lunch-section-header">
                    <h2 className="lunch-section-title">All Lunch Recipes</h2>

                    {currentUser && (currentUser.userType === 'Admin' || currentUser.userType === 'Creator') && (
                        <button
                            className="lunch-add-recipe-btn"
                            onClick={() => setShowAddModal(true)}
                        >
                            <MdAdd /> Add New Recipe
                        </button>
                    )}
                </div>

                {loading ? (
                    <LoadingSpinner />
                ) : (
                    <>
                        {filteredRecipes.length > 0 ? (
                            <div className="lunch-recipes-grid">
                                {filteredRecipes.map((recipe, index) => (
                                    <RecipeCard key={recipe._id || index} recipe={recipe} index={index} />
                                ))}
                            </div>
                        ) : (
                            <div className="lunch-no-recipes">
                                <p>No recipes match your current filters. Try adjusting your search criteria.</p>
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* Popular Lunch Combinations */}
            <section className="lunch-popular-section">
                <h2 className="lunch-section-title">Popular Lunch Combinations</h2>
                <p className="lunch-section-description">
                    Perfectly balanced meal ideas loved by our community
                </p>

                <div className="lunch-popular-combinations">
                    <div className="lunch-combination-card">
                        <h3 className="lunch-combination-title">Protein-Packed Lunch</h3>
                        <ul className="lunch-combination-items">
                            <li>Grilled chicken breast or tofu</li>
                            <li>Quinoa or brown rice</li>
                            <li>Steamed broccoli or roasted vegetables</li>
                            <li>Avocado slices</li>
                            <li>Lemon tahini dressing</li>
                        </ul>
                    </div>

                    <div className="lunch-combination-card">
                        <h3 className="lunch-combination-title">Quick Mediterranean Bowl</h3>
                        <ul className="lunch-combination-items">
                            <li>Hummus or falafel</li>
                            <li>Cherry tomatoes and cucumber</li>
                            <li>Couscous or bulgur</li>
                            <li>Feta cheese (optional)</li>
                            <li>Olives and lemon olive oil dressing</li>
                        </ul>
                    </div>

                    <div className="lunch-combination-card">
                        <h3 className="lunch-combination-title">Asian-Inspired Lunch</h3>
                        <ul className="lunch-combination-items">
                            <li>Soba or rice noodles</li>
                            <li>Edamame or shredded chicken</li>
                            <li>Shredded carrots and cabbage</li>
                            <li>Sliced green onions</li>
                            <li>Sesame ginger dressing</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Add Recipe Modal */}
            {showAddModal && (
                <div className="lunch-modal-overlay">
                    <div className={`lunch-modal ${isDarkMode ? 'lunch-dark' : 'lunch-light'}`}>
                        <h2 className="lunch-modal-title">Add New Lunch Recipe</h2>

                        <div className="lunch-form-group">
                            <label className="lunch-form-label">Recipe Title</label>
                            <input
                                type="text"
                                className="lunch-form-input"
                                placeholder="Enter recipe title"
                                value={newRecipe.title}
                                onChange={(e) => setNewRecipe({ ...newRecipe, title: e.target.value })}
                            />
                        </div>

                        <div className="lunch-form-group">
                            <label className="lunch-form-label">Cooking Time (minutes)</label>
                            <input
                                type="text"
                                className="lunch-form-input"
                                placeholder="e.g., '15 mins'"
                                value={newRecipe.time}
                                onChange={(e) => setNewRecipe({ ...newRecipe, time: e.target.value })}
                            />
                        </div>

                        <div className="lunch-form-group">
                            <label className="lunch-form-label">Cuisine Type</label>
                            <select
                                className="lunch-form-select"
                                value={newRecipe.cuisineType}
                                onChange={(e) => setNewRecipe({ ...newRecipe, cuisineType: e.target.value })}
                            >
                                <option value="">Select cuisine</option>
                                {cuisineOptions.map((cuisine) => (
                                    <option key={cuisine} value={cuisine}>{cuisine}</option>
                                ))}
                            </select>
                        </div>

                        <div className="lunch-form-group">
                            <label className="lunch-form-label">Image URL</label>
                            <input
                                type="text"
                                className="lunch-form-input"
                                placeholder="Enter image URL"
                                value={newRecipe.image}
                                onChange={(e) => setNewRecipe({ ...newRecipe, image: e.target.value })}
                            />
                        </div>

                        <div className="lunch-form-group">
                            <label className="lunch-form-label">Calories</label>
                            <input
                                type="text"
                                className="lunch-form-input"
                                placeholder="e.g., '350 cal'"
                                value={newRecipe.calories}
                                onChange={(e) => setNewRecipe({ ...newRecipe, calories: e.target.value })}
                            />
                        </div>

                        <div className="lunch-form-group lunch-checkbox-container">
                            <label className="lunch-checkbox-label">
                                <input
                                    type="checkbox"
                                    className="lunch-checkbox-input"
                                    checked={newRecipe.isVegetarian}
                                    onChange={(e) => setNewRecipe({ ...newRecipe, isVegetarian: e.target.checked })}
                                />
                                <span className="lunch-checkbox-text">Vegetarian</span>
                            </label>
                        </div>

                        <div className="lunch-form-group">
                            <label className="lunch-form-label">Ingredients</label>
                            <div className="lunch-form-list-container">
                                <div className="lunch-form-list-input-group">
                                    <input
                                        type="text"
                                        className="lunch-form-input"
                                        placeholder="Add ingredient"
                                        value={ingredientInput}
                                        onChange={(e) => setIngredientInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient()}
                                    />
                                    <button
                                        type="button"
                                        className="lunch-form-add-btn"
                                        onClick={handleAddIngredient}
                                    >
                                        <MdAdd />
                                    </button>
                                </div>

                                <ul className="lunch-form-list">
                                    {newRecipe.ingredients.map((ingredient, idx) => (
                                        <li key={idx} className="lunch-form-list-item">
                                            <span>{ingredient}</span>
                                            <button
                                                type="button"
                                                className="lunch-form-remove-btn"
                                                onClick={() => setNewRecipe({
                                                    ...newRecipe,
                                                    ingredients: newRecipe.ingredients.filter((_, i) => i !== idx)
                                                })}
                                            >
                                                <MdDelete />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="lunch-form-group">
                            <label className="lunch-form-label">Preparation Steps</label>
                            <div className="lunch-form-list-container">
                                <div className="lunch-form-list-input-group">
                                    <input
                                        type="text"
                                        className="lunch-form-input"
                                        placeholder="Add step"
                                        value={stepInput}
                                        onChange={(e) => setStepInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddStep()}
                                    />
                                    <button
                                        type="button"
                                        className="lunch-form-add-btn"
                                        onClick={handleAddStep}
                                    >
                                        <MdAdd />
                                    </button>
                                </div>

                                <ul className="lunch-form-list">
                                    {newRecipe.steps.map((step, idx) => (
                                        <li key={idx} className="lunch-form-list-item">
                                            <span>{idx + 1}. {step}</span>
                                            <button
                                                type="button"
                                                className="lunch-form-remove-btn"
                                                onClick={() => setNewRecipe({
                                                    ...newRecipe,
                                                    steps: newRecipe.steps.filter((_, i) => i !== idx)
                                                })}
                                            >
                                                <MdDelete />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="lunch-modal-actions">
                            <button
                                type="button"
                                className="lunch-modal-cancel-btn"
                                onClick={() => setShowAddModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="lunch-modal-submit-btn"
                                onClick={handleAddRecipe}
                            >
                                Add Recipe
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Recipe Modal */}
            {editingRecipe && (
                <div className="lunch-modal-overlay">
                    <div className={`lunch-modal ${isDarkMode ? 'lunch-dark' : 'lunch-light'}`}>
                        <h2 className="lunch-modal-title">Edit Recipe</h2>

                        <div className="lunch-form-group">
                            <label className="lunch-form-label">Recipe Title</label>
                            <input
                                type="text"
                                className="lunch-form-input"
                                value={editingRecipe.title}
                                onChange={(e) => setEditingRecipe({ ...editingRecipe, title: e.target.value })}
                            />
                        </div>

                        <div className="lunch-form-group">
                            <label className="lunch-form-label">Cooking Time (minutes)</label>
                            <input
                                type="text"
                                className="lunch-form-input"
                                value={editingRecipe.time}
                                onChange={(e) => setEditingRecipe({ ...editingRecipe, time: e.target.value })}
                            />
                        </div>

                        <div className="lunch-form-group">
                            <label className="lunch-form-label">Cuisine Type</label>
                            <select
                                className="lunch-form-select"
                                value={editingRecipe.cuisineType}
                                onChange={(e) => setEditingRecipe({ ...editingRecipe, cuisineType: e.target.value })}
                            >
                                <option value="">Select cuisine</option>
                                {cuisineOptions.map((cuisine) => (
                                    <option key={cuisine} value={cuisine}>{cuisine}</option>
                                ))}
                            </select>
                        </div>

                        <div className="lunch-form-group">
                            <label className="lunch-form-label">Image URL</label>
                            <input
                                type="text"
                                className="lunch-form-input"
                                value={editingRecipe.image}
                                onChange={(e) => setEditingRecipe({ ...editingRecipe, image: e.target.value })}
                            />
                        </div>

                        <div className="lunch-form-group">
                            <label className="lunch-form-label">Calories</label>
                            <input
                                type="text"
                                className="lunch-form-input"
                                value={editingRecipe.calories}
                                onChange={(e) => setEditingRecipe({ ...editingRecipe, calories: e.target.value })}
                            />
                        </div>

                        <div className="lunch-form-group lunch-checkbox-container">
                            <label className="lunch-checkbox-label">
                                <input
                                    type="checkbox"
                                    className="lunch-checkbox-input"
                                    checked={editingRecipe.isVegetarian}
                                    onChange={(e) => setEditingRecipe({ ...editingRecipe, isVegetarian: e.target.checked })}
                                />
                                <span className="lunch-checkbox-text">Vegetarian</span>
                            </label>
                        </div>

                        <div className="lunch-form-group">
                            <label className="lunch-form-label">Ingredients</label>
                            <div className="lunch-form-list-container">
                                <div className="lunch-form-list-input-group">
                                    <input
                                        type="text"
                                        className="lunch-form-input"
                                        placeholder="Add ingredient"
                                        value={ingredientInput}
                                        onChange={(e) => setIngredientInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient()}
                                    />
                                    <button
                                        type="button"
                                        className="lunch-form-add-btn"
                                        onClick={handleAddIngredient}
                                    >
                                        <MdAdd />
                                    </button>
                                </div>

                                <ul className="lunch-form-list">
                                    {editingRecipe.ingredients.map((ingredient, idx) => (
                                        <li key={idx} className="lunch-form-list-item">
                                            <span>{ingredient}</span>
                                            <button
                                                type="button"
                                                className="lunch-form-remove-btn"
                                                onClick={() => setEditingRecipe({
                                                    ...editingRecipe,
                                                    ingredients: editingRecipe.ingredients.filter((_, i) => i !== idx)
                                                })}
                                            >
                                                <MdDelete />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="lunch-form-group">
                            <label className="lunch-form-label">Preparation Steps</label>
                            <div className="lunch-form-list-container">
                                <div className="lunch-form-list-input-group">
                                    <input
                                        type="text"
                                        className="lunch-form-input"
                                        placeholder="Add step"
                                        value={stepInput}
                                        onChange={(e) => setStepInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddStep()}
                                    />
                                    <button
                                        type="button"
                                        className="lunch-form-add-btn"
                                        onClick={handleAddStep}
                                    >
                                        <MdAdd />
                                    </button>
                                </div>

                                <ul className="lunch-form-list">
                                    {editingRecipe.steps.map((step, idx) => (
                                        <li key={idx} className="lunch-form-list-item">
                                            <span>{idx + 1}. {step}</span>
                                            <button
                                                type="button"
                                                className="lunch-form-remove-btn"
                                                onClick={() => setEditingRecipe({
                                                    ...editingRecipe,
                                                    steps: editingRecipe.steps.filter((_, i) => i !== idx)
                                                })}
                                            >
                                                <MdDelete />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="lunch-modal-actions">
                            <button
                                type="button"
                                className="lunch-modal-cancel-btn"
                                onClick={() => setEditingRecipe(null)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="lunch-modal-submit-btn"
                                onClick={handleEditRecipe}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Newsletter Subscription */}
            <section className="lunch-newsletter-section">
                <div className="lunch-newsletter-container">
                    <div className="lunch-newsletter-content">
                        <h2 className="lunch-newsletter-title">Get Weekly Lunch Ideas!</h2>
                        <p className="lunch-newsletter-text">
                            Subscribe to our newsletter and receive fresh lunch inspiration every week,
                            tailored to your preferences and dietary needs.
                        </p>

                        <form className="lunch-newsletter-form">
                            <input
                                type="email"
                                className="lunch-newsletter-input"
                                placeholder="Your email address"
                            />
                            <button type="submit" className="lunch-newsletter-btn">Subscribe</button>
                        </form>

                        <p className="lunch-newsletter-disclaimer">
                            We respect your privacy. Unsubscribe at any time.
                        </p>
                    </div>
                </div>
            </section>

            {/* Lunch Nutrition Facts Section */}
            <section className="lunch-nutrition-section">
                <h2 className="lunch-section-title">Lunch Nutrition Facts</h2>
                <p className="lunch-section-description">
                    Understanding the right balance for your midday meal
                </p>

                <div className="lunch-nutrition-cards">
                    <div className="lunch-nutrition-card">
                        <h3 className="lunch-nutrition-title">Ideal Calorie Range</h3>
                        <p className="lunch-nutrition-text">
                            A balanced lunch should typically provide 25-30% of your daily calorie needs.
                            For most adults, this means approximately 400-600 calories, depending on your
                            activity level, age, and overall health goals.
                        </p>
                    </div>

                    <div className="lunch-nutrition-card">
                        <h3 className="lunch-nutrition-title">Protein Requirements</h3>
                        <p className="lunch-nutrition-text">
                            Include 15-30g of protein in your lunch to maintain energy levels throughout
                            the afternoon and prevent the mid-day slump. Good sources include lean meats,
                            fish, tofu, legumes, eggs, and dairy products.
                        </p>
                    </div>

                    <div className="lunch-nutrition-card">
                        <h3 className="lunch-nutrition-title">Balanced Macronutrients</h3>
                        <p className="lunch-nutrition-text">
                            Aim for a lunch that contains:
                            <ul className="lunch-nutrition-list">
                                <li>40-50% complex carbohydrates (whole grains, vegetables)</li>
                                <li>20-30% lean proteins</li>
                                <li>20-30% healthy fats (avocado, olive oil, nuts)</li>
                            </ul>
                            This balance helps maintain stable blood sugar and sustained energy.
                        </p>
                    </div>
                </div>
            </section>

            {/* FAQs Section */}
            <section className="lunch-faq-section">
                <h2 className="lunch-section-title">Frequently Asked Questions</h2>

                <div className="lunch-faq-container">
                    <div className="lunch-faq-item">
                        <h3 className="lunch-faq-question">What makes an ideal quick lunch recipe?</h3>
                        <p className="lunch-faq-answer">
                            An ideal quick lunch recipe should be nutritionally balanced, take less than 20 minutes to prepare,
                            use minimal ingredients (ideally 5-10), and be customizable to dietary preferences. It should also
                            be easy to make ahead and store, making it perfect for busy weekdays.
                        </p>
                    </div>

                    <div className="lunch-faq-item">
                        <h3 className="lunch-faq-question">How can I meal prep lunches for the entire week?</h3>
                        <p className="lunch-faq-answer">
                            Start by planning your menu and shopping for all ingredients on the weekend. Dedicate 2-3 hours to
                            batch cook staples like grains, proteins, and roasted vegetables. Store components separately in
                            airtight containers. Assemble meals the night before or prepare 2-3 complete meals at once, keeping
                            dressings separate until serving time.
                        </p>
                    </div>

                    <div className="lunch-faq-item">
                        <h3 className="lunch-faq-question">What are good lunch options for weight management?</h3>
                        <p className="lunch-faq-answer">
                            Focus on high-protein, high-fiber meals with moderate healthy fats. Good options include salads with
                            lean protein, grain bowls with plenty of vegetables, protein wraps with whole grain tortillas, or
                            hearty vegetable soups with beans or lentils. Aim for meals between 400-500 calories with at least
                            20g of protein and 8-10g of fiber.
                        </p>
                    </div>

                    <div className="lunch-faq-item">
                        <h3 className="lunch-faq-question">How can I keep my lunch fresh until midday?</h3>
                        <p className="lunch-faq-answer">
                            Invest in quality insulated lunch containers or bags with ice packs for perishable items. Use airtight
                            containers to preserve freshness. Keep wet and dry ingredients separate until eating time. For salads,
                            layer ingredients with dressing at the bottom and greens at the top, or use separate containers for dressing.
                        </p>
                    </div>

                    <div className="lunch-faq-item">
                        <h3 className="lunch-faq-question">What are nutritious lunch options for kids?</h3>
                        <p className="lunch-faq-answer">
                            Focus on balanced meals with protein, whole grains, fruits, and vegetables. Try bento box lunches with
                            variety, whole grain wraps or pita pockets with hummus and vegetables, pasta salads with hidden veggies,
                            or homemade lunchables with whole grain crackers, cheese, and fruit. Make food appealing with different
                            colors and fun shapes.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer with Related Links */}
            <section className="lunch-related-links-section">
                <h2 className="lunch-section-title">Explore More Recipe Categories</h2>

                <div className="lunch-related-links">
                    <a href="/recipes/breakfast" className="lunch-related-link">Breakfast Ideas</a>
                    <a href="/recipes/dinner" className="lunch-related-link">Dinner Recipes</a>
                    <a href="/recipes/snacks" className="lunch-related-link">Healthy Snacks</a>
                    <a href="/recipes/desserts" className="lunch-related-link">Desserts</a>
                    <a href="/recipes/vegetarian" className="lunch-related-link">Vegetarian Meals</a>
                    <a href="/recipes/meal-prep" className="lunch-related-link">Meal Prep Guides</a>
                </div>
            </section>
        </div>
    );
};

export default LunchRecipes;