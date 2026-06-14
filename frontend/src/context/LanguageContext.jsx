import { createContext, useContext, useState, useCallback } from "react";

const translations = {
  en: {
    // Navbar
    checkRumor: "Check Rumor",
    history: "History",
    dashboard: "Dashboard",
    login: "Login",
    logout: "Logout",
    toggleTheme: "Toggle theme",

    // Check Page
    liveAnalysis: "🛡 Live Analysis",
    pageTitle: "Government Scheme Rumor Detection",
    pageSubtitle: "Paste any text, news, or message to verify its authenticity against official government scheme data.",
    enterText: "Enter Text or News Article",
    placeholder: 'Paste the text, WhatsApp forward, or news headline to fact-check…\n\nExample: "Government announces ₹6000 monthly to all citizens under PM-KISAN…"',
    ctrlEnter: "Ctrl + Enter to submit",
    analyze: "Analyze for Rumors",
    analyzing: "Analyzing…",
    analyzedText: "Analyzed Text",

    // Result
    analysisResult: "Analysis Result",
    alert: "🚨 Alert",
    clear: "✅ Clear",
    relatedScheme: "Related Scheme",
    level: "Level",
    similarity: "Similarity",
    confidence: "Confidence",
    confidenceScore: "Confidence Score",
    misleading: "This content appears to be misleading or false.",
    official: "This content aligns with official records.",
    placeholder_result: "Your analysis results will appear here after submission",
    crossRef: "Cross-referencing scheme database…",
    viewRelated: "View Related Schemes",
    relatedSchemes: "Related Schemes",

    // Scheme Popup
    schemeName: "Scheme Name",
    description: "Description",
    benefits: "Benefits",
    eligibility: "Eligibility",
    category: "Category",
    validity: "Validity",
    status: "Status",
    sentiment: "Sentiment",
    schemeLevel: "Level",
    similarityScore: "Similarity",
    close: "Close",
    schemeDetails: "Scheme Details",
    noDescription: "No description available.",

    // History
    analysisHistory: "Analysis History",
    historySubtitle: "total checks — filter, search, and review past analyses.",
    all: "All",
    rumors: "Rumors",
    legitimate: "Legitimate",
    searchPlaceholder: "Search by text or scheme name…",
    clearAll: "Clear All",
    clearConfirm: "Clear all history? This cannot be undone.",
    noSearchResults: "No results match your search.",
    noHistory: "No history yet — start analyzing text!",
    conf: "Conf",

    // Dashboard
    analyticsDashboard: "Analytics Dashboard",
    dashboardSubtitle: "Real-time insights into rumor detection patterns and scheme-wise analysis.",
    totalChecks: "Total Checks",
    rumorsDetected: "Rumors Detected",
    legitimateLabel: "Legitimate",
    avgConfidence: "Avg Confidence",
    allTime: "All time",
    ofTotal: "of total",
    modelCertainty: "Model certainty",
    weeklyActivity: "Weekly Activity",
    checksPerDay: "Checks per day (last 7 days)",
    rumorVsLegit: "Rumor vs Legitimate",
    distribution: "Distribution breakdown",
    topSchemes: "Top Queried Government Schemes",
    topSchemesSubtitle: "Most frequently analyzed scheme categories",
    runAnalyses: "Run some analyses to see scheme statistics here.",

    // Footer
    builtBy: "Built By",
    platform: "Government Rumor Detection Platform",

    // Auth
    welcomeBack: "Welcome Back",
    signInToContinue: "Sign in to continue to SchemeRadar",
    email: "Email",
    password: "Password",
    signIn: "Sign In",
    or: "or",
    noAccount: "Don't have an account?",
    signUp: "Sign Up",
    createAccount: "Create Account",
    joinSchemeRadar: "Join SchemeRadar to start detecting rumors",
    fullName: "Full Name",
    createBtn: "Create Account",
    haveAccount: "Already have an account?",

    // Language
    langLabel: "EN",
  },
  hi: {
    // Navbar
    checkRumor: "अफवाह जांचें",
    history: "इतिहास",
    dashboard: "डैशबोर्ड",
    login: "लॉगिन",
    logout: "लॉगआउट",
    toggleTheme: "थीम बदलें",

    // Check Page
    liveAnalysis: "🛡 लाइव विश्लेषण",
    pageTitle: "सरकारी योजना अफवाह पहचान",
    pageSubtitle: "किसी भी टेक्स्ट, समाचार या संदेश को सरकारी योजना डेटा के विरुद्ध सत्यापित करने के लिए पेस्ट करें।",
    enterText: "टेक्स्ट या समाचार लेख डालें",
    placeholder: 'जांच करने के लिए टेक्स्ट, व्हाट्सएप फॉरवर्ड, या समाचार शीर्षक पेस्ट करें…\n\nउदाहरण: "सरकार ने PM-KISAN के तहत सभी नागरिकों को ₹6000 मासिक की घोषणा की…"',
    ctrlEnter: "Ctrl + Enter सबमिट करें",
    analyze: "अफवाह के लिए विश्लेषण करें",
    analyzing: "विश्लेषण हो रहा है…",
    analyzedText: "विश्लेषित टेक्स्ट",

    // Result
    analysisResult: "विश्लेषण परिणाम",
    alert: "🚨 चेतावनी",
    clear: "✅ स्पष्ट",
    relatedScheme: "संबंधित योजना",
    level: "स्तर",
    similarity: "समानता",
    confidence: "विश्वास",
    confidenceScore: "विश्वास स्कोर",
    misleading: "यह सामग्री भ्रामक या गलत प्रतीत होती है।",
    official: "यह सामग्री आधिकारिक रिकॉर्ड के अनुरूप है।",
    placeholder_result: "सबमिट करने के बाद आपके विश्लेषण परिणाम यहां दिखाई देंगे",
    crossRef: "योजना डेटाबेस से क्रॉस-रेफरेंस हो रहा है…",
    viewRelated: "संबंधित योजनाएं देखें",
    relatedSchemes: "संबंधित योजनाएं",

    // Scheme Popup
    schemeName: "योजना का नाम",
    description: "विवरण",
    benefits: "लाभ",
    eligibility: "पात्रता",
    category: "श्रेणी",
    validity: "वैधता",
    status: "स्थिति",
    sentiment: "भावना",
    schemeLevel: "स्तर",
    similarityScore: "समानता",
    close: "बंद करें",
    schemeDetails: "योजना विवरण",
    noDescription: "कोई विवरण उपलब्ध नहीं।",

    // History
    analysisHistory: "विश्लेषण इतिहास",
    historySubtitle: "कुल जांच — फ़िल्टर करें, खोजें, और पिछले विश्लेषणों की समीक्षा करें।",
    all: "सभी",
    rumors: "अफवाहें",
    legitimate: "वैध",
    searchPlaceholder: "टेक्स्ट या योजना नाम से खोजें…",
    clearAll: "सभी साफ़ करें",
    clearConfirm: "सभी इतिहास साफ़ करें? यह पूर्ववत नहीं किया जा सकता।",
    noSearchResults: "आपकी खोज से कोई परिणाम मेल नहीं खाता।",
    noHistory: "अभी तक कोई इतिहास नहीं — टेक्स्ट का विश्लेषण शुरू करें!",
    conf: "विश्वास",

    // Dashboard
    analyticsDashboard: "एनालिटिक्स डैशबोर्ड",
    dashboardSubtitle: "अफवाह पहचान पैटर्न और योजना-वार विश्लेषण में रीयल-टाइम अंतर्दृष्टि।",
    totalChecks: "कुल जांच",
    rumorsDetected: "अफवाहें पहचानी गईं",
    legitimateLabel: "वैध",
    avgConfidence: "औसत विश्वास",
    allTime: "कुल समय",
    ofTotal: "कुल का",
    modelCertainty: "मॉडल निश्चितता",
    weeklyActivity: "साप्ताहिक गतिविधि",
    checksPerDay: "प्रति दिन जांच (पिछले 7 दिन)",
    rumorVsLegit: "अफवाह बनाम वैध",
    distribution: "वितरण विश्लेषण",
    topSchemes: "शीर्ष पूछताछ सरकारी योजनाएं",
    topSchemesSubtitle: "सबसे अधिक विश्लेषित योजना श्रेणियां",
    runAnalyses: "योजना आंकड़े देखने के लिए कुछ विश्लेषण चलाएं।",

    // Footer
    builtBy: "निर्मित",
    platform: "सरकारी अफवाह पहचान मंच",

    // Auth
    welcomeBack: "वापस आपका स्वागत है",
    signInToContinue: "SchemeRadar जारी रखने के लिए साइन इन करें",
    email: "ईमेल",
    password: "पासवर्ड",
    signIn: "साइन इन करें",
    or: "या",
    noAccount: "खाता नहीं है?",
    signUp: "साइन अप करें",
    createAccount: "खाता बनाएं",
    joinSchemeRadar: "अफवाहों का पता लगाने के लिए SchemeRadar से जुड़ें",
    fullName: "पूरा नाम",
    createBtn: "खाता बनाएं",
    haveAccount: "पहले से खाता है?",

    // Language
    langLabel: "हिंदी",
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("sr_lang") || "en";
  });

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === "en" ? "hi" : "en";
      localStorage.setItem("sr_lang", next);
      return next;
    });
  }, []);

  const t = useCallback(
    (key) => translations[lang]?.[key] ?? translations.en[key] ?? key,
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
};
