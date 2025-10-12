import React, { lazy, Suspense } from "react";
import { menuItems } from "../config/menuConfig";
import SidebarItem from "./sidebar/SidebarItem";
import SidebarSubmenu from "./sidebar/SidebarSubmenu";
const LazyFooter = lazy(() => import('./Footer'));

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isCollapsed = false }) => {
  return (
    <>
      {/* Background Overlay for Mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm md:hidden" 
        onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen pt-20 transition-all duration-500 ease-out bg-[hsl(var(--background))] dark:bg-gray-900/80 backdrop-blur-xl border-r border-white/20 dark:border-gray-700/50 shadow-2xl ${
          isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 md:translate-x-0 md:opacity-100"
        } ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Sidebar Background Effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-400/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent dark:from-gray-800/20"></div>
        </div>

        {/* Navigation Items */}
        <div className="relative z-10 h-full flex flex-col">
          <ul className="space-y-1 px-3 py-4 flex-1">
            {menuItems.map((item, idx) => (
              <div
                key={idx}
                className="transform transition-all duration-300 hover:translate-x-2"
                style={{ transitionDelay: `${idx * 50}ms` }}
              >
                {item.children ? (
                  <SidebarSubmenu item={item} onCloseSidebar={onClose} isCollapsed={isCollapsed} />
                ) : (
                  <SidebarItem item={item} onCloseSidebar={onClose} isCollapsed={isCollapsed} />
                )}
              </div>
            ))}
          </ul>

          {/* Footer - Only show when not collapsed */}
          {!isCollapsed && (
            <div className="p-4 border-t border-white/20 dark:border-gray-700/30">
              <Suspense fallback={
                <div className="flex items-center justify-center p-4">
                  <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              }>
                <LazyFooter />
              </Suspense>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;