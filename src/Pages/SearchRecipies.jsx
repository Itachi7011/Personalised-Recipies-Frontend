import React, { useState, useEffect, useContext, useRef } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { Heart, Book, Filter, Search, Sliders, ChevronDown, Plus, Edit3, Trash2, Clock, Users, ChefHat, Compass, Tag, Briefcase , Send} from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const SearchRecipes = () => {
    const { isDarkMode } = useContext(ThemeContext);
    const navigate = useNavigate();
    const [user, setUser] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);
    const [savedRecipes, setSavedRecipes] = useState([]);
    const [likedRecipes, setLikedRecipes] = useState([]);
    const [activeTab, setActiveTab] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [ingredients, setIngredients] = useState([]);
    const [newIngredient, setNewIngredient] = useState('');
    const [generatedRecipes, setGeneratedRecipes] = useState([]);
    const [searchHistory, setSearchHistory] = useState([]);
    const [suggestedIngredients, setSuggestedIngredients] = useState([]);
    const [viewMode, setViewMode] = useState('grid'); // grid or list
    const [sortBy, setSortBy] = useState('relevance');
    const [filterExpanded, setFilterExpanded] = useState(false);
    const [dietPreference, setDietPreference] = useState('all');
    const [timeFilter, setTimeFilter] = useState('any');
    const [skillLevel, setSkillLevel] = useState('any');
    const [isFavoriteFilter, setIsFavoriteFilter] = useState(false);
    const [isInventoryFilter, setIsInventoryFilter] = useState(false);
    const [servingsFilter, setServingsFilter] = useState(0);
    const searchResultsRef = useRef(null);
    const [inventory, setInventory] = useState([]);
    const [loading3d, setLoading3d] = useState(true);
    const scene3dRef = useRef(null);

    const [newsletterEmail, setNewsletterEmail] = useState('');
const [newsletterPreferences, setNewsletterPreferences] = useState({
    weeklyRecipes: true,
    seasonalGuides: true,
    cookingTips: true
});

    const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY || 'YOUR_FREE_API_KEY';

    const [cuisineOptions, setCuisineOptions] = useState([
        { id: 'italian', name: 'Italian', selected: false },
        { id: 'indian', name: 'Indian', selected: false },
        { id: 'chinese', name: 'Chinese', selected: false },
        { id: 'mexican', name: 'Mexican', selected: false },
        { id: 'thai', name: 'Thai', selected: false },
        { id: 'japanese', name: 'Japanese', selected: false },
        { id: 'french', name: 'French', selected: false },
        { id: 'mediterranean', name: 'Mediterranean', selected: false },
        { id: 'american', name: 'American', selected: false },
        { id: 'korean', name: 'Korean', selected: false },
    ]);

    // Common ingredients suggestions
    const commonIngredients = [
        'chicken', 'beef', 'pork', 'salmon',
        'rice', 'pasta', 'potatoes', 'onions',
        'tomatoes', 'garlic', 'eggs', 'cheese',
        'spinach', 'carrots', 'bell peppers', 'broccoli'
    ];

    useEffect(() => {
        const checkLoggedIn = async () => {
            try {
                const res = await axios.get('/api/check-auth', { withCredentials: true });
                if (res.data.isLoggedIn) {
                    setUser(res.data.user);
                    fetchUserData(res.data.user.email);
                }
            } catch (error) {
                console.error('Auth check error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkLoggedIn();
        fetchSearchHistory();

        // Initialize 3D scene
        if (scene3dRef.current) {
            initializeThreeJsScene();
        }

        setTimeout(() => {
            setLoading3d(false);
        }, 2000);
    }, []);

    const initializeThreeJsScene = () => {
        // This would be replaced with actual Three.js code in a production app
        console.log("3D scene initialized");
    };

    const fetchUserData = async (email) => {
        try {
            const res = await axios.get(`/api/user-data?email=${email}`, { withCredentials: true });

            // Update saved and liked recipes
            if (res.data.savedRecipes) {
                const savedIndices = res.data.savedRecipes.map(r => r.recipeId);
                setSavedRecipes(savedIndices);
            }

            if (res.data.likedRecipes) {
                const likedIndices = res.data.likedRecipes.map(r => r.recipeId);
                setLikedRecipes(likedIndices);
            }

            // Update inventory
            if (res.data.inventory) {
                setInventory(res.data.inventory);
            }

        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const fetchSearchHistory = async () => {
        try {
            const res = await axios.get('/api/recipe-search-history', { withCredentials: true });
            if (res.data && res.data.length) {
                setSearchHistory(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch search history:', error);
        }
    };

    useEffect(() => {
        if (initialLoad) {
            setInitialLoad(false);
            return;
        }

        // Update suggested ingredients based on the current ingredient list
        const updateSuggestions = () => {
            // Filter out ingredients that are already in the list
            const filteredSuggestions = commonIngredients.filter(
                ing => !ingredients.includes(ing.toLowerCase()) &&
                    ing.toLowerCase().includes(newIngredient.toLowerCase())
            );
            setSuggestedIngredients(filteredSuggestions.slice(0, 5));
        };

        updateSuggestions();
    }, [newIngredient, ingredients]);

    const handleTabChange = (index, tab) => {
        setActiveTab(prev => ({
            ...prev,
            [index]: tab
        }));
    };

    const handleAddIngredient = () => {
        if (newIngredient.trim() && !ingredients.includes(newIngredient.trim().toLowerCase())) {
            setIngredients([...ingredients, newIngredient.trim().toLowerCase()]);
            setNewIngredient('');

            // Show a subtle toast notification
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
                background: isDarkMode ? '#333' : '#fff',
                color: isDarkMode ? '#fff' : '#333',
            });

            Toast.fire({
                icon: 'success',
                title: `Added ${newIngredient.trim()}`
            });
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAddIngredient();
        }
    };

    const handleRemoveIngredient = (indexToRemove) => {
        setIngredients(ingredients.filter((_, index) => index !== indexToRemove));
    };

    const toggleCuisine = (id) => {
        setCuisineOptions(cuisineOptions.map(cuisine =>
            cuisine.id === id ? { ...cuisine, selected: !cuisine.selected } : cuisine
        ));
    };

    const generateRecipes = async () => {
        setIsGenerating(true);
        setGeneratedRecipes([]);

        try {
            // Save search to history
            if (user && user.email) {
                await axios.post('/api/save-search-history', {
                    query: searchQuery,
                    ingredients: ingredients,
                    filters: {
                        diet: dietPreference,
                        time: timeFilter,
                        cuisines: cuisineOptions.filter(c => c.selected).map(c => c.id)
                    }
                }, { withCredentials: true });
            }

            // Get selected cuisines
            const selectedCuisines = cuisineOptions
                .filter(c => c.selected)
                .map(c => c.id)
                .join(',');

            // Prepare diet parameters
            let dietParams = '';
            if (dietPreference === 'veg') {
                dietParams = '&vegetarian=true&vegan=false';
            } else if (dietPreference === 'non-veg') {
                dietParams = '&vegetarian=false&vegan=false';
            }

            // Prepare time filter
            let timeParam = '';
            if (timeFilter !== 'any') {
                const maxTime = timeFilter === 'quick' ? 30 :
                    timeFilter === 'moderate' ? 60 : 120;
                timeParam = `&maxReadyTime=${maxTime}`;
            }

            // Prepare ingredients string
            const ingredientsString = ingredients.join(',');

            // Prepare query
            let queryParam = '';
            if (searchQuery.trim()) {
                queryParam = `&query=${encodeURIComponent(searchQuery.trim())}`;
            }

            // Build API URL
            const apiUrl = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&instructionsRequired=true&addRecipeInformation=true&fillIngredients=true&ingredients=${ingredientsString}&number=10${queryParam}${dietParams}${timeParam}${selectedCuisines ? `&cuisine=${selectedCuisines}` : ''}`;

            const response = await fetch(apiUrl);

            if (!response.ok) throw new Error('API request failed');

            const data = await response.json();

            if (data.results && data.results.length > 0) {
                // Format the recipes data
                const formattedRecipes = data.results.map(recipe => {
                    // Extract ingredients
                    const ingredientsList = recipe.missedIngredients.concat(recipe.usedIngredients).map(ing =>
                        `${ing.amount ? ing.amount : ''} ${ing.unit ? ing.unit : ''} ${ing.name}`.trim()
                    );

                    // Extract instructions
                    let steps = [];
                    if (recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0) {
                        steps = recipe.analyzedInstructions[0].steps.map(step => step.step);
                    } else if (recipe.instructions) {
                        steps = recipe.instructions.split('\n').filter(step => step.trim());
                    }

                    return {
                        id: recipe.id,
                        title: recipe.title,
                        ingredients: ingredientsList,
                        steps: steps,
                        time: `${recipe.readyInMinutes || 30} mins`,
                        image: recipe.image,
                        video: recipe.video,
                        isVegetarian: recipe.vegetarian || false,
                        sourceUrl: recipe.sourceUrl,
                        servings: recipe.servings || 4,
                        healthScore: recipe.healthScore || 50,
                        cuisines: recipe.cuisines || [],
                        dishTypes: recipe.dishTypes || [],
                        diets: recipe.diets || []
                    };
                });

                setGeneratedRecipes(formattedRecipes);

                // Scroll to results
                if (searchResultsRef.current) {
                    searchResultsRef.current.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                createMockRecipe();
            }
        } catch (error) {
            console.error('API Error:', error);
            createMockRecipe();
        } finally {
            setIsGenerating(false);
            // Trigger a search history refresh
            fetchSearchHistory();
        }
    };

    const createMockRecipe = () => {
        Swal.fire({
            title: 'No Recipes Found',
            text: 'We could not find recipes with your exact criteria. Here are some alternatives you might enjoy!',
            icon: 'info',
            confirmButtonText: 'Show Alternatives',
            background: isDarkMode ? '#1e1e1e' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#333333',
        });

        // Create mock recipes based on ingredients
        const mockRecipes = [];

        if (ingredients.includes('chicken')) {
            mockRecipes.push({
                id: 'mock-1',
                title: 'Simple Roasted Chicken',
                ingredients: [
                    '1 whole chicken (about 4-5 lbs)',
                    '2 tbsp olive oil',
                    '1 tbsp salt',
                    '1 tsp black pepper',
                    '3 cloves garlic, minced',
                    '1 lemon, quartered',
                    'Fresh herbs (rosemary, thyme)'
                ],
                steps: [
                    'Preheat oven to 425°F (220°C).',
                    'Remove giblets from chicken cavity and pat chicken dry with paper towels.',
                    'Rub chicken with olive oil and season generously with salt and pepper.',
                    'Stuff cavity with garlic, lemon, and herbs.',
                    'Place chicken breast-side up in a roasting pan.',
                    'Roast for 1 hour and 15 minutes or until internal temperature reaches 165°F (74°C).',
                    'Let rest for 15 minutes before carving.'
                ],
                time: '90 mins',
                image: 'https://spoonacular.com/recipeImages/640803-556x370.jpg',
                isVegetarian: false,
                sourceUrl: '#',
                servings: 4,
                healthScore: 78,
                cuisines: ['American'],
                dishTypes: ['lunch', 'main course', 'dinner'],
                diets: ['gluten free', 'dairy free']
            });
        }

        if (ingredients.includes('pasta') || ingredients.includes('tomatoes')) {
            mockRecipes.push({
                id: 'mock-2',
                title: 'Quick Tomato Pasta',
                ingredients: [
                    '8 oz pasta',
                    '2 tbsp olive oil',
                    '3 cloves garlic, minced',
                    '1 can (14 oz) diced tomatoes',
                    '1/4 cup fresh basil, chopped',
                    '1/4 cup parmesan cheese, grated',
                    'Salt and pepper to taste'
                ],
                steps: [
                    'Cook pasta according to package instructions.',
                    'In a large pan, heat olive oil over medium heat.',
                    'Add garlic and sauté until fragrant, about 30 seconds.',
                    'Add diced tomatoes and simmer for 10 minutes.',
                    'Drain pasta and add to the tomato sauce.',
                    'Mix in fresh basil, salt, and pepper.',
                    'Serve with grated parmesan cheese.'
                ],
                time: '25 mins',
                image: 'https://spoonacular.com/recipeImages/654959-556x370.jpg',
                isVegetarian: true,
                sourceUrl: '#',
                servings: 2,
                healthScore: 65,
                cuisines: ['Italian'],
                dishTypes: ['lunch', 'main course', 'dinner'],
                diets: ['vegetarian']
            });
        }

        if (ingredients.includes('eggs') || ingredients.length === 0) {
            mockRecipes.push({
                id: 'mock-3',
                title: 'Classic French Omelette',
                ingredients: [
                    '3 large eggs',
                    '1 tbsp butter',
                    '2 tbsp chives, finely chopped',
                    '2 tbsp gruyère cheese, grated (optional)',
                    'Salt and pepper to taste'
                ],
                steps: [
                    'In a bowl, beat eggs with salt and pepper until well mixed.',
                    'Heat a non-stick pan over medium heat and add butter.',
                    'Once butter is melted and foaming, pour in eggs.',
                    'As eggs begin to set, use a spatula to push cooked portions toward the center.',
                    'When eggs are almost set but still slightly runny on top, sprinkle cheese if using.',
                    'Fold omelette in half or thirds.',
                    'Slide onto a plate and garnish with chives.'
                ],
                time: '10 mins',
                image: 'https://spoonacular.com/recipeImages/638604-556x370.jpg',
                isVegetarian: true,
                sourceUrl: '#',
                servings: 1,
                healthScore: 85,
                cuisines: ['French'],
                dishTypes: ['breakfast', 'brunch'],
                diets: ['vegetarian', 'gluten free']
            });
        }

        setGeneratedRecipes(mockRecipes.length > 0 ? mockRecipes : [
            {
                id: 'mock-default',
                title: 'Simple Vegetable Stir Fry',
                ingredients: [
                    '2 tbsp vegetable oil',
                    '2 cloves garlic, minced',
                    '1 inch ginger, grated',
                    '1 bell pepper, sliced',
                    '1 carrot, julienned',
                    '1 cup broccoli florets',
                    '2 tbsp soy sauce',
                    '1 tbsp sesame oil',
                    '2 cups cooked rice for serving'
                ],
                steps: [
                    'Heat oil in a wok or large pan over high heat.',
                    'Add garlic and ginger, stir for 30 seconds until fragrant.',
                    'Add vegetables and stir fry for 4-5 minutes until crisp-tender.',
                    'Add soy sauce and sesame oil, toss to combine.',
                    'Serve hot over cooked rice.'
                ],
                time: '15 mins',
                image: 'https://spoonacular.com/recipeImages/798400-556x370.jpg',
                isVegetarian: true,
                sourceUrl: '#',
                servings: 2,
                healthScore: 90,
                cuisines: ['Asian'],
                dishTypes: ['lunch', 'main course', 'dinner'],
                diets: ['vegetarian', 'vegan']
            }
        ]);
    };

    // Add this function near the other handler functions
const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    
    try {
        const response = await axios.post('/api/subscribe-newsletter', {
            email: newsletterEmail,
            preferences: newsletterPreferences
        }, { withCredentials: true });

        Swal.fire({
            title: 'Subscribed!',
            text: 'Thank you for subscribing to our newsletter',
            icon: 'success',
            background: isDarkMode ? '#1e1e1e' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#333333',
        });
        
        setNewsletterEmail('');
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        Swal.fire({
            title: 'Error',
            text: 'Failed to subscribe. Please try again later.',
            icon: 'error',
            background: isDarkMode ? '#1e1e1e' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#333333',
        });
    }
};

    const handleAddFromInventory = () => {
        // Open inventory selection modal
        Swal.fire({
            title: 'Add from Inventory',
            html: `
                <div class="srchrcp-inventory-selector">
                    ${inventory.map((item, idx) => `
                        <div class="srchrcp-inventory-item">
                            <input type="checkbox" id="item-${idx}" class="srchrcp-inventory-checkbox" ${ingredients.includes(item.name.toLowerCase()) ? 'checked disabled' : ''}>
                            <label for="item-${idx}" class="srchrcp-inventory-label">
                                ${item.name} (${item.quantity || '1'} ${item.unit || 'item'})
                            </label>
                        </div>
                    `).join('')}
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Add Selected',
            background: isDarkMode ? '#1e1e1e' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#333333',
            preConfirm: () => {
                const selected = [];
                document.querySelectorAll('.srchrcp-inventory-checkbox:checked:not(:disabled)').forEach(checkbox => {
                    const idx = checkbox.id.split('-')[1];
                    if (inventory[idx]) {
                        selected.push(inventory[idx].name.toLowerCase());
                    }
                });
                return selected;
            }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                const newIngredients = [...ingredients];
                result.value.forEach(item => {
                    if (!newIngredients.includes(item)) {
                        newIngredients.push(item);
                    }
                });
                setIngredients(newIngredients);
            }
        });
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
                    navigate('/Login');
                }
            });
            return;
        }

        // Check if recipe is already saved
        const isAlreadySaved = savedRecipes.includes(recipe.id);

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
                    setSavedRecipes([...savedRecipes, recipe.id]);
                } else {
                    Swal.fire({
                        title: 'Unsaved!',
                        text: 'Recipe has been removed from your collection',
                        icon: 'success',
                        background: isDarkMode ? '#1e1e1e' : '#ffffff',
                        color: isDarkMode ? '#ffffff' : '#333333',
                    });
                    setSavedRecipes(savedRecipes.filter(id => id !== recipe.id));
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
                    navigate('/Login');
                }
            });
            return;
        }

        // Check if recipe is already liked
        const isAlreadyLiked = likedRecipes.includes(recipe.id);

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
                    setLikedRecipes([...likedRecipes, recipe.id]);
                } else {
                    Swal.fire({
                        title: 'Unliked!',
                        text: 'Recipe has been removed from your favorites',
                        icon: 'success',
                        background: isDarkMode ? '#1e1e1e' : '#ffffff',
                        color: isDarkMode ? '#ffffff' : '#333333',
                    });
                    setLikedRecipes(likedRecipes.filter(id => id !== recipe.id));
                }
            }
        } catch (error) {
            console.error('Error liking recipe:', error);
        }
    };

    const handleApplySearch = (historyItem) => {
        if (historyItem.query) {
            setSearchQuery(historyItem.query);
        }

        if (historyItem.ingredients && historyItem.ingredients.length > 0) {
            setIngredients(historyItem.ingredients);
        }

        if (historyItem.filters) {
            if (historyItem.filters.diet) {
                setDietPreference(historyItem.filters.diet);
            }

            if (historyItem.filters.time) {
                setTimeFilter(historyItem.filters.time);
            }

            if (historyItem.filters.cuisines && historyItem.filters.cuisines.length > 0) {
                setCuisineOptions(prev => prev.map(cuisine => ({
                    ...cuisine,
                    selected: historyItem.filters.cuisines.includes(cuisine.id)
                })));
            }
        }

        // Execute search immediately
        setTimeout(() => {
            generateRecipes();
        }, 500);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setIngredients([]);
        setDietPreference('all');
        setTimeFilter('any');
        setCuisineOptions(prev => prev.map(cuisine => ({ ...cuisine, selected: false })));
        setIsFavoriteFilter(false);
        setIsInventoryFilter(false);
        setServingsFilter(0);
        setSkillLevel('any');
    };

    return (
        <div className={`srchrcp-container ${isDarkMode ? 'srchrcp-dark' : 'srchrcp-light'}`}>
            {/* 3D Hero Section */}
            <div className="srchrcp-hero-section">
                <div className="srchrcp-hero-content">
                    <h1 className="srchrcp-hero-title">Find Your Perfect Recipe</h1>
                    <p className="srchrcp-hero-description">
                        Search through thousands of recipes based on ingredients you have, dietary preferences,
                        or cuisines you love. Let our AI find your next delicious meal!
                    </p>
                </div>
                <div ref={scene3dRef} className={`srchrcp-3d-scene ${loading3d ? 'srchrcp-loading' : ''}`}>
                    {loading3d ? (
                        <div className="srchrcp-loading-spinner">
                            <div className="srchrcp-spinner"></div>
                        </div>
                    ) : (
                        <>
                            <div className="srchrcp-3d-plate">
                                <div className="srchrcp-3d-food srchrcp-3d-food-1"></div>
                                <div className="srchrcp-3d-food srchrcp-3d-food-2"></div>
                                <div className="srchrcp-3d-food srchrcp-3d-food-3"></div>
                                <div className="srchrcp-3d-utensil srchrcp-3d-fork"></div>
                                <div className="srchrcp-3d-utensil srchrcp-3d-knife"></div>
                            </div>
                            <div className="srchrcp-3d-shadow"></div>
                        </>
                    )}
                </div>
            </div>

            {/* Search Section */}
            <section className="srchrcp-search-section">
                <div className="srchrcp-search-container">
                    <h2 className="srchrcp-section-title">Recipe Search</h2>
                    <p className="srchrcp-section-subtitle">
                        Find recipes by keyword, ingredients you have, cuisine type, or dietary restrictions.
                        Our AI will suggest personalized options based on your preferences.
                    </p>

                    <div className="srchrcp-search-box">
                        <div className="srchrcp-search-input-wrapper">
                            <Search className="srchrcp-search-icon" size={20} />
                            <input
                                type="text"
                                className="srchrcp-search-input"
                                placeholder="Search for recipes (e.g., pasta, chicken curry, vegan salad)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    className="srchrcp-clear-search-btn"
                                    onClick={() => setSearchQuery('')}
                                >
                                    ×
                                </button>
                            )}
                        </div>

                        <div className="srchrcp-advanced-toggle" onClick={() => setShowAdvanced(!showAdvanced)}>
                            <span>Advanced Options</span>
                            <ChevronDown className={`srchrcp-toggle-icon ${showAdvanced ? 'srchrcp-rotated' : ''}`} size={18} />
                        </div>
                    </div>

                    <AnimatePresence>
                        {showAdvanced && (
                            <motion.div
                                className="srchrcp-advanced-options"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="srchrcp-filter-section">
                                    <h3 className="srchrcp-filter-title">Diet Preferences</h3>
                                    <div className="srchrcp-filter-options">
                                        <button
                                            className={`srchrcp-filter-btn ${dietPreference === 'all' ? 'active' : ''}`}
                                            onClick={() => setDietPreference('all')}
                                        >
                                            All
                                        </button>
                                        <button
                                            className={`srchrcp-filter-btn ${dietPreference === 'veg' ? 'active' : ''}`}
                                            onClick={() => setDietPreference('veg')}
                                        >
                                            Vegetarian
                                        </button>
                                        <button
                                            className={`srchrcp-filter-btn ${dietPreference === 'vegan' ? 'active' : ''}`}
                                            onClick={() => setDietPreference('vegan')}
                                        >
                                            Vegan
                                        </button>
                                        <button
                                            className={`srchrcp-filter-btn ${dietPreference === 'non-veg' ? 'active' : ''}`}
                                            onClick={() => setDietPreference('non-veg')}
                                        >
                                            Non-Vegetarian
                                        </button>
                                    </div>
                                </div>

                                <div className="srchrcp-filter-section">
                                    <h3 className="srchrcp-filter-title">Preparation Time</h3>
                                    <div className="srchrcp-filter-options">
                                        <button
                                            className={`srchrcp-filter-btn ${timeFilter === 'any' ? 'active' : ''}`}
                                            onClick={() => setTimeFilter('any')}
                                        >
                                            Any Time
                                        </button>
                                        <button
                                            className={`srchrcp-filter-btn ${timeFilter === 'quick' ? 'active' : ''}`}
                                            onClick={() => setTimeFilter('quick')}
                                        >
                                            <Clock size={16} /> Quick (&lt; 30 mins)
                                        </button>
                                        <button
                                            className={`srchrcp-filter-btn ${timeFilter === 'moderate' ? 'active' : ''}`}
                                            onClick={() => setTimeFilter('moderate')}
                                        >
                                            <Clock size={16} /> Moderate (30-60 mins)
                                        </button>
                                        <button
                                            className={`srchrcp-filter-btn ${timeFilter === 'lengthy' ? 'active' : ''}`}
                                            onClick={() => setTimeFilter('lengthy')}
                                        >
                                            <Clock size={16} /> Lengthy (&gt; 60 mins)
                                        </button>
                                    </div>
                                </div>

                                <div className="srchrcp-filter-section">
                                    <h3 className="srchrcp-filter-title">Cuisine Types</h3>
                                    <div className="srchrcp-cuisine-options">
                                        {cuisineOptions.map(cuisine => (
                                            <button
                                                key={cuisine.id}
                                                className={`srchrcp-cuisine-btn ${cuisine.selected ? 'active' : ''}`}
                                                onClick={() => toggleCuisine(cuisine.id)}
                                            >
                                                {cuisine.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="srchrcp-filter-section">
                                    <h3 className="srchrcp-filter-title">Additional Filters</h3>
                                    <div className="srchrcp-additional-filters">
                                        <div className="srchrcp-filter-group">
                                            <h4 className="srchrcp-filter-subtitle">Skill Level</h4>
                                            <div className="srchrcp-filter-options">
                                                <button
                                                    className={`srchrcp-filter-btn ${skillLevel === 'any' ? 'active' : ''}`}
                                                    onClick={() => setSkillLevel('any')}
                                                >
                                                    Any Level
                                                </button>
                                                <button
                                                    className={`srchrcp-filter-btn ${skillLevel === 'beginner' ? 'active' : ''}`}
                                                    onClick={() => setSkillLevel('beginner')}
                                                >
                                                    <ChefHat size={16} /> Beginner
                                                </button>
                                                <button
                                                    className={`srchrcp-filter-btn ${skillLevel === 'intermediate' ? 'active' : ''}`}
                                                    onClick={() => setSkillLevel('intermediate')}
                                                >
                                                    <ChefHat size={16} /> Intermediate
                                                </button>
                                                <button
                                                    className={`srchrcp-filter-btn ${skillLevel === 'advanced' ? 'active' : ''}`}
                                                    onClick={() => setSkillLevel('advanced')}
                                                >
                                                    <ChefHat size={16} /> Advanced
                                                </button>
                                            </div>
                                        </div>

                                        <div className="srchrcp-filter-group">
                                            <h4 className="srchrcp-filter-subtitle">Servings</h4>
                                            <div className="srchrcp-servings-slider">
                                                <span className="srchrcp-servings-value">
                                                    {servingsFilter === 0 ? 'Any' : servingsFilter}
                                                </span>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="10"
                                                    value={servingsFilter}
                                                    onChange={(e) => setServingsFilter(parseInt(e.target.value))}
                                                    className="srchrcp-servings-range"
                                                />
                                                <div className="srchrcp-servings-labels">
                                                    <span>Any</span>
                                                    <span>10+</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="srchrcp-filter-group">
                                            <h4 className="srchrcp-filter-subtitle">Collection Filters</h4>
                                            <div className="srchrcp-toggle-filters">
                                                <label className="srchrcp-toggle-filter">
                                                    <input
                                                        type="checkbox"
                                                        checked={isFavoriteFilter}
                                                        onChange={() => setIsFavoriteFilter(!isFavoriteFilter)}
                                                    />
                                                    <span className="srchrcp-toggle-slider"></span>
                                                    <span className="srchrcp-toggle-label">
                                                        <Heart size={16} /> Favorite Recipes Only
                                                    </span>
                                                </label>

                                                <label className="srchrcp-toggle-filter">
                                                    <input
                                                        type="checkbox"
                                                        checked={isInventoryFilter}
                                                        onChange={() => setIsInventoryFilter(!isInventoryFilter)}
                                                    />
                                                    <span className="srchrcp-toggle-slider"></span>
                                                    <span className="srchrcp-toggle-label">
                                                        <Briefcase size={16} /> Use Inventory Only
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="srchrcp-ingredients-section">
                        <h3 className="srchrcp-ingredients-title">
                            <Tag size={18} /> Ingredients
                            <span className="srchrcp-ingredients-subtitle">
                                Add ingredients you have or want to use
                            </span>
                        </h3>

                        <div className="srchrcp-ingredients-input-container">
                            <div className="srchrcp-ingredients-input-wrapper">
                                <input
                                    type="text"
                                    className="srchrcp-ingredients-input"
                                    placeholder="Enter an ingredient (e.g., chicken, tomatoes, rice)"
                                    value={newIngredient}
                                    onChange={(e) => setNewIngredient(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                />
                                <button
                                    className="srchrcp-add-ingredient-btn"
                                    onClick={handleAddIngredient}
                                    disabled={!newIngredient.trim()}
                                >
                                    <Plus size={18} />
                                </button>
                            </div>

                            {user && Object.keys(user).length > 0 && inventory.length > 0 && (
                                <button
                                    className="srchrcp-inventory-btn"
                                    onClick={handleAddFromInventory}
                                >
                                    <Briefcase size={16} /> Add from Inventory
                                </button>
                            )}
                        </div>

                        {suggestedIngredients.length > 0 && newIngredient.trim() && (
                            <div className="srchrcp-suggested-ingredients">
                                <span className="srchrcp-suggestion-label">Suggestions:</span>
                                {suggestedIngredients.map((ingredient, index) => (
                                    <button
                                        key={index}
                                        className="srchrcp-suggestion-btn"
                                        onClick={() => {
                                            setIngredients([...ingredients, ingredient.toLowerCase()]);
                                            setNewIngredient('');
                                        }}
                                    >
                                        {ingredient}
                                    </button>
                                ))}
                            </div>
                        )}

                        {ingredients.length > 0 && (
                            <div className="srchrcp-ingredients-list">
                                {ingredients.map((ingredient, index) => (
                                    <div key={index} className="srchrcp-ingredient-pill">
                                        <span className="srchrcp-ingredient-name">{ingredient}</span>
                                        <button
                                            className="srchrcp-remove-ingredient"
                                            onClick={() => handleRemoveIngredient(index)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                                {ingredients.length > 0 && (
                                    <button
                                        className="srchrcp-clear-all-btn"
                                        onClick={() => setIngredients([])}
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="srchrcp-search-actions">
                        <button
                            className="srchrcp-search-btn"
                            onClick={generateRecipes}
                            disabled={isGenerating}
                        >
                            {isGenerating ? (
                                <>
                                    <div className="srchrcp-loader"></div>
                                    Generating Recipes...
                                </>
                            ) : (
                                <>
                                    <Compass size={18} />
                                    Find Recipes
                                </>
                            )}
                        </button>

                        <button
                            className="srchrcp-clear-search-btn secondary"
                            onClick={handleClearSearch}
                        >
                            Clear All Filters
                        </button>
                    </div>
                </div>
            </section>

            {/* Search History Section */}
            {user && Object.keys(user).length > 0 && searchHistory.length > 0 && (
                <section className="srchrcp-history-section">
                    <div className="srchrcp-history-container">
                        <h2 className="srchrcp-section-title">Previous Searches</h2>
                        <p className="srchrcp-section-subtitle">
                            Quickly access your recent recipe searches and explorations
                        </p>

                        <div className="srchrcp-history-items">
                            {searchHistory.slice(0, 5).map((item, index) => (
                                <div key={index} className="srchrcp-history-item">
                                    <div className="srchrcp-history-details">
                                        <h3 className="srchrcp-history-query">
                                            <Search size={16} /> {item.query || 'Ingredient Search'}
                                        </h3>
                                        {item.ingredients && item.ingredients.length > 0 && (
                                            <div className="srchrcp-history-ingredients">
                                                {item.ingredients.slice(0, 3).join(', ')}
                                                {item.ingredients.length > 3 ? ` +${item.ingredients.length - 3} more` : ''}
                                            </div>
                                        )}
                                        <div className="srchrcp-history-filters">
                                            {item.filters?.diet && item.filters.diet !== 'all' && (
                                                <span className="srchrcp-history-filter">
                                                    {item.filters.diet === 'veg' ? 'Vegetarian' :
                                                        item.filters.diet === 'vegan' ? 'Vegan' : 'Non-Vegetarian'}
                                                </span>
                                            )}
                                            {item.filters?.time && item.filters.time !== 'any' && (
                                                <span className="srchrcp-history-filter">
                                                    {item.filters.time === 'quick' ? 'Quick' :
                                                        item.filters.time === 'moderate' ? 'Moderate Time' : 'Lengthy'}
                                                </span>
                                            )}
                                            {item.filters?.cuisines && item.filters.cuisines.length > 0 && (
                                                <span className="srchrcp-history-filter">
                                                    {item.filters.cuisines.length} cuisine{item.filters.cuisines.length > 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        className="srchrcp-apply-search-btn"
                                        onClick={() => handleApplySearch(item)}
                                    >
                                        Apply
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Results Section */}
            {generatedRecipes.length > 0 && (
                <section className="srchrcp-results-section" ref={searchResultsRef}>
                    <div className="srchrcp-results-container">
                        <div className="srchrcp-results-header">
                            <h2 className="srchrcp-section-title">Recipe Results</h2>
                            <div className="srchrcp-results-actions">
                                <div className="srchrcp-view-toggle">
                                    <button
                                        className={`srchrcp-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                        onClick={() => setViewMode('grid')}
                                    >
                                        Grid
                                    </button>
                                    <button
                                        className={`srchrcp-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                        onClick={() => setViewMode('list')}
                                    >
                                        List
                                    </button>
                                </div>

                                <div className="srchrcp-sort-filter">
                                    <button
                                        className="srchrcp-filter-toggle"
                                        onClick={() => setFilterExpanded(!filterExpanded)}
                                    >
                                        <Filter size={16} />
                                        Sort By
                                    </button>
                                    {filterExpanded && (
                                        <div className="srchrcp-sort-dropdown">
                                            <button
                                                className={`srchrcp-sort-option ${sortBy === 'relevance' ? 'active' : ''}`}
                                                onClick={() => {
                                                    setSortBy('relevance');
                                                    setFilterExpanded(false);
                                                }}
                                            >
                                                Relevance
                                            </button>
                                            <button
                                                className={`srchrcp-sort-option ${sortBy === 'time-asc' ? 'active' : ''}`}
                                                onClick={() => {
                                                    setSortBy('time-asc');
                                                    setFilterExpanded(false);
                                                }}
                                            >
                                                Time (Quickest)
                                            </button>
                                            <button
                                                className={`srchrcp-sort-option ${sortBy === 'time-desc' ? 'active' : ''}`}
                                                onClick={() => {
                                                    setSortBy('time-desc');
                                                    setFilterExpanded(false);
                                                }}
                                            >
                                                Time (Longest)
                                            </button>
                                            <button
                                                className={`srchrcp-sort-option ${sortBy === 'ingredients-asc' ? 'active' : ''}`}
                                                onClick={() => {
                                                    setSortBy('ingredients-asc');
                                                    setFilterExpanded(false);
                                                }}
                                            >
                                                Ingredients (Fewest)
                                            </button>
                                            <button
                                                className={`srchrcp-sort-option ${sortBy === 'ingredients-desc' ? 'active' : ''}`}
                                                onClick={() => {
                                                    setSortBy('ingredients-desc');
                                                    setFilterExpanded(false);
                                                }}
                                            >
                                                Ingredients (Most)
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className={`srchrcp-recipes-grid ${viewMode === 'list' ? 'srchrcp-list-view' : ''}`}>
                            {generatedRecipes.map((recipe, index) => (
                                <motion.div
                                    key={recipe.id || index}
                                    className="srchrcp-recipe-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                >
                                    <div className="srchrcp-recipe-image-container">
                                        <img
                                            src={recipe.image || 'https://spoonacular.com/recipeImages/default-placeholder.jpg'}
                                            alt={recipe.title}
                                            className="srchrcp-recipe-image"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://spoonacular.com/recipeImages/default-placeholder.jpg';
                                            }}
                                        />
                                        <div className="srchrcp-recipe-badges">
                                            {recipe.isVegetarian && (
                                                <span className="srchrcp-recipe-badge vegetarian">Vegetarian</span>
                                            )}
                                            {recipe.diets && recipe.diets.includes('vegan') && (
                                                <span className="srchrcp-recipe-badge vegan">Vegan</span>
                                            )}
                                            {recipe.diets && recipe.diets.includes('gluten free') && (
                                                <span className="srchrcp-recipe-badge gluten-free">Gluten Free</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="srchrcp-recipe-content">
                                        <h3 className="srchrcp-recipe-title">{recipe.title}</h3>

                                        <div className="srchrcp-recipe-meta">
                                            <div className="srchrcp-recipe-time">
                                                <Clock size={14} /> {recipe.time}
                                            </div>
                                            <div className="srchrcp-recipe-servings">
                                                <Users size={14} /> {recipe.servings || 4} servings
                                            </div>
                                        </div>

                                        <div className="srchrcp-recipe-tags">
                                            {recipe.cuisines && recipe.cuisines.slice(0, 2).map((cuisine, idx) => (
                                                <span key={idx} className="srchrcp-recipe-tag">{cuisine}</span>
                                            ))}
                                            {recipe.dishTypes && recipe.dishTypes.slice(0, 1).map((type, idx) => (
                                                <span key={idx} className="srchrcp-recipe-tag">{type}</span>
                                            ))}
                                        </div>

                                        <div className="srchrcp-recipe-ingredients">
                                            <h4 className="srchrcp-recipe-subtitle">Ingredients:</h4>
                                            <ul className="srchrcp-ingredients-list-items">
                                                {recipe.ingredients.slice(0, viewMode === 'list' ? 6 : 4).map((ingredient, idx) => (
                                                    <li key={idx} className="srchrcp-ingredient-item">{ingredient}</li>
                                                ))}
                                                {recipe.ingredients.length > (viewMode === 'list' ? 6 : 4) && (
                                                    <li className="srchrcp-ingredient-more">
                                                        +{recipe.ingredients.length - (viewMode === 'list' ? 6 : 4)} more ingredients
                                                    </li>
                                                )}
                                            </ul>
                                        </div>

                                        {/* Only show steps in list view */}
                                        {viewMode === 'list' && (
                                            <div className="srchrcp-recipe-steps">
                                                <h4 className="srchrcp-recipe-subtitle">Instructions:</h4>
                                                <ol className="srchrcp-steps-list">
                                                    {recipe.steps.slice(0, 3).map((step, idx) => (
                                                        <li key={idx} className="srchrcp-step-item">{step}</li>
                                                    ))}
                                                    {recipe.steps.length > 3 && (
                                                        <li className="srchrcp-step-more">
                                                            +{recipe.steps.length - 3} more steps
                                                        </li>
                                                    )}
                                                </ol>
                                            </div>
                                        )}

                                        <div className="srchrcp-recipe-actions">
                                            <button
                                                className={`srchrcp-recipe-action-btn ${savedRecipes.includes(recipe.id) ? 'saved' : ''}`}
                                                onClick={() => handleSaveRecipe(recipe, index)}
                                            >
                                                <Book size={16} /> {savedRecipes.includes(recipe.id) ? 'Unsave' : 'Save'}
                                            </button>
                                            <button
                                                className={`srchrcp-recipe-action-btn ${likedRecipes.includes(recipe.id) ? 'liked' : ''}`}
                                                onClick={() => handleLikeRecipe(recipe, index)}
                                            >
                                                <Heart size={16} fill={likedRecipes.includes(recipe.id) ? 'red' : 'none'} />
                                                {likedRecipes.includes(recipe.id) ? 'Liked' : 'Like'}
                                            </button>
                                        </div>

                                        <button
                                            className="srchrcp-view-recipe-btn"
                                            onClick={() => navigate(`/recipe/${recipe.id}`)}
                                        >
                                            View Full Recipe
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* AI Recipe Tips Section */}
            <section className="srchrcp-tips-section">
                <div className="srchrcp-tips-container">
                    <h2 className="srchrcp-section-title">AI-Powered Recipe Tips</h2>
                    <p className="srchrcp-section-subtitle">
                        Our AI analyzes thousands of recipes to provide intelligent cooking tips and ingredient substitutions
                    </p>

                    <div className="srchrcp-tips-grid">
                        <div className="srchrcp-tip-card">
                            <div className="srchrcp-tip-icon">🔄</div>
                            <h3 className="srchrcp-tip-title">Ingredient Substitutions</h3>
                            <p className="srchrcp-tip-content">
                                Missing an ingredient? Our AI can suggest substitute ingredients based on flavor profiles
                                and chemical properties, ensuring your recipe still turns out delicious.
                            </p>
                            <div className="srchrcp-tip-examples">
                                <div className="srchrcp-tip-example">
                                    <span className="srchrcp-example-from">Buttermilk</span>
                                    <span className="srchrcp-example-arrow">→</span>
                                    <span className="srchrcp-example-to">Milk + 1 tbsp vinegar</span>
                                </div>
                                <div className="srchrcp-tip-example">
                                    <span className="srchrcp-example-from">Fresh herbs</span>
                                    <span className="srchrcp-example-arrow">→</span>
                                    <span className="srchrcp-example-to">1/3 amount dried herbs</span>
                                </div>
                            </div>
                        </div>

                        <div className="srchrcp-tip-card">
                            <div className="srchrcp-tip-icon">⏱️</div>
                            <h3 className="srchrcp-tip-title">Time-Saving Techniques</h3>
                            <p className="srchrcp-tip-content">
                                Our AI analyzes prep and cooking methods to suggest time-saving techniques that don't
                                compromise on flavor. Perfect for busy weeknight cooking.
                            </p>
                            <div className="srchrcp-tip-examples">
                                <div className="srchrcp-tip-technique">
                                    <strong>Batch Prep:</strong> Prepare ingredients for multiple meals at once
                                </div>
                                <div className="srchrcp-tip-technique">
                                    <strong>One-Pot Cooking:</strong> Reduce cleanup time while maintaining flavor
                                </div>
                            </div>
                        </div>

                        <div className="srchrcp-tip-card">
                            <div className="srchrcp-tip-icon">🥗</div>
                            <h3 className="srchrcp-tip-title">Nutritional Optimization</h3>
                            <p className="srchrcp-tip-content">
                                Our AI can suggest modifications to recipes to meet specific nutritional goals, whether
                                you're looking to increase protein, reduce sodium, or adapt for specific diets.
                            </p>
                            <div className="srchrcp-tip-examples">
                                <div className="srchrcp-tip-nutrition">
                                    <span>Lower Carb:</span> Replace rice with cauliflower rice
                                </div>
                                <div className="srchrcp-tip-nutrition">
                                    <span>Higher Protein:</span> Add Greek yogurt instead of sour cream
                                </div>
                            </div>
                        </div>

                        <div className="srchrcp-tip-card">
                            <div className="srchrcp-tip-icon">🛒</div>
                            <h3 className="srchrcp-tip-title">Smart Shopping Lists</h3>
                            <p className="srchrcp-tip-content">
                                Our AI combines ingredients from multiple recipes to create optimized shopping lists,
                                reducing waste and ensuring you have everything you need for the week.
                            </p>
                            <div className="srchrcp-tip-features">
                                <div className="srchrcp-tip-feature">
                                    <span>✓</span> Categorized by grocery department
                                </div>
                                <div className="srchrcp-tip-feature">
                                    <span>✓</span> Combines similar ingredients to reduce overbuying
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="srchrcp-faq-section">
                <div className="srchrcp-faq-container">
                    <h2 className="srchrcp-section-title">Frequently Asked Questions</h2>
                    <p className="srchrcp-section-subtitle">
                        Learn more about our personalized recipe generator and how to get the most out of it
                    </p>

                    <div className="srchrcp-faq-list">
                        <div className="srchrcp-faq-item">
                            <h3 className="srchrcp-faq-question">
                                How does the ingredient-based recipe search work?
                            </h3>
                            <p className="srchrcp-faq-answer">
                                Our recipe search uses AI algorithms to match the ingredients you have with thousands of recipes
                                in our database. The system considers compatible flavor profiles, cooking methods, and cuisine types
                                to provide the most relevant recipe suggestions. It can identify recipes that use all or most of your
                                specified ingredients, prioritizing those that require fewer additional ingredients.
                            </p>
                        </div>

                        <div className="srchrcp-faq-item">
                            <h3 className="srchrcp-faq-question">
                                Can I save recipes to access later?
                            </h3>
                            <p className="srchrcp-faq-answer">
                                Yes! You can save any recipe to your personal collection by clicking the "Save" button on a recipe card.
                                Your saved recipes are stored in your account and can be accessed anytime from your profile dashboard.
                                This makes it easy to build a personalized cookbook of your favorite dishes and plan your meals ahead.
                            </p>
                        </div>

                        <div className="srchrcp-faq-item">
                            <h3 className="srchrcp-faq-question">
                                How accurate are the cooking times shown?
                            </h3>
                            <p className="srchrcp-faq-answer">
                                The cooking times shown are estimates based on average preparation skills and standard kitchen equipment.
                                Actual cooking times may vary depending on your experience level, the specific ingredients used, and
                                your kitchen setup. We recommend using the times as a general guideline and adjusting based on your
                                personal experience. The "Quick," "Moderate," and "Lengthy" filters help you find recipes that match
                                your available time constraints.
                            </p>
                        </div>

                        <div className="srchrcp-faq-item">
                            <h3 className="srchrcp-faq-question">
                                Can I filter recipes for specific dietary needs?
                            </h3>
                            <p className="srchrcp-faq-answer">
                                Absolutely! Our advanced filtering system allows you to search for recipes that meet specific dietary
                                requirements such as vegetarian, vegan, gluten-free, low-carb, and more. You can also filter by
                                allergens, nutritional content, and health labels. The diet preference filters in the advanced search
                                options help you find recipes that align with your specific health goals and dietary restrictions.
                            </p>
                        </div>

                        <div className="srchrcp-faq-item">
                            <h3 className="srchrcp-faq-question">
                                How does the AI-powered recommendation system work?
                            </h3>
                            <p className="srchrcp-faq-answer">
                                Our AI-powered recommendation system analyzes your search history, saved recipes, and ingredient preferences
                                to suggest recipes that match your tastes. The more you use the platform, the more personalized your
                                recommendations become. The system learns from your interactions, recipe ratings, and cooking habits to
                                identify patterns and predict which new recipes you might enjoy. It also considers seasonal ingredients,
                                trending recipes, and nutritional balance when making suggestions.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="srchrcp-newsletter-section">
                <div className="srchrcp-newsletter-container">
                    <div className="srchrcp-newsletter-content">
                        <h2 className="srchrcp-newsletter-title">Get Weekly Recipe Inspiration</h2>
                        <p className="srchrcp-newsletter-description">
                            Subscribe to our newsletter for personalized recipe recommendations, seasonal ingredient guides,
                            and exclusive cooking tips straight to your inbox.
                        </p>

                        <form className="srchrcp-newsletter-form" onSubmit={handleNewsletterSubmit}>
                            <div className="srchrcp-newsletter-input-wrapper">
                                <input
                                    type="email"
                                    className="srchrcp-newsletter-input"
                                    placeholder="Enter your email address"
                                    value={newsletterEmail}
                                    onChange={(e) => setNewsletterEmail(e.target.value)}
                                    required
                                />
                                <button type="submit" className="srchrcp-newsletter-button">
                                    <Send size={18} />
                                    Subscribe
                                </button>
                            </div>

                            <div className="srchrcp-newsletter-preferences">
                                <label className="srchrcp-newsletter-preference">
                                    <input
                                        type="checkbox"
                                        checked={newsletterPreferences.weeklyRecipes}
                                        onChange={() => setNewsletterPreferences({
                                            ...newsletterPreferences,
                                            weeklyRecipes: !newsletterPreferences.weeklyRecipes
                                        })}
                                    />
                                    <span className="srchrcp-preference-text">Weekly Recipe Collections</span>
                                </label>

                                <label className="srchrcp-newsletter-preference">
                                    <input
                                        type="checkbox"
                                        checked={newsletterPreferences.seasonalGuides}
                                        onChange={() => setNewsletterPreferences({
                                            ...newsletterPreferences,
                                            seasonalGuides: !newsletterPreferences.seasonalGuides
                                        })}
                                    />
                                    <span className="srchrcp-preference-text">Seasonal Ingredient Guides</span>
                                </label>

                                <label className="srchrcp-newsletter-preference">
                                    <input
                                        type="checkbox"
                                        checked={newsletterPreferences.cookingTips}
                                        onChange={() => setNewsletterPreferences({
                                            ...newsletterPreferences,
                                            cookingTips: !newsletterPreferences.cookingTips
                                        })}
                                    />
                                    <span className="srchrcp-preference-text">Cooking Tips & Techniques</span>
                                </label>
                            </div>
                        </form>
                    </div>

                    <div className="srchrcp-newsletter-image">
                        <div className="srchrcp-newsletter-decoration">
                            <div className="srchrcp-newsletter-shape srchrcp-shape-1"></div>
                            <div className="srchrcp-newsletter-shape srchrcp-shape-2"></div>
                            <div className="srchrcp-newsletter-shape srchrcp-shape-3"></div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default SearchRecipes;