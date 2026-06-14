import { useEffect, useState } from "react";
import { Spinner } from "./ui/Spinner";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { Card, CardContent, CardHeader } from "./ui/Card";
import SchemePopup from "./SchemePopup";
import { useLang } from "../context/LanguageContext";
import { cn } from "../lib/cn";

/**
 * ResultDisplay
 * Props:
 *   result  – object { scheme, level, similarity, verdict, confidence, isRumor, related_schemes, ... }
 *             or null when no analysis has been run yet
 *   loading – bool
 */
export default function ResultDisplay({ result, loading }) {
  const { t } = useLang();
  const [confVisible, setConfVisible] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [localExplanation, setLocalExplanation] = useState("");

  // Animate confidence bar and set initial AI explanation when result arrives
  useEffect(() => {
    if (result) {
      setConfVisible(0);
      setLocalExplanation(result.explanation || "");
      const timer = setTimeout(() => setConfVisible(result.confidence), 80);
      return () => clearTimeout(timer);
    }
  }, [result]);

  const handleGenerateAI = async () => {
    if (!result || !result.history_id) return;
    setAiLoading(true);
    try {
      const { getAIExplanation } = await import('../services/api');
      const { data } = await getAIExplanation(result.history_id);
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

  const levelClass =
    result?.level === "High"   ? "destructive" :
    result?.level === "Medium" ? "warning"     : "success";

  const rows = result
    ? [
        { key: t("relatedScheme"), value: <Badge variant="secondary" className="font-mono text-xs">🏛 {result.scheme}</Badge> },
        { key: t("level"),         value: <Badge variant={levelClass}>{result.level} Risk</Badge> },
        { key: t("similarity"),    value: `${(+result.similarity * 100).toFixed(1)}%` },
        { key: t("confidence"),    value: `${result.confidence}%` },
        { key: t("status") || "Status", value: <Badge variant={result.status?.toLowerCase() === 'active' ? 'success' : 'secondary'} className="text-[10px]">{result.status || "N/A"}</Badge> },
        { key: t("sentiment") || "Sentiment", value: <span className="font-medium">{result.sentiment || "N/A"}</span> },
      ]
    : [];

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <CardHeader className="flex-row items-center justify-between pb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
          {t("analysisResult")}
        </h3>
        {result && (
          <Badge variant={result.isRumor ? "destructive" : "success"}>
            {result.isRumor ? t("alert") : t("clear")}
          </Badge>
        )}
      </CardHeader>

      <CardContent>
        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center min-h-[280px]">
            <Spinner size="lg" label={t("crossRef")} />
          </div>
        )}

        {/* Result body */}
        {!loading && result && (
          <div className="animate-fade-in space-y-5">
            {/* Verdict banner */}
            <div className={cn(
              "flex items-center gap-4 rounded-lg p-4 border",
              result.isRumor
                ? "bg-danger-500/10 border-danger-500/20"
                : "bg-success-500/10 border-success-500/20"
            )}>
              <span className="text-3xl flex-shrink-0">{result.isRumor ? "🚨" : "✅"}</span>
              <div>
                <div className={cn(
                  "text-lg font-bold",
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
                <strong className="text-sm font-semibold text-primary-400 block mb-1">💡 AI Analysis</strong>
                <span className="text-sm text-[var(--text-muted)] leading-relaxed">{localExplanation}</span>
              </div>
            ) : (
              <div className="mb-2">
                <Button
                  variant="outline"
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
              {rows.map(({ key, value }) => (
                <div key={key} className="flex items-center justify-between py-3 text-sm">
                  <span className="text-[var(--text-muted)] font-medium">{key}</span>
                  <span className="font-semibold font-mono text-[var(--text)] text-xs">{value}</span>
                </div>
              ))}
            </div>

            {/* Confidence bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[var(--text-dim)]">
                <span>{t("confidenceScore")}</span>
                <span className="font-mono font-semibold tabular-nums">{result.confidence}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[var(--bg-elevated)] overflow-hidden">
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
                onClick={() => setShowPopup(true)}
              >
                🏛 {t("viewRelated")}
              </Button>
            )}
          </div>
        )}

        {/* Placeholder */}
        {!loading && !result && (
          <div className="flex flex-col items-center justify-center min-h-[280px] text-center gap-4">
            <div className="text-5xl opacity-20">🔍</div>
            <p className="text-sm text-[var(--text-dim)] max-w-[200px] leading-relaxed">
              {t("placeholder_result")}
            </p>
          </div>
        )}
      </CardContent>

      {/* Related Schemes Popup */}
      {showPopup && result?.related_schemes && (
        <SchemePopup
          schemes={result.related_schemes}
          onClose={() => setShowPopup(false)}
        />
      )}
    </Card>
  );
}
