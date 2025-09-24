import React, { useEffect, useState } from "react";

const AboutPage: React.FC = () => {
    const features = [
        { 
            title: "Performance", 
            desc: "Optimized with modern best practices.",
            icon: "⚡",
            gradient: "from-green-500 to-blue-500"
        },
        { 
            title: "Security", 
            desc: "Protected routes and safe authentication.",
            icon: "🛡️",
            gradient: "from-red-500 to-orange-500"
        },
        { 
            title: "Scalability", 
            desc: "Modular, maintainable, and ready to grow.",
            icon: "📈",
            gradient: "from-purple-500 to-pink-500"
        },
        { 
            title: "Innovation", 
            desc: "Cutting-edge technology stack.",
            icon: "💡",
            gradient: "from-yellow-500 to-red-500"
        },
        { 
            title: "User Experience", 
            desc: "Intuitive and delightful interfaces.",
            icon: "🎨",
            gradient: "from-blue-500 to-teal-500"
        },
        { 
            title: "Reliability", 
            desc: "Consistent performance and uptime.",
            icon: "🔒",
            gradient: "from-indigo-500 to-purple-500"
        },
    ];

    const [animate, setAnimate] = useState(false);
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setAnimate(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 overflow-hidden">
            {/* Enhanced Background Animation */}
            <div className="fixed inset-0 overflow-hidden z-0">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 opacity-20 rounded-full mix-blend-multiply filter blur-3xl animate-float-slow"></div>
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-20 rounded-full mix-blend-multiply filter blur-3xl animate-float-medium delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-green-400 to-teal-400 opacity-15 rounded-full mix-blend-multiply filter blur-3xl animate-float-fast delay-2000"></div>
                
                {/* Animated grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] animate-grid-move"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-6xl px-4 py-12">
                {/* Animated heading with enhanced effects */}
                <div className="text-center mb-12">
                    <div className="relative inline-block">
                        <h1 className="text-5xl md:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mb-4 animate-gradient-x">
                            About This Application
                        </h1>
                        <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full animate-pulse-scale"></div>
                    </div>
                    
                    {/* Subtitle with typing animation */}
                    <p className={`text-xl md:text-2xl text-gray-600 dark:text-gray-300 mt-8 max-w-3xl mx-auto leading-relaxed transition-all duration-1000 transform ${
                        animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}>
                        This application is built to provide a{" "}
                        <span className="relative inline-block">
                            <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent font-semibold animate-pulse">
                                seamless experience
                            </span>
                        </span>{" "}
                        with powerful tools and an elegant interface that adapts to your needs.
                    </p>
                </div>

                {/* Enhanced Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
                    {features.map((item, i) => (
                        <div
                            key={i}
                            className={`group relative p-8 rounded-3xl backdrop-blur-xl border border-white/20 bg-white/10 dark:bg-gray-900/20 shadow-2xl transform transition-all duration-700 ease-out hover:scale-105 hover:shadow-2xl ${
                                animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                            }`}
                            style={{ 
                                transitionDelay: `${i * 150}ms`,
                                transform: hoveredCard === i ? 'translateY(-8px) scale(1.02)' : ''
                            }}
                            onMouseEnter={() => setHoveredCard(i)}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            {/* Hover gradient overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`}></div>
                            
                            {/* Animated icon */}
                            <div className="relative z-10 text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                                {item.icon}
                            </div>
                            
                            {/* Content */}
                            <h3 className={`relative z-10 text-2xl font-bold bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent mb-3`}>
                                {item.title}
                            </h3>
                            <p className="relative z-10 text-gray-600 dark:text-gray-300 leading-relaxed">
                                {item.desc}
                            </p>
                            
                            {/* Animated border */}
                            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`}>
                                <div className="absolute inset-[2px] rounded-3xl bg-white dark:bg-gray-900"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Additional animated element */}
                <div className={`text-center mt-16 transition-all duration-1000 delay-1000 ${
                    animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}>
                    <div className="inline-flex items-center space-x-4 p-4 rounded-2xl bg-white/10 dark:bg-gray-800/20 backdrop-blur-lg border border-white/20">
                        <span className="text-2xl">🚀</span>
                        <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                            Ready to explore amazing features?
                        </span>
                        <span className="text-2xl animate-bounce">👇</span>
                    </div>
                </div>
            </div>

            {/* Floating particles */}
            <div className="fixed inset-0 z-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
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

export default AboutPage;