import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { type MenuItem } from "../../config/menuConfig";

interface SidebarSubmenuProps {
  item: MenuItem;
  onCloseSidebar: () => void;
}

const SidebarSubmenu: React.FC<SidebarSubmenuProps> = ({ item, onCloseSidebar }) => {

    const Icon = item.icon;
    const [isOpen, setIsOpen] = useState(false);
    const handleChildClick = () => {
        // Close sidebar on mobile after a small delay for smooth transition
        setTimeout(() => {
            onCloseSidebar();
        }, 150);
    };

    return (
        <li className="group">
            <details 
                className="relative"
                open={isOpen}
                onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}
            >
                <summary className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 hover:bg-white/50 dark:hover:bg-gray-800/50 border border-transparent hover:border-white/20 group-hover:scale-105">
                    {Icon && (
                        <div className="p-2 rounded-lg bg-gray-100/50 dark:bg-gray-700/50 group-hover:bg-gradient-to-r group-hover:from-purple-500/20 group-hover:to-pink-500/20 transition-all duration-300">
                            <Icon className="w-4 h-4" />
                        </div>
                    )}
                    <span className="font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
                        {item.label}
                    </span>
                    <svg 
                        className={`w-4 h-4 ml-auto transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    
                    {/* Hover effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                </summary>
                
                <ul className="pl-8 mt-2 space-y-1 animate-in fade-in-50 slide-in-from-top-2 duration-300">
                    {item.children?.map((child, idx) => (
                        <li key={idx} className="transform transition-all duration-300 hover:translate-x-1">
                            <NavLink
                                to={child.href || "/"}
                                onClick={handleChildClick}
                                className={({ isActive }) =>
                                    `block p-2 rounded-lg transition-all duration-300 relative ${
                                        isActive
                                            ? "bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 font-medium"
                                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <span className="relative z-10 flex items-center gap-2">
                                            {/* Dot indicator */}
                                            <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                                isActive 
                                                    ? "bg-gradient-to-r from-purple-500 to-pink-500 scale-125" 
                                                    : "bg-gray-300 dark:bg-gray-600 group-hover:bg-purple-400"
                                            }`}></div>
                                            {child.label}
                                        </span>
                                        
                                        {isActive && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-lg"></div>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </details>
        </li>
    );
};

export default SidebarSubmenu;