import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useLang } from "../context/LanguageContext";
import { Sun, Moon, User, ShieldCheck, Globe, Menu, X } from "lucide-react";
import { Button } from "./ui/Button";
import { cn } from "../lib/cn";

export default function Navbar() {
  const { dark, setDark, user, setUser } = useApp();
  const { t, lang, toggleLang } = useLang();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NAV_LINKS = [
    { to: "/",          label: t("checkRumor") },
    { to: "/history",   label: t("history")    },
    { to: "/dashboard", label: t("dashboard")  },
  ];

  if (user?.is_admin) {
    NAV_LINKS.push({ to: "/admin", label: "Admin" });
  }

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
    navigate("/login");
  };

  return (
    <>
      <nav className="glass sticky top-0 z-50 border-b border-[var(--border)]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 no-underline group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-shadow duration-300">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <span className="text-base font-bold text-[var(--text)]">
              <span className="text-gradient">Scheme</span>Radar
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "relative px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 no-underline",
                  location.pathname === n.to
                    ? "text-primary-400 bg-primary-500/10"
                    : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)]"
                )}
              >
                {n.label}
                {location.pathname === n.to && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-primary-400" />
                )}
              </Link>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLang}
              title={lang === "en" ? "हिंदी में बदलें" : "Switch to English"}
              aria-label="Toggle language"
              className="gap-1.5 text-xs"
            >
              <Globe size={14} />
              <span className="hidden sm:inline">{lang === "en" ? "हिंदी" : "EN"}</span>
            </Button>

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDark((d) => !d)}
              title={t("toggleTheme")}
              aria-label={t("toggleTheme")}
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </Button>

            {/* User / Auth */}
            {user ? (
              <div className="flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-400 text-xs font-bold text-white ring-2 ring-[var(--border)]"
                  title={user.name}
                >
                  {user.name?.[0]?.toUpperCase() ?? "U"}
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden sm:inline-flex">
                  {t("logout")}
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login" className="no-underline gap-1.5">
                  <User size={14} /> {t("login")}
                </Link>
              </Button>
            )}

            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="absolute top-16 right-0 w-64 bg-[var(--bg-card)] border-l border-b border-[var(--border)] rounded-bl-xl shadow-2xl p-4 animate-slide-down"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 no-underline",
                    location.pathname === n.to
                      ? "text-primary-400 bg-primary-500/10"
                      : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)]"
                  )}
                >
                  {n.label}
                </Link>
              ))}
              {user && (
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-danger-400 hover:bg-danger-500/10 text-left transition-colors cursor-pointer"
                >
                  {t("logout")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
