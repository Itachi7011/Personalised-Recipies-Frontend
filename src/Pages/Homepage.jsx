import React, { useContext, useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ThemeContext } from '../context/ThemeContext';
import { ChefHat, Utensils, Check, Camera, Book, Filter, Star, Heart, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { Clock, Youtube } from 'lucide-react';

const HomePage = () => {
    const { isDarkMode } = useContext(ThemeContext);
    const [ingredients, setIngredients] = useState([]);
    const [inputIngredient, setInputIngredient] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedRecipes, setGeneratedRecipes] = useState([]);
    const [dietPreference, setDietPreference] = useState('veg'); // 'veg', 'non-veg', 'both'
    const [activeTab, setActiveTab] = useState({});

    const [savedRecipes, setSavedRecipes] = useState([]);
    const [likedRecipes, setLikedRecipes] = useState([]);

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

    const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY || 'YOUR_FREE_API_KEY';
    console.log(API_KEY)
    // Function to handle Get Started button click
    const handleGetStarted = () => {
        Swal.fire({
            title: 'Welcome!',
            text: 'Ready to turn your ingredients into delicious meals?',
            icon: 'success',
            confirmButtonText: 'Let\'s Go',
            background: isDarkMode ? '#1e1e1e' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#333333',
        });
    };
    const handleTabChange = (recipeIndex, tabName) => {
        setActiveTab(prev => ({
            ...prev,
            [recipeIndex]: tabName
        }));
    };
    const [cuisineOptions, setCuisineOptions] = useState([
        { id: 'indian', name: 'Indian', selected: false },
        { id: 'italian', name: 'Italian', selected: false },
        { id: 'chinese', name: 'Chinese', selected: false },
        { id: 'mexican', name: 'Mexican', selected: false },
        { id: 'american', name: 'American', selected: false },
        { id: 'mediterranean', name: 'Mediterranean', selected: false },
        { id: 'thai', name: 'Thai', selected: false },
        { id: 'french', name: 'French', selected: false },
    ]);

    const toggleCuisine = (id) => {
        setCuisineOptions(cuisineOptions.map(cuisine =>
            cuisine.id === id ? { ...cuisine, selected: !cuisine.selected } : cuisine
        ));
    };
    // Add ingredient to list
    const addIngredient = () => {
        if (inputIngredient.trim() && !ingredients.includes(inputIngredient.trim().toLowerCase())) {
            setIngredients([...ingredients, inputIngredient.trim().toLowerCase()]);
            setInputIngredient('');
        }
    };

    // Remove ingredient from list
    const removeIngredient = (ingredientToRemove) => {
        setIngredients(ingredients.filter(ing => ing !== ingredientToRemove));
    };

    // Generate recipes using Hugging Face API (free tier)

    const generateRecipes = async () => {
        setIsGenerating(true);
        setGeneratedRecipes([]);

        try {
            // Get selected cuisines (if none selected, we'll use all)
            const selectedCuisines = cuisineOptions
                .filter(c => c.selected)
                .map(c => c.id)
                .join(',');

            // Prepare diet parameters based on preference
            let dietParams = '';
            if (dietPreference === 'veg') {
                dietParams = 'vegetarian=true&vegan=false';
            } else if (dietPreference === 'non-veg') {
                dietParams = 'vegetarian=false&vegan=false';
            }

            // Prepare ingredients string
            const ingredientsString = ingredients.join(',');

            // Make API request to Spoonacular
            const response = await fetch(
                `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${API_KEY || 'YOUR_FREE_API_KEY'}&ingredients=${ingredientsString}&number=5&${dietParams}${selectedCuisines ? `&cuisine=${selectedCuisines}` : ''}`
            );

            if (!response.ok) throw new Error('API request failed');

            const recipes = await response.json();

            if (recipes && recipes.length > 0) {
                // Fetch detailed information for each recipe
                const detailedRecipes = await Promise.all(
                    recipes.map(recipe =>
                        fetch(`https://api.spoonacular.com/recipes/${recipe.id}/information?apiKey=${API_KEY || 'YOUR_FREE_API_KEY'}`)
                            .then(res => res.json())
                    )
                );

                // Format the recipes data
                const formattedRecipes = detailedRecipes.map(recipe => {
                    // Extract ingredients
                    const ingredientsList = recipe.extendedIngredients.map(ing =>
                        `${ing.amount} ${ing.unit} ${ing.name}`
                    );

                    // Extract instructions
                    let steps = [];
                    if (recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0) {
                        steps = recipe.analyzedInstructions[0].steps.map(step => step.step);
                    } else if (recipe.instructions) {
                        steps = recipe.instructions.split('\n').filter(step => step.trim());
                    }

                    // Construct proper image URL
                    let imageUrl = recipe.image;
                    if (!imageUrl) {
                        // Fallback image
                        imageUrl = isVeg
                            ? 'https://spoonacular.com/recipeImages/vegetarian-placeholder.jpg'
                            : 'https://spoonacular.com/recipeImages/non-vegetarian-placeholder.jpg';
                    } else if (!imageUrl.startsWith('http')) {
                        // Some Spoonacular image URLs might be relative
                        imageUrl = `https://spoonacular.com/recipeImages/${imageUrl}`;
                    }

                    return {
                        title: recipe.title,
                        ingredients: ingredientsList,
                        steps: steps,
                        time: `${recipe.readyInMinutes} mins`,
                        image: imageUrl, // Use the properly constructed URL
                        video: recipe.sourceUrl,
                        isVegetarian: recipe.vegetarian || false,
                        sourceUrl: recipe.sourceUrl
                    };
                });


                setGeneratedRecipes(formattedRecipes);
            } else {
                createMockRecipe();
            }
        } catch (error) {
            console.error('API Error:', error);
            createMockRecipe();
        } finally {
            setIsGenerating(false);
        }
    };

    // Updated mock recipe generator with cuisine support
    const createMockRecipe = () => {
        const isVeg = dietPreference === 'veg' ||
            (dietPreference === 'both' && Math.random() > 0.5);

        // Get selected cuisines or use a random one if none selected
        const selectedCuisines = cuisineOptions.filter(c => c.selected);
        const cuisine = selectedCuisines.length > 0
            ? selectedCuisines[Math.floor(Math.random() * selectedCuisines.length)].name
            : 'International';

        const protein = isVeg ? 'tofu' : 'chicken';
        const mockIngredients = [...ingredients, protein, 'spices', 'oil'];

        const mockRecipes = [{
            title: `${cuisine} ${isVeg ? 'Vegetarian' : ''} ${ingredients[0]} Dish`,
            ingredients: mockIngredients.map(ing => `1 cup ${ing}`),
            steps: [
                `Prepare all ${mockIngredients.length} ingredients`,
                `Heat oil and sauté ${ingredients[0]}`,
                isVeg ? 'Add tofu and vegetables' : 'Add chicken and cook until browned',
                'Add remaining ingredients',
                'Cook for 10-15 minutes',
                'Season to taste',
                'Serve hot'
            ],
            time: '25 mins',
            image: isVeg
                ? 'https://spoonacular.com/recipeImages/vegetarian-placeholder.jpg'
                : 'https://spoonacular.com/recipeImages/non-vegetarian-placeholder.jpg',
            isVegetarian: isVeg,
            sourceUrl: '#'
        }];

        setGeneratedRecipes(mockRecipes);
    };


    // Fallback recipe generator



    {
        isGenerating && (
            <div className="loading-recipes">
                <Loader2 className="spin" size={32} />
                <p>Generating delicious recipes...</p>
            </div>
        )
    }

    {
        !isGenerating && generatedRecipes.length === 0 && ingredients.length > 0 && (
            <p>No recipes generated yet. Click the button above!</p>
        )
    }

    // Animation controls (existing code remains the same)
    const controls = useAnimation();
    const [ref, inView] = useInView({
        threshold: 0.2,
        triggerOnce: true
    });

    useEffect(() => {
        if (inView) {
            controls.start('visible');
        }
    }, [controls, inView]);

    // 3D Fridge animation ref (existing code remains the same)
    const fridgeRef = useRef(null);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!fridgeRef.current) return;

            const rect = fridgeRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const tiltX = (x - centerX) / centerX * 10;
            const tiltY = (y - centerY) / centerY * 10;

            fridgeRef.current.style.transform = `perspective(1000px) rotateX(${-tiltY}deg) rotateY(${tiltX}deg)`;
        };

        const fridgeElement = fridgeRef.current;
        if (fridgeElement) {
            fridgeElement.addEventListener('mousemove', handleMouseMove);

            return () => {
                fridgeElement.removeEventListener('mousemove', handleMouseMove);
            };
        }
    }, []);

    // Testimonials data (existing code remains the same)
    const testimonials = [
        {
            name: "Sarah Johnson",
            photo: "/api/placeholder/64/64",
            text: "This app transformed how I cook! I never waste ingredients anymore and have discovered amazing recipes."
        },
        {
            name: "David Chen",
            photo: "/api/placeholder/64/64",
            text: "As someone with dietary restrictions, this app has been a lifesaver. It always suggests perfect alternatives!"
        },
        {
            name: "Maya Williams",
            photo: "/api/placeholder/64/64",
            text: "I've saved so much money on groceries since I started using this. No more throwing away unused food!"
        }
    ];

    // Features data (updated with AI features)
    const features = [
        {
            icon: <ChefHat size={32} />,
            title: "AI Recipe Personalization",
            description: "Our AI learns your taste preferences and suggests recipes you'll love"
        },
        {
            icon: <Filter size={32} />,
            title: "Dietary Filters",
            description: "Easily filter by vegan, keto, gluten-free, and other dietary needs"
        },
        {
            icon: <Heart size={32} />,
            title: "Save & Share Favorites",
            description: "Keep track of your favorite recipes and share with friends and family"
        },
        {
            icon: <Book size={32} />,
            title: "Meal Planning",
            description: "Plan your meals for the week based on what's in your fridge"
        }
    ];

    // Variants for animations (existing code remains the same)
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5
            }
        }
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
    return (
        <div className={`homepage-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
            {/* Hero Section (existing code remains the same) */}
            <section className="homepage-hero-section">
                <div className="homepage-hero-content">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="homepage-hero-title"
                    >
                        Turn Your Fridge Into a 5-Star Kitchen
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="homepage-hero-subtitle"
                    >
                        Discover delicious recipes tailored to your available ingredients with AI-powered suggestions
                    </motion.p>
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="homepage-cta-button"
                        onClick={handleGetStarted}
                    >
                        Get Started
                    </motion.button>
                </div>
                <div className="recipe-app__hero-visual-container">
                    <div className="recipe-app__ingredient-orbits">
                        <div className="recipe-app__ai-core">
                            <div className="recipe-app__ai-pulse"></div>
                            <div className="recipe-app__ai-icon">AI</div>
                        </div>
                        <div className="recipe-app__orbit recipe-app__orbit--first">
                            <div className="recipe-app__ingredient recipe-app__ingredient--veg" data-name="Tomato"></div>
                            <div className="recipe-app__ingredient recipe-app__ingredient--protein" data-name="Chicken"></div>
                            <div className="recipe-app__ingredient recipe-app__ingredient--grain" data-name="Pasta"></div>
                        </div>
                        <div className="recipe-app__orbit recipe-app__orbit--second">
                            <div className="recipe-app__ingredient recipe-app__ingredient--dairy" data-name="Cheese"></div>
                            <div className="recipe-app__ingredient recipe-app__ingredient--spice" data-name="Basil"></div>
                            <div className="recipe-app__ingredient recipe-app__ingredient--fruit" data-name="Lemon"></div>
                            <div className="recipe-app__ingredient recipe-app__ingredient--oil" data-name="Olive Oil"></div>
                        </div>
                    </div>
                    <div className="recipe-app__recipe-cards">
                        <div className="recipe-app__recipe-card recipe-app__recipe-card--pasta">
                            <div className="recipe-app__recipe-card-title">Pasta Primavera</div>
                        </div>
                        <div className="recipe-app__recipe-card recipe-app__recipe-card--curry">
                            <div className="recipe-app__recipe-card-title">Chicken Curry</div>
                        </div>
                        <div className="recipe-app__recipe-card recipe-app__recipe-card--salad">
                            <div className="recipe-app__recipe-card-title">Mediterranean Salad</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section (existing code remains the same) */}
            <section className="homepage-how-it-works">
                <h2 className="homepage-section-title">How It Works</h2>
                <motion.div
                    ref={ref}
                    variants={containerVariants}
                    initial="hidden"
                    animate={controls}
                    className="homepage-steps-container"
                >
                    <motion.div variants={itemVariants} className="homepage-step">
                        <div className="homepage-step-icon">
                            <Camera size={36} />
                        </div>
                        <h3>Step 1</h3>
                        <p>Add your ingredients or scan your fridge</p>
                    </motion.div>
                    <div className="homepage-step-arrow">→</div>
                    <motion.div variants={itemVariants} className="homepage-step">
                        <div className="homepage-step-icon">
                            <ChefHat size={36} />
                        </div>
                        <h3>Step 2</h3>
                        <p>AI suggests personalized recipes</p>
                    </motion.div>
                    <div className="homepage-step-arrow">→</div>
                    <motion.div variants={itemVariants} className="homepage-step">
                        <div className="homepage-step-icon">
                            <Utensils size={36} />
                        </div>
                        <h3>Step 3</h3>
                        <p>Cook & enjoy delicious meals</p>
                    </motion.div>
                </motion.div>
            </section>

            {/* Interactive Ingredients Section */}
            <section className="homepage-ingredients-section">
                <h2 className="homepage-section-title">Add Your Ingredients  </h2>
                <div className="preference-filters">
                    <div className="diet-filter">
                        <label>Diet Preference:</label>
                        <select
                            value={dietPreference}
                            onChange={(e) => setDietPreference(e.target.value)}
                        >
                            <option value="both">Both Vegetarian & Non-Veg</option>
                            <option value="veg">Vegetarian Only</option>
                            <option value="non-veg">Non-Vegetarian Only</option>
                        </select>
                    </div>

                    <div className="cuisine-filter">
                        <label>Cuisine Preferences:</label>
                        <div className="cuisine-checkboxes">
                            {cuisineOptions.map((cuisine) => (
                                <label key={cuisine.id} className="cuisine-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={cuisine.selected}
                                        onChange={() => toggleCuisine(cuisine.id)}
                                    />
                                    {cuisine.name}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="homepage-ingredients-input">
                    <input
                        type="text"
                        value={inputIngredient}
                        onChange={(e) => setInputIngredient(e.target.value)}
                        placeholder="Enter an ingredient (e.g., chicken, tomatoes)"
                        onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                    />
                    <button onClick={addIngredient}>Add</button>
                </div>

                {ingredients.length > 0 && (
                    <div className="homepage-ingredients-list">
                        <h3>Your Ingredients:</h3>
                        <div className="ingredients-tags">
                            {ingredients.map((ingredient, index) => (
                                <div key={index} className="ingredient-tag">
                                    {ingredient}
                                    <button onClick={() => removeIngredient(ingredient)}>×</button>
                                </div>
                            ))}
                        </div>
                        <button
                            className="homepage-cta-button generate-button"
                            onClick={generateRecipes}
                            disabled={isGenerating}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="spin" size={18} /> Generating...
                                </>
                            ) : (
                                'Generate Recipes'
                            )}
                        </button>
                    </div>
                )}
            </section>

            {/* Generated Recipes Section */}
            {generatedRecipes.length > 0 && (
                <section className="homepage-recipes-section">
                    <h2 className="homepage-section-title">AI-Generated Recipes</h2>
                    <div className="recipes-grid">
                        {generatedRecipes.map((recipe, index) => (
                            <div className="apt-recipe-card" key={index}>
                                {recipe.image && (
                                    <div className="apt-recipe-image-container">
                                        <img
                                            src={recipe.image}
                                            alt={recipe.title}
                                            className="apt-recipe-image"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "https://spoonacular.com/recipeImages/placeholder.png"
                                            }}
                                        />
                                        {recipe.video && (
                                            <a href={recipe.video} target="_blank" rel="noopener" className="apt-recipe-video-btn">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                                    <polyline points="15 3 21 3 21 9"></polyline>
                                                    <line x1="10" y1="14" x2="21" y2="3"></line>
                                                </svg>
                                            </a>
                                        )}
                                    </div>
                                )}
                                <div className="apt-recipe-content">
                                    <h3 className="apt-recipe-title">{recipe.title}</h3>
                                    <div className="apt-recipe-actions">
                                        <button
                                            className={`apt-recipe-action-btn ${savedRecipes.includes(index) ? 'saved' : ''}`}
                                            onClick={() => handleSaveRecipe(recipe, index)}
                                        >
                                            <Book size={16} /> {savedRecipes.includes(index) ? 'Unsave' : 'Save'}
                                        </button>
                                        <button
                                            className={`apt-recipe-action-btn ${likedRecipes.includes(index) ? 'liked' : ''}`}
                                            onClick={() => handleLikeRecipe(recipe, index)}
                                        >
                                            <Heart size={16} fill={likedRecipes.includes(index) ? 'red' : 'none'} />
                                            {likedRecipes.includes(index) ? 'Liked' : 'Like'}
                                        </button>
                                    </div>
                                    <div className="apt-recipe-meta">
                                        <span className="apt-recipe-time">
                                            <i className="far fa-clock"></i> {recipe.time}
                                        </span>
                                        <span className="apt-recipe-difficulty">
                                            <i className="fas fa-chart-line"></i> Medium
                                        </span>
                                        <span className="apt-recipe-servings">
                                            <i className="fas fa-utensils"></i> 4 servings
                                        </span>
                                    </div>

                                    <div className="apt-recipe-details">
                                        <div
                                            className={`apt-recipe-tab ${activeTab[index] !== 'instructions' ? 'apt-recipe-tab-active' : ''}`}
                                            onClick={() => handleTabChange(index, 'ingredients')}
                                        >
                                            <i className="fas fa-list"></i> Ingredients
                                        </div>
                                        <div
                                            className={`apt-recipe-tab ${activeTab[index] === 'instructions' ? 'apt-recipe-tab-active' : ''}`}
                                            onClick={() => handleTabChange(index, 'instructions')}
                                        >
                                            <i className="far fa-tasks"></i> Instructions
                                        </div>
                                    </div>

                                    <div className={`apt-recipe-panel ${activeTab[index] !== 'instructions' ? 'apt-recipe-panel-active' : ''}`}>
                                        <ul className="apt-ingredients-list">
                                            {recipe.ingredients.map((ing, i) => (
                                                <li key={i} className="apt-ingredient-item">
                                                    <i className="fas fa-check-circle"></i>
                                                    <span>{ing}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className={`apt-recipe-panel ${activeTab[index] === 'instructions' ? 'apt-recipe-panel-active' : ''}`}>
                                        <ol className="apt-instructions-list">
                                            {recipe.steps.map((step, i) => (
                                                <li key={i} className="apt-instruction-item">
                                                    <span className="apt-step-number">{i + 1}</span>
                                                    <p>{step}</p>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Features Section (existing code remains the same) */}
            <section className="homepage-features-section">
                <h2 className="homepage-section-title">Smart Features</h2>
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="homepage-features-grid"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="homepage-feature-card"
                        >
                            <div className="homepage-feature-icon">
                                {feature.icon}
                            </div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Testimonials Section (existing code remains the same) */}
            <section className="homepage-testimonials-section">
                <h2 className="homepage-section-title">What Our Users Say</h2>
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="homepage-testimonials-container"
                >
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="homepage-testimonial-card"
                        >
                            <div className="homepage-testimonial-stars">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} fill="#FFD700" color="#FFD700" />
                                ))}
                            </div>
                            <p className="homepage-testimonial-text">{testimonial.text}</p>
                            <div className="homepage-testimonial-author">
                                <img src={testimonial.photo} alt={testimonial.name} />
                                <span>{testimonial.name}</span>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Final CTA Section (existing code remains the same) */}
            <section className="homepage-final-cta">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="homepage-final-cta-content"
                >
                    <motion.h2 variants={itemVariants}>Ready to Transform Your Cooking Experience?</motion.h2>
                    <motion.p variants={itemVariants}>
                        Join thousands of users who have revolutionized their kitchen game with our AI-powered recipe suggestions
                    </motion.p>
                    <motion.button
                        variants={itemVariants}
                        className="homepage-cta-button"
                        onClick={handleGetStarted}
                    >
                        Get Started Now
                    </motion.button>
                </motion.div>
            </section>
        </div>
    );
};

export default HomePage;