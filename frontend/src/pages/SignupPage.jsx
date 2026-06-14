import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Lock, Mail, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Alert } from "../components/ui/Alert";
import { Spinner } from "../components/ui/Spinner";
import { useToast } from "../components/ui/Toast";
import { registerUser } from "../services/api";
import { useApp } from "../context/AppContext";
import { useLang } from "../context/LanguageContext";

export default function SignupPage() {
  const { setUser } = useApp();
  const { t } = useLang();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    if (!name || !email || !pass) return "Please fill in all fields.";
    if (!/\S+@\S+\.\S+/.test(email)) return "Please enter a valid email address.";
    if (pass.length < 6) return "Password must be at least 6 characters.";
    return "";
  };

  const handleSignup = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    setLoading(true);
    try {
      const { data } = await registerUser(name, email, pass);
      localStorage.setItem("access_token", data.access_token);
      setUser(data.user);
      addToast(`Welcome to SchemeRadar, ${data.user?.name || ""}!`, "success");
      navigate("/");
    } catch (e) {
      setError(e.response?.data?.detail || "Registration failed. Please try again.");
      addToast("Registration failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 lg:py-20 animate-fade-in">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden shadow-2xl shadow-black/20">
        {/* Left - Illustration Panel */}
        <div className="hidden lg:flex flex-col justify-between p-10 relative bg-gradient-to-br from-primary-900/30 via-[var(--bg-card)] to-accent-500/10 overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <img src="/images/schemes.png" alt="" className="w-full h-full object-cover" loading="lazy" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-transparent" />

          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-12">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/25">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <span className="text-lg font-bold"><span className="text-gradient">Scheme</span>Radar</span>
            </div>

            <h2 className="text-3xl font-bold tracking-tight mb-4 leading-tight">
              Start Detecting<br />
              <span className="text-gradient">Rumors Today</span>
            </h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-sm">
              Create your account to access personalized history, analytics dashboard, and AI-powered analysis.
            </p>
          </div>

          <div className="relative z-10 space-y-3">
            {["Unlimited scheme verification", "Personal analysis history", "AI-powered explanations", "Real-time dashboard analytics"].map((feat) => (
              <div key={feat} className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <div className="h-5 w-5 rounded-full bg-primary-500/15 flex items-center justify-center">
                  <ArrowRight size={10} className="text-primary-400" />
                </div>
                {feat}
              </div>
            ))}
          </div>
        </div>

        {/* Right - Signup Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold"><span className="text-gradient">Scheme</span>Radar</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[var(--text)] tracking-tight">{t("createAccount")}</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">{t("joinSchemeRadar")}</p>
          </div>

          {error && <Alert variant="destructive" className="mb-5">{error}</Alert>}

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--text-muted)]">{t("fullName")}</label>
              <Input icon={User} type="text" placeholder="Aditya Kumar" value={name} onChange={(e) => setName(e.target.value)} className="h-11" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--text-muted)]">{t("email")}</label>
              <Input icon={Mail} type="email" placeholder="you@example.gov.in" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--text-muted)]">{t("password")}</label>
              <Input icon={Lock} type="password" placeholder="Min 6 characters" value={pass} onChange={(e) => setPass(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSignup()} className="h-11" />
            </div>

            <Button className="w-full h-11 text-sm mt-1" onClick={handleSignup} disabled={loading}>
              {loading && <Spinner size="sm" inline />}
              {loading ? "Creating account…" : t("createBtn")}
            </Button>

            <div className="flex items-center gap-3 text-[var(--text-dim)] text-xs my-1">
              <div className="flex-1 h-px bg-[var(--border)]" />
              <span>{t("or")}</span>
              <div className="flex-1 h-px bg-[var(--border)]" />
            </div>

            <p className="text-center text-sm text-[var(--text-muted)]">
              {t("haveAccount")}{" "}
              <Link to="/login" className="text-primary-400 font-semibold hover:underline no-underline">{t("signIn")}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
