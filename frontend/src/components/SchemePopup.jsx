import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLang } from "../context/LanguageContext";
import { Badge } from "./ui/Badge";
import { getSchemeByName } from "../services/api";
import SchemeDetailPopup from "./SchemeDetailPopup";

/**
 * SchemePopup
 * A modal showing up to 4 related schemes in card layout.
 * Props:
 *   schemes  – array of { scheme, level, similarity, verdict, details, benefits, eligibility, category, validity }
 *   onClose  – function to close the popup
 */
export default function SchemePopup({ schemes, onClose }) {
  const { t } = useLang();
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [schemeLoading, setSchemeLoading] = useState(false);
  const [showSchemeDetailPopup, setShowSchemeDetailPopup] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { 
      if (e.key === "Escape") {
        if (showSchemeDetailPopup) {
          setShowSchemeDetailPopup(false);
          setSelectedScheme(null);
        } else {
          onClose(); 
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, showSchemeDetailPopup]);

  const handleSchemeClick = async (schemeName) => {
    setSchemeLoading(true);
    setShowSchemeDetailPopup(true);
    setSelectedScheme(null);
    try {
      const { data } = await getSchemeByName(schemeName);
      setSelectedScheme(data);
    } catch (err) {
      console.error("Failed to fetch scheme details:", err);
      setSelectedScheme(null);
    } finally {
      setSchemeLoading(false);
    }
  };

  if (!schemes || schemes.length === 0) return null;

  const modalContent = (
    <>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      >
        <div
          className="w-full max-w-[780px] max-h-[85vh] overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl shadow-black/40 animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[var(--border)] sticky top-0 bg-[var(--bg-card)] z-10">
            <h2 className="text-lg font-bold text-[var(--text)]">{t("relatedSchemes")}</h2>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
              onClick={onClose}
              aria-label={t("close")}
            >
              ✕
            </button>
          </div>

          {/* Scheme grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-5">
            {schemes.map((s, i) => {
              const validityVariant =
                s.status?.toLowerCase() === "active" ? "success" :
                s.status?.toLowerCase().includes("expired") ? "destructive" : "warning";

              return (
                <div
                  key={i}
                  onClick={() => handleSchemeClick(s.scheme)}
                  className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-4 transition-all duration-200 hover:border-primary-500/50 hover:shadow-lg animate-fade-in cursor-pointer group"
                  style={{ animationDelay: `${i * 0.08}s` }}
                  title="Click to view details"
                >
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <span className="text-sm font-semibold text-[var(--text)] group-hover:text-primary-400 transition-colors leading-snug flex-1">
                      {s.scheme}
                    </span>
                    <Badge variant={validityVariant} className="text-xs px-2.5 py-0.5 flex-shrink-0 uppercase tracking-widest font-bold shadow-sm border-2">
                      {s.status || "N/A"}
                    </Badge>
                  </div>

                  <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3">
                    {s.details
                      ? (s.details.length > 150 ? s.details.slice(0, 150) + "…" : s.details)
                      : t("noDescription")}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-dim)] font-medium">{t("schemeLevel")}</span>
                      <Badge variant={s.level === "Central" ? "default" : "secondary"} className="text-[10px]">
                        {s.level}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-dim)] font-medium">{t("similarityScore")}</span>
                      <span className="font-semibold font-mono text-[var(--text)] text-[11px]">
                        {(s.similarity * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-dim)] font-medium">{t("category")}</span>
                      <span className="font-medium text-[var(--text-muted)] text-[11px] max-w-[160px] text-right truncate">
                        {s.category || "—"}
                      </span>
                    </div>
                    {s.tags && (
                      <div className="flex items-center justify-between text-xs gap-2 mt-1">
                        <span className="text-[var(--text-dim)] font-medium">{t("tags") || "Tags"}</span>
                        <div className="flex gap-1 overflow-hidden justify-end">
                          {s.tags.split(",").slice(0, 2).map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-[9px] px-1 py-0">{tag.trim()}</Badge>
                          ))}
                          {s.tags.split(",").length > 2 && <span className="text-[10px] text-[var(--text-muted)]">+{s.tags.split(",").length - 2}</span>}
                        </div>
                      </div>
                    )}
                    {s.sentiment && (
                      <div className="flex items-center justify-between text-xs gap-2 mt-1">
                        <span className="text-[var(--text-dim)] font-medium">{t("sentiment") || "Sentiment"}</span>
                        <span className="font-medium text-[var(--text-muted)] text-[11px] max-w-[160px] text-right truncate">
                          {s.sentiment}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {showSchemeDetailPopup && (
        <SchemeDetailPopup 
          scheme={selectedScheme} 
          loading={schemeLoading} 
          onClose={() => { 
            setShowSchemeDetailPopup(false); 
            setSelectedScheme(null); 
          }} 
        />
      )}
    </>
  );

  return createPortal(modalContent, document.body);
}
