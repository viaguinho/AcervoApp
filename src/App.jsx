import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from './components/Layout';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const Catalog = lazy(() => import('./pages/Catalog'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Bag = lazy(() => import('./pages/Bag'));
const Admin = lazy(() => import('./pages/Admin'));
const LandingPage = lazy(() => import('./pages/LandingPage'));

const ScrollToTop = () => {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Intercepta link de compartilhamento (ex: /?product=123) e redireciona
    if (pathname === '/' && search.includes('product=')) {
      const params = new URLSearchParams(search);
      const productId = params.get('product');
      if (productId) {
        navigate(`/product/${productId}`, { replace: true });
        return;
      }
    }

    // Reset global window scroll
    window.scrollTo(0, 0);
    
    // Reset any internal scroll containers
    const scrollContainers = document.querySelectorAll('.overflow-y-auto');
    scrollContainers.forEach(container => {
      container.scrollTop = 0;
    });
  }, [pathname, search, navigate]);

  return null;
};

const RequireAgeVerification = ({ children }) => {
  const verified = localStorage.getItem('age_verified') === 'true';
  const location = useLocation();

  if (!verified && location.pathname !== '/welcome') {
    return <Navigate to="/welcome" replace state={{ from: location }} />;
  }

  return children;
};

const RequireAdmin = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (user?.role !== "admin") {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Suspense fallback={
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    }>
      <Routes>
        <Route element={<RequireAgeVerification><Layout /></RequireAgeVerification>}>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/bag" element={<Bag />} />
          <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
        <Route path="/welcome" element={<LandingPage />} />
      </Routes>
    </Suspense>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App