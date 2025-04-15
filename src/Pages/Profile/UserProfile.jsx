import React, { useState, useContext, useEffect } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
    FaUser, FaUtensils, FaAlignLeft, FaHistory, FaCalendarAlt, FaShoppingBag,
    FaCog, FaSave, FaPlusCircle, FaMinusCircle, FaTrash, FaMoon, FaSun
} from 'react-icons/fa';

const UserProfile = () => {
    const { isDarkMode } = useContext(ThemeContext);
    const [activeTab, setActiveTab] = useState('personal');
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [notificationTiming, setNotificationTiming] = useState('morning');
    const [notificationFrequency, setNotificationFrequency] = useState('daily');


    // Form states for different sections
    const [personalInfo, setPersonalInfo] = useState({
        name: '',
        email: '',
        phoneNo: '',
        gender: '',
        dateOfBirth: '',
        state: '',
        country: ''
    });

    const [dietaryInfo, setDietaryInfo] = useState({
        dietaryRestrictions: [],
        allergies: [],
        dislikedIngredients: [''],
        cookingSkillLevel: 'intermediate'
    });

    const [cuisinesEquipment, setCuisinesEquipment] = useState({
        preferredCuisines: [''],
        equipmentAvailable: ['']
    });

    const [tasteProfileData, setTasteProfileData] = useState({
        preferredFlavors: [''],
        spiceTolerance: 3,
        preferredCookingTime: 30
    });

    const [notificationSettings, setNotificationSettings] = useState({
        email: {
            newRecipes: true,
            mealReminders: true,
            inventoryAlerts: true
        },
        push: {
            mealSuggestions: true
        }
    });

    const [inventoryItems, setInventoryItems] = useState([
        { name: '', category: 'vegetable', quantity: 1, unit: 'item', expirationDate: '' }
    ]);

    const [currentShoppingList, setCurrentShoppingList] = useState({
        name: 'My Shopping List',
        items: [{ name: '', quantity: 1, unit: 'item', purchased: false, category: 'vegetable' }]
    });

    const [mealPlanData, setMealPlanData] = useState({
        weekStart: new Date().toISOString().substr(0, 10),
        days: [
            {
                date: new Date().toISOString().substr(0, 10),
                meals: {
                    breakfast: '',
                    lunch: '',
                    dinner: '',
                    snacks: ['']
                }
            }
        ]
    });

    // Options for dropdowns
    const dietaryRestrictionOptions = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'halal', 'kosher', 'keto', 'paleo'];
    const skillLevelOptions = ['beginner', 'intermediate', 'advanced', 'chef'];
    const categoryOptions = ['vegetable', 'fruit', 'meat', 'dairy', 'grain', 'spice', 'other'];
    const flavorOptions = ['sweet', 'salty', 'sour', 'bitter', 'umami', 'spicy', 'savory', 'tangy', 'smoky', 'herbal'];
    const cuisineOptions = [
        'Italian', 'Mexican', 'Chinese', 'Indian', 'Japanese', 'Thai', 'French',
        'Greek', 'Spanish', 'Middle Eastern', 'Korean', 'Vietnamese', 'American',
        'Mediterranean', 'Caribbean', 'Brazilian', 'Moroccan', 'German', 'British'
    ];
    const equipmentOptions = [
        'Stove', 'Oven', 'Microwave', 'Blender', 'Food Processor', 'Slow Cooker',
        'Pressure Cooker', 'Air Fryer', 'Grill', 'Toaster Oven', 'Stand Mixer',
        'Rice Cooker', 'Sous Vide', 'Wok', 'Cast Iron Skillet', 'Dutch Oven'
    ];

    useEffect(() => {
        // Fetch user data
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('userToken');
                const response = await axios.get('/api/userProfile', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const userData = response.data;
                setUser(userData);

                // Populate form states with user data
                setPersonalInfo({
                    name: userData.name || '',
                    email: userData.email || '',
                    phoneNo: userData.phoneNo || '',
                    gender: userData.gender || '',
                    dateOfBirth: userData.dateOfBirth || '',
                    state: userData.state || '',
                    country: userData.country || 'India'
                });

                setDietaryInfo({
                    dietaryRestrictions: userData.dietaryRestrictions || [],
                    allergies: userData.allergies || [],
                    dislikedIngredients: userData.dislikedIngredients?.length ? userData.dislikedIngredients : [''],
                    cookingSkillLevel: userData.cookingSkillLevel || 'intermediate'
                });

                setCuisinesEquipment({
                    preferredCuisines: userData.preferredCuisines?.length ? userData.preferredCuisines : [''],
                    equipmentAvailable: userData.equipmentAvailable?.length ? userData.equipmentAvailable : ['']
                });

                if (userData.tasteProfile) {
                    setTasteProfileData({
                        preferredFlavors: userData.tasteProfile.preferredFlavors?.length ? userData.tasteProfile.preferredFlavors : [''],
                        spiceTolerance: userData.tasteProfile.spiceTolerance || 3,
                        preferredCookingTime: userData.tasteProfile.preferredCookingTime || 30
                    });
                }

                if (userData.notificationPreferences) {
                    setNotificationSettings(userData.notificationPreferences);
                }

                if (userData.inventory && userData.inventory.length > 0) {
                    setInventoryItems(userData.inventory.map(item => ({
                        ...item,
                        expirationDate: item.expirationDate ? new Date(item.expirationDate).toISOString().substr(0, 10) : ''
                    })));
                }

                if (userData.shoppingLists && userData.shoppingLists.length > 0) {
                    setCurrentShoppingList(userData.shoppingLists[0]);
                }

                if (userData.mealPlans && userData.mealPlans.length > 0) {
                    const mealPlan = userData.mealPlans[0];
                    setMealPlanData({
                        weekStart: new Date(mealPlan.weekStart).toISOString().substr(0, 10),
                        days: mealPlan.days.map(day => ({
                            date: new Date(day.date).toISOString().substr(0, 10),
                            meals: day.meals
                        }))
                    });
                }

                if (userData.userImage && userData.userImage.data) {
                    setImagePreview(userData.userImage.data);
                }

                setLoading(false);
            } catch (error) {
                console.error('Error fetching user data:', error);
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to load profile data',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileImageUpdate = async () => {
        if (!profileImage) return;

        try {
            setSaveLoading(true);
            const formData = new FormData();
            formData.append('profileImage', profileImage);

            const token = localStorage.getItem('userToken');
            await axios.post('/api/user/update-profile-image', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            Swal.fire({
                title: 'Success!',
                text: 'Profile image updated successfully',
                icon: 'success',
                confirmButtonText: 'OK'
            });
            setSaveLoading(false);
        } catch (error) {
            console.error('Error updating profile image:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update profile image',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            setSaveLoading(false);
        }
    };

    // Dynamic array field handlers
    const handleAddArrayItem = (setter, stateObj, field) => {
        setter({
            ...stateObj,
            [field]: [...stateObj[field], '']
        });
    };

    const handleRemoveArrayItem = (setter, stateObj, field, index) => {
        if (stateObj[field].length > 1) {
            const newArray = [...stateObj[field]];
            newArray.splice(index, 1);
            setter({
                ...stateObj,
                [field]: newArray
            });
        }
    };


    const handleArrayItemChange = (setter, stateObj, field, index, value) => {
        const newArray = [...stateObj[field]];
        newArray[index] = value;
        setter({
            ...stateObj,
            [field]: newArray
        });
    };

    // Inventory handlers
    const handleAddInventoryItem = () => {
        setInventoryItems([
            ...inventoryItems,
            { name: '', category: 'vegetable', quantity: 1, unit: 'item', expirationDate: '' }
        ]);
    };

    const handleRemoveInventoryItem = (index) => {
        if (inventoryItems.length > 1) {
            const newItems = [...inventoryItems];
            newItems.splice(index, 1);
            setInventoryItems(newItems);
        }
    };

    const handleInventoryItemChange = (index, field, value) => {
        const newItems = [...inventoryItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setInventoryItems(newItems);
    };

    // Shopping list handlers
    const handleAddShoppingItem = () => {
        setCurrentShoppingList({
            ...currentShoppingList,
            items: [
                ...currentShoppingList.items,
                { name: '', quantity: 1, unit: 'item', purchased: false, category: 'vegetable' }
            ]
        });
    };

    const handleRemoveShoppingItem = (index) => {
        if (currentShoppingList.items.length > 1) {
            const newItems = [...currentShoppingList.items];
            newItems.splice(index, 1);
            setCurrentShoppingList({
                ...currentShoppingList,
                items: newItems
            });
        }
    };

    const handleShoppingItemChange = (index, field, value) => {
        const newItems = [...currentShoppingList.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setCurrentShoppingList({
            ...currentShoppingList,
            items: newItems
        });
    };

    const handleShoppingListNameChange = (value) => {
        setCurrentShoppingList({
            ...currentShoppingList,
            name: value
        });
    };

    // Meal plan handlers
    const handleAddMealPlanDay = () => {
        const lastDate = new Date(mealPlanData.days[mealPlanData.days.length - 1].date);
        const nextDate = new Date(lastDate);
        nextDate.setDate(nextDate.getDate() + 1);

        setMealPlanData({
            ...mealPlanData,
            days: [
                ...mealPlanData.days,
                {
                    date: nextDate.toISOString().substr(0, 10),
                    meals: {
                        breakfast: '',
                        lunch: '',
                        dinner: '',
                        snacks: ['']
                    }
                }
            ]
        });
    };

    const handleRemoveMealPlanDay = (index) => {
        if (mealPlanData.days.length > 1) {
            const newDays = [...mealPlanData.days];
            newDays.splice(index, 1);
            setMealPlanData({
                ...mealPlanData,
                days: newDays
            });
        }
    };

    const handleMealPlanChange = (dayIndex, mealType, value) => {
        const newDays = [...mealPlanData.days];

        if (mealType !== 'snacks') {
            newDays[dayIndex].meals[mealType] = value;
        } else {
            // This would be for handling snack arrays if needed
        }

        setMealPlanData({
            ...mealPlanData,
            days: newDays
        });
    };

    const handleAddSnack = (dayIndex) => {
        const newDays = [...mealPlanData.days];
        newDays[dayIndex].meals.snacks.push('');

        setMealPlanData({
            ...mealPlanData,
            days: newDays
        });
    };

    const handleRemoveSnack = (dayIndex, snackIndex) => {
        if (mealPlanData.days[dayIndex].meals.snacks.length > 1) {
            const newDays = [...mealPlanData.days];
            newDays[dayIndex].meals.snacks.splice(snackIndex, 1);

            setMealPlanData({
                ...mealPlanData,
                days: newDays
            });
        }
    };

    const handleSnackChange = (dayIndex, snackIndex, value) => {
        const newDays = [...mealPlanData.days];
        newDays[dayIndex].meals.snacks[snackIndex] = value;

        setMealPlanData({
            ...mealPlanData,
            days: newDays
        });
    };

    // Submit handlers for each section
    const handlePersonalInfoSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaveLoading(true);
            const token = localStorage.getItem('userToken');
            await axios.post('/api/user/update-personal-info', personalInfo, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Swal.fire({
                title: 'Success!',
                text: 'Personal information updated successfully',
                icon: 'success',
                confirmButtonText: 'OK'
            });
            setSaveLoading(false);
        } catch (error) {
            console.error('Error updating personal info:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update personal information',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            setSaveLoading(false);
        }
    };

    const handleDietaryInfoSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaveLoading(true);
            const token = localStorage.getItem('userToken');
            await axios.post('/api/user/update-dietary-info', dietaryInfo, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Swal.fire({
                title: 'Success!',
                text: 'Dietary information updated successfully',
                icon: 'success',
                confirmButtonText: 'OK'
            });
            setSaveLoading(false);
        } catch (error) {
            console.error('Error updating dietary info:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update dietary information',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            setSaveLoading(false);
        }
    };

    const handleCuisinesEquipmentSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaveLoading(true);
            const token = localStorage.getItem('userToken');
            await axios.post('/api/user/update-cuisines-equipment', cuisinesEquipment, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Swal.fire({
                title: 'Success!',
                text: 'Cuisines and equipment information updated successfully',
                icon: 'success',
                confirmButtonText: 'OK'
            });
            setSaveLoading(false);
        } catch (error) {
            console.error('Error updating cuisines and equipment:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update cuisines and equipment information',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            setSaveLoading(false);
        }
    };

    const handleTasteProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaveLoading(true);
            const token = localStorage.getItem('userToken');
            await axios.post('/api/user/update-taste-profile', tasteProfileData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Swal.fire({
                title: 'Success!',
                text: 'Taste profile updated successfully',
                icon: 'success',
                confirmButtonText: 'OK'
            });
            setSaveLoading(false);
        } catch (error) {
            console.error('Error updating taste profile:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update taste profile',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            setSaveLoading(false);
        }
    };

    const handleNotificationSettingsSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaveLoading(true);
            const token = localStorage.getItem('userToken');
            await axios.post('/api/user/update-notification-settings', notificationSettings, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Swal.fire({
                title: 'Success!',
                text: 'Notification settings updated successfully',
                icon: 'success',
                confirmButtonText: 'OK'
            });
            setSaveLoading(false);
        } catch (error) {
            console.error('Error updating notification settings:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update notification settings',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            setSaveLoading(false);
        }
    };

    const handleInventorySubmit = async (e) => {
        e.preventDefault();
        try {
            setSaveLoading(true);
            const token = localStorage.getItem('userToken');
            await axios.post('/api/user/update-inventory', { inventory: inventoryItems }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Swal.fire({
                title: 'Success!',
                text: 'Inventory updated successfully',
                icon: 'success',
                confirmButtonText: 'OK'
            });
            setSaveLoading(false);
        } catch (error) {
            console.error('Error updating inventory:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update inventory',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            setSaveLoading(false);
        }
    };

    const handleShoppingListSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaveLoading(true);
            const token = localStorage.getItem('userToken');
            await axios.post('/api/user/update-shopping-list', { shoppingList: currentShoppingList }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Swal.fire({
                title: 'Success!',
                text: 'Shopping list updated successfully',
                icon: 'success',
                confirmButtonText: 'OK'
            });
            setSaveLoading(false);
        } catch (error) {
            console.error('Error updating shopping list:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update shopping list',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            setSaveLoading(false);
        }
    };

    const handleMealPlanSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaveLoading(true);
            const token = localStorage.getItem('userToken');
            await axios.post('/api/user/update-meal-plan', { mealPlan: mealPlanData }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Swal.fire({
                title: 'Success!',
                text: 'Meal plan updated successfully',
                icon: 'success',
                confirmButtonText: 'OK'
            });
            setSaveLoading(false);
        } catch (error) {
            console.error('Error updating meal plan:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update meal plan',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            setSaveLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={`profile_app_loading ${isDarkMode ? 'profile_app_dark' : 'profile_app_light'}`}>
                <div className="profile_app_loading_spinner"></div>
                <p>Loading your profile...</p>
            </div>
        );
    }

    return (
        <div className={`profile_app_container ${isDarkMode ? 'profile_app_dark' : 'profile_app_light'}`}>
            <div className="profile_app_sidebar">
                <div className="profile_app_user_card">
                    <div className="profile_app_user_image_container">
                        {imagePreview ? (
                            <img
                                src={imagePreview}
                                alt="Profile"
                                className="profile_app_user_image"
                            />
                        ) : (
                            <div className="profile_app_user_image_placeholder">
                                <FaUser />
                            </div>
                        )}
                        <label htmlFor="profile_app_image_upload" className="profile_app_image_upload_label">
                            <span>Change Photo</span>
                        </label>
                        <input
                            type="file"
                            id="profile_app_image_upload"
                            className="profile_app_image_upload"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        {profileImage && (
                            <button
                                className="profile_app_save_image_btn"
                                onClick={handleProfileImageUpdate}
                                disabled={saveLoading}
                            >
                                {saveLoading ? 'Saving...' : 'Save Photo'}
                            </button>
                        )}
                    </div>
                    <h2 className="profile_app_user_name">{user?.name || 'User'}</h2>
                    <p className="profile_app_user_email">{user?.email || 'user@example.com'}</p>
                    <p className="profile_app_user_joined">
                        Joined: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                    </p>
                </div>

                <nav className="profile_app_nav">
                    <button
                        className={`profile_app_nav_item ${activeTab === 'personal' ? 'profile_app_active' : ''}`}
                        onClick={() => setActiveTab('personal')}
                    >
                        <FaUser className="profile_app_nav_icon" />
                        <span>Personal Info</span>
                    </button>
                    <button
                        className={`profile_app_nav_item ${activeTab === 'dietary' ? 'profile_app_active' : ''}`}
                        onClick={() => setActiveTab('dietary')}
                    >
                        <FaUtensils className="profile_app_nav_icon" />
                        <span>Dietary Preferences</span>
                    </button>
                    <button
                        className={`profile_app_nav_item ${activeTab === 'cuisines' ? 'profile_app_active' : ''}`}
                        onClick={() => setActiveTab('cuisines')}
                    >
                        <FaAlignLeft className="profile_app_nav_icon" />
                        <span>Cuisines & Equipment</span>
                    </button>
                    <button
                        className={`profile_app_nav_item ${activeTab === 'inventory' ? 'profile_app_active' : ''}`}
                        onClick={() => setActiveTab('inventory')}
                    >
                        <FaHistory className="profile_app_nav_icon" />
                        <span>My Inventory</span>
                    </button>
                    <button
                        className={`profile_app_nav_item ${activeTab === 'mealplan' ? 'profile_app_active' : ''}`}
                        onClick={() => setActiveTab('mealplan')}
                    >
                        <FaCalendarAlt className="profile_app_nav_icon" />
                        <span>Meal Planning</span>
                    </button>
                    <button
                        className={`profile_app_nav_item ${activeTab === 'shopping' ? 'profile_app_active' : ''}`}
                        onClick={() => setActiveTab('shopping')}
                    >
                        <FaShoppingBag className="profile_app_nav_icon" />
                        <span>Shopping Lists</span>
                    </button>
                    <button
                        className={`profile_app_nav_item ${activeTab === 'taste' ? 'profile_app_active' : ''}`}
                        onClick={() => setActiveTab('taste')}
                    >
                        <FaUtensils className="profile_app_nav_icon" />
                        <span>Taste Profile</span>
                    </button>
                    <button
                        className={`profile_app_nav_item ${activeTab === 'notifications' ? 'profile_app_active' : ''}`}
                        onClick={() => setActiveTab('notifications')}
                    >
                        <FaCog className="profile_app_nav_icon" />
                        <span>Notifications</span>
                    </button>
                </nav>

               
            </div>

            <div className="profile_app_content">
                <div className="profile_app_content_header">
                    <h1>
                        {activeTab === 'personal' && 'Personal Information'}
                        {activeTab === 'dietary' && 'Dietary Preferences'}
                        {activeTab === 'cuisines' && 'Cuisines & Equipment'}
                        {activeTab === 'inventory' && 'My Inventory'}
                        {activeTab === 'mealplan' && 'Meal Planning'}
                        {activeTab === 'shopping' && 'Shopping Lists'}
                        {activeTab === 'taste' && 'Taste Profile'}
                        {activeTab === 'notifications' && 'Notification Settings'}
                    </h1>
                </div>

                <div className="profile_app_content_body">
                    {/* Personal Information Tab */}
                    {activeTab === 'personal' && (
                        <form className="profile_app_form" onSubmit={handlePersonalInfoSubmit}>
                            <div className="profile_app_form_group">
                                <label className="profile_app_form_label" htmlFor="profile_app_name">Full Name</label>
                                <input
                                    id="profile_app_name"
                                    type="text"
                                    className="profile_app_form_input"
                                    value={personalInfo.name}
                                    onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                                    placeholder="Your full name"
                                />
                            </div>

                            <div className="profile_app_form_group">
                                <label className="profile_app_form_label" htmlFor="profile_app_email">Email Address</label>
                                <input
                                    id="profile_app_email"
                                    type="email"
                                    className="profile_app_form_input"
                                    value={personalInfo.email}
                                    onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                                    placeholder="Your email address"
                                    readOnly
                                />
                                <small className="profile_app_form_help">Email address cannot be changed</small>
                            </div>

                            <div className="profile_app_form_row">
                                <div className="profile_app_form_group">
                                    <label className="profile_app_form_label" htmlFor="profile_app_phone">Phone Number</label>
                                    <input
                                        id="profile_app_phone"
                                        type="tel"
                                        className="profile_app_form_input"
                                        value={personalInfo.phoneNo}
                                        onChange={(e) => setPersonalInfo({ ...personalInfo, phoneNo: e.target.value })}
                                        placeholder="Your phone number"
                                    />
                                </div>

                                <div className="profile_app_form_group">
                                    <label className="profile_app_form_label" htmlFor="profile_app_gender">Gender</label>
                                    <select
                                        id="profile_app_gender"
                                        className="profile_app_form_select"
                                        value={personalInfo.gender}
                                        onChange={(e) => setPersonalInfo({ ...personalInfo, gender: e.target.value })}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                        <option value="Prefer not to say">Prefer not to say</option>
                                    </select>
                                </div>
                            </div>
                            <div className="profile_app_form_row">
                                <div className="profile_app_form_group">
                                    <label className="profile_app_form_label" htmlFor="profile_app_dob">Date of Birth</label>
                                    <input
                                        id="profile_app_dob"
                                        type="date"
                                        className="profile_app_form_input"
                                        value={personalInfo.dateOfBirth}
                                        onChange={(e) => setPersonalInfo({ ...personalInfo, dateOfBirth: e.target.value })}
                                    />
                                </div>

                                <div className="profile_app_form_group">
                                    <label className="profile_app_form_label" htmlFor="profile_app_state">State</label>
                                    <input
                                        id="profile_app_state"
                                        type="text"
                                        className="profile_app_form_input"
                                        value={personalInfo.state}
                                        onChange={(e) => setPersonalInfo({ ...personalInfo, state: e.target.value })}
                                        placeholder="Your state"
                                    />
                                </div>
                            </div>

                            <div className="profile_app_form_group">
                                <label className="profile_app_form_label" htmlFor="profile_app_country">Country</label>
                                <input
                                    id="profile_app_country"
                                    type="text"
                                    className="profile_app_form_input"
                                    value={personalInfo.country}
                                    onChange={(e) => setPersonalInfo({ ...personalInfo, country: e.target.value })}
                                    placeholder="Your country"
                                />
                            </div>

                            <div className="profile_app_form_actions">
                                <button type="submit" className="profile_app_btn profile_app_btn_primary" disabled={saveLoading}>
                                    {saveLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Dietary Preferences Tab */}
                    {activeTab === 'dietary' && (

                        <form className="profile_app_form" onSubmit={handleDietaryInfoSubmit}>
                            <div className="profile_app_form_group">
                                <label className="profile_app_form_label">Dietary Restrictions</label>
                                <div className="profile_app_checkbox_group">
                                    {dietaryRestrictionOptions.map((option) => (
                                        <label key={option} className="profile_app_checkbox_label">
                                            <input
                                                type="checkbox"
                                                className="profile_app_checkbox"
                                                checked={dietaryInfo.dietaryRestrictions.includes(option)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setDietaryInfo({
                                                            ...dietaryInfo,
                                                            dietaryRestrictions: [...dietaryInfo.dietaryRestrictions, option]
                                                        });
                                                    } else {
                                                        setDietaryInfo({
                                                            ...dietaryInfo,
                                                            dietaryRestrictions: dietaryInfo.dietaryRestrictions.filter(item => item !== option)
                                                        });
                                                    }
                                                }}
                                            />
                                            <span className="profile_app_checkbox_text">{option.charAt(0).toUpperCase() + option.slice(1)}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="profile_app_form_group">
                                <label className="profile_app_form_label">Allergies</label>
                                <div className="profile_app_array_input_container">
                                    {dietaryInfo.allergies.map((allergy, index) => (
                                        <div key={index} className="profile_app_array_input_row">
                                            <input
                                                type="text"
                                                className="profile_app_form_input"
                                                value={allergy}
                                                onChange={(e) => handleArrayItemChange(setDietaryInfo, dietaryInfo, 'allergies', index, e.target.value)}
                                                placeholder="Enter an allergy"
                                            />
                                            <button
                                                type="button"
                                                className="profile_app_btn profile_app_btn_icon profile_app_btn_danger"
                                                onClick={() => handleRemoveArrayItem(setDietaryInfo, dietaryInfo, 'allergies', index)}
                                            >
                                                <FaMinusCircle />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        className="profile_app_btn profile_app_btn_secondary profile_app_btn_add"
                                        onClick={() => handleAddArrayItem(setDietaryInfo, dietaryInfo, 'allergies')}
                                    >
                                        <FaPlusCircle /> Add Allergy
                                    </button>
                                </div>
                            </div>

                            <div className="profile_app_form_group">
                                <label className="profile_app_form_label">Disliked Ingredients</label>
                                <div className="profile_app_array_input_container">
                                    {dietaryInfo.dislikedIngredients.map((ingredient, index) => (
                                        <div key={index} className="profile_app_array_input_row">
                                            <input
                                                type="text"
                                                className="profile_app_form_input"
                                                value={ingredient}
                                                onChange={(e) => handleArrayItemChange(setDietaryInfo, dietaryInfo, 'dislikedIngredients', index, e.target.value)}
                                                placeholder="Enter a disliked ingredient"
                                            />
                                            <button
                                                type="button"
                                                className="profile_app_btn profile_app_btn_icon profile_app_btn_danger"
                                                onClick={() => handleRemoveArrayItem(setDietaryInfo, dietaryInfo, 'dislikedIngredients', index)}
                                            >
                                                <FaMinusCircle />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        className="profile_app_btn profile_app_btn_secondary profile_app_btn_add"
                                        onClick={() => handleAddArrayItem(setDietaryInfo, dietaryInfo, 'dislikedIngredients')}
                                    >
                                        <FaPlusCircle /> Add Disliked Ingredient
                                    </button>
                                </div>
                            </div>

                            <div className="profile_app_form_group">
                                <label className="profile_app_form_label" htmlFor="profile_app_skill_level">Cooking Skill Level</label>
                                <select
                                    id="profile_app_skill_level"
                                    className="profile_app_form_select"
                                    value={dietaryInfo.cookingSkillLevel}
                                    onChange={(e) => setDietaryInfo({ ...dietaryInfo, cookingSkillLevel: e.target.value })}
                                >
                                    {skillLevelOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option.charAt(0).toUpperCase() + option.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="profile_app_form_actions">
                                <button type="submit" className="profile_app_btn profile_app_btn_primary" disabled={saveLoading}>
                                    {saveLoading ? 'Saving...' : 'Save Dietary Preferences'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Cuisines & Equipment Tab */}
                    {activeTab === 'cuisines' && (
                        <form className="profile_app_form" onSubmit={handleCuisinesEquipmentSubmit}>
                            <div className="profile_app_form_group">
                                <label className="profile_app_form_label">Preferred Cuisines</label>
                                <div className="profile_app_array_input_container">
                                    {cuisinesEquipment.preferredCuisines.map((cuisine, index) => (
                                        <div key={index} className="profile_app_array_input_row">
                                            <select
                                                className="profile_app_form_select"
                                                value={cuisine}
                                                onChange={(e) => handleArrayItemChange(setCuisinesEquipment, cuisinesEquipment, 'preferredCuisines', index, e.target.value)}
                                            >
                                                <option value="">Select a cuisine</option>
                                                {cuisineOptions.map((option) => (
                                                    <option key={option} value={option}>
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                className="profile_app_btn profile_app_btn_icon profile_app_btn_danger"
                                                onClick={() => handleRemoveArrayItem(setCuisinesEquipment, cuisinesEquipment, 'preferredCuisines', index)}
                                            >
                                                <FaMinusCircle />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        className="profile_app_btn profile_app_btn_secondary profile_app_btn_add"
                                        onClick={() => handleAddArrayItem(setCuisinesEquipment, cuisinesEquipment, 'preferredCuisines')}
                                    >
                                        <FaPlusCircle /> Add Cuisine
                                    </button>
                                </div>
                            </div>

                            <div className="profile_app_form_group">
                                <label className="profile_app_form_label">Equipment Available</label>
                                <div className="profile_app_array_input_container">
                                    {cuisinesEquipment.equipmentAvailable.map((equipment, index) => (
                                        <div key={index} className="profile_app_array_input_row">
                                            <select
                                                className="profile_app_form_select"
                                                value={equipment}
                                                onChange={(e) => handleArrayItemChange(setCuisinesEquipment, cuisinesEquipment, 'equipmentAvailable', index, e.target.value)}
                                            >
                                                <option value="">Select equipment</option>
                                                {equipmentOptions.map((option) => (
                                                    <option key={option} value={option}>
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                className="profile_app_btn profile_app_btn_icon profile_app_btn_danger"
                                                onClick={() => handleRemoveArrayItem(setCuisinesEquipment, cuisinesEquipment, 'equipmentAvailable', index)}
                                            >
                                                <FaMinusCircle />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        className="profile_app_btn profile_app_btn_secondary profile_app_btn_add"
                                        onClick={() => handleAddArrayItem(setCuisinesEquipment, cuisinesEquipment, 'equipmentAvailable')}
                                    >
                                        <FaPlusCircle /> Add Equipment
                                    </button>
                                </div>
                            </div>

                            <div className="profile_app_form_actions">
                                <button type="submit" className="profile_app_btn profile_app_btn_primary" disabled={saveLoading}>
                                    {saveLoading ? 'Saving...' : 'Save Cuisines & Equipment'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Inventory Tab */}
                    {activeTab === 'inventory' && (
                        <form className="profile_app_form" onSubmit={handleInventorySubmit}>
                            <div className="profile_app_inventory_header">
                                <h2>My Kitchen Inventory</h2>
                                <p>Keep track of ingredients you have on hand for recipe suggestions</p>
                            </div>

                            <div className="profile_app_inventory_container">
                                {inventoryItems.map((item, index) => (
                                    <div key={index} className="profile_app_inventory_item">
                                        <div className="profile_app_inventory_item_header">
                                            <h3>Item {index + 1}</h3>
                                            <button
                                                type="button"
                                                className="profile_app_btn profile_app_btn_icon profile_app_btn_danger"
                                                onClick={() => handleRemoveInventoryItem(index)}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>

                                        <div className="profile_app_form_row">
                                            <div className="profile_app_form_group">
                                                <label className="profile_app_form_label">Item Name</label>
                                                <input
                                                    type="text"
                                                    className="profile_app_form_input"
                                                    value={item.name}
                                                    onChange={(e) => handleInventoryItemChange(index, 'name', e.target.value)}
                                                    placeholder="Ingredient name"
                                                />
                                            </div>

                                            <div className="profile_app_form_group">
                                                <label className="profile_app_form_label">Category</label>
                                                <select
                                                    className="profile_app_form_select"
                                                    value={item.category}
                                                    onChange={(e) => handleInventoryItemChange(index, 'category', e.target.value)}
                                                >
                                                    {categoryOptions.map((option) => (
                                                        <option key={option} value={option}>
                                                            {option.charAt(0).toUpperCase() + option.slice(1)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="profile_app_form_row">
                                            <div className="profile_app_form_group">
                                                <label className="profile_app_form_label">Quantity</label>
                                                <input
                                                    type="number"
                                                    className="profile_app_form_input"
                                                    value={item.quantity}
                                                    onChange={(e) => handleInventoryItemChange(index, 'quantity', parseInt(e.target.value))}
                                                    min="1"
                                                />
                                            </div>

                                            <div className="profile_app_form_group">
                                                <label className="profile_app_form_label">Unit</label>
                                                <input
                                                    type="text"
                                                    className="profile_app_form_input"
                                                    value={item.unit}
                                                    onChange={(e) => handleInventoryItemChange(index, 'unit', e.target.value)}
                                                    placeholder="e.g., grams, pieces"
                                                />
                                            </div>
                                        </div>

                                        <div className="profile_app_form_group">
                                            <label className="profile_app_form_label">Expiration Date</label>
                                            <input
                                                type="date"
                                                className="profile_app_form_input"
                                                value={item.expirationDate}
                                                onChange={(e) => handleInventoryItemChange(index, 'expirationDate', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    className="profile_app_btn profile_app_btn_secondary profile_app_btn_add"
                                    onClick={handleAddInventoryItem}
                                >
                                    <FaPlusCircle /> Add New Inventory Item
                                </button>
                            </div>

                            <div className="profile_app_form_actions">
                                <button type="submit" className="profile_app_btn profile_app_btn_primary" disabled={saveLoading}>
                                    {saveLoading ? 'Saving...' : 'Save Inventory'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Meal Planning Tab */}
                    {activeTab === 'mealplan' && (
                        <form className="profile_app_form" onSubmit={handleMealPlanSubmit}>
                            <div className="profile_app_meal_plan_header">
                                <h2>My Meal Plan</h2>
                                <p>Organize your meals for the week</p>
                            </div>

                            <div className="profile_app_form_group">
                                <label className="profile_app_form_label" htmlFor="profile_app_week_start">Week Starting</label>
                                <input
                                    id="profile_app_week_start"
                                    type="date"
                                    className="profile_app_form_input"
                                    value={mealPlanData.weekStart}
                                    onChange={(e) => setMealPlanData({ ...mealPlanData, weekStart: e.target.value })}
                                />
                            </div>

                            <div className="profile_app_meal_plan_container">
                                {mealPlanData.days.map((day, dayIndex) => (
                                    <div key={dayIndex} className="profile_app_meal_plan_day">
                                        <div className="profile_app_meal_plan_day_header">
                                            <h3>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h3>
                                            <button
                                                type="button"
                                                className="profile_app_btn profile_app_btn_icon profile_app_btn_danger"
                                                onClick={() => handleRemoveMealPlanDay(dayIndex)}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>

                                        <div className="profile_app_form_group">
                                            <label className="profile_app_form_label">Date</label>
                                            <input
                                                type="date"
                                                className="profile_app_form_input"
                                                value={day.date}
                                                onChange={(e) => {
                                                    const newDays = [...mealPlanData.days];
                                                    newDays[dayIndex].date = e.target.value;
                                                    setMealPlanData({ ...mealPlanData, days: newDays });
                                                }}
                                            />
                                        </div>

                                        <div className="profile_app_form_group">
                                            <label className="profile_app_form_label">Breakfast</label>
                                            <input
                                                type="text"
                                                className="profile_app_form_input"
                                                value={day.meals.breakfast}
                                                onChange={(e) => handleMealPlanChange(dayIndex, 'breakfast', e.target.value)}
                                                placeholder="Enter breakfast"
                                            />
                                        </div>

                                        <div className="profile_app_form_group">
                                            <label className="profile_app_form_label">Lunch</label>
                                            <input
                                                type="text"
                                                className="profile_app_form_input"
                                                value={day.meals.lunch}
                                                onChange={(e) => handleMealPlanChange(dayIndex, 'lunch', e.target.value)}
                                                placeholder="Enter lunch"
                                            />
                                        </div>

                                        <div className="profile_app_form_group">
                                            <label className="profile_app_form_label">Dinner</label>
                                            <input
                                                type="text"
                                                className="profile_app_form_input"
                                                value={day.meals.dinner}
                                                onChange={(e) => handleMealPlanChange(dayIndex, 'dinner', e.target.value)}
                                                placeholder="Enter dinner"
                                            />
                                        </div>

                                        <div className="profile_app_form_group">
                                            <label className="profile_app_form_label">Snacks</label>
                                            <div className="profile_app_array_input_container">
                                                {day.meals.snacks.map((snack, snackIndex) => (
                                                    <div key={snackIndex} className="profile_app_array_input_row">
                                                        <input
                                                            type="text"
                                                            className="profile_app_form_input"
                                                            value={snack}
                                                            onChange={(e) => handleSnackChange(dayIndex, snackIndex, e.target.value)}
                                                            placeholder="Enter snack"
                                                        />
                                                        <button
                                                            type="button"
                                                            className="profile_app_btn profile_app_btn_icon profile_app_btn_danger"
                                                            onClick={() => handleRemoveSnack(dayIndex, snackIndex)}
                                                        >
                                                            <FaMinusCircle />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    className="profile_app_btn profile_app_btn_secondary profile_app_btn_add"
                                                    onClick={() => handleAddSnack(dayIndex)}
                                                >
                                                    <FaPlusCircle /> Add Snack
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    className="profile_app_btn profile_app_btn_secondary profile_app_btn_add"
                                    onClick={handleAddMealPlanDay}
                                >
                                    <FaPlusCircle /> Add Day
                                </button>
                            </div>

                            <div className="profile_app_form_actions">
                                <button type="submit" className="profile_app_btn profile_app_btn_primary" disabled={saveLoading}>
                                    {saveLoading ? 'Saving...' : 'Save Meal Plan'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Shopping Lists Tab */}
                    {activeTab === 'shopping' && (
                        <form className="profile_app_form" onSubmit={handleShoppingListSubmit}>
                            <div className="profile_app_shopping_list_header">
                                <div className="profile_app_form_group">
                                    <label className="profile_app_form_label" htmlFor="profile_app_shopping_list_name">Shopping List Name</label>
                                    <input
                                        id="profile_app_shopping_list_name"
                                        type="text"
                                        className="profile_app_form_input"
                                        value={currentShoppingList.name}
                                        onChange={(e) => handleShoppingListNameChange(e.target.value)}
                                        placeholder="Name your shopping list"
                                    />
                                </div>
                            </div>

                            <div className="profile_app_shopping_list_container">
                                {currentShoppingList.items.map((item, index) => (
                                    <div key={index} className="profile_app_shopping_list_item">
                                        <div className="profile_app_shopping_item_row">
                                            <div className="profile_app_form_group profile_app_shopping_item_name">
                                                <label className="profile_app_form_label">Item</label>
                                                <input
                                                    type="text"
                                                    className="profile_app_form_input"
                                                    value={item.name}
                                                    onChange={(e) => handleShoppingItemChange(index, 'name', e.target.value)}
                                                    placeholder="Item name"
                                                />
                                            </div>

                                            <div className="profile_app_form_group profile_app_shopping_item_quantity">
                                                <label className="profile_app_form_label">Qty</label>
                                                <input
                                                    type="number"
                                                    className="profile_app_form_input"
                                                    value={item.quantity}
                                                    onChange={(e) => handleShoppingItemChange(index, 'quantity', parseInt(e.target.value))}
                                                    min="1"
                                                />
                                            </div>

                                            <div className="profile_app_form_group profile_app_shopping_item_unit">
                                                <label className="profile_app_form_label">Unit</label>
                                                <input
                                                    type="text"
                                                    className="profile_app_form_input"
                                                    value={item.unit}
                                                    onChange={(e) => handleShoppingItemChange(index, 'unit', e.target.value)}
                                                    placeholder="e.g., grams"
                                                />
                                            </div>

                                            <div className="profile_app_form_group profile_app_shopping_item_category">
                                                <label className="profile_app_form_label">Category</label>
                                                <select
                                                    className="profile_app_form_select"
                                                    value={item.category}
                                                    onChange={(e) => handleShoppingItemChange(index, 'category', e.target.value)}
                                                >
                                                    {categoryOptions.map((option) => (
                                                        <option key={option} value={option}>
                                                            {option.charAt(0).toUpperCase() + option.slice(1)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="profile_app_form_group profile_app_shopping_item_purchased">
                                                <label className="profile_app_form_label">Purchased</label>
                                                <div className="profile_app_switch_container">
                                                    <label className="profile_app_switch">
                                                        <input
                                                            type="checkbox"
                                                            checked={item.purchased}
                                                            onChange={(e) => handleShoppingItemChange(index, 'purchased', e.target.checked)}
                                                        />
                                                        <span className="profile_app_switch_slider"></span>
                                                    </label>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                className="profile_app_btn profile_app_btn_icon profile_app_btn_danger profile_app_shopping_item_delete"
                                                onClick={() => handleRemoveShoppingItem(index)}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    className="profile_app_btn profile_app_btn_secondary profile_app_btn_add"
                                    onClick={handleAddShoppingItem}
                                >
                                    <FaPlusCircle /> Add Shopping Item
                                </button>
                            </div>

                            <div className="profile_app_form_actions">
                                <button type="submit" className="profile_app_btn profile_app_btn_primary" disabled={saveLoading}>
                                    {saveLoading ? 'Saving...' : 'Save Shopping List'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Taste Profile Tab */}
                    {activeTab === 'taste' && (
                        <form className="profile_app_form" onSubmit={handleTasteProfileSubmit}>
                            <div className="profile_app_taste_profile_header">
                                <h2>My Taste Profile</h2>
                                <p>Help us recommend recipes that match your taste preferences</p>
                            </div>

                            <div className="profile_app_form_group">
                                <label className="profile_app_form_label">Preferred Flavors</label>
                                <div className="profile_app_array_input_container">
                                    {tasteProfileData.preferredFlavors.map((flavor, index) => (
                                        <div key={index} className="profile_app_array_input_row">
                                            <select
                                                className="profile_app_form_select"
                                                value={flavor}
                                                onChange={(e) => handleArrayItemChange(setTasteProfileData, tasteProfileData, 'preferredFlavors', index, e.target.value)}
                                            >
                                                <option value="">Select a flavor</option>
                                                {flavorOptions.map((option) => (
                                                    <option key={option} value={option}>
                                                        {option.charAt(0).toUpperCase() + option.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                className="profile_app_btn profile_app_btn_icon profile_app_btn_danger"
                                                onClick={() => handleRemoveArrayItem(setTasteProfileData, tasteProfileData, 'preferredFlavors', index)}
                                            >
                                                <FaMinusCircle />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        className="profile_app_btn profile_app_btn_secondary profile_app_btn_add"
                                        onClick={() => handleAddArrayItem(setTasteProfileData, tasteProfileData, 'preferredFlavors')}
                                    >
                                        <FaPlusCircle /> Add Flavor
                                    </button>
                                </div>
                            </div>

                            <div className="profile_app_form_group">
                                <label className="profile_app_form_label" htmlFor="profile_app_spice_tolerance">Spice Tolerance</label>
                                <div className="profile_app_range_container">
                                    <input
                                        id="profile_app_spice_tolerance"
                                        type="range"
                                        min="1"
                                        max="5"
                                        step="1"
                                        className="profile_app_range_input"
                                        value={tasteProfileData.spiceTolerance}
                                        onChange={(e) => setTasteProfileData({ ...tasteProfileData, spiceTolerance: parseInt(e.target.value) })}
                                    />
                                    <div className="profile_app_range_labels">
                                        <span>Mild</span>
                                        <span>Medium</span>
                                        <span>Hot</span>
                                    </div>
                                    <div className="profile_app_range_value">{tasteProfileData.spiceTolerance}</div>
                                </div>
                            </div>

                            <div className="profile_app_form_group">
                                <label className="profile_app_form_label" htmlFor="profile_app_cooking_time">Preferred Cooking Time (minutes)</label>
                                <input
                                    id="profile_app_cooking_time"
                                    type="number"
                                    className="profile_app_form_input"
                                    value={tasteProfileData.preferredCookingTime}
                                    onChange={(e) => setTasteProfileData({ ...tasteProfileData, preferredCookingTime: parseInt(e.target.value) })}
                                    min="5"
                                    step="5"
                                />
                            </div>

                            <div className="profile_app_form_actions">
                                <button type="submit" className="profile_app_btn profile_app_btn_primary" disabled={saveLoading}>
                                    {saveLoading ? 'Saving...' : 'Save Taste Profile'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Notification Settings Tab */}
                    {activeTab === 'notifications' && (
                        <form className="profile_app_form" onSubmit={handleNotificationSettingsSubmit}>
                            <div className="profile_app_notification_header">
                                <h2>Notification Preferences</h2>
                                <p>Manage how and when you receive notifications</p>
                            </div>

                            <div className="profile_app_notification_section">
                                <h3>Email Notifications</h3>

                                <div className="profile_app_notification_option">
                                    <div className="profile_app_notification_text">
                                        <h4>New Recipe Suggestions</h4>
                                        <p>Receive emails about new recipes that match your preferences</p>
                                    </div>
                                    <div className="profile_app_switch_container">
                                        <label className="profile_app_switch">
                                            <input
                                                type="checkbox"
                                                checked={notificationSettings.email.newRecipes}
                                                onChange={(e) => setNotificationSettings({
                                                    ...notificationSettings,
                                                    email: {
                                                        ...notificationSettings.email,
                                                        newRecipes: e.target.target.checked
                                                    }
                                                })}
                                            />
                                            <span className="profile_app_slider profile_app_round"></span>
                                        </label>
                                    </div>
                                </div>

                                <div className="profile_app_notification_option">
                                    <div className="profile_app_notification_text">
                                        <h4>Meal Reminders</h4>
                                        <p>Get reminders about your planned meals and prep times</p>
                                    </div>
                                    <div className="profile_app_switch_container">
                                        <label className="profile_app_switch">
                                            <input
                                                type="checkbox"
                                                checked={notificationSettings.email.mealReminders}
                                                onChange={(e) => setNotificationSettings({
                                                    ...notificationSettings,
                                                    email: {
                                                        ...notificationSettings.email,
                                                        mealReminders: e.target.checked
                                                    }
                                                })}
                                            />
                                            <span className="profile_app_slider profile_app_round"></span>
                                        </label>
                                    </div>
                                </div>

                                <div className="profile_app_notification_option">
                                    <div className="profile_app_notification_text">
                                        <h4>Inventory Alerts</h4>
                                        <p>Receive alerts when items in your inventory are about to expire</p>
                                    </div>
                                    <div className="profile_app_switch_container">
                                        <label className="profile_app_switch">
                                            <input
                                                type="checkbox"
                                                checked={notificationSettings.email.inventoryAlerts}
                                                onChange={(e) => setNotificationSettings({
                                                    ...notificationSettings,
                                                    email: {
                                                        ...notificationSettings.email,
                                                        inventoryAlerts: e.target.checked
                                                    }
                                                })}
                                            />
                                            <span className="profile_app_slider profile_app_round"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="profile_app_notification_section">
                                <h3>Push Notifications</h3>

                                <div className="profile_app_notification_option">
                                    <div className="profile_app_notification_text">
                                        <h4>Meal Suggestions</h4>
                                        <p>Get personalized meal suggestions based on your inventory</p>
                                    </div>
                                    <div className="profile_app_switch_container">
                                        <label className="profile_app_switch">
                                            <input
                                                type="checkbox"
                                                checked={notificationSettings.push.mealSuggestions}
                                                onChange={(e) => setNotificationSettings({
                                                    ...notificationSettings,
                                                    push: {
                                                        ...notificationSettings.push,
                                                        mealSuggestions: e.target.checked
                                                    }
                                                })}
                                            />
                                            <span className="profile_app_slider profile_app_round"></span>
                                        </label>
                                    </div>
                                </div>

                                <div className="profile_app_notification_option">
                                    <div className="profile_app_notification_text">
                                        <h4>Weekly Digest</h4>
                                        <p>Receive a weekly summary of your cooking activity and recommendations</p>
                                    </div>
                                    <div className="profile_app_switch_container">
                                        <label className="profile_app_switch">
                                            <input
                                                type="checkbox"
                                                checked={notificationSettings.push.weeklyDigest || false}
                                                onChange={(e) => setNotificationSettings({
                                                    ...notificationSettings,
                                                    push: {
                                                        ...notificationSettings.push,
                                                        weeklyDigest: e.target.checked
                                                    }
                                                })}
                                            />
                                            <span className="profile_app_slider profile_app_round"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="profile_app_notification_section">
                                <h3>Frequency & Timing</h3>

                                <div className="profile_app_form_group">
                                    <label className="profile_app_form_label">Preferred Notification Time</label>
                                    <select
                                        className="profile_app_form_select"
                                        value={notificationTiming}
                                        onChange={(e) => setNotificationTiming(e.target.value)}
                                    >
                                        <option value="morning">Morning (8:00 AM - 10:00 AM)</option>
                                        <option value="afternoon">Afternoon (12:00 PM - 2:00 PM)</option>
                                        <option value="evening">Evening (5:00 PM - 7:00 PM)</option>
                                    </select>
                                </div>

                                <div className="profile_app_form_group">
                                    <label className="profile_app_form_label">Notification Frequency</label>
                                    <select
                                        className="profile_app_form_select"
                                        value={notificationFrequency}
                                        onChange={(e) => setNotificationFrequency(e.target.value)}
                                    >
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="biweekly">Bi-weekly</option>
                                        <option value="monthly">Monthly</option>
                                    </select>
                                </div>
                            </div>

                            <div className="profile_app_form_actions">
                                <button type="submit" className="profile_app_btn profile_app_btn_primary">
                                    Save Notification Settings
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'activity' && (
                        <div className="profile_app_activity_container">
                            <div className="profile_app_activity_header">
                                <h2>Activity History</h2>
                                <p>Your recent interactions with recipes and meal plans</p>
                            </div>

                            <div className="profile_app_activity_section">
                                <h3>Recently Viewed Recipes</h3>

                                {userActivity.recentlyViewed && userActivity.recentlyViewed.length > 0 ? (
                                    <div className="profile_app_activity_cards">
                                        {userActivity.recentlyViewed.map((recipe, index) => (
                                            <div className="profile_app_activity_card" key={index}>
                                                <div className="profile_app_activity_card_image">
                                                    <img src={recipe.image || '/images/recipe-placeholder.jpg'} alt={recipe.title} />
                                                </div>
                                                <div className="profile_app_activity_card_content">
                                                    <h4>{recipe.title}</h4>
                                                    <p className="profile_app_activity_card_date">
                                                        Viewed on {new Date(recipe.viewedAt).toLocaleDateString()}
                                                    </p>
                                                    <button
                                                        className="profile_app_btn profile_app_btn_text"
                                                        onClick={() => handleViewRecipe(recipe.recipeId)}
                                                    >
                                                        View Recipe
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="profile_app_empty_state">
                                        <div className="profile_app_empty_state_icon">
                                            <i className="fa-regular fa-clock"></i>
                                        </div>
                                        <p>You haven't viewed any recipes yet.</p>
                                        <button
                                            className="profile_app_btn profile_app_btn_outline"
                                            onClick={handleExploreRecipes}
                                        >
                                            Explore Recipes
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="profile_app_activity_section">
                                <h3>Cooking History</h3>

                                {userActivity.mealHistory && userActivity.mealHistory.length > 0 ? (
                                    <div className="profile_app_timeline">
                                        {userActivity.mealHistory.map((meal, index) => (
                                            <div className="profile_app_timeline_item" key={index}>
                                                <div className="profile_app_timeline_date">
                                                    {new Date(meal.date).toLocaleDateString()}
                                                </div>
                                                <div className="profile_app_timeline_content">
                                                    <h4>{meal.recipeName}</h4>
                                                    <div className="profile_app_timeline_tags">
                                                        <span className={`profile_app_tag ${meal.enjoyed ? 'profile_app_tag_success' : 'profile_app_tag_neutral'}`}>
                                                            {meal.enjoyed ? 'Enjoyed' : 'Cooked'}
                                                        </span>
                                                        {meal.mealType && (
                                                            <span className="profile_app_tag profile_app_tag_info">
                                                                {meal.mealType}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {meal.notes && (
                                                        <p className="profile_app_timeline_notes">{meal.notes}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="profile_app_empty_state">
                                        <div className="profile_app_empty_state_icon">
                                            <i className="fa-solid fa-utensils"></i>
                                        </div>
                                        <p>Your cooking history will appear here once you start logging meals.</p>
                                        <button
                                            className="profile_app_btn profile_app_btn_outline"
                                            onClick={handleLogMeal}
                                        >
                                            Log a Meal
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="profile_app_activity_section">
                                <h3>Saved Recipes</h3>

                                {userActivity.savedRecipes && userActivity.savedRecipes.length > 0 ? (
                                    <div className="profile_app_activity_grid">
                                        {userActivity.savedRecipes.map((recipe, index) => (
                                            <div className="profile_app_recipe_card" key={index}>
                                                <div className="profile_app_recipe_card_image">
                                                    <img src={recipe.image || '/images/recipe-placeholder.jpg'} alt={recipe.title} />
                                                    <button
                                                        className="profile_app_recipe_card_favorite"
                                                        onClick={() => handleToggleSave(recipe.recipeId, !recipe.isSaved)}
                                                    >
                                                        <i className={`fa-${recipe.isSaved ? 'solid' : 'regular'} fa-bookmark`}></i>
                                                    </button>
                                                </div>
                                                <div className="profile_app_recipe_card_content">
                                                    <h4>{recipe.title}</h4>
                                                    <div className="profile_app_recipe_card_meta">
                                                        <span className="profile_app_recipe_card_rating">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <i
                                                                    key={star}
                                                                    className={`fa-${recipe.rating >= star ? 'solid' : 'regular'} fa-star`}
                                                                ></i>
                                                            ))}
                                                        </span>
                                                        <span className="profile_app_recipe_card_time">
                                                            <i className="fa-regular fa-clock"></i> {recipe.cookTime} min
                                                        </span>
                                                    </div>
                                                    <button
                                                        className="profile_app_btn profile_app_btn_text"
                                                        onClick={() => handleViewRecipe(recipe.recipeId)}
                                                    >
                                                        View Recipe
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="profile_app_empty_state">
                                        <div className="profile_app_empty_state_icon">
                                            <i className="fa-regular fa-bookmark"></i>
                                        </div>
                                        <p>You haven't saved any recipes yet.</p>
                                        <button
                                            className="profile_app_btn profile_app_btn_outline"
                                            onClick={handleExploreRecipes}
                                        >
                                            Discover Recipes
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'appearance' && (
                        <div className="profile_app_appearance_container">
                            <div className="profile_app_appearance_header">
                                <h2>Appearance Settings</h2>
                                <p>Customize how the application looks and feels</p>
                            </div>

                            <div className="profile_app_appearance_section">
                                <h3>Theme Preferences</h3>

                                <div className="profile_app_theme_options">
                                    <div
                                        className={`profile_app_theme_card ${themeMode === 'light' ? 'profile_app_theme_active' : ''}`}
                                        onClick={() => handleThemeChange('light')}
                                    >
                                        <div className="profile_app_theme_preview profile_app_theme_preview_light">
                                            <div className="profile_app_theme_preview_header"></div>
                                            <div className="profile_app_theme_preview_sidebar"></div>
                                            <div className="profile_app_theme_preview_content">
                                                <div className="profile_app_theme_preview_line"></div>
                                                <div className="profile_app_theme_preview_line"></div>
                                                <div className="profile_app_theme_preview_line"></div>
                                            </div>
                                        </div>
                                        <div className="profile_app_theme_label">
                                            <span className="profile_app_radio_button">
                                                <input
                                                    type="radio"
                                                    name="theme"
                                                    checked={themeMode === 'light'}
                                                    onChange={() => { }}
                                                />
                                                <span className="profile_app_radio_checkmark"></span>
                                            </span>
                                            <span>Light Mode</span>
                                        </div>
                                    </div>

                                    <div
                                        className={`profile_app_theme_card ${themeMode === 'dark' ? 'profile_app_theme_active' : ''}`}
                                        onClick={() => handleThemeChange('dark')}
                                    >
                                        <div className="profile_app_theme_preview profile_app_theme_preview_dark">
                                            <div className="profile_app_theme_preview_header"></div>
                                            <div className="profile_app_theme_preview_sidebar"></div>
                                            <div className="profile_app_theme_preview_content">
                                                <div className="profile_app_theme_preview_line"></div>
                                                <div className="profile_app_theme_preview_line"></div>
                                                <div className="profile_app_theme_preview_line"></div>
                                            </div>
                                        </div>
                                        <div className="profile_app_theme_label">
                                            <span className="profile_app_radio_button">
                                                <input
                                                    type="radio"
                                                    name="theme"
                                                    checked={themeMode === 'dark'}
                                                    onChange={() => { }}
                                                />
                                                <span className="profile_app_radio_checkmark"></span>
                                            </span>
                                            <span>Dark Mode</span>
                                        </div>
                                    </div>

                                    <div
                                        className={`profile_app_theme_card ${themeMode === 'system' ? 'profile_app_theme_active' : ''}`}
                                        onClick={() => handleThemeChange('system')}
                                    >
                                        <div className="profile_app_theme_preview profile_app_theme_preview_system">
                                            <div className="profile_app_theme_preview_header"></div>
                                            <div className="profile_app_theme_preview_sidebar"></div>
                                            <div className="profile_app_theme_preview_content">
                                                <div className="profile_app_theme_preview_line"></div>
                                                <div className="profile_app_theme_preview_line"></div>
                                                <div className="profile_app_theme_preview_line"></div>
                                            </div>
                                        </div>
                                        <div className="profile_app_theme_label">
                                            <span className="profile_app_radio_button">
                                                <input
                                                    type="radio"
                                                    name="theme"
                                                    checked={themeMode === 'system'}
                                                    onChange={() => { }}
                                                />
                                                <span className="profile_app_radio_checkmark"></span>
                                            </span>
                                            <span>System Default</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="profile_app_appearance_section">
                                <h3>Color Scheme</h3>

                                <div className="profile_app_color_options">
                                    {colorSchemes.map((scheme) => (
                                        <div
                                            key={scheme.name}
                                            className={`profile_app_color_option ${colorScheme === scheme.name ? 'profile_app_color_active' : ''}`}
                                            onClick={() => handleColorSchemeChange(scheme.name)}
                                        >
                                            <div className="profile_app_color_preview" style={{ background: scheme.colors.join(' ') }}>
                                                <div className="profile_app_color_preview_gradient"></div>
                                            </div>
                                            <div className="profile_app_color_label">
                                                <span className="profile_app_radio_button">
                                                    <input
                                                        type="radio"
                                                        name="colorScheme"
                                                        checked={colorScheme === scheme.name}
                                                        onChange={() => { }}
                                                    />
                                                    <span className="profile_app_radio_checkmark"></span>
                                                </span>
                                                <span>{scheme.label}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="profile_app_appearance_section">
                                <h3>Font Size</h3>

                                <div className="profile_app_font_size_slider">
                                    <span className="profile_app_font_size_label profile_app_font_size_small">A</span>
                                    <input
                                        type="range"
                                        min="1"
                                        max="5"
                                        value={fontSize}
                                        onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
                                        className="profile_app_slider profile_app_slider_horizontal"
                                    />
                                    <span className="profile_app_font_size_label profile_app_font_size_large">A</span>
                                </div>

                                <div className="profile_app_font_size_preview">
                                    <p className="profile_app_font_preview_text">
                                        This is how your text will appear throughout the application
                                    </p>
                                </div>
                            </div>

                            <div className="profile_app_form_actions">
                                <button
                                    onClick={handleResetAppearance}
                                    className="profile_app_btn profile_app_btn_secondary"
                                >
                                    Reset to Default
                                </button>
                                <button
                                    onClick={handleSaveAppearance}
                                    className="profile_app_btn profile_app_btn_primary"
                                >
                                    Save Appearance Settings
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="profile_app_security_container">
                            <div className="profile_app_security_header">
                                <h2>Security Settings</h2>
                                <p>Manage your account security and privacy preferences</p>
                            </div>

                            <div className="profile_app_security_section">
                                <h3>Password</h3>
                                <form className="profile_app_form" onSubmit={handlePasswordChange}>
                                    <div className="profile_app_form_group">
                                        <label className="profile_app_form_label">Current Password</label>
                                        <div className="profile_app_password_input">
                                            <input
                                                type={showCurrentPassword ? "text" : "password"}
                                                className="profile_app_form_input"
                                                value={passwords.current}
                                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="profile_app_password_toggle"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            >
                                                <i className={`fa-solid fa-eye${showCurrentPassword ? '-slash' : ''}`}></i>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="profile_app_form_group">
                                        <label className="profile_app_form_label">New Password</label>
                                        <div className="profile_app_password_input">
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                className="profile_app_form_input"
                                                value={passwords.new}
                                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                                required
                                                minLength="8"
                                            />
                                            <button
                                                type="button"
                                                className="profile_app_password_toggle"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                            >
                                                <i className={`fa-solid fa-eye${showNewPassword ? '-slash' : ''}`}></i>
                                            </button>
                                        </div>
                                        <div className="profile_app_password_strength">
                                            <div className="profile_app_password_meter">
                                                <span
                                                    className="profile_app_password_strength_bar"
                                                    style={{ width: `${passwordStrength * 25}%`, background: getPasswordStrengthColor() }}
                                                ></span>
                                            </div>
                                            <span className="profile_app_password_strength_text">
                                                {getPasswordStrengthText()}
                                            </span>
                                        </div>
                                        <ul className="profile_app_password_requirements">
                                            <li className={passwords.new.length >= 8 ? 'profile_app_requirement_met' : ''}>
                                                <i className={`fa-solid fa-${passwords.new.length >= 8 ? 'check' : 'times'}`}></i>
                                                At least 8 characters
                                            </li>
                                            <li className={/[A-Z]/.test(passwords.new) ? 'profile_app_requirement_met' : ''}>
                                                <i className={`fa-solid fa-${/[A-Z]/.test(passwords.new) ? 'check' : 'times'}`}></i>
                                                At least one uppercase letter
                                            </li>
                                            <li className={/[0-9]/.test(passwords.new) ? 'profile_app_requirement_met' : ''}>
                                                <i className={`fa-solid fa-${/[0-9]/.test(passwords.new) ? 'check' : 'times'}`}></i>
                                                At least one number
                                            </li>
                                            <li className={/[^A-Za-z0-9]/.test(passwords.new) ? 'profile_app_requirement_met' : ''}>
                                                <i className={`fa-solid fa-${/[^A-Za-z0-9]/.test(passwords.new) ? 'check' : 'times'}`}></i>
                                                At least one special character
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="profile_app_form_group">
                                        <label className="profile_app_form_label">Confirm New Password</label>
                                        <div className="profile_app_password_input">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                className="profile_app_form_input"
                                                value={passwords.confirm}
                                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="profile_app_password_toggle"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                <i className={`fa-solid fa-eye${showConfirmPassword ? '-slash' : ''}`}></i>
                                            </button>
                                        </div>
                                        {passwords.new !== passwords.confirm && passwords.confirm && (
                                            <div className="profile_app_form_error">
                                                Passwords do not match
                                            </div>
                                        )}
                                    </div>

                                    <div className="profile_app_form_actions">
                                        <button type="submit" className="profile_app_btn profile_app_btn_primary" disabled={!isPasswordValid()}>
                                            Update Password
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div className="profile_app_security_section">
                                <h3>Two-Factor Authentication</h3>

                                <div className="profile_app_toggle_option">
                                    <div className="profile_app_toggle_content">
                                        <h4>Enable Two-Factor Authentication</h4>
                                        <p>Add an extra layer of security to your account</p>
                                    </div>
                                    <div className="profile_app_switch_container">
                                        <label className="profile_app_switch">
                                            <input
                                                type="checkbox"
                                                checked={twoFactorEnabled}
                                                onChange={handleToggleTwoFactor}
                                            />
                                            <span className="profile_app_slider profile_app_round"></span>
                                        </label>
                                    </div>
                                </div>

                                {twoFactorEnabled && (
                                    <div className="profile_app_two_factor_setup">
                                        <div className="profile_app_two_factor_qr">
                                            <div className="profile_app_qr_code">
                                                {/* Placeholder for QR code */}
                                                <div className="profile_app_qr_placeholder">
                                                    <i className="fa-solid fa-qrcode"></i>
                                                </div>
                                            </div>
                                            <p className="profile_app_two_factor_instructions">
                                                Scan this QR code with your authenticator app
                                            </p>
                                        </div>

                                        <div className="profile_app_two_factor_verify">
                                            <div className="profile_app_form_group">
                                                <label className="profile_app_form_label">Verification Code</label>
                                                <input
                                                    type="text"
                                                    className="profile_app_form_input profile_app_code_input"
                                                    value={verificationCode}
                                                    onChange={(e) => setVerificationCode(e.target.value)}
                                                    placeholder="Enter the 6-digit code"
                                                    maxLength="6"
                                                />
                                            </div>

                                            <div className="profile_app_form_actions">
                                                <button
                                                    onClick={handleVerifyTwoFactor}
                                                    className="profile_app_btn profile_app_btn_primary"
                                                    disabled={verificationCode.length !== 6}
                                                >
                                                    Verify and Enable
                                                </button>
                                            </div>
                                        </div>

                                        <div className="profile_app_two_factor_recovery">
                                            <h4>Recovery Codes</h4>
                                            <p>Save these backup codes in a secure place to regain access to your account if you lose your device</p>

                                            <div className="profile_app_recovery_codes">
                                                {recoveryCodes.map((code, index) => (
                                                    <div className="profile_app_recovery_code" key={index}>
                                                        <span>{code}</span>
                                                        <button
                                                            className="profile_app_btn profile_app_btn_icon"
                                                            onClick={() => handleCopyRecoveryCode(code)}
                                                        >
                                                            <i className="fa-regular fa-copy"></i>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="profile_app_form_actions">
                                                <button
                                                    onClick={handleDownloadRecoveryCodes}
                                                    className="profile_app_btn profile_app_btn_secondary"
                                                >
                                                    <i className="fa-solid fa-download"></i> Download Recovery Codes
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="profile_app_security_section">
                                <h3>Session Management</h3>

                                <div className="profile_app_session_list">
                                    {activeSessions.map((session, index) => (
                                        <div className="profile_app_session_item" key={index}>
                                            <div className="profile_app_session_info">
                                                <div className="profile_app_session_device">
                                                    <i className={`fa-solid ${getDeviceIcon(session.device)}`}></i>
                                                    <span>{session.device}</span>
                                                    {session.current && (
                                                        <span className="profile_app_current_device">Current Device</span>
                                                    )}
                                                </div>
                                                <div className="profile_app_session_details">
                                                    <div className="profile_app_session_location">
                                                        <i className="fa-solid fa-location-dot"></i>
                                                        <span>{session.location}</span>
                                                    </div>
                                                    <div className="profile_app_session_time">
                                                        <i className="fa-regular fa-clock"></i>
                                                        <span>Last active: {formatTimeAgo(session.lastActive)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="profile_app_session_actions">
                                                {!session.current && (
                                                    <button
                                                        className="profile_app_btn profile_app_btn_danger profile_app_btn_sm"
                                                        onClick={() => handleLogoutSession(session.id)}
                                                    >
                                                        Log Out
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="profile_app_form_actions">
                                    <button
                                        onClick={handleLogoutAllSessions}
                                        className="profile_app_btn profile_app_btn_danger"
                                    >
                                        Log Out of All Other Devices
                                    </button>
                                </div>
                            </div>

                            <div className="profile_app_security_section">
                                <h3>Privacy Settings</h3>

                                <div className="profile_app_toggle_option">
                                    <div className="profile_app_toggle_content">
                                        <h4>Share Cooking Activity</h4>
                                        <p>Allow other users to see your cooking activity and achievements</p>
                                    </div>
                                    <div className="profile_app_switch_container">
                                        <label className="profile_app_switch">
                                            <input
                                                type="checkbox"
                                                checked={privacySettings.shareActivity}
                                                onChange={() => setPrivacySettings({
                                                    ...privacySettings,
                                                    shareActivity: !privacySettings.shareActivity
                                                })}
                                            />
                                            <span className="profile_app_slider profile_app_round"></span>
                                        </label>
                                    </div>
                                </div>

                                <div className="profile_app_toggle_option">
                                    <div className="profile_app_toggle_content">
                                        <h4>Show Profile in Search Results</h4>
                                        <p>Allow your profile to appear in search results and recommendations</p>
                                    </div>
                                    <div className="profile_app_switch_container">
                                        <label className="profile_app_switch">
                                            <input
                                                type="checkbox"
                                                checked={privacySettings.showInSearch}
                                                onChange={() => setPrivacySettings({
                                                    ...privacySettings,
                                                    showInSearch: !privacySettings.showInSearch
                                                })}
                                            />
                                            <span className="profile_app_slider profile_app_round"></span>
                                        </label>
                                    </div>
                                </div>

                                <div className="profile_app_toggle_option">
                                    <div className="profile_app_toggle_content">
                                        <h4>Allow Private Messages</h4>
                                        <p>Let other users send you direct messages</p>
                                    </div>
                                    <div className="profile_app_switch_container">
                                        <label className="profile_app_switch">
                                            <input
                                                type="checkbox"
                                                checked={privacySettings.allowMessages}
                                                onChange={() => setPrivacySettings({
                                                    ...privacySettings,
                                                    allowMessages: !privacySettings.allowMessages
                                                })}
                                            />
                                            <span className="profile_app_slider profile_app_round"></span>
                                        </label>
                                    </div>
                                </div>

                                <div className="profile_app_form_actions">
                                    <button
                                        onClick={handleSavePrivacySettings}
                                        className="profile_app_btn profile_app_btn_primary"
                                        disabled={!privacySettingsChanged}
                                    >
                                        Save Privacy Settings
                                    </button>
                                </div>
                            </div>

                            <div className="profile_app_security_section profile_app_danger_zone">
                                <h3>Danger Zone</h3>

                                <div className="profile_app_danger_option">
                                    <div className="profile_app_danger_content">
                                        <h4>Delete Account</h4>
                                        <p>Permanently delete your account and all associated data</p>
                                    </div>
                                    <button
                                        className="profile_app_btn profile_app_btn_danger"
                                        onClick={() => setShowDeleteAccountModal(true)}
                                    >
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>

        </div>)
}

export default UserProfile;
