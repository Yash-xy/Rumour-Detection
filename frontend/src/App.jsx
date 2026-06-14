import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import { LanguageProvider } from "./context/LanguageContext";
import { ToastProvider } from "./components/ui/Toast";
import Navbar      from "./components/Navbar";
import Footer      from "./components/Footer";
import CheckPage   from "./pages/CheckPage";
import HistoryPage from "./pages/HistoryPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage   from "./pages/LoginPage";
import SignupPage  from "./pages/SignupPage";
import AdminDashboard from "./pages/AdminDashboard";
import { Spinner } from "./components/ui/Spinner";

function MainApp() {
  const { loading } = useApp();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--bg)]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/25 animate-pulse">
            <span className="text-white font-black text-sm">SR</span>
          </div>
          <Spinner size="md" label="Restoring session..." />
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div id="app-root" className="flex flex-col min-h-screen w-full bg-[var(--bg)] bg-grid-pattern">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <Routes>
            <Route path="/"          element={<CheckPage />}    />
            <Route path="/history"   element={<HistoryPage />}  />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/login"     element={<LoginPage />}    />
            <Route path="/signup"    element={<SignupPage />}   />
            <Route path="/admin"     element={<AdminDashboard />} />
            <Route path="*"          element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppProvider>
        <ToastProvider>
          <MainApp />
        </ToastProvider>
      </AppProvider>
    </LanguageProvider>
  );
}
