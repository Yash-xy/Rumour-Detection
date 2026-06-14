import { useState, useEffect } from "react";
import { Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Spinner } from "./ui/Spinner";
import SchemePopup from "./SchemePopup";
import { useLang } from "../context/LanguageContext";
import { cn } from "../lib/cn";

/**
 * HistoryItem
 * Props:
 *   item – { text, result: { scheme, verdict, confidence, isRumor, timestamp, related_schemes, ... } }
 */
export default function HistoryItem({ item, showUser }) {
  const { t } = useLang();
  const { text, result, user_name } = item;
  const [expanded, setExpanded] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [confVisible, setConfVisible] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const [localExplanation, setLocalExplanation] = useState(result.explanation || "");

  useEffect(() => {
    if (expanded) {
      setConfVisible(0);
      setLocalExplanation(result.explanation || "");
      const timer = setTimeout(() => setConfVisible(result.confidence), 80);
      return () => clearTimeout(timer);
    }
  }, [expanded, result.confidence, result.explanation]);

  const handleGenerateAI = async (e) => {
    e.stopPropagation();
    if (!item.id) return;
    setAiLoading(true);
    try {
      const { getAIExplanation } = await import('../services/api');
      const { data } = await getAIExplanation(item.id);
      if (data && data.explanation) {
        setLocalExplanation(data.explanation);
      }
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to generate AI analysis.";
      setLocalExplanation(`⚠️ Error: ${msg}`);
      console.error("Failed to generate AI analysis:", err);
    } finally {
      setAiLoading(false);
    }
  };

  const fmt = (ts) =>
    new Date(ts).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  const levelClass =
    result?.level === "High"   ? "destructive" :
    result?.level === "Medium" ? "warning"     : "success";

  return (
    <>
      <div className={cn(
        "group rounded-xl border border-[var(--border)] bg-[var(--bg-card)] transition-all duration-200 hover:border-[var(--border-hover)] hover:shadow-lg hover:shadow-primary-500/5",
        expanded && "border-primary-500/30 bg-[var(--bg-elevated)] shadow-lg shadow-primary-500/5"
      )}>
        {/* Main row */}
        <div
          className="flex items-start gap-3 p-4 cursor-pointer"
          onClick={() => setExpanded((e) => !e)}
        >
          <div className="text-xl flex-shrink-0 mt-0.5">{result.isRumor ? "🚨" : "✅"}</div>

          <div className="flex-1 min-w-0">
            <p className="text-sm text-[var(--text)] truncate mb-2 font-medium">{text}</p>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={result.isRumor ? "destructive" : "success"} className="text-[10px]">
                {result.verdict}
              </Badge>

              <Badge variant="secondary" className="text-[10px] font-mono">
                🏛 {result.scheme}
              </Badge>

              <span className="text-[10px] font-mono text-[var(--text-dim)]">
                {t("conf")}: {result.confidence}%
              </span>

              {showUser && user_name && (
                <span className="text-[10px] text-accent-400 font-medium">
                  👤 {user_name}
                </span>
              )}

              <span className="inline-flex items-center gap-1 text-[10px] text-[var(--text-dim)] font-mono">
                <Clock size={10} />
                {fmt(result.timestamp)}
              </span>
            </div>
          </div>

          <div className="text-[var(--text-dim)] group-hover:text-[var(--text)] transition-colors flex-shrink-0 mt-1">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>

        {/* Expanded analysis card */}
        {expanded && (
          <div className="border-t border-[var(--border)] px-4 pb-4 pt-4 animate-fade-in space-y-4">
            {/* Verdict banner */}
            <div className={cn(
              "flex items-center gap-3 rounded-lg p-3.5 border",
              result.isRumor
                ? "bg-danger-500/10 border-danger-500/20"
                : "bg-success-500/10 border-success-500/20"
            )}>
              <span className="text-2xl flex-shrink-0">{result.isRumor ? "🚨" : "✅"}</span>
              <div>
                <div className={cn(
                  "text-base font-bold",
                  result.isRumor ? "text-danger-400" : "text-success-400"
                )}>
                  {result.verdict}
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">
                  {result.isRumor ? t("misleading") : t("official")}
                </div>
              </div>
            </div>

            {/* AI Explanation Section */}
            {localExplanation ? (
              <div className="rounded-lg border-l-4 border-primary-500 bg-primary-500/10 px-4 py-3">
                <strong className="text-xs font-semibold text-primary-400 block mb-1">💡 AI Analysis</strong>
                <span className="text-xs text-[var(--text-muted)] leading-relaxed">{localExplanation}</span>
              </div>
            ) : (
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateAI}
                  disabled={aiLoading}
                  className="gap-2 border-primary-500/30 text-primary-400 hover:bg-primary-500/10"
                >
                  {aiLoading ? <Spinner size="sm" inline /> : "💡"}
                  {aiLoading ? "Generating AI Analysis..." : "Generate AI Analysis"}
                </Button>
              </div>
            )}

            {/* Detail rows */}
            <div className="divide-y divide-[var(--border)]">
              <div className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-[var(--text-muted)] font-medium text-xs">{t("relatedScheme")}</span>
                <Badge variant="secondary" className="font-mono text-[10px]">🏛 {result.scheme}</Badge>
              </div>
              <div className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-[var(--text-muted)] font-medium text-xs">{t("level")}</span>
                <Badge variant={levelClass} className="text-[10px]">{result.level} Risk</Badge>
              </div>
              <div className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-[var(--text-muted)] font-medium text-xs">{t("similarity")}</span>
                <span className="font-semibold font-mono text-xs text-[var(--text)]">{(+result.similarity * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-[var(--text-muted)] font-medium text-xs">{t("confidence")}</span>
                <span className="font-semibold font-mono text-xs text-[var(--text)]">{result.confidence}%</span>
              </div>
            </div>

            {/* Confidence bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-[var(--text-dim)]">
                <span>{t("confidenceScore")}</span>
                <span className="font-mono font-semibold tabular-nums">{result.confidence}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[var(--bg-muted)] overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-1000 ease-out",
                    result.isRumor
                      ? "bg-gradient-to-r from-danger-600 to-danger-400"
                      : "bg-gradient-to-r from-success-600 to-success-400"
                  )}
                  style={{ width: `${confVisible}%` }}
                />
              </div>
            </div>

            {/* Related Schemes Button */}
            {result.related_schemes && result.related_schemes.length > 0 && (
              <Button
                className="w-full"
                size="sm"
                onClick={(e) => { e.stopPropagation(); setShowPopup(true); }}
              >
                🏛 {t("viewRelated")}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Related Schemes Popup */}
      {showPopup && result?.related_schemes && (
        <SchemePopup
          schemes={result.related_schemes}
          onClose={() => setShowPopup(false)}
        />
      )}
    </>
  );
}
