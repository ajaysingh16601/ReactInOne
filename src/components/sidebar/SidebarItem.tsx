import React from "react";
import { NavLink } from "react-router-dom";
import { type MenuItem } from "../../config/menuConfig";

interface SidebarItemProps {
  item: MenuItem;
  onCloseSidebar: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ item, onCloseSidebar }) => {
    const Icon = item.icon;

    if (item.children) return null;

    const handleClick = () => {
        // Close sidebar on mobile after a small delay for smooth transition
        setTimeout(() => {
            onCloseSidebar();
        }, 150);
    };

    return (
        <li className="group">
            <NavLink
                to={item.href || "/"}
                onClick={handleClick}
                className={({ isActive }) =>
                    `relative flex items-center justify-between p-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                        isActive
                            ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 shadow-lg border border-purple-200/50 dark:border-purple-500/30"
                            : "hover:bg-white/50 dark:hover:bg-gray-800/50 border border-transparent"
                    }`
                }
            >
                {/* Active indicator */}
                {({ isActive }) => (
                    <>
                        {isActive && (
                            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-r-full"></div>
                        )}
                        
                        <div className="flex items-center gap-3">
                            {Icon && (
                                <div className={`p-2 rounded-lg transition-all duration-300 ${
                                    isActive 
                                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg" 
                                        : "bg-gray-100/50 dark:bg-gray-700/50 group-hover:bg-gradient-to-r group-hover:from-purple-500/20 group-hover:to-pink-500/20"
                                }`}>
                                    <Icon className={`w-4 h-4 ${isActive ? 'scale-110' : ''} transition-transform`} />
                                </div>
                            )}
                            <span className={`font-medium transition-all duration-300 ${
                                isActive 
                                    ? "text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400" 
                                    : "text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"
                            }`}>
                                {item.label}
                            </span>
                        </div>
                        
                        {item.badge && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full transition-all duration-300 ${
                                isActive
                                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                                    : "bg-gray-200/70 dark:bg-gray-700/70 text-gray-600 dark:text-gray-300 group-hover:bg-gradient-to-r group-hover:from-purple-500/20 group-hover:to-pink-500/20"
                            }`}>
                                {item.badge}
                            </span>
                        )}
                        
                        {/* Hover effect */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                    </>
                )}
            </NavLink>
        </li>
    );
};

export default SidebarItem;