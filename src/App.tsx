import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './hooks/index';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ProtectedLayout from './components/ProtectedLayout';
import Dashboard from './pages/Dashboard';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import { restoreAuth, hydrate } from './feature/auth/authSlice';
import AboutPage from './pages/AboutPage';

function App() {
    const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.mode);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  useEffect(() => {
    // Restore authentication if tokens exist
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const user = localStorage.getItem('user');
    if (accessToken && refreshToken && user) {
      console.log('Restoring auth from localStorage');
      dispatch(restoreAuth({ tokens: { accessToken, refreshToken }, user: JSON.parse(user) }));
    } else {
      dispatch(hydrate()); // mark complete even if not logged in
    }

    // Set theme class on document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dispatch, theme]);


  return (
    <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Protected routes wrapped in ProtectedLayout */}
            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/about" element={<AboutPage />} />
              {/* Add other protected routes here, e.g.: */}
              {/* <Route path="/kanban" element={<KanbanPage />} /> */}
              {/* Default redirect for / to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/about" element={<Navigate to="/about" replace />} />
            </Route>
            {/* Catch-all: Redirect to login or home */}
            <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />        
        </Routes>
    </Router>  
  );
}

export default App;