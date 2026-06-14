import { useState } from "react";
import { Search, Trash2, Globe, User, History, Filter } from "lucide-react";
import HistoryItem from "../components/HistoryItem";
import { useApp } from "../context/AppContext";
import { useLang } from "../context/LanguageContext";
import { useToast } from "../components/ui/Toast";
import useDebounce from "../hooks/useDebounce";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Alert } from "../components/ui/Alert";
import { Badge } from "../components/ui/Badge";
import { cn } from "../lib/cn";

export default function HistoryPage() {
  const { publicHistory, myHistory, totalPublic, totalMy, fetchPublicHistory, fetchMyHistory, clearHistory, user } = useApp();
  const { t } = useLang();
  const { addToast } = useToast();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [filter, setFilter] = useState("all");
  const [tab, setTab] = useState("public");

  const activeHistory = tab === "my" ? myHistory : publicHistory;
  const activeTotal = tab === "my" ? totalMy : totalPublic;
  const hasMore = debouncedSearch === "" && filter === "all" && activeHistory.length < activeTotal;

  const counts = {
    all: activeHistory.length,
    rumor: activeHistory.filter((h) => h.isRumor).length,
    legit: activeHistory.filter((h) => !h.isRumor).length,
  };

  const FILTERS = [
    { id: "all", label: t("all"), count: counts.all, color: "text-[var(--text)]" },
    { id: "rumor", label: t("rumors"), count: counts.rumor, color: "text-danger-400" },
    { id: "legit", label: t("legitimate"), count: counts.legit, color: "text-success-400" },
  ];

  const filtered = activeHistory.filter((h) => {
    const searchText = h.text?.toLowerCase() || "";
    const searchScheme = h.scheme?.toLowerCase() || "";
    const matchSearch = searchText.includes(debouncedSearch.toLowerCase()) || searchScheme.includes(debouncedSearch.toLowerCase());
    const matchFilter = filter === "all" || (filter === "rumor" && h.isRumor) || (filter === "legit" && !h.isRumor);
    return matchSearch && matchFilter;
  });

  const handleClearAll = () => {
    if (window.confirm(t("clearConfirm"))) {
      clearHistory();
      addToast("History cleared successfully", "success");
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header with stats */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 sm:p-8 mb-10 lg:mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-radial-glow opacity-50 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <History size={20} className="text-primary-400" />
                <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)] tracking-tight">
                  {t("analysisHistory")}
                </h1>
              </div>
              <p className="text-sm text-[var(--text-muted)]">
                {activeHistory.length} {t("historySubtitle")}
              </p>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-3">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "rounded-xl border p-3 text-center transition-all duration-200 cursor-pointer",
                  filter === f.id
                    ? "border-primary-500/30 bg-primary-500/10 shadow-sm"
                    : "border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--border-hover)]"
                )}
              >
                <div className={cn("text-2xl font-bold font-mono", f.color)}>{f.count}</div>
                <div className="text-[10px] text-[var(--text-dim)] uppercase tracking-wider mt-0.5">{f.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab + Search row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8 lg:mb-10">
        {/* Tabs */}
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] flex-shrink-0">
          <button
            className={cn(
              "inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer",
              tab === "public" ? "bg-primary-500/15 text-primary-400 shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text)]"
            )}
            onClick={() => { setTab("public"); setFilter("all"); }}
          >
            <Globe size={14} /> {t("lang") === "hi" ? "सार्वजनिक" : "Public"}
          </button>
          <button
            className={cn(
              "inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer",
              tab === "my" ? "bg-primary-500/15 text-primary-400 shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text)]"
            )}
            onClick={() => { setTab("my"); setFilter("all"); }}
          >
            <User size={14} /> {t("lang") === "hi" ? "मेरा" : "Mine"}
          </button>
        </div>

        {/* Search */}
        <div className="flex-1">
          <Input icon={Search} placeholder={t("searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} className="h-11" />
        </div>

        {/* Clear */}
        {tab === "my" && user && myHistory.length > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClearAll} className="text-danger-400 hover:text-danger-300 hover:bg-danger-500/10 flex-shrink-0">
            <Trash2 size={14} /> {t("clearAll")}
          </Button>
        )}
      </div>

      {/* Login prompt */}
      {tab === "my" && !user && (
        <Alert variant="info" className="mb-5">
          <span>🔒</span>
          <span>{t("lang") === "hi" ? "अपना व्यक्तिगत इतिहास देखने के लिए लॉगिन करें।" : "Please log in to view your personal search history."}</span>
        </Alert>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] flex flex-col items-center justify-center py-20 text-center">
          <div className="h-20 w-20 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center text-4xl mb-5 opacity-40">
            {search ? "🔎" : "📋"}
          </div>
          <p className="text-sm text-[var(--text-dim)] max-w-xs">
            {search ? t("noSearchResults") : t("noHistory")}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((item) => (
            <HistoryItem
              key={item.id}
              item={{
                id: item.id, text: item.text,
                result: {
                  scheme: item.scheme, verdict: item.verdict, confidence: item.confidence,
                  isRumor: item.isRumor, timestamp: item.timestamp, similarity: item.similarity,
                  level: item.level, related_schemes: item.related_schemes || [], explanation: item.explanation,
                },
                user_name: item.user_name,
              }}
              showUser={tab === "public"}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && filtered.length > 0 && (
        <div className="text-center mt-6">
          <Button variant="outline" onClick={() => { tab === "my" ? fetchMyHistory(myHistory.length) : fetchPublicHistory(publicHistory.length); }}>
            {t("lang") === "hi" ? "और लोड करें" : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
