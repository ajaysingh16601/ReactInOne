// src/components/Layout.tsx
import React, { lazy, Suspense, useState } from 'react';

const LazyNavbar = lazy(() => import('./Navbar'));
const LazySidebar = lazy(() => import('./Sidebar'));

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);
    const toggleSidebarCollapse = () => setIsSidebarCollapsed(!isSidebarCollapsed);

    return (
        <div className="min-h-screen bg-[hsl(var(--background))] dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Suspense fallback={<div>Loading Navbar...</div>}>
                <LazyNavbar
                    toggleSidebar={toggleSidebar}
                    toggleSidebarCollapse={toggleSidebarCollapse}
                    isSidebarCollapsed={isSidebarCollapsed}
                />
            </Suspense>
            <Suspense fallback={<div>Loading Sidebar...</div>}>
                <LazySidebar
                    isOpen={isSidebarOpen}
                    onClose={closeSidebar}
                    isCollapsed={isSidebarCollapsed}
                />
            </Suspense>
            <main
                className={`p-4 mt-14 transition-all duration-500 ease-out ${isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
                    }`}
            >
                <div>{children}</div>
            </main>
        </div>
    );
};

export default Layout;