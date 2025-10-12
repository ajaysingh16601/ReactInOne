import React, { useEffect, useState } from "react";

interface MenuItem {
    id: string;
    label: string;
    icon: string;
    active?: boolean;
    gradient: string;
}

interface ToggleSetting {
    id: string;
    label: string;
    checked: boolean;
    description?: string;
    gradient: string;
}

interface SelectOption {
    value: string;
    label: string;
}

const SettingsPage: React.FC = () => {
    const [animate, setAnimate] = useState(false);
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);
    const [hoveredMenu, setHoveredMenu] = useState<number | null>(null);

    const menuItems: MenuItem[] = [
        { id: 'profile', label: 'Profile', icon: '👤', gradient: "from-green-500 to-blue-500", active: true },
        { id: 'notifications', label: 'Notifications', icon: '🔔', gradient: "from-red-500 to-orange-500" },
        { id: 'appearance', label: 'Appearance', icon: '🎨', gradient: "from-purple-500 to-pink-500" },
        { id: 'privacy', label: 'Privacy & Security', icon: '🛡️', gradient: "from-yellow-500 to-red-500" },
        { id: 'language', label: 'Language', icon: '🌐', gradient: "from-blue-500 to-teal-500" },
        { id: 'storage', label: 'Storage', icon: '💾', gradient: "from-indigo-500 to-purple-500" },
    ];

    const [profileData, setProfileData] = useState({
        name: 'Alex Johnson',
        email: 'alex.johnson@example.com',
        bio: 'UI/UX Designer & Frontend Developer',
    });

    const [privacySettings, setPrivacySettings] = useState<ToggleSetting[]>([
        { 
            id: 'private-account', 
            label: 'Private Account', 
            checked: true,
            description: 'Make your account visible to approved followers only',
            gradient: "from-purple-500 to-pink-500"
        },
        { 
            id: 'online-status', 
            label: 'Show Online Status', 
            checked: true,
            description: 'Let others see when you are active',
            gradient: "from-blue-500 to-teal-500"
        },
        { 
            id: 'tagging', 
            label: 'Allow Tagging', 
            checked: false,
            description: 'Allow others to tag you in posts and photos',
            gradient: "from-green-500 to-blue-500"
        },
    ]);

    const [notificationSettings, setNotificationSettings] = useState({
        toggles: [
            { 
                id: 'push', 
                label: 'Push Notifications', 
                checked: true,
                description: 'Receive notifications in your browser',
                gradient: "from-red-500 to-orange-500"
            },
            { 
                id: 'email', 
                label: 'Email Notifications', 
                checked: true,
                description: 'Get important updates via email',
                gradient: "from-yellow-500 to-red-500"
            },
            { 
                id: 'sms', 
                label: 'SMS Alerts', 
                checked: false,
                description: 'Critical alerts via text message',
                gradient: "from-indigo-500 to-purple-500"
            },
        ],
        frequency: 'daily',
    });

    const [appearanceSettings, setAppearanceSettings] = useState({
        theme: 'system',
        accent: 'purple-pink',
        compactMode: false,
        animations: true,
    });

    const [activeSection, setActiveSection] = useState('profile');

    const frequencyOptions: SelectOption[] = [
        { value: 'realtime', label: 'Real-time' },
        { value: 'daily', label: 'Daily Digest' },
        { value: 'weekly', label: 'Weekly Summary' },
    ];

    const themeOptions: SelectOption[] = [
        { value: 'system', label: 'System Default' },
        { value: 'light', label: 'Light Mode' },
        { value: 'dark', label: 'Dark Mode' },
    ];

    const accentOptions: SelectOption[] = [
        { value: 'purple-pink', label: 'Purple Pink' },
        { value: 'indigo-purple', label: 'Indigo Purple' },
        { value: 'blue-cyan', label: 'Blue Cyan' },
    ];

    useEffect(() => {
        const timer = setTimeout(() => setAnimate(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleMenuClick = (id: string) => {
        setMenuItems(items => items.map(item => ({
            ...item,
            active: item.id === id
        })));
        setActiveSection(id);
    };

    const handleToggleChange = (settings: ToggleSetting[], setSettings: React.Dispatch<React.SetStateAction<ToggleSetting[]>>, id: string) => {
        setSettings(settings.map(setting => 
            setting.id === id ? { ...setting, checked: !setting.checked } : setting
        ));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleNotificationToggleChange = (id: string) => {
        setNotificationSettings(prev => ({
            ...prev,
            toggles: prev.toggles.map(setting =>
                setting.id === id ? { ...setting, checked: !setting.checked } : setting
            )
        }));
    };

    const setMenuItems = (updater: (items: MenuItem[]) => MenuItem[]) => {
        // This would normally update state, but we're using const for demo
        console.log('Menu items updated');
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 overflow-hidden p-4">
            {/* Enhanced Background Animation - Matching About Page */}
            <div className="fixed inset-0 overflow-hidden z-0">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 opacity-20 rounded-full mix-blend-multiply filter blur-3xl animate-float-slow"></div>
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-20 rounded-full mix-blend-multiply filter blur-3xl animate-float-medium delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-green-400 to-teal-400 opacity-15 rounded-full mix-blend-multiply filter blur-3xl animate-float-fast delay-2000"></div>
                
                {/* Animated grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] animate-grid-move"></div>
            </div>

            {/* Floating particles */}
            <div className="fixed inset-0 z-0 overflow-hidden">
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-white/30 rounded-full animate-float"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${15 + Math.random() * 10}s`
                        }}
                    />
                ))}
            </div>

            {/* Main Settings Container */}
            <div className="relative z-10 w-full">
                {/* Animated heading with enhanced effects */}
                <div className="text-center mb-12">
                    <div className="relative inline-block">
                        <h1 className="text-5xl md:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mb-4 animate-gradient-x">
                            Application Settings
                        </h1>
                        <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full animate-pulse-scale"></div>
                    </div>
                    
                    {/* Subtitle with typing animation */}
                    <p className={`text-xl md:text-2xl text-gray-600 dark:text-gray-300 mt-8 max-w-3xl mx-auto leading-relaxed transition-all duration-1000 transform ${
                        animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}>
                        Customize your experience with our{" "}
                        <span className="relative inline-block">
                            <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent font-semibold animate-pulse">
                                powerful settings
                            </span>
                        </span>{" "}
                        and make the application truly yours.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1">
                        <div className="backdrop-blur-xl border border-white/20 bg-white/10 dark:bg-gray-900/20 rounded-3xl p-6 shadow-2xl">
                            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
                                Settings Menu
                            </h3>
                            <nav className="space-y-3">
                                {menuItems.map((item, i) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleMenuClick(item.id)}
                                        className={`group relative w-full text-left p-4 rounded-2xl backdrop-blur-lg border transition-all duration-500 ease-out transform hover:scale-105 ${
                                            item.active 
                                                ? 'border-white/30 bg-white/20 shadow-lg' 
                                                : 'border-white/10 bg-white/5 hover:bg-white/10'
                                        } ${
                                            animate ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
                                        }`}
                                        style={{ 
                                            transitionDelay: `${i * 100}ms`,
                                            transform: hoveredMenu === i ? 'translateX(8px) scale(1.02)' : ''
                                        }}
                                        onMouseEnter={() => setHoveredMenu(i)}
                                        onMouseLeave={() => setHoveredMenu(null)}
                                    >
                                        {/* Hover gradient overlay */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500`}></div>
                                        
                                        <div className="relative z-10 flex items-center space-x-4">
                                            <span className="text-2xl transform group-hover:scale-110 transition-transform duration-300">
                                                {item.icon}
                                            </span>
                                            <span className={`font-semibold ${
                                                item.active 
                                                    ? 'bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'
                                                    : 'text-gray-700 dark:text-gray-200'
                                            }`}>
                                                {item.label}
                                            </span>
                                        </div>
                                        
                                        {/* Animated border */}
                                        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`}>
                                            <div className="absolute inset-[1px] rounded-2xl bg-white/10 dark:bg-gray-900/20"></div>
                                        </div>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3">
                        {/* Profile Settings */}
                        {activeSection === 'profile' && (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                <div
                                    className={`group relative p-8 rounded-3xl backdrop-blur-xl border border-white/20 bg-white/10 dark:bg-gray-900/20 shadow-2xl transform transition-all duration-700 ease-out hover:scale-105 hover:shadow-2xl ${
                                        animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                                    }`}
                                    style={{ 
                                        transitionDelay: `100ms`,
                                        transform: hoveredCard === 0 ? 'translateY(-8px) scale(1.02)' : ''
                                    }}
                                    onMouseEnter={() => setHoveredCard(0)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-blue-500 opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500"></div>
                                    
                                    <div className="relative z-10">
                                        <div className="flex items-center space-x-4 mb-6">
                                            <span className="text-4xl transform group-hover:scale-110 transition-transform duration-300">👤</span>
                                            <h3 className="text-2xl font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
                                                Profile Information
                                            </h3>
                                        </div>
                                        
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-gray-700 dark:text-gray-200 font-medium mb-3">Full Name</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={profileData.name}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 bg-white/20 dark:bg-gray-800/20 border border-white/30 rounded-xl text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-4 focus:ring-green-400/30 transition-all duration-300 backdrop-blur-sm"
                                                    placeholder="Enter your full name"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-gray-700 dark:text-gray-200 font-medium mb-3">Email Address</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={profileData.email}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 bg-white/20 dark:bg-gray-800/20 border border-white/30 rounded-xl text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/30 transition-all duration-300 backdrop-blur-sm"
                                                    placeholder="Enter your email"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-gray-700 dark:text-gray-200 font-medium mb-3">Bio</label>
                                                <input
                                                    type="text"
                                                    name="bio"
                                                    value={profileData.bio}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 bg-white/20 dark:bg-gray-800/20 border border-white/30 rounded-xl text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-400/30 transition-all duration-300 backdrop-blur-sm"
                                                    placeholder="Tell us about yourself"
                                                />
                                            </div>

                                            <button className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center gap-3 backdrop-blur-sm">
                                                <span className="text-lg">💾</span>
                                                Save Changes
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional profile settings card */}
                                <div
                                    className={`group relative p-8 rounded-3xl backdrop-blur-xl border border-white/20 bg-white/10 dark:bg-gray-900/20 shadow-2xl transform transition-all duration-700 ease-out hover:scale-105 hover:shadow-2xl ${
                                        animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                                    }`}
                                    style={{ 
                                        transitionDelay: `300ms`,
                                        transform: hoveredCard === 1 ? 'translateY(-8px) scale(1.02)' : ''
                                    }}
                                    onMouseEnter={() => setHoveredCard(1)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500"></div>
                                    
                                    <div className="relative z-10">
                                        <div className="flex items-center space-x-4 mb-6">
                                            <span className="text-4xl transform group-hover:scale-110 transition-transform duration-300">⚙️</span>
                                            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                                                Account Preferences
                                            </h3>
                                        </div>
                                        
                                        <div className="space-y-6">
                                            {privacySettings.map((setting, index) => (
                                                <div key={setting.id} className="flex items-center justify-between bg-white/5 rounded-xl p-4 transition-all duration-300 hover:bg-white/10">
                                                    <div>
                                                        <span className="block text-gray-700 dark:text-gray-200 font-medium">{setting.label}</span>
                                                        <span className="text-gray-600 dark:text-gray-300 text-sm">{setting.description}</span>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={setting.checked}
                                                            onChange={() => handleToggleChange(privacySettings, setPrivacySettings, setting.id)}
                                                            className="sr-only peer"
                                                        />
                                                        <div className={`w-14 h-7 bg-white/20 rounded-full peer peer-checked:after:translate-x-7 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all duration-300 ${
                                                            setting.checked ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''
                                                        }`}></div>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notifications Settings */}
                        {activeSection === 'notifications' && (
                            <div
                                className={`group relative p-8 rounded-3xl backdrop-blur-xl border border-white/20 bg-white/10 dark:bg-gray-900/20 shadow-2xl transform transition-all duration-700 ease-out hover:scale-105 hover:shadow-2xl ${
                                    animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                                }`}
                                style={{ 
                                    transitionDelay: `100ms`,
                                }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500"></div>
                                
                                <div className="relative z-10">
                                    <div className="flex items-center space-x-4 mb-6">
                                        <span className="text-4xl transform group-hover:scale-110 transition-transform duration-300">🔔</span>
                                        <h3 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                                            Notification Settings
                                        </h3>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        {notificationSettings.toggles.map((setting, index) => (
                                            <div key={setting.id} className="flex items-center justify-between bg-white/5 rounded-xl p-4 transition-all duration-300 hover:bg-white/10">
                                                <div>
                                                    <span className="block text-gray-700 dark:text-gray-200 font-medium">{setting.label}</span>
                                                    <span className="text-gray-600 dark:text-gray-300 text-sm">{setting.description}</span>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={setting.checked}
                                                        onChange={() => handleNotificationToggleChange(setting.id)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className={`w-14 h-7 bg-white/20 rounded-full peer peer-checked:after:translate-x-7 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all duration-300 ${
                                                        setting.checked ? 'bg-gradient-to-r from-red-500 to-orange-500' : ''
                                                    }`}></div>
                                                </label>
                                            </div>
                                        ))}

                                        <div className="bg-white/5 rounded-xl p-4 transition-all duration-300 hover:bg-white/10">
                                            <label className="block text-gray-700 dark:text-gray-200 font-medium mb-3">Notification Frequency</label>
                                            <select 
                                                value={notificationSettings.frequency}
                                                onChange={(e) => setNotificationSettings(prev => ({...prev, frequency: e.target.value}))}
                                                className="w-full px-4 py-3 bg-white/20 dark:bg-gray-800/20 border border-white/30 rounded-xl text-gray-800 dark:text-white focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-400/30 transition-all duration-300 backdrop-blur-sm"
                                            >
                                                {frequencyOptions.map(option => (
                                                    <option key={option.value} value={option.value} className="bg-gray-900 text-white">
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Add more sections for other menu items following the same pattern */}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes gradient-x {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(180deg); }
                }
                @keyframes float-slow {
                    0%, 100% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(50px, -30px) scale(1.1); }
                    66% { transform: translate(-30px, 40px) scale(0.9); }
                }
                @keyframes float-medium {
                    0%, 100% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(-40px, 50px) scale(1.05); }
                    66% { transform: translate(60px, -20px) scale(0.95); }
                }
                @keyframes float-fast {
                    0%, 100% { transform: translate(0px, 0px) scale(1); }
                    50% { transform: translate(30px, -40px) scale(1.2); }
                }
                @keyframes grid-move {
                    0% { transform: translate(0px, 0px); }
                    100% { transform: translate(60px, 60px); }
                }
                @keyframes pulse-scale {
                    0%, 100% { transform: scaleX(1); opacity: 1; }
                    50% { transform: scaleX(1.1); opacity: 0.8; }
                }
                .animate-gradient-x {
                    background-size: 200% 200%;
                    animation: gradient-x 6s ease infinite;
                }
                .animate-float {
                    animation: float 8s ease-in-out infinite;
                }
                .animate-float-slow {
                    animation: float-slow 15s ease-in-out infinite;
                }
                .animate-float-medium {
                    animation: float-medium 12s ease-in-out infinite;
                }
                .animate-float-fast {
                    animation: float-fast 10s ease-in-out infinite;
                }
                .animate-grid-move {
                    animation: grid-move 20s linear infinite;
                }
                .animate-pulse-scale {
                    animation: pulse-scale 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default SettingsPage;