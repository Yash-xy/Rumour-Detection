import { useState } from "react";
import { ShieldCheck, X } from "lucide-react";
import { Button } from "./ui/Button";
import { Textarea } from "./ui/Textarea";
import { Alert } from "./ui/Alert";
import { Spinner } from "./ui/Spinner";
import { useLang } from "../context/LanguageContext";
import { cn } from "../lib/cn";

const MAX_LEN = 1000;
const MIN_LEN = 10;

/**
 * InputForm
 * Props:
 *   onSubmit(text) – async function called with the trimmed text
 *   loading        – bool, disables form while API call is in flight
 */
export default function InputForm({ onSubmit, loading }) {
  const { t } = useLang();
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      setError("Please enter some text to analyze.");
      return;
    }
    if (trimmed.length < MIN_LEN) {
      setError(`Please enter at least ${MIN_LEN} characters.`);
      return;
    }
    setError("");
    await onSubmit(trimmed);
  };

  const handleClear = () => {
    setText("");
    setError("");
  };

  const remaining = MAX_LEN - text.length;

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <Alert variant="destructive">
          <span>⚠️</span>
          <span>{error}</span>
        </Alert>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[var(--text-muted)]" htmlFor="rumor-input">
          {t("enterText")}
        </label>
        <Textarea
          id="rumor-input"
          rows={8}
          maxLength={MAX_LEN}
          placeholder={t("placeholder")}
          value={text}
          disabled={loading}
          className="min-h-[200px] text-sm leading-relaxed"
          onChange={(e) => {
            setText(e.target.value);
            if (error) setError("");
          }}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleSubmit();
          }}
        />
        <div className="flex items-center justify-between text-xs text-[var(--text-dim)]">
          <span className="font-mono opacity-60">{t("ctrlEnter")}</span>
          <span className={cn(
            "font-mono tabular-nums transition-colors",
            remaining < 50 ? "text-warning-400" : ""
          )}>
            {text.length} / {MAX_LEN}
          </span>
        </div>
      </div>

      <div className="flex gap-2.5">
        <Button
          className="flex-1"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner size="sm" inline />
              {t("analyzing")}
            </>
          ) : (
            <>
              <ShieldCheck size={16} />
              {t("analyze")}
            </>
          )}
        </Button>

        {text && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            disabled={loading}
            title="Clear input"
          >
            <X size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}
