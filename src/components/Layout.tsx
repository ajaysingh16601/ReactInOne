// src/components/Layout.tsx
import React, { lazy, Suspense, useState } from 'react';

// Dynamic code splitting with lazy loading for modularity and performance
const LazyNavbar = lazy(() => import('./Navbar'));
const LazySidebar = lazy(() => import('./Sidebar'));
const LazyHeader = lazy(() => import('./Header')); // Optional, if used in main
// const LazyFooter = lazy(() => import('./Footer'));

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => {
    setIsSidebarOpen(false);
    };

    return (
        <div className="mybody min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Suspense fallback={<div>Loading Navbar...</div>}>
            <LazyNavbar toggleSidebar={toggleSidebar} />
        </Suspense>
        <Suspense fallback={<div>Loading Sidebar...</div>}>
            <LazySidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        </Suspense>
        <main className="p-4 md:ml-64 mt-14">
            <div className="p-4 border-2 border-dashed rounded-lg border-gray-200 dark:border-gray-700">
            {/* <Suspense fallback={<div>Loading Header...</div>}>
                <LazyHeader />
            </Suspense> */}
            {children}
            {/* <Suspense fallback={<div>Loading Footer...</div>}>
                <LazyFooter />
            </Suspense> */}
            </div>
        </main>
        </div>
    );
};

export default Layout;