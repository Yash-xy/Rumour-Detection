import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { getPublicHistory, getHistory, clearAllHistory, getCurrentUser } from "../services/api";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [publicHistory, setPublicHistory] = useState([]);
  const [totalPublic, setTotalPublic] = useState(0);
  const [myHistory, setMyHistory] = useState([]);
  const [totalMy, setTotalMy] = useState(0);
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("sr_theme") !== "light";
  });

  // Fetch public history and restore session on mount
  useEffect(() => {
    const init = async () => {
      await fetchPublicHistory();
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          const { data } = await getCurrentUser();
          setUser(data);
        } catch (err) {
          console.error("Session restore failed:", err);
          localStorage.removeItem("access_token");
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  // Fetch personal history when user logs in
  useEffect(() => {
    if (user) {
      fetchMyHistory();
    } else {
      setMyHistory([]);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("sr_theme", dark ? "dark" : "light");
    document.body.className = dark ? "dark" : "light";
  }, [dark]);

  const fetchPublicHistory = useCallback(async (skip = 0) => {
    try {
      const { data } = await getPublicHistory(skip, 100);
      if (skip === 0) setPublicHistory(data.items || []);
      else setPublicHistory(prev => [...prev, ...(data.items || [])]);
      setTotalPublic(data.total || 0);
    } catch (err) {
      console.error("Failed to fetch public history:", err);
    }
  }, []);

  const fetchMyHistory = useCallback(async (skip = 0) => {
    try {
      const { data } = await getHistory(skip, 50);
      if (skip === 0) setMyHistory(data.items || []);
      else setMyHistory(prev => [...prev, ...(data.items || [])]);
      setTotalMy(data.total || 0);
    } catch (err) {
      console.error("Failed to fetch personal history:", err);
    }
  }, []);

  const refreshHistory = useCallback(async () => {
    await fetchPublicHistory();
    if (user) {
      await fetchMyHistory();
    }
  }, [user, fetchPublicHistory, fetchMyHistory]);

  const clearHistory = useCallback(async () => {
    try {
      await clearAllHistory();
      setMyHistory([]);
      await fetchPublicHistory(); // refresh public feed too
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  }, [fetchPublicHistory]);

  return (
    <AppContext.Provider value={{
      user, setUser, loading,
      publicHistory, totalPublic, fetchPublicHistory,
      myHistory, totalMy, fetchMyHistory,
      refreshHistory, clearHistory,
      dark, setDark,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
};
