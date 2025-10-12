import React from "react";
import { NavLink } from "react-router-dom";
import { type MenuItem } from "../../config/menuConfig";

interface SidebarItemProps {
  item: MenuItem;
  onCloseSidebar: () => void;
  isCollapsed?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ item, onCloseSidebar, isCollapsed = false }) => {
    const Icon = item.icon;

    if (item.children) return null;

    const handleClick = () => {
        setTimeout(() => {
            onCloseSidebar();
        }, 150);
    };

    return (
        <li className="group" title={isCollapsed ? item.label : undefined}>
            <NavLink
                to={item.href || "/"}
                onClick={handleClick}
                className={({ isActive }) =>
                    `relative flex items-center justify-between p-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                        isActive
                            ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 shadow-lg border border-purple-200/50 dark:border-purple-500/30"
                            : "hover:bg-white/50 dark:hover:bg-gray-800/50 border border-transparent"
                    } ${isCollapsed ? 'justify-center px-2' : ''}`
                }
            >
                {/* Active indicator */}
                {({ isActive }) => (
                    <>
                        {isActive && (
                            <div className={`absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-r-full ${
                                isCollapsed ? 'left-1/2 -translate-x-1/2 w-8 h-1 top-auto -bottom-1 rounded-b-full' : ''
                            }`}></div>
                        )}
                        
                        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                            {Icon && (
                                <div className={`p-2 rounded-lg transition-all duration-300 ${
                                    isActive 
                                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg" 
                                        : "bg-gray-100/50 dark:bg-gray-700/50 group-hover:bg-gradient-to-r group-hover:from-purple-500/20 group-hover:to-pink-500/20"
                                } ${isCollapsed ? 'p-3' : ''}`}>
                                    <Icon className={`w-4 h-4 ${isActive ? 'scale-110' : ''} transition-transform ${
                                        isCollapsed ? 'w-5 h-5' : ''
                                    }`} />
                                </div>
                            )}
                            {!isCollapsed && (
                                <span className={`font-medium transition-all duration-300 ${
                                    isActive 
                                        ? "text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400" 
                                        : "text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"
                                }`}>
                                    {item.label}
                                </span>
                            )}
                        </div>
                        
                        {item.badge && !isCollapsed && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full transition-all duration-300 ${
                                isActive
                                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                                    : "bg-gray-200/70 dark:bg-gray-700/70 text-gray-600 dark:text-gray-300 group-hover:bg-gradient-to-r group-hover:from-purple-500/20 group-hover:to-pink-500/20"
                            }`}>
                                {item.badge}
                            </span>
                        )}
                        
                        {/* Show badge as dot when collapsed */}
                        {item.badge && isCollapsed && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                        )}
                        
                        {/* Hover effect */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                    </>
                )}
            </NavLink>

            {/* Tooltip for collapsed state */}
            {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 whitespace-nowrap">
                    {item.label}
                    {item.badge && (
                        <span className="ml-1 px-1 py-0.5 text-xs bg-gradient-to-r from-purple-500 to-pink-500 rounded">
                            {item.badge}
                        </span>
                    )}
                    {/* Tooltip arrow */}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-700"></div>
                </div>
            )}
        </li>
    );
};

export default SidebarItem;