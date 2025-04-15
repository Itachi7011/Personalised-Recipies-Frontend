import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaRegHeart, FaBookmark, FaRegBookmark, FaClock, FaUtensils, FaSearch, FaPlus, FaFilter } from 'react-icons/fa';
import { IoMdAddCircleOutline } from 'react-icons/io';
import { RiDeleteBinLine, RiEditLine } from 'react-icons/ri';
import { BiTimeFive } from 'react-icons/bi';
import { MdOutlineInventory2 } from 'react-icons/md';
import Swal from 'sweetalert2';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

const DinnerRecipes = () => {
    const { isDarkMode } = useContext(ThemeContext);
    const [recipes, setRecipes] = useState([]);
    const [quickDinnerRecipes, setQuickDinnerRecipes] = useState([]);
    const [savedRecipes, setSavedRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('popularity');
    const [filterOptions, setFilterOptions] = useState({
        maxTime: 45, // Default maximum cooking time for dinner
        cuisineType: [],
        dietaryRestrictions: []
    });
    const [showFilters, setShowFilters] = useState(false);
    const [inventory, setInventory] = useState([]);
    const [cuisines, setCuisines] = useState([
        { id: 'italian', name: 'Italian', selected: false },
        { id: 'mexican', name: 'Mexican', selected: false },
        { id: 'indian', name: 'Indian', selected: false },
        { id: 'chinese', name: 'Chinese', selected: false },
        { id: 'american', name: 'American', selected: false },
        { id: 'thai', name: 'Thai', selected: false },
        { id: 'mediterranean', name: 'Mediterranean', selected: false },
        { id: 'french', name: 'French', selected: false }
    ]);
    const [dietaryOptions, setDietaryOptions] = useState([
        { id: 'vegetarian', name: 'Vegetarian', selected: false },
        { id: 'vegan', name: 'Vegan', selected: false },
        { id: 'gluten-free', name: 'Gluten-Free', selected: false },
        { id: 'dairy-free', name: 'Dairy-Free', selected: false },
        { id: 'keto', name: 'Keto', selected: false }
    ]);
    const [showAddRecipeModal, setShowAddRecipeModal] = useState(false);
    const [newRecipe, setNewRecipe] = useState({
        title: '',
        ingredients: [''],
        steps: [''],
        time: 30,
        image: '',
        isVegetarian: false,
        cuisineType: '',
        mealType: 'dinner'
    });
    const [editingRecipe, setEditingRecipe] = useState(null);
    const [showInventoryModal, setShowInventoryModal] = useState(false);
    const [newIngredient, setNewIngredient] = useState({
        name: '',
        category: 'other',
        quantity: 1,
        unit: 'piece'
    });

    // Fetch recipes based on current filters
    useEffect(() => {
        fetchRecipes();
        fetchSavedRecipes();
        fetchUserInventory();
    }, [filterOptions, sortBy, searchQuery]);

    // Fetch quick dinner suggestions based on inventory
    useEffect(() => {
        if (inventory.length > 0) {
            fetchQuickDinnerSuggestions();
        }
    }, [inventory]);

    const fetchRecipes = async () => {
        setLoading(true);
        try {
            // Construct query parameters based on filters
            const selectedCuisines = cuisines
                .filter(c => c.selected)
                .map(c => c.id)
                .join(',');

            const selectedDiets = dietaryOptions
                .filter(d => d.selected)
                .map(d => d.id)
                .join(',');

            const response = await axios.get('/api/recipes/dinner', {
                params: {
                    search: searchQuery,
                    maxTime: filterOptions.maxTime,
                    cuisines: selectedCuisines,
                    diet: selectedDiets,
                    sortBy: sortBy
                }
            });

            if (response.data && response.data.recipes) {
                setRecipes(response.data.recipes);
            }
        } catch (error) {
            console.error('Error fetching dinner recipes:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to load dinner recipes. Please try again later.',
                icon: 'error',
                confirmButtonText: 'OK',
                customClass: {
                    popup: `swal-popup ${isDarkMode ? 'dark-mode' : 'light-mode'}`
                }
            });

            // Load mocked data for demo purposes
            setRecipes(getMockedRecipes());
        } finally {
            setLoading(false);
        }
    };

    const fetchQuickDinnerSuggestions = async () => {
        try {
            // Get ingredients from inventory
            const ingredientsFromInventory = inventory.map(item => item.name).join(',');

            const response = await axios.get('/api/recipes/quick-dinner-suggestions', {
                params: {
                    ingredients: ingredientsFromInventory,
                    maxTime: 30, // Quick dinner should be 30 minutes or less
                }
            });

            if (response.data && response.data.recipes) {
                setQuickDinnerRecipes(response.data.recipes);
            }
        } catch (error) {
            console.error('Error fetching quick dinner suggestions:', error);
            // Set mock data for demo
            setQuickDinnerRecipes(getMockedQuickRecipes());
        }
    };

    const fetchSavedRecipes = async () => {
        try {
            const response = await axios.get('/api/users/saved-recipes?type=dinner');
            if (response.data && response.data.savedRecipes) {
                setSavedRecipes(response.data.savedRecipes);
            }
        } catch (error) {
            console.error('Error fetching saved recipes:', error);
            // Mock data for demo
            setSavedRecipes([]);
        }
    };

    const fetchUserInventory = async () => {
        try {
            const response = await axios.get('/api/users/inventory');
            if (response.data && response.data.inventory) {
                setInventory(response.data.inventory);
            }
        } catch (error) {
            console.error('Error fetching user inventory:', error);
            // Mock inventory data
            setInventory(getMockedInventory());
        }
    };

    const handleSaveRecipe = async (recipe) => {
        try {
            // Check if recipe is already saved
            const isAlreadySaved = savedRecipes.some(
                savedRecipe => savedRecipe.recipeId === recipe.id
            );

            if (isAlreadySaved) {
                // Unsave the recipe
                await axios.delete(`/api/users/saved-recipes/${recipe.id}`);
                setSavedRecipes(savedRecipes.filter(
                    savedRecipe => savedRecipe.recipeId !== recipe.id
                ));
                Swal.fire({
                    title: 'Removed!',
                    text: `${recipe.title} removed from your saved recipes.`,
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    customClass: {
                        popup: `swal-popup ${isDarkMode ? 'dark-mode' : 'light-mode'}`
                    }
                });
            } else {
                // Save the recipe
                const recipeToSave = {
                    recipeId: recipe.id,
                    title: recipe.title,
                    sourceUrl: recipe.sourceUrl || '',
                    image: recipe.image || ''
                };

                await axios.post('/api/users/saved-recipes', recipeToSave);
                setSavedRecipes([...savedRecipes, recipeToSave]);
                Swal.fire({
                    title: 'Saved!',
                    text: `${recipe.title} added to your saved recipes.`,
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    customClass: {
                        popup: `swal-popup ${isDarkMode ? 'dark-mode' : 'light-mode'}`
                    }
                });
            }
        } catch (error) {
            console.error('Error saving/unsaving recipe:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update saved recipes. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK',
                customClass: {
                    popup: `swal-popup ${isDarkMode ? 'dark-mode' : 'light-mode'}`
                }
            });
        }
    };

    const handleLikeRecipe = async (recipe) => {
        try {
            // Check if recipe is already liked
            const isAlreadyLiked = savedRecipes.some(
                savedRecipe => savedRecipe.recipeId === recipe.id && savedRecipe.liked
            );

            if (isAlreadyLiked) {
                // Unlike the recipe
                await axios.delete(`/api/users/liked-recipes/${recipe.id}`);
                setSavedRecipes(savedRecipes.map(
                    savedRecipe => savedRecipe.recipeId === recipe.id
                        ? { ...savedRecipe, liked: false }
                        : savedRecipe
                ));
            } else {
                // Like the recipe
                await axios.post('/api/users/liked-recipes', {
                    recipeId: recipe.id,
                    title: recipe.title,
                    sourceUrl: recipe.sourceUrl || '',
                    image: recipe.image || ''
                });

                // Update saved recipes if it exists, otherwise it doesn't matter for the UI
                setSavedRecipes(savedRecipes.map(
                    savedRecipe => savedRecipe.recipeId === recipe.id
                        ? { ...savedRecipe, liked: true }
                        : savedRecipe
                ));
            }
        } catch (error) {
            console.error('Error liking/unliking recipe:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update liked recipes. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK',
                customClass: {
                    popup: `swal-popup ${isDarkMode ? 'dark-mode' : 'light-mode'}`
                }
            });
        }
    };

    const handleAddRecipe = async () => {
        // Validate form
        if (!newRecipe.title.trim() || newRecipe.ingredients.some(ing => !ing.trim()) ||
            newRecipe.steps.some(step => !step.trim()) || !newRecipe.time) {
            Swal.fire({
                title: 'Missing Information',
                text: 'Please fill in all required fields',
                icon: 'warning',
                confirmButtonText: 'OK',
                customClass: {
                    popup: `swal-popup ${isDarkMode ? 'dark-mode' : 'light-mode'}`
                }
            });
            return;
        }

        try {
            // If editing
            if (editingRecipe) {
                await axios.put(`/api/recipes/${editingRecipe.id}`, newRecipe);
                setRecipes(recipes.map(recipe =>
                    recipe.id === editingRecipe.id ? { ...newRecipe, id: editingRecipe.id } : recipe
                ));
                Swal.fire({
                    title: 'Updated!',
                    text: 'Your recipe has been updated successfully.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    customClass: {
                        popup: `swal-popup ${isDarkMode ? 'dark-mode' : 'light-mode'}`
                    }
                });
            } else {
                // If adding new
                const response = await axios.post('/api/recipes', { ...newRecipe, mealType: 'dinner' });
                setRecipes([...recipes, response.data.recipe]);
                Swal.fire({
                    title: 'Added!',
                    text: 'Your new dinner recipe has been added successfully.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    customClass: {
                        popup: `swal-popup ${isDarkMode ? 'dark-mode' : 'light-mode'}`
                    }
                });
            }

            // Reset form and close modal
            setNewRecipe({
                title: '',
                ingredients: [''],
                steps: [''],
                time: 30,
                image: '',
                isVegetarian: false,
                cuisineType: '',
                mealType: 'dinner'
            });
            setEditingRecipe(null);
            setShowAddRecipeModal(false);
        } catch (error) {
            console.error('Error adding/updating recipe:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to save your recipe. Please try again later.',
                icon: 'error',
                confirmButtonText: 'OK',
                customClass: {
                    popup: `swal-popup ${isDarkMode ? 'dark-mode' : 'light-mode'}`
                }
            });
        }
    };

    const handleEditRecipe = (recipe) => {
        setEditingRecipe(recipe);
        setNewRecipe({
            title: recipe.title,
            ingredients: recipe.ingredients || [''],
            steps: recipe.steps || [''],
            time: recipe.time || 30,
            image: recipe.image || '',
            isVegetarian: recipe.isVegetarian || false,
            cuisineType: recipe.cuisineType || '',
            mealType: 'dinner'
        });
        setShowAddRecipeModal(true);
    };

    const handleDeleteRecipe = async (recipeId) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            customClass: {
                popup: `swal-popup ${isDarkMode ? 'dark-mode' : 'light-mode'}`
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`/api/recipes/${recipeId}`);
                    setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
                    Swal.fire({
                        title: 'Deleted!',
                        text: 'Your recipe has been deleted.',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false,
                        customClass: {
                            popup: `swal-popup ${isDarkMode ? 'dark-mode' : 'light-mode'}`
                        }
                    });
                } catch (error) {
                    console.error('Error deleting recipe:', error);
                    Swal.fire({
                        title: 'Error!',
                        text: 'Failed to delete the recipe. Please try again.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                        customClass: {
                            popup: `swal-popup ${isDarkMode ? 'dark-mode' : 'light-mode'}`
                        }
                    });
                }
            }
        });
    };

    const handleAddIngredient = async () => {
        if (!newIngredient.name.trim()) {
            Swal.fire({
                title: 'Missing Information',
                text: 'Please enter ingredient name',
                icon: 'warning',
                confirmButtonText: 'OK',
                customClass: {
                    popup: `swal-popup ${isDarkMode ? 'dark-mode' : 'light-mode'}`
                }
            });
            return;
        }

        try {
            const response = await axios.post('/api/users/inventory', newIngredient);
            setInventory([...inventory, response.data.ingredient]);
            setNewIngredient({
                name: '',
                category: 'other',
                quantity: 1,
                unit: 'piece'
            });
            Swal.fire({
                title: 'Added!',
                text: `${newIngredient.name} added to your inventory.`,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                customClass: {
                    popup: `swal-popup ${isDarkMode ? 'dark-mode' : 'light-mode'}`
                }
            });
        } catch (error) {
            console.error('Error adding ingredient to inventory:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to add ingredient to inventory. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK',
                customClass: {
                    popup: `swal-popup ${isDarkMode ? 'dark-mode' : 'light-mode'}`
                }
            });
        }
    };

    const handleDeleteInventoryItem = async (itemId) => {
        try {
            await axios.delete(`/api/users/inventory/${itemId}`);
            setInventory(inventory.filter(item => item._id !== itemId));
            Swal.fire({
                title: 'Removed!',
                text: 'Item removed from your inventory.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                customClass: {
                    popup: `swal-popup ${isDarkMode ? 'dark-mode' : 'light-mode'}`
                }
            });
        } catch (error) {
            console.error('Error removing inventory item:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to remove item from inventory. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK',
                customClass: {
                    popup: `swal-popup ${isDarkMode ? 'dark-mode' : 'light-mode'}`
                }
            });
        }
    };

    const handleAddIngredientField = () => {
        setNewRecipe({ ...newRecipe, ingredients: [...newRecipe.ingredients, ''] });
    };

    const handleAddStepField = () => {
        setNewRecipe({ ...newRecipe, steps: [...newRecipe.steps, ''] });
    };

    const handleIngredientChange = (index, value) => {
        const updatedIngredients = [...newRecipe.ingredients];
        updatedIngredients[index] = value;
        setNewRecipe({ ...newRecipe, ingredients: updatedIngredients });
    };

    const handleStepChange = (index, value) => {
        const updatedSteps = [...newRecipe.steps];
        updatedSteps[index] = value;
        setNewRecipe({ ...newRecipe, steps: updatedSteps });
    };

    const toggleCuisineFilter = (cuisineId) => {
        setCuisines(
            cuisines.map(cuisine =>
                cuisine.id === cuisineId
                    ? { ...cuisine, selected: !cuisine.selected }
                    : cuisine
            )
        );
    };

    const toggleDietaryFilter = (dietId) => {
        setDietaryOptions(
            dietaryOptions.map(diet =>
                diet.id === dietId
                    ? { ...diet, selected: !diet.selected }
                    : diet
            )
        );
    };

    // Mock data function for demo purposes
    const getMockedRecipes = () => {
        return [
            {
                id: '1',
                title: 'Quick Garlic Butter Pasta',
                ingredients: [
                    '8 oz pasta',
                    '4 tbsp butter',
                    '4 cloves garlic, minced',
                    '1/4 cup grated parmesan',
                    'Salt and pepper to taste',
                    'Fresh parsley, chopped'
                ],
                steps: [
                    'Cook pasta according to package directions.',
                    'In a large skillet, melt butter over medium heat.',
                    'Add minced garlic and sauté until fragrant, about 1 minute.',
                    'Drain pasta and add to the skillet with garlic butter.',
                    'Toss to coat, add parmesan, salt, and pepper.',
                    'Garnish with fresh parsley before serving.'
                ],
                time: 20,
                image: '/api/placeholder/400/300',
                isVegetarian: true,
                cuisineType: 'italian',
                mealType: 'dinner'
            },
            {
                id: '2',
                title: '30-Minute Chicken Stir Fry',
                ingredients: [
                    '1 lb boneless chicken breast, sliced',
                    '2 cups mixed vegetables (bell peppers, broccoli, carrots)',
                    '3 tbsp soy sauce',
                    '1 tbsp honey',
                    '2 cloves garlic, minced',
                    '1 tbsp ginger, grated',
                    '2 tbsp oil'
                ],
                steps: [
                    'Heat oil in a wok or large skillet over high heat.',
                    'Add chicken and stir fry until no longer pink, about 5-6 minutes.',
                    'Remove chicken and set aside.',
                    'Add vegetables to the same pan and stir fry for 3-4 minutes.',
                    'Mix soy sauce, honey, garlic, and ginger in a small bowl.',
                    'Return chicken to the pan, add sauce, and toss to combine.',
                    'Cook for 2 more minutes until sauce thickens.',
                    'Serve hot with rice or noodles.'
                ],
                time: 30,
                image: '/api/placeholder/400/300',
                isVegetarian: false,
                cuisineType: 'asian',
                mealType: 'dinner'
            },
            {
                id: '3',
                title: 'Mediterranean Salad Bowl',
                ingredients: [
                    '1 cup quinoa, cooked',
                    '1 cucumber, diced',
                    '1 cup cherry tomatoes, halved',
                    '1/2 red onion, thinly sliced',
                    '1/2 cup kalamata olives',
                    '1/2 cup feta cheese, crumbled',
                    '1/4 cup olive oil',
                    '2 tbsp lemon juice',
                    '1 tsp dried oregano',
                    'Salt and pepper to taste'
                ],
                steps: [
                    'In a large bowl, combine cooked quinoa, cucumber, tomatoes, red onion, and olives.',
                    'In a small bowl, whisk together olive oil, lemon juice, oregano, salt, and pepper.',
                    'Pour dressing over the salad and toss to combine.',
                    'Top with crumbled feta cheese.',
                    'Serve immediately or refrigerate for up to 2 days.'
                ],
                time: 15,
                image: '/api/placeholder/400/300',
                isVegetarian: true,
                cuisineType: 'mediterranean',
                mealType: 'dinner'
            }
        ];
    };

    const getMockedQuickRecipes = () => {
        return [
            {
                id: '4',
                title: '15-Min Caprese Pasta',
                ingredients: [
                    '8 oz pasta',
                    '1 cup cherry tomatoes, halved',
                    '8 oz fresh mozzarella, diced',
                    '1/4 cup fresh basil, chopped',
                    '2 tbsp olive oil',
                    'Balsamic glaze'
                ],
                steps: [
                    'Cook pasta according to package instructions.',
                    'Drain and toss with olive oil.',
                    'Mix in tomatoes and mozzarella while pasta is still warm.',
                    'Garnish with fresh basil and drizzle with balsamic glaze before serving.'
                ],
                time: 15,
                image: '/api/placeholder/400/300',
                isVegetarian: true,
                cuisineType: 'italian',
                mealType: 'dinner'
            },
            {
                id: '5',
                title: '10-Min Egg Fried Rice',
                ingredients: [
                    '2 cups cooked rice (preferably day-old)',
                    '2 eggs, beaten',
                    '1/2 cup frozen peas and carrots',
                    '2 green onions, chopped',
                    '2 tbsp soy sauce',
                    '1 tbsp sesame oil'
                ],
                steps: [
                    'Heat sesame oil in a large skillet or wok over medium-high heat.',
                    'Add beaten eggs and scramble until just set.',
                    'Add rice and break up any clumps.',
                    'Stir in frozen vegetables and green onions.',
                    'Add soy sauce and stir-fry for 2-3 minutes until heated through.'
                ],
                time: 10,
                image: '/api/placeholder/400/300',
                isVegetarian: true,
                cuisineType: 'asian',
                mealType: 'dinner'
            }
        ];
    };

    const getMockedInventory = () => {
        return [
            {
                _id: 'inv1',
                name: 'Pasta',
                category: 'grain',
                quantity: 2,
                unit: 'lb'
            },
            {
                _id: 'inv2',
                name: 'Tomatoes',
                category: 'vegetable',
                quantity: 5,
                unit: 'piece'
            },
            {
                _id: 'inv3',
                name: 'Chicken Breast',
                category: 'meat',
                quantity: 1,
                unit: 'lb'
            },
            {
                _id: 'inv4',
                name: 'Rice',
                category: 'grain',
                quantity: 3,
                unit: 'lb'
            },
            {
                _id: 'inv5',
                name: 'Eggs',
                category: 'dairy',
                quantity: 12,
                unit: 'piece'
            }
        ];
    };

    const isRecipeSaved = (recipeId) => {
        return savedRecipes.some(recipe => recipe.recipeId === recipeId);
    };

    const isRecipeLiked = (recipeId) => {
        return savedRecipes.some(recipe => recipe.recipeId === recipeId && recipe.liked);
    };

    // Calculate recipes that can be made with current inventory
    const getRecipesMatchingInventory = () => {
        const ingredientsInInventory = inventory.map(item => item.name.toLowerCase());

        return recipes.filter(recipe => {
            const recipeIngredients = recipe.ingredients.map(ing => {
                // Extract ingredient name from formatted string (e.g., "1 lb chicken" -> "chicken")
                const parts = typeof ing === 'string' ? ing.split(' ') : [];
                // Take the last part as the ingredient name
                return parts.length > 0 ? parts[parts.length - 1].toLowerCase() : '';
            });

            // Recipe matches if at least 70% of ingredients are in inventory
            const matchingIngredients = recipeIngredients.filter(ing =>
                ingredientsInInventory.some(invIng => invIng.includes(ing) || ing.includes(invIng))
            );

            return matchingIngredients.length >= recipeIngredients.length * 0.7;
        });
    };

    const matchingRecipes = getRecipesMatchingInventory();

    return (
        <div className={`dinner-recipes-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
            <motion.div
                className="dinner-recipes-hero"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="dinner-recipes-hero-content">
                    <h1 className="dinner-recipes-title">Quick & Easy Dinner Recipes</h1>
                    <p className="dinner-recipes-subtitle">Delicious dinners ready in under 45 minutes, perfect for busy weeknights</p>

                    <div className="dinner-recipes-search-bar">
                        <FaSearch className="dinner-recipes-search-icon" />
                        <input
                            type="text"
                            className="dinner-recipes-search-input"
                            placeholder="Search for dinner recipes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button
                            className="dinner-recipes-filter-button"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <FaFilter /> Filters
                        </button>
                    </div>

                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                className="dinner-recipes-filters"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="dinner-recipes-filter-section">
                                    <h3>Max Cooking Time</h3>
                                    <div className="dinner-recipes-time-slider">
                                        <input
                                            type="range"
                                            min="5"
                                            max="60"
                                            step="5"
                                            value={filterOptions.maxTime}
                                            onChange={(e) => setFilterOptions({ ...filterOptions, maxTime: parseInt(e.target.value) })}
                                            className="dinner-recipes-slider"
                                        />
                                        <span>{filterOptions.maxTime} minutes or less</span>
                                    </div>
                                </div>

                                <div className="dinner-recipes-filter-section">
                                    <h3>Cuisine Type</h3>
                                    <div className="dinner-recipes-filter-chips">
                                        {cuisines.map(cuisine => (
                                            <div
                                                key={cuisine.id}
                                                className={`dinner-recipes-filter-chip ${cuisine.selected ? 'selected' : ''}`}
                                                onClick={() => toggleCuisineFilter(cuisine.id)}
                                            >
                                                {cuisine.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="dinner-recipes-filter-section">
                                    <h3>Dietary Restrictions</h3>
                                    <div className="dinner-recipes-filter-chips">
                                        {dietaryOptions.map(diet => (
                                            <div
                                                key={diet.id}
                                                className={`dinner-recipes-filter-chip ${diet.selected ? 'selected' : ''}`}
                                                onClick={() => toggleDietaryFilter(diet.id)}
                                            >
                                                {diet.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="dinner-recipes-filter-section">
                                    <h3>Sort By</h3>
                                    <select
                                        className="dinner-recipes-sort-select"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <option value="popularity">Most Popular</option>
                                        <option value="time_asc">Quickest First</option>
                                        <option value="time_desc">Longest First</option>
                                        <option value="newest">Newest First</option>
                                    </select>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            <div className="dinner-recipes-actions">
                <button
                    className="dinner-recipes-add-button"
                    onClick={() => {
                        setEditingRecipe(null);
                        setNewRecipe({
                            title: '',
                            ingredients: [''],
                            steps: [''],
                            time: 30,
                            image: '',
                            isVegetarian: false,
                            cuisineType: '',
                            mealType: 'dinner'
                        });
                        setShowAddRecipeModal(true);
                    }}
                >
                    <IoMdAddCircleOutline /> Add New Recipe
                </button>

                <button
                    className="dinner-recipes-inventory-button"
                    onClick={() => setShowInventoryModal(true)}
                >
                    <MdOutlineInventory2 /> Manage Inventory
                </button>
            </div>

            {inventory.length > 0 && (
                <motion.div
                    className="dinner-recipes-match-section"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 className="dinner-recipes-section-title">
                        <span className="dinner-recipes-highlight">Cook Now</span> - Recipes Using Your Ingredients
                    </h2>
                    <p className="dinner-recipes-section-description">
                        We found {matchingRecipes.length} dinner recipes you can make with ingredients you have on hand.
                    </p>

                    <div className="dinner-recipes-matching-container">
                        <Swiper
                            modules={[Navigation, Pagination, Autoplay]}
                            spaceBetween={20}
                            slidesPerView={1}
                            navigation
                            pagination={{ clickable: true }}
                            autoplay={{ delay: 5000, disableOnInteraction: false }}
                            breakpoints={{
                                640: {
                                    slidesPerView: 2,
                                },
                                1024: {
                                    slidesPerView: 3,
                                }
                            }}
                            className="dinner-recipes-matching-swiper"
                        >
                            {matchingRecipes.length > 0 ? (
                                matchingRecipes.map(recipe => (
                                    <SwiperSlide key={recipe.id}>
                                        <div className="dinner-recipes-card dinner-recipes-match-card">
                                            <div className="dinner-recipes-card-badge">
                                                <MdOutlineInventory2 /> Ready to Cook
                                            </div>
                                            <div className="dinner-recipes-card-image">
                                                <img src={recipe.image || '/api/placeholder/400/300'} alt={recipe.title} />
                                            </div>
                                            <div className="dinner-recipes-card-content">
                                                <h3 className="dinner-recipes-card-title">{recipe.title}</h3>
                                                <div className="dinner-recipes-card-meta">
                                                    <span className="dinner-recipes-card-time">
                                                        <BiTimeFive /> {recipe.time} mins
                                                    </span>
                                                    {recipe.isVegetarian && (
                                                        <span className="dinner-recipes-card-veg">Vegetarian</span>
                                                    )}
                                                </div>
                                                <p className="dinner-recipes-card-description">
                                                    Quick dinner using {recipe.ingredients.length} ingredients you already have!
                                                </p>
                                            </div>
                                            <div className="dinner-recipes-card-actions">
                                                <button
                                                    className="dinner-recipes-card-action-button"
                                                    data-tooltip-id={`like-${recipe.id}`}
                                                    data-tooltip-content={isRecipeLiked(recipe.id) ? "Unlike" : "Like"}
                                                    onClick={() => handleLikeRecipe(recipe)}
                                                >
                                                    {isRecipeLiked(recipe.id) ? <FaHeart className="dinner-recipes-heart-filled" /> : <FaRegHeart />}
                                                </button>
                                                <Tooltip id={`like-${recipe.id}`} />

                                                <button
                                                    className="dinner-recipes-card-action-button"
                                                    data-tooltip-id={`save-${recipe.id}`}
                                                    data-tooltip-content={isRecipeSaved(recipe.id) ? "Unsave" : "Save"}
                                                    onClick={() => handleSaveRecipe(recipe)}
                                                >
                                                    {isRecipeSaved(recipe.id) ? <FaBookmark className="dinner-recipes-bookmark-filled" /> : <FaRegBookmark />}
                                                </button>
                                                <Tooltip id={`save-${recipe.id}`} />
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                ))
                            ) : (
                                <SwiperSlide>
                                    <div className="dinner-recipes-empty-state">
                                        <p>No matching recipes found. Try adding more ingredients to your inventory.</p>
                                    </div>
                                </SwiperSlide>
                            )}
                        </Swiper>
                    </div>
                </motion.div>
            )}

            <motion.div
                className="dinner-recipes-quick-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <h2 className="dinner-recipes-section-title">
                    <span className="dinner-recipes-highlight">Quick Dinner</span> - Ready in 30 Minutes or Less
                </h2>
                <p className="dinner-recipes-section-description">
                    Perfect for busy weeknights when you need a delicious meal on the table fast.
                </p>

                <div className="dinner-recipes-quick-container">
                    {quickDinnerRecipes.length > 0 ? (
                        quickDinnerRecipes.map(recipe => (
                            <motion.div
                                key={recipe.id}
                                className="dinner-recipes-card dinner-recipes-quick-card"
                                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                            >
                                <div className="dinner-recipes-card-image">
                                    <img src={recipe.image || '/api/placeholder/400/300'} alt={recipe.title} />
                                    <div className="dinner-recipes-card-time-badge">
                                        <BiTimeFive /> {recipe.time} min
                                    </div>
                                </div>
                                <div className="dinner-recipes-card-content">
                                    <h3 className="dinner-recipes-card-title">{recipe.title}</h3>
                                    <p className="dinner-recipes-card-ingredients">
                                        {recipe.ingredients.slice(0, 3).join(", ")}
                                        {recipe.ingredients.length > 3 ? " & more..." : ""}
                                    </p>
                                </div>
                                <div className="dinner-recipes-card-actions">
                                    <button
                                        className="dinner-recipes-card-action-button"
                                        data-tooltip-id={`quick-like-${recipe.id}`}
                                        data-tooltip-content={isRecipeLiked(recipe.id) ? "Unlike" : "Like"}
                                        onClick={() => handleLikeRecipe(recipe)}
                                    >
                                        {isRecipeLiked(recipe.id) ? <FaHeart className="dinner-recipes-heart-filled" /> : <FaRegHeart />}
                                    </button>
                                    <Tooltip id={`quick-like-${recipe.id}`} />

                                    <button
                                        className="dinner-recipes-card-action-button"
                                        data-tooltip-id={`quick-save-${recipe.id}`}
                                        data-tooltip-content={isRecipeSaved(recipe.id) ? "Unsave" : "Save"}
                                        onClick={() => handleSaveRecipe(recipe)}
                                    >
                                        {isRecipeSaved(recipe.id) ? <FaBookmark className="dinner-recipes-bookmark-filled" /> : <FaRegBookmark />}
                                    </button>
                                    <Tooltip id={`quick-save-${recipe.id}`} />
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="dinner-recipes-empty-state">
                            <p>No quick recipes found. Please try a different search.</p>
                        </div>
                    )}
                </div>
            </motion.div>

            <motion.div
                className="dinner-recipes-all-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                <h2 className="dinner-recipes-section-title">
                    <span className="dinner-recipes-highlight">All Dinner</span> Recipes
                </h2>
                <p className="dinner-recipes-section-description">
                    Browse our collection of delicious dinner recipes for any occasion.
                </p>

                {loading ? (
                    <div className="dinner-recipes-loading">
                        <div className="dinner-recipes-spinner"></div>
                        <p>Loading dinner recipes...</p>
                    </div>
                ) : (
                    <div className="dinner-recipes-grid">
                        {recipes.length > 0 ? (
                            recipes.map(recipe => (
                                <motion.div
                                    key={recipe.id}
                                    className="dinner-recipes-card"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                    whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.2)', transition: { duration: 0.2 } }}
                                >
                                    <div className="dinner-recipes-card-image">
                                        <img src={recipe.image || '/api/placeholder/400/300'} alt={recipe.title} />
                                        <div className="dinner-recipes-card-time-badge">
                                            <BiTimeFive /> {recipe.time} min
                                        </div>
                                    </div>
                                    <div className="dinner-recipes-card-content">
                                        <h3 className="dinner-recipes-card-title">{recipe.title}</h3>
                                        <div className="dinner-recipes-card-meta">
                                            {recipe.cuisineType && (
                                                <span className="dinner-recipes-card-cuisine">{recipe.cuisineType}</span>
                                            )}
                                            {recipe.isVegetarian && (
                                                <span className="dinner-recipes-card-veg">Vegetarian</span>
                                            )}
                                        </div>
                                        <p className="dinner-recipes-card-description">
                                            {recipe.ingredients.length} ingredients • {recipe.steps.length} steps
                                        </p>
                                    </div>
                                    <div className="dinner-recipes-card-actions">
                                        <button
                                            className="dinner-recipes-card-action-button"
                                            data-tooltip-id={`all-like-${recipe.id}`}
                                            data-tooltip-content={isRecipeLiked(recipe.id) ? "Unlike" : "Like"}
                                            onClick={() => handleLikeRecipe(recipe)}
                                        >
                                            {isRecipeLiked(recipe.id) ? <FaHeart className="dinner-recipes-heart-filled" /> : <FaRegHeart />}
                                        </button>
                                        <Tooltip id={`all-like-${recipe.id}`} />

                                        <button
                                            className="dinner-recipes-card-action-button"
                                            data-tooltip-id={`all-save-${recipe.id}`}
                                            data-tooltip-content={isRecipeSaved(recipe.id) ? "Unsave" : "Save"}
                                            onClick={() => handleSaveRecipe(recipe)}
                                        >
                                            {isRecipeSaved(recipe.id) ? <FaBookmark className="dinner-recipes-bookmark-filled" /> : <FaRegBookmark />}
                                        </button>
                                        <Tooltip id={`all-save-${recipe.id}`} />

                                        <button
                                            className="dinner-recipes-card-action-button"
                                            data-tooltip-id={`edit-${recipe.id}`}
                                            data-tooltip-content="Edit Recipe"
                                            onClick={() => handleEditRecipe(recipe)}
                                        >
                                            <RiEditLine />
                                        </button>
                                        <Tooltip id={`edit-${recipe.id}`} />

                                        <button
                                            className="dinner-recipes-card-action-button"
                                            data-tooltip-id={`delete-${recipe.id}`}
                                            data-tooltip-content="Delete Recipe"
                                            onClick={() => handleDeleteRecipe(recipe.id)}
                                        >
                                            <RiDeleteBinLine />
                                        </button>
                                        <Tooltip id={`delete-${recipe.id}`} />
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="dinner-recipes-empty-state">
                                <p>No dinner recipes found. Try adjusting your search or filters.</p>
                                <button
                                    className="dinner-recipes-action-button"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setFilterOptions({
                                            maxTime: 45,
                                            cuisineType: [],
                                            dietaryRestrictions: []
                                        });
                                        setCuisines(cuisines.map(c => ({ ...c, selected: false })));
                                        setDietaryOptions(dietaryOptions.map(d => ({ ...d, selected: false })));
                                        setSortBy('popularity');
                                    }}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>

            <AnimatePresence>
                {showAddRecipeModal && (
                    <motion.div
                        className="dinner-recipes-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowAddRecipeModal(false)}
                    >
                        <motion.div
                            className="dinner-recipes-modal"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="dinner-recipes-modal-header">
                                <h2>{editingRecipe ? 'Edit Recipe' : 'Add New Dinner Recipe'}</h2>
                                <button
                                    className="dinner-recipes-modal-close"
                                    onClick={() => setShowAddRecipeModal(false)}
                                >
                                    &times;
                                </button>
                            </div>

                            <div className="dinner-recipes-modal-content">
                                <div className="dinner-recipes-form-group">
                                    <label htmlFor="recipe-title" className="dinner-recipes-form-label">Recipe Title</label>
                                    <input
                                        id="recipe-title"
                                        type="text"
                                        className="dinner-recipes-form-input"
                                        placeholder="Enter recipe title"
                                        value={newRecipe.title}
                                        onChange={(e) => setNewRecipe({ ...newRecipe, title: e.target.value })}
                                    />
                                </div>

                                <div className="dinner-recipes-form-group">
                                    <label className="dinner-recipes-form-label">Ingredients</label>
                                    {newRecipe.ingredients.map((ingredient, index) => (
                                        <div key={index} className="dinner-recipes-form-input-group">
                                            <input
                                                type="text"
                                                className="dinner-recipes-form-input"
                                                placeholder={`Ingredient #${index + 1}`}
                                                value={ingredient}
                                                onChange={(e) => handleIngredientChange(index, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        className="dinner-recipes-form-add-button"
                                        onClick={handleAddIngredientField}
                                    >
                                        <FaPlus /> Add Ingredient
                                    </button>
                                </div>

                                <div className="dinner-recipes-form-group">
                                    <label className="dinner-recipes-form-label">Cooking Steps</label>
                                    {newRecipe.steps.map((step, index) => (
                                        <div key={index} className="dinner-recipes-form-input-group">
                                            <textarea
                                                className="dinner-recipes-form-textarea"
                                                placeholder={`Step #${index + 1}`}
                                                value={step}
                                                onChange={(e) => handleStepChange(index, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        className="dinner-recipes-form-add-button"
                                        onClick={handleAddStepField}
                                    >
                                        <FaPlus /> Add Step
                                    </button>
                                </div>

                                <div className="dinner-recipes-form-row">
                                    <div className="dinner-recipes-form-group">
                                        <label htmlFor="recipe-time" className="dinner-recipes-form-label">Cooking Time (minutes)</label>
                                        <input
                                            id="recipe-time"
                                            type="number"
                                            className="dinner-recipes-form-input"
                                            min="5"
                                            max="60"
                                            placeholder="Cooking time in minutes"
                                            value={newRecipe.time}
                                            onChange={(e) => setNewRecipe({ ...newRecipe, time: parseInt(e.target.value) })}
                                        />
                                    </div>

                                    <div className="dinner-recipes-form-group">
                                        <label htmlFor="recipe-cuisine" className="dinner-recipes-form-label">Cuisine Type</label>
                                        <select
                                            id="recipe-cuisine"
                                            className="dinner-recipes-form-select"
                                            value={newRecipe.cuisineType}
                                            onChange={(e) => setNewRecipe({ ...newRecipe, cuisineType: e.target.value })}
                                        >
                                            <option value="">Select Cuisine</option>
                                            <option value="italian">Italian</option>
                                            <option value="mexican">Mexican</option>
                                            <option value="indian">Indian</option>
                                            <option value="chinese">Chinese</option>
                                            <option value="american">American</option>
                                            <option value="thai">Thai</option>
                                            <option value="mediterranean">Mediterranean</option>
                                            <option value="french">French</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="dinner-recipes-form-group">
                                    <label htmlFor="recipe-image" className="dinner-recipes-form-label">Image URL</label>
                                    <input
                                        id="recipe-image"
                                        type="text"
                                        className="dinner-recipes-form-input"
                                        placeholder="Enter image URL"
                                        value={newRecipe.image}
                                        onChange={(e) => setNewRecipe({ ...newRecipe, image: e.target.value })}
                                    />
                                </div>

                                <div className="dinner-recipes-form-checkbox">
                                    <input
                                        id="recipe-vegetarian"
                                        type="checkbox"
                                        checked={newRecipe.isVegetarian}
                                        onChange={(e) => setNewRecipe({ ...newRecipe, isVegetarian: e.target.checked })}
                                    />
                                    <label htmlFor="recipe-vegetarian">Vegetarian</label>
                                </div>
                            </div>

                            <div className="dinner-recipes-modal-footer">
                                <button
                                    className="dinner-recipes-modal-cancel"
                                    onClick={() => setShowAddRecipeModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="dinner-recipes-modal-save"
                                    onClick={handleAddRecipe}
                                >
                                    {editingRecipe ? 'Update Recipe' : 'Add Recipe'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showInventoryModal && (
                    <motion.div
                        className="dinner-recipes-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowInventoryModal(false)}
                    >
                        <motion.div
                            className="dinner-recipes-modal dinner-recipes-inventory-modal"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="dinner-recipes-modal-header">
                                <h2>Manage Kitchen Inventory</h2>
                                <button
                                    className="dinner-recipes-modal-close"
                                    onClick={() => setShowInventoryModal(false)}
                                >
                                    &times;
                                </button>
                            </div>

                            <div className="dinner-recipes-modal-body">
                                <div className="dinner-recipes-inventory-add">
                                    <h3>Add New Ingredient</h3>
                                    <div className="dinner-recipes-inventory-form">
                                        <div className="dinner-recipes-form-group">
                                            <label htmlFor="ingredient-name" className="dinner-recipes-form-label">Ingredient Name</label>
                                            <input
                                                id="ingredient-name"
                                                type="text"
                                                className="dinner-recipes-form-input"
                                                placeholder="e.g., Tomatoes"
                                                value={newIngredient.name}
                                                onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                                            />
                                        </div>

                                        <div className="dinner-recipes-form-row">
                                            <div className="dinner-recipes-form-group">
                                                <label htmlFor="ingredient-category" className="dinner-recipes-form-label">Category</label>
                                                <select
                                                    id="ingredient-category"
                                                    className="dinner-recipes-form-select"
                                                    value={newIngredient.category}
                                                    onChange={(e) => setNewIngredient({ ...newIngredient, category: e.target.value })}
                                                >
                                                    <option value="vegetable">Vegetable</option>
                                                    <option value="fruit">Fruit</option>
                                                    <option value="meat">Meat</option>
                                                    <option value="dairy">Dairy</option>
                                                    <option value="grain">Grain</option>
                                                    <option value="spice">Spice</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>

                                            <div className="dinner-recipes-form-group">
                                                <label htmlFor="ingredient-quantity" className="dinner-recipes-form-label">Quantity</label>
                                                <input
                                                    id="ingredient-quantity"
                                                    type="number"
                                                    className="dinner-recipes-form-input"
                                                    min="1"
                                                    value={newIngredient.quantity}
                                                    onChange={(e) => setNewIngredient({ ...newIngredient, quantity: parseInt(e.target.value) })}
                                                />
                                            </div>

                                            <div className="dinner-recipes-form-group">
                                                <label htmlFor="ingredient-unit" className="dinner-recipes-form-label">Unit</label>
                                                <select
                                                    id="ingredient-unit"
                                                    className="dinner-recipes-form-select"
                                                    value={newIngredient.unit}
                                                    onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                                                >
                                                    <option value="piece">Piece</option>
                                                    <option value="cup">Cup</option>
                                                    <option value="tbsp">Tablespoon</option>
                                                    <option value="tsp">Teaspoon</option>
                                                    <option value="oz">Ounce</option>
                                                    <option value="lb">Pound</option>
                                                    <option value="g">Gram</option>
                                                    <option value="kg">Kilogram</option>
                                                    <option value="ml">Milliliter</option>
                                                    <option value="l">Liter</option>
                                                </select>
                                            </div>
                                        </div>

                                        <button
                                            className="dinner-recipes-add-ingredient-btn"
                                            onClick={handleAddIngredient}
                                        >
                                            <FaPlus /> Add to Inventory
                                        </button>
                                    </div>
                                </div>

                                <div className="dinner-recipes-inventory-list">
                                    <h3>Current Inventory</h3>

                                    {inventory.length === 0 ? (
                                        <p className="dinner-recipes-empty-inventory">Your inventory is empty. Add ingredients above.</p>
                                    ) : (
                                        <div className="dinner-recipes-inventory-table">
                                            <div className="dinner-recipes-inventory-header">
                                                <div className="dinner-recipes-inventory-col">Ingredient</div>
                                                <div className="dinner-recipes-inventory-col">Category</div>
                                                <div className="dinner-recipes-inventory-col">Quantity</div>
                                                <div className="dinner-recipes-inventory-col">Actions</div>
                                            </div>

                                            {inventory.map(item => (
                                                <motion.div
                                                    key={item._id}
                                                    className="dinner-recipes-inventory-row"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                >
                                                    <div className="dinner-recipes-inventory-col">{item.name}</div>
                                                    <div className="dinner-recipes-inventory-col">
                                                        <span className={`dinner-recipes-category-badge dinner-recipes-category-${item.category}`}>
                                                            {item.category}
                                                        </span>
                                                    </div>
                                                    <div className="dinner-recipes-inventory-col">
                                                        {item.quantity} {item.unit}
                                                    </div>
                                                    <div className="dinner-recipes-inventory-col dinner-recipes-actions-col">
                                                        <button
                                                            className="dinner-recipes-inventory-delete-btn"
                                                            onClick={() => handleDeleteInventoryItem(item._id)}
                                                        >
                                                            <RiDeleteBinLine />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="dinner-recipes-modal-footer">
                                <button
                                    className="dinner-recipes-modal-close-btn"
                                    onClick={() => setShowInventoryModal(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DinnerRecipes;