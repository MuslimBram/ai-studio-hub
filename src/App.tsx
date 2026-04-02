import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { MfaGuard } from "@/components/MfaGuard";
import { ForceLogoutProvider } from "@/components/ForceLogoutProvider";
import Index from "./pages/Index";
import CategoryPage from "./pages/CategoryPage";
import SubcategoryPage from "./pages/SubcategoryPage";
import ToolPage from "./pages/ToolPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import DonatePage from "./pages/DonatePage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTools from "./pages/admin/AdminTools";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminDonations from "./pages/admin/AdminDonations";
import AdminUsers from "./pages/admin/AdminUsers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ForceLogoutProvider />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/tools/:categorySlug" element={<CategoryPage />} />
            <Route path="/tools/:categorySlug/:subcategorySlug" element={<SubcategoryPage />} />
            <Route path="/tool/:toolSlug" element={<ToolPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/donate" element={<DonatePage />} />

            {/* Protected routes — require 2FA */}
            <Route path="/profile" element={<MfaGuard><ProfilePage /></MfaGuard>} />
            <Route path="/admin" element={<MfaGuard><AdminDashboard /></MfaGuard>} />
            <Route path="/admin/tools" element={<MfaGuard><AdminTools /></MfaGuard>} />
            <Route path="/admin/categories" element={<MfaGuard><AdminCategories /></MfaGuard>} />
            <Route path="/admin/donations" element={<MfaGuard><AdminDonations /></MfaGuard>} />
            <Route path="/admin/users" element={<MfaGuard><AdminUsers /></MfaGuard>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
