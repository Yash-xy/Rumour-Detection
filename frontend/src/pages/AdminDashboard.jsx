import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useLang } from "../context/LanguageContext";
import { useToast } from "../components/ui/Toast";
import api from "../services/api";
import { ShieldAlert, Upload, RefreshCw, CheckCircle, AlertTriangle, Database, Cpu } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Alert } from "../components/ui/Alert";
import { Badge } from "../components/ui/Badge";

export default function AdminDashboard() {
  const { user } = useApp();
  const { t } = useLang();
  const { addToast } = useToast();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isUploading, setIsUploading] = useState(false);
  const [isRebuilding, setIsRebuilding] = useState(false);

  if (!user?.is_admin) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
        <div className="h-24 w-24 rounded-2xl bg-danger-500/10 border border-danger-500/20 flex items-center justify-center mb-6">
          <ShieldAlert size={48} className="text-danger-400" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Access Denied</h1>
        <p className="text-sm text-[var(--text-muted)]">You do not have administrator privileges to view this page.</p>
      </div>
    );
  }

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setStatus({ type: "info", message: "Uploading dataset..." });
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post("/admin/upload-schemes", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setStatus({ type: "success", message: res.data.message });
      setFile(null);
      addToast("Dataset uploaded and rebuild started!", "success");
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Failed to upload file." });
      addToast("Upload failed. Please try again.", "error");
    } finally { setIsUploading(false); }
  };

  const handleRebuild = async () => {
    setIsRebuilding(true);
    setStatus({ type: "info", message: "Triggering database rebuild..." });
    try {
      const res = await api.post("/admin/rebuild-index");
      setStatus({ type: "success", message: res.data.message });
      addToast("Index rebuild triggered successfully!", "success");
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Failed to schedule rebuild." });
      addToast("Rebuild failed.", "error");
    } finally { setIsRebuilding(false); }
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="mb-12">
        <Badge variant="warning" className="mb-3">Admin Only</Badge>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)] tracking-tight mb-2">🛠️ System Administration</h1>
        <p className="text-sm text-[var(--text-muted)]">Manage the SchemeRadar dataset and analytics.</p>
      </div>

      {/* Upload Card */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden mb-10 lg:mb-12 glow-card">
        <div className="border-b border-[var(--border)] p-5 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <Database size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text)]">Data Management</h3>
            <p className="text-xs text-[var(--text-dim)]">Upload and manage scheme datasets</p>
          </div>
        </div>

        <div className="p-6">
          <p className="text-sm text-[var(--text-muted)] mb-6 leading-relaxed">
            Uploading a new <code className="bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded text-xs font-mono text-primary-400">govt_schemes.csv</code> will overwrite the current master dataset and automatically trigger a background job to rebuild the FAISS embedding vectors and PostgreSQL index.
          </p>

          {status.message && (
            <Alert variant={status.type === "success" ? "success" : status.type === "error" ? "destructive" : "info"} className="mb-5">
              {status.type === "success" ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
              <span>{status.message}</span>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-semibold text-[var(--text-muted)] mb-2">Upload Dataset (CSV)</label>
              <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text)] file:mr-3 file:rounded-lg file:border-0 file:bg-primary-500/20 file:px-4 file:py-1.5 file:text-sm file:font-semibold file:text-primary-400 hover:file:bg-primary-500/30 cursor-pointer transition-colors" />
            </div>
            <Button onClick={handleUpload} disabled={!file || isUploading} className="gap-2 flex-shrink-0 h-11">
              <Upload size={16} /> {isUploading ? "Uploading..." : "Upload & Rebuild"}
            </Button>
          </div>
        </div>
      </div>

      {/* Rebuild Card */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden glow-card">
        <div className="border-b border-[var(--border)] p-5 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent-500 to-primary-400 flex items-center justify-center shadow-lg shadow-accent-500/20">
            <Cpu size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text)]">ML Pipeline</h3>
            <p className="text-xs text-[var(--text-dim)]">Manage embedding indexes</p>
          </div>
        </div>

        <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-[var(--text)] mb-1">Manual Index Rebuild</h4>
            <p className="text-sm text-[var(--text-muted)]">Force a rebuild of the ML embeddings from the current dataset.</p>
          </div>
          <Button variant="secondary" onClick={handleRebuild} disabled={isRebuilding} className="gap-2 flex-shrink-0 h-11">
            <RefreshCw size={16} className={isRebuilding ? "animate-spin" : ""} /> {isRebuilding ? "Processing..." : "Force Rebuild"}
          </Button>
        </div>
      </div>
    </div>
  );
}
