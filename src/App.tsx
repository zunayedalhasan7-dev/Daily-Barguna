import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { SmoothScrollProvider } from "./components/SmoothScrollProvider";
import ErrorBoundary from "./components/ErrorBoundary";
import RamadanAzanPlayer from "./components/RamadanAzanPlayer";

// Public Pages
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Category from "./pages/Category";
import NewsDetail from "./pages/NewsDetail";
import Search from "./pages/Search";
import AboutUs from "./pages/AboutUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import Contact from "./pages/Contact";
import UnionNews from "./pages/UnionNews";
import AllUnions from "./pages/AllUnions";
import EditorInfo from "./pages/EditorInfo";
import WorldNews from "./pages/WorldNews";
import DownloadPage from "./pages/Download";
import NotFound from "./pages/NotFound";

// Admin Pages (Lazy Loaded)
const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const Login = lazy(() => import("./admin/Login"));
const PasscodePage = lazy(() => import("./admin/PasscodePage"));
const Dashboard = lazy(() => import("./admin/Dashboard"));
const AddEditNews = lazy(() => import("./admin/AddEditNews"));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
  </div>
);

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <RamadanAzanPlayer />
        <HelmetProvider>
          <ThemeProvider>
            <AuthProvider>
              <Router>
                <SmoothScrollProvider>
                  <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="category/:category" element={<Category />} />
                        <Route path="news/:id" element={<NewsDetail />} />
                        <Route path="search" element={<Search />} />
                        <Route path="about" element={<AboutUs />} />
                        <Route path="privacy" element={<PrivacyPolicy />} />
                        <Route path="terms" element={<TermsConditions />} />
                        <Route path="contact" element={<Contact />} />
                        <Route path="union/:unionName" element={<UnionNews />} />
                        <Route path="unions" element={<AllUnions />} />
                        <Route path="world" element={<WorldNews />} />
                        <Route path="download" element={<DownloadPage />} />
                        <Route path="editor-info" element={<EditorInfo />} />
                        <Route path="*" element={<NotFound />} />
                      </Route>

                      {/* Admin Routes */}
                      <Route path="/admin/passcode" element={<PasscodePage />} />
                      <Route path="/admin/login" element={<Login />} />
                      <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="news" element={<Dashboard />} />
                        <Route path="news/add" element={<AddEditNews />} />
                        <Route path="news/edit/:id" element={<AddEditNews />} />
                      </Route>
                    </Routes>
                  </Suspense>
                </SmoothScrollProvider>
              </Router>
            </AuthProvider>
          </ThemeProvider>
        </HelmetProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
