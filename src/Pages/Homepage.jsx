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
    const [dietPreference, setDietPreference] = useState('both'); // 'veg', 'non-veg', 'both'

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
            const response = await fetch(
                `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredients[0]}`
            );

            if (!response.ok) throw new Error('API request failed');

            const data = await response.json();

            if (data.meals && data.meals.length > 0) {
                const recipeDetails = await Promise.all(
                    data.meals.slice(0, 5).map(meal =>
                        fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`)
                            .then(res => res.json())
                    )
                );

                const recipes = recipeDetails
                    .map(detail => {
                        const recipe = detail.meals[0];

                        // Check if recipe matches diet preference
                        const isVeg = !recipe.strMeal.toLowerCase().includes('chicken') &&
                            !recipe.strMeal.toLowerCase().includes('beef') &&
                            !recipe.strMeal.toLowerCase().includes('pork') &&
                            !recipe.strMeal.toLowerCase().includes('fish') &&
                            !recipe.strMeal.toLowerCase().includes('meat');

                        // Extract ingredients
                        const ingredientsList = [];
                        for (let i = 1; i <= 20; i++) {
                            const ingredient = recipe[`strIngredient${i}`];
                            const measure = recipe[`strMeasure${i}`];
                            if (ingredient && ingredient.trim() !== '') {
                                ingredientsList.push(`${measure || ''} ${ingredient}`.trim());
                            }
                        }

                        return {
                            title: recipe.strMeal,
                            ingredients: ingredientsList,
                            steps: recipe.strInstructions.split('\r\n').filter(step => step.trim()),
                            time: '30 mins',
                            image: recipe.strMealThumb,
                            video: recipe.strYoutube,
                            isVegetarian: isVeg
                        };
                    })
                    // Filter based on diet preference
                    .filter(recipe => {
                        if (dietPreference === 'both') return true;
                        if (dietPreference === 'veg') return recipe.isVegetarian;
                        if (dietPreference === 'non-veg') return !recipe.isVegetarian;
                        return true;
                    })
                    .slice(0, 3); // Limit to 3 recipes

                if (recipes.length > 0) {
                    setGeneratedRecipes(recipes);
                } else {
                    createMockRecipe();
                }
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
    // Mock recipe generator
    const createMockRecipe = () => {
        const isVeg = dietPreference === 'veg' ||
            (dietPreference === 'both' && Math.random() > 0.5);

        const protein = isVeg ? 'tofu' : 'chicken';
        const mockIngredients = [...ingredients, protein, 'spices', 'oil'];

        const mockRecipes = [{
            title: `${isVeg ? 'Vegetarian' : 'Non-Vegetarian'} ${ingredients[0]} Dish`,
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
                ? 'https://www.themealdb.com/images/media/meals/xxyupu1468262513.jpg'
                : 'https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg',
            isVegetarian: isVeg
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
                <div className="homepage-hero-image-container">
                    <div className="homepage-3d-fridge" ref={fridgeRef}>
                        <div className="fridge-door">
                            <div className="fridge-handle"></div>
                            <div className="fridge-contents">
                                <div className="fridge-item" style={{ top: '20%', left: '30%' }}></div>
                                <div className="fridge-item" style={{ top: '45%', left: '60%' }}></div>
                                <div className="fridge-item" style={{ top: '70%', left: '40%' }}></div>
                            </div>
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
                <h2 className="homepage-section-title">Add Your Ingredients</h2>
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
                            <div className="recipe-card">
                                {recipe.image && (
                                    <img src={recipe.image} alt={recipe.title} className="recipe-image" />
                                )}
                                <h3>{recipe.title}</h3>

                                <div className="recipe-meta">
                                    <span className="recipe-time">
                                        <Clock size={16} /> {recipe.time}
                                    </span>
                                    {recipe.video && (
                                        <a href={recipe.video} target="_blank" rel="noopener" className="recipe-video">
                                            <Youtube size={16} /> Watch Video
                                        </a>
                                    )}
                                </div>

                                <div className="recipe-ingredients">
                                    <h4>Ingredients:</h4>
                                    <ul>
                                        {recipe.ingredients.map((ing, i) => (
                                            <li key={i}>{ing}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="recipe-steps">
                                    <h4>Instructions:</h4>
                                    <ol>
                                        {recipe.steps.map((step, i) => (
                                            <li key={i}>{step}</li>
                                        ))}
                                    </ol>
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