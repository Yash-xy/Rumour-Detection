import { Shield, ExternalLink, Heart } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useLang } from "../context/LanguageContext";

export default function Footer() {
  const { t, lang } = useLang();
  return (
    <footer className="border-t border-white/5 bg-[var(--bg-card)]/60 backdrop-blur-sm mt-auto w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-primary-600">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-[var(--text)]">SchemeRadar</span>
            </div>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-xs">
              AI-powered government scheme rumor detection platform. Helping citizens verify claims about public welfare schemes.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <span className="flex items-center gap-1.5 text-xs text-[var(--text-dim)]">
                <div className="w-1.5 h-1.5 rounded-full bg-success-400 animate-pulse"></div>
                System Operational
              </span>
              <span className="text-xs text-[var(--text-dim)]/50">|</span>
              <span className="text-xs text-[var(--text-dim)]">v2.4.1</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider mb-3">Navigation</h4>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Check Rumor' },
                { to: '/history', label: 'History' },
                { to: '/dashboard', label: 'Dashboard' },
                { to: '/admin', label: 'Admin Panel' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <NavLink to={to} className="text-sm text-[var(--text-muted)] hover:text-primary-400 transition-colors">{label}</NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider mb-3">Resources</h4>
            <ul className="space-y-2">
              {[
                { label: 'Official Schemes Portal', href: 'https://india.gov.in' },
                { label: 'MyGov India', href: 'https://mygov.in' },
                { label: 'PIB Fact Check', href: 'https://pib.gov.in' },
                { label: 'API Documentation', href: '#' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-primary-400 transition-colors">
                    {label}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--text-dim)]">
            © 2026 SchemeRadar. Built for the Government of India's Digital India Initiative. Built by Palak Tanish Yash.
          </p>
          <p className="text-xs text-[var(--text-dim)] flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-danger-400" /> for citizens of India
          </p>
        </div>
      </div>
    </footer>
  )
}
