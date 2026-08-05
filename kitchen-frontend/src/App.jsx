import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
// import ChatBot from "./components/ChatBot"; // CHATBOT DISABLED
import ScrollToTop from "./components/ScrollToTop";
import WhatsAppButton from "./components/WhatsAppButton";
import ToastViewport from "./components/ToastViewport";

import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import CategoriesPage from "./pages/CategoriesPage";
import ProductDetail from "./pages/ProductDetail";
import Search from "./pages/Search";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import DownloadCenter from "./pages/DownloadCenter";
import DealerLocator from "./pages/DealerLocator";

// Pages with full-screen hero images — navbar overlays them, no spacer needed
const HERO_ROUTES = new Set(["/", "/shop"]);

function PublicLayout() {
  const location = useLocation();
  const needsSpacer = !HERO_ROUTES.has(location.pathname);

  return (
    <>
      <Navbar />
      {/* Spacer for fixed navbar on non-hero pages */}
      {needsSpacer && <div aria-hidden="true" style={{ height: "var(--navbar-height)" }} />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Home />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/category/:slug" element={<CategoriesPage />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/search" element={<Search />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/downloads" element={<DownloadCenter />} />
        <Route path="/dealers" element={<DealerLocator />} />
      </Routes>
      <Footer />
      <WhatsAppButton />
      {/* <ChatBot /> */}{/* CHATBOT DISABLED */}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <ScrollToTop />
          <ToastViewport />
          <Routes>
            {/* Admin Routes (no navbar/footer) */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

            {/* Public Routes */}
            <Route path="/*" element={<PublicLayout />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
