import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useLang } from "../context/LanguageContext";
import { Badge } from "./ui/Badge";
import { Spinner } from "./ui/Spinner";

/**
 * SchemeDetailPopup
 * A modal showing full details of a single scheme (used from Dashboard).
 * Props:
 *   scheme  – { scheme, details, benefits, eligibility, level, category, validity }
 *   onClose – function to close the popup
 *   loading – optional bool for loading state
 */
export default function SchemeDetailPopup({ scheme, onClose, loading }) {
  const { t } = useLang();

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const validityVariant =
    scheme?.status?.toLowerCase() === "active" ? "success" :
    scheme?.status?.toLowerCase()?.includes("expired") ? "destructive" : "warning";

  const modalContent = (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[560px] max-h-[85vh] overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl shadow-black/40 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)] sticky top-0 bg-[var(--bg-card)] z-10">
          <h2 className="text-lg font-bold text-[var(--text)]">{t("schemeDetails")}</h2>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
            onClick={onClose}
            aria-label={t("close")}
          >
            ✕
          </button>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <Spinner size="md" label="Loading…" />
          </div>
        )}

        {!loading && scheme && (
          <div className="p-5 animate-fade-in space-y-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-bold text-[var(--text)] leading-snug flex-1">{scheme.scheme}</h3>
              <Badge variant={validityVariant} className="flex-shrink-0">
                {scheme.status || "N/A"}
              </Badge>
            </div>

            {scheme.level && (
              <Badge variant={scheme.level === "Central" ? "default" : "secondary"}>
                {scheme.level}
              </Badge>
            )}

            <div className="space-y-3 mt-2">
              {scheme.details && (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
                  <h4 className="text-sm font-semibold text-primary-400 mb-2">📋 {t("description")}</h4>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{scheme.details}</p>
                </div>
              )}
              {scheme.benefits && (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
                  <h4 className="text-sm font-semibold text-primary-400 mb-2">🎁 {t("benefits")}</h4>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{scheme.benefits}</p>
                </div>
              )}
              {scheme.eligibility && (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
                  <h4 className="text-sm font-semibold text-primary-400 mb-2">✅ {t("eligibility")}</h4>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{scheme.eligibility}</p>
                </div>
              )}
              {scheme.application && (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
                  <h4 className="text-sm font-semibold text-primary-400 mb-2">📝 {t("application") || "Application Process"}</h4>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{scheme.application}</p>
                </div>
              )}
              {scheme.documents && (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
                  <h4 className="text-sm font-semibold text-primary-400 mb-2">📎 {t("documents") || "Required Documents"}</h4>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{scheme.documents}</p>
                </div>
              )}
              {scheme.category && (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
                  <h4 className="text-sm font-semibold text-primary-400 mb-2">📁 {t("category")}</h4>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{scheme.category}</p>
                </div>
              )}
              {scheme.tags && (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
                  <h4 className="text-sm font-semibold text-primary-400 mb-2">🏷️ {t("tags") || "Tags"}</h4>
                  <div className="flex flex-wrap gap-2">
                    {scheme.tags.split(",").map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">{tag.trim()}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {scheme.sentiment && (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
                  <h4 className="text-sm font-semibold text-primary-400 mb-2">💬 {t("sentiment") || "Sentiment"}</h4>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{scheme.sentiment}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {!loading && !scheme && (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-[var(--text-dim)]">Scheme not found.</p>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
