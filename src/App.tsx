import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import ScrollToTop from "./components/ScrollToTop";
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
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminLayout from "./admin/AdminLayout";
import Login from "./admin/Login";
import PasscodePage from "./admin/PasscodePage";
import Dashboard from "./admin/Dashboard";
import AddEditNews from "./admin/AddEditNews";

export default function App() {
  return (
    <ErrorBoundary>
      <RamadanAzanPlayer />
      <HelmetProvider>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <Router>
                <ScrollToTop />
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
              </Router>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}
