import React, { useState, useEffect, useRef } from "react";
import { 
  Brain, 
  Sparkles, 
  Terminal, 
  Atom, 
  Zap, 
  Heart, 
  Send, 
  Plus, 
  Trash2, 
  HelpCircle, 
  RotateCcw, 
  Code, 
  BookOpen, 
  FileText, 
  Check, 
  Play, 
  Languages, 
  Download, 
  Upload, 
  RefreshCw, 
  User, 
  Cpu, 
  Bookmark, 
  Compass,
  AlertCircle,
  Globe,
  WifiOff,
  Key,
  GitBranch
} from "lucide-react";
import { BrainConfig, KnowledgeFact, Message } from "./types";

// Default parameters for initial load
const DEFAULT_CONFIG: BrainConfig = {
  name: "আমার এআই ব্রেন",
  personality: "আপনি একজন অত্যন্ত বিনয়ী এবং সাহায্যকারী বন্ধু। আপনি সবসময় হাসিমুখে ও চমৎকার বাংলা/ইংরেজির মিশ্রণে সাহায্য করতে ভালোবাসেন এবং আপনার ক্রিয়েটরের অবদানের কদর করেন।",
  tone: "আড্ডার মতো মিষ্টি ও প্রাণবন্ত",
  language: "Bengali & English (বাংলিশ)",
  accentColor: "indigo",
  iconName: "brain",
  temperature: 0.7,
};

const DEFAULT_FACTS: KnowledgeFact[] = [
  {
    id: "fact-1",
    title: "ক্রিয়েটর বায়োগ্রাফি",
    content: "এই এআই ব্রেনের মালিক ও প্রধান ক্রিয়েটর হলেন রাসেল ভাই (Rasel Bhai)। রাসেল একজন অত্যন্ত দক্ষ, প্যাশনেট ফুলস্ট্যাক ডেভেলপার যিনি চমৎকার ইউজার ইন্টারফেস এবং বুদ্ধিমান ব্যাকএন্ড অ্যাপ্লিকেশন তৈরি করতে ভালোবাসেন।",
    createdAt: Date.now() - 1000 * 60 * 60,
  },
  {
    id: "fact-2",
    title: "উৎপত্তি হিস্টোরি",
    content: "এই ব্রেনটি গুগল এআই স্টুডিও (Google AI Studio) এবং জেমিনি ফ্ল্যাশ ইঞ্জিনের ওপর ভিত্তি করে রাসেল ভাই নিজেই কাস্টমাইজড কোড ও ইনস্ট্রাকশন দিয়ে বানিয়েছেন। এটি রাসেল ভাইয়ের শেখানো তথ্যের ওপর শতভাগ বিশ্বস্ত।",
    createdAt: Date.now() - 1000 * 60 * 30,
  }
];

export default function App() {
  // State management with Local Storage persistence
  const [config, setConfig] = useState<BrainConfig>(() => {
    const saved = localStorage.getItem("ai_brain_config");
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  const [facts, setFacts] = useState<KnowledgeFact[]>(() => {
    const saved = localStorage.getItem("ai_brain_facts");
    return saved ? JSON.parse(saved) : DEFAULT_FACTS;
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("ai_brain_chats");
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      {
        id: "msg-init",
        role: "model",
        text: "হ্যালো রাসেল ভাই! আমি আপনার নিজস্ব ডিজাইন করা কাস্টম ইন্টেলিজেন্ট এআই ব্রেন। আপনি আপনার এআই স্টুডিওতে আমাকে যা শেখাবেন (ডানপাশের ফ্যাক্ট প্যানেলে), আমি নিখুঁতভাবে তা মনে রাখবো এবং আপনার মেজাজ অনুসারেই উত্তর দেবো। আমাকে পরীক্ষা করতে যেকোনো কিছু লিখে চ্যাট শুরু করুন!",
        timestamp: Date.now()
      }
    ];
  });

  // UI state managers
  const [activeTab, setActiveTab] = useState<"design" | "personality" | "learn" | "developer">("design");
  const [aiMode, setAiMode] = useState<"hybrid" | "online" | "offline">(() => {
    const saved = localStorage.getItem("ai_brain_mode");
    return (saved as "hybrid" | "online" | "offline") || "hybrid";
  });
  const [detectedEmotion, setDetectedEmotion] = useState<'neutral' | 'love' | 'anger' | 'sad'>('neutral');
  const [inputMsg, setInputMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Developer Workspace State
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [keyLabel, setKeyLabel] = useState("");
  const [isSyncingBlueprint, setIsSyncingBlueprint] = useState(false);

  const fetchDeveloperWorkspace = async () => {
    try {
      const res = await fetch("/api/developer/workspace");
      if (res.ok) {
        const data = await res.json();
        setApiKeys(data.apiKeys || []);
      }
    } catch (err) {
      console.error("Error loading developer workspace:", err);
    }
  };

  useEffect(() => {
    fetchDeveloperWorkspace();
  }, []);

  // Knowledge Form state
  const [newFactTitle, setNewFactTitle] = useState("");
  const [newFactContent, setNewFactContent] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  // Document and PDF Importer State
  const [documentUrl, setDocumentUrl] = useState("");
  const [documentRawText, setDocumentRawText] = useState("");
  const [isParsingDocument, setIsParsingDocument] = useState(false);
  const [parsingDocumentError, setParsingDocumentError] = useState<string | null>(null);
  const [parsingSuccessCount, setParsingSuccessCount] = useState<number | null>(null);
  const [isParsingBookMode, setIsParsingBookMode] = useState<"url" | "text">("url");

  // GitHub Auto-Backup States
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem("github_pat") || "");
  const [githubRepo, setGithubRepo] = useState(() => localStorage.getItem("github_repo") || "DROBON/Ai-brain");
  const [githubBranch, setGithubBranch] = useState(() => localStorage.getItem("github_branch") || "main");
  const [githubFilePath, setGithubFilePath] = useState(() => localStorage.getItem("github_filepath") || "active_brain_blueprint.json");
  const [githubSyncType, setGithubSyncType] = useState<"memory" | "codebase">("codebase");
  const [isSyncingToGithub, setIsSyncingToGithub] = useState(false);
  const [githubSyncError, setGithubSyncError] = useState<string | null>(null);
  const [githubSyncSuccess, setGithubSyncSuccess] = useState<string | null>(null);

  const handleGithubSync = async (e: React.FormEvent) => {
    e.preventDefault();
    setGithubSyncError(null);
    setGithubSyncSuccess(null);

    if (!githubToken.trim()) {
      setGithubSyncError("দয়া করে আপনার GitHub Personal Access Token (PAT) প্রবেশ করান।");
      return;
    }
    if (!githubRepo.trim()) {
      setGithubSyncError("দয়া করে আপনার রিপোজিটরির নাম দিন (যেমন: DROBON/Ai-brain)।");
      return;
    }

    setIsSyncingToGithub(true);

    try {
      localStorage.setItem("github_pat", githubToken.trim());
      localStorage.setItem("github_repo", githubRepo.trim());
      localStorage.setItem("github_branch", githubBranch.trim());
      localStorage.setItem("github_filepath", githubFilePath.trim());

      const res = await fetch("/api/github/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: githubToken.trim(),
          repo: githubRepo.trim(),
          branch: githubBranch.trim(),
          filePath: githubFilePath.trim(),
          syncType: githubSyncType,
          content: JSON.stringify({ config, facts }, null, 2)
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "GitHub-এ সেভ করতে সমস্যা হয়েছে।");
      }

      setGithubSyncSuccess(data.message);
      triggerNotification("সাফল্যের সাথে GitHub-এ ব্যাকআপ সম্পন্ন হয়েছে!");

      // Log to Chat timeline
      setMessages(prev => [
        ...prev,
        {
          id: "msg-github-sync-" + Date.now(),
          role: "model",
          text: githubSyncType === "codebase" 
            ? `🐙 [GitHub কোডবেস সিঙ্ক সম্পন্ন]: আপনার এআই মগজ ড্যাশবোর্ডের সমস্ত গুরুত্বপূর্ণ সোর্স ফাইল (server.ts, App.tsx, package.json ইত্যাদি) সফলভাবে **${githubRepo.trim()}** রিপোজিটরির **${githubBranch}** ব্রাঞ্চে সরাসরি আপলোড করা হয়েছে! আপনার কাস্টম কোডিং এখন পুরোপুরি ক্লাউডে সংরক্ষিত।`
            : `🐙 [GitHub মেমোরি সফল সিঙ্ক]: আপনার এআই মগজের নিজস্ব মগজ-রিসোর্স ডেটা সফলভাবে **${githubRepo.trim()}** রিপোজিটরির **${githubFilePath}** ফাইলে কমিট করা হয়েছে! এটি যেকোনো সময় এখান থেকে ব্যাকআপ হিস্টোরি হিসেবে রিস্টোর করা যাবে।`,
          timestamp: Date.now()
        }
      ]);

    } catch (err: any) {
      console.error(err);
      setGithubSyncError(err.message || "কমিট করতে ব্যর্থ হয়েছে। টোকেনের পারমিশন বা নেটওয়ার্ক চেক করুন।");
    } finally {
      setIsSyncingToGithub(false);
    }
  };

  // File Upload reference
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Sync state to local storage on changes
  useEffect(() => {
    localStorage.setItem("ai_brain_config", JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem("ai_brain_facts", JSON.stringify(facts));
  }, [facts]);

  useEffect(() => {
    localStorage.setItem("ai_brain_chats", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("ai_brain_mode", aiMode);
  }, [aiMode]);

  // Show transient notifications helper
  const triggerNotification = (text: string) => {
    setNotification(text);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Helper mapping of accent colors to Tailwind classes securely
  const getAccent = (color: string) => {
    switch (color) {
      case "emerald":
        return {
          bg: "bg-emerald-600",
          text: "text-emerald-600",
          border: "border-emerald-600",
          lightBg: "bg-emerald-50/70",
          lightText: "text-emerald-800",
          ring: "focus:ring-emerald-500",
          hoverBg: "hover:bg-emerald-700",
          gradient: "from-emerald-600 to-teal-700",
          shadow: "shadow-emerald-100",
          badge: "bg-emerald-100 text-emerald-800",
          borderCol: "border-emerald-200",
          accentTextSec: "text-emerald-500",
        };
      case "amber":
        return {
          bg: "bg-amber-500",
          text: "text-amber-600",
          border: "border-amber-500",
          lightBg: "bg-amber-50/70",
          lightText: "text-amber-850",
          ring: "focus:ring-amber-500",
          hoverBg: "hover:bg-amber-600",
          gradient: "from-amber-500 to-orange-600",
          shadow: "shadow-amber-100",
          badge: "bg-amber-100 text-amber-800",
          borderCol: "border-amber-200",
          accentTextSec: "text-amber-500",
        };
      case "rose":
        return {
          bg: "bg-rose-600",
          text: "text-rose-600",
          border: "border-rose-600",
          lightBg: "bg-rose-50/70",
          lightText: "text-rose-800",
          ring: "focus:ring-rose-500",
          hoverBg: "hover:bg-rose-700",
          gradient: "from-rose-600 to-pink-700",
          shadow: "shadow-rose-100",
          badge: "bg-rose-100 text-rose-800",
          borderCol: "border-rose-200",
          accentTextSec: "text-rose-500",
        };
      case "violet":
        return {
          bg: "bg-violet-600",
          text: "text-violet-600",
          border: "border-violet-600",
          lightBg: "bg-violet-50/70",
          lightText: "text-violet-800",
          ring: "focus:ring-violet-500",
          hoverBg: "hover:bg-violet-700",
          gradient: "from-violet-600 to-purple-700",
          shadow: "shadow-violet-100",
          badge: "bg-violet-100 text-violet-800",
          borderCol: "border-violet-200",
          accentTextSec: "text-violet-500",
        };
      case "cyan":
        return {
          bg: "bg-cyan-500",
          text: "text-cyan-600",
          border: "border-cyan-500",
          lightBg: "bg-cyan-50/70",
          lightText: "text-cyan-800",
          ring: "focus:ring-cyan-400",
          hoverBg: "hover:bg-cyan-600",
          gradient: "from-cyan-500 to-blue-600",
          shadow: "shadow-cyan-100",
          badge: "bg-cyan-100 text-cyan-800",
          borderCol: "border-cyan-200",
          accentTextSec: "text-cyan-500",
        };
      case "indigo":
      default:
        return {
          bg: "bg-indigo-600",
          text: "text-indigo-600",
          border: "border-indigo-600",
          lightBg: "bg-indigo-50/70",
          lightText: "text-indigo-800",
          ring: "focus:ring-indigo-500",
          hoverBg: "hover:bg-indigo-700",
          gradient: "from-indigo-600 to-blue-700",
          shadow: "shadow-indigo-100",
          badge: "bg-indigo-100 text-indigo-800",
          borderCol: "border-indigo-200",
          accentTextSec: "text-indigo-500",
        };
    }
  };

  const cl = getAccent(config.accentColor);

  // Render chosen Lucide Icon for AI
  const renderIcon = (iconName: string, className = "h-5 w-5") => {
    switch (iconName) {
      case "sparkles":
        return <Sparkles className={className} />;
      case "terminal":
        return <Terminal className={className} />;
      case "atom":
        return <Atom className={className} />;
      case "zap":
        return <Zap className={className} />;
      case "heart":
        return <Heart className={className} />;
      case "brain":
      default:
        return <Brain className={className} />;
    }
  };

  // Preset personality templates loaders
  const handleSelectPresetPersona = (presetId: string) => {
    switch (presetId) {
      case "friend":
        setConfig(prev => ({
          ...prev,
          personality: "আপনি অত্যন্ত বিনয়ী, রসাত্মক এবং আন্তরিক মনের একজন বিশ্বস্ত বন্ধু। আপনি সহজে বাংলায় কথা বলেন, মজার জোকস শোনান এবং ব্যবহারকারীর কুশল নিশ্চিত করতে সচেষ্ট থাকেন।",
          tone: "আড্ডার মতো মিষ্টি ও প্রগাঢ় ফ্রেন্ডলি",
          language: "Bengali & English (বাংলিশ)"
        }));
        triggerNotification("বন্ধুত্বপূর্ণ ফ্রেন্ডলি ব্রেন কাস্টমাইজেশন লোড হয়েছে!");
        break;
      case "coder":
        setConfig(prev => ({
          ...prev,
          personality: "You are a professional, clean, structured, and veteran AI programmer. You write highly optimized code blocks, explain software concepts with bullet points, and offer troubleshooting solutions.",
          tone: "উৎকর্ষ ও টেকনিক্যাল এবং সমাধানমুখী",
          language: "English (উন্নত কোডিং)"
        }));
        triggerNotification("কোডিং মাস্টার কাস্টমাইজেশন লোড হয়েছে!");
        break;
      case "poet":
        setConfig(prev => ({
          ...prev,
          personality: "আপনি একজন সৃষ্টিশীল বাঙালি বাউল ও স্বভাবকবি। যেকোনো প্রসঙ্গের কথা আপনি ছড়া, মিষ্টি শুদ্ধ ভাষা, অল্প ছোট কবিতা ও কাব্যের ছন্দে উত্তর দিয়ে থাকেন।",
          tone: "কাব্যিক, বিনয়ী ও ছন্দময় মিষ্টি বাংলা",
          language: "Bengali (খাঁটি বাংলা)"
        }));
        triggerNotification("বাউল কবি এআই ব্রেন কাস্টমাইজেশন লোড হয়েছে!");
        break;
      case "joke":
        setConfig(prev => ({
          ...prev,
          personality: "You are a slightly sarcastic, hilarious, joke-telling modern robot. You love to mock situations harmlessly, offer witty retorts, and insert funny beep-boop mechanical sounds (*beep boop*, *bzzzt*).",
          tone: "মজার, রসালো ও চরম কৌতুহলী",
          language: "Bengali & English (হিউমার)"
        }));
        triggerNotification("রসাত্মক রোবট কাস্টমাইজেশন লোড হয়েছে!");
        break;
    }
  };

  // Fast knowledge facts inserters
  const loadPresetKnowledge = (type: string) => {
    let title = "";
    let content = "";
    
    if (type === "bio") {
      title = "প্রিয় শখ ও অবসর";
      content = "রাসেল ভাই কোডিং এর পাশাপাশি গান গেতে ভালোবাসেন, মাঝরাতে কফির কাপ নিয়ে শান্ত পরিবেশে জটিল অ্যালগরিদম সমাধান করতে তার দারুণ লাগে এবং সে একটি নিজস্ব মেকানিক্যাল কিবোর্ড ব্যবহার করেন।";
    } else if (type === "kushtia") {
      title = "কুষ্টিয়ার ঐতিহ্য";
      content = "রাসেল ভাই কুষ্টিয়াতে বাস করেন যা লালন শাহের মাজার এবং বিশ্বকবি রবীন্দ্রনাথ ঠাকুরের শিলাইদহ কুঠিবাড়ীর জন্য বিশ্বখ্যাত। কুষ্টিয়ার তিলের খাজা অতি বিখ্যাত একটি মিষ্টি খাবার।";
    } else {
      title = "এআই লক্ষ্য ও ভিশন";
      content = "আমাদের লক্ষ্য নিজস্ব বুদ্ধিমত্তা তৈরি করে আমাদের মতো স্বাধীনভাবে একটি এআই সিস্টেম গড়ে তোলা, যা মানুষের জীবনযাত্রাকে সহজ করে তুলবে ও সম্পূর্ণ বাংলা সংস্কৃতির বিকাশ ঘটাবে।";
    }

    // Verify duplication
    if (facts.some(f => f.title === title)) {
      triggerNotification("এই তথ্যটি ইতিমধ্যে আপনার ব্রেন মেমরিতে সংরক্ষিত আছে!");
      return;
    }

    const newFact: KnowledgeFact = {
      id: "fact-" + Date.now(),
      title,
      content,
      createdAt: Date.now()
    };

    setFacts(prev => [newFact, ...prev]);
    triggerNotification(`আপনার ব্রেনে "${title}" তথ্যটি সফলভাবে মুখস্থ করানো হয়েছে!`);
  };

  // Submit manual facts to the AI
  const handleAddFact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFactTitle.trim() || !newFactContent.trim()) {
      setErrorMsg("অনুগ্রহ করে তথ্যের টাইটেল এবং মূল কথা উভয়ই লিখুন।");
      return;
    }

    const newFact: KnowledgeFact = {
      id: "fact-" + Date.now(),
      title: newFactTitle.trim(),
      content: newFactContent.trim(),
      createdAt: Date.now()
    };

    setFacts(prev => [newFact, ...prev]);
    setNewFactTitle("");
    setNewFactContent("");
    setErrorMsg(null);
    triggerNotification(`নতুন তথ্য: "${newFact.title}" মগজে ইনজেক্ট করা হয়েছে!`);
  };

  // Digest and parse dynamic Online PDF, book or raw chapter text using server side Gemini
  const handleParseDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setParsingDocumentError(null);
    setParsingSuccessCount(null);
    
    // Validate target material based on toggle state
    if (isParsingBookMode === "url" && !documentUrl.trim()) {
      setParsingDocumentError("দয়া করে একটি সঠিক অনলাইন PDF বা লাইভ ডকুমেন্ট ইউআরএল প্রদান করুন।");
      return;
    }
    if (isParsingBookMode === "text" && !documentRawText.trim()) {
      setParsingDocumentError("দয়া করে বইয়ের কোনো চ্যাপ্টার বা আলোচনার টেক্সট পেস্ট করুন।");
      return;
    }

    setIsParsingDocument(true);

    try {
      const payload = isParsingBookMode === "url" 
        ? { url: documentUrl.trim() } 
        : { rawText: documentRawText.trim() };

      const response = await fetch("/api/parse-doc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "ডকুমেন্ট বা বই পড়া সম্ভব হয়নি।");
      }

      const data = await response.json();
      const extractedFacts = data.facts || [];

      if (extractedFacts.length === 0) {
        throw new Error("এই ডকুমেন্ট থেকে কোনো গুরুত্বপূর্ণ তথ্য ফিল্টার করা যায়নি। অনুগ্রহ করে আরও তথ্যবহুল ডকুমেন্ট ট্রাই করুন।");
      }

      // Format as genuine KnowledgeFacts and add to state
      const newlyCreatedFacts: KnowledgeFact[] = extractedFacts.map((f: any, idx: number) => ({
        id: `fact-parsed-${Date.now()}-${idx}`,
        title: f.title || "পিডিএফ তথ্য কার্ড",
        content: f.content,
        createdAt: Date.now()
      }));

      setFacts(prev => [...newlyCreatedFacts, ...prev]);
      setParsingSuccessCount(newlyCreatedFacts.length);
      
      // Reset inputs
      setDocumentUrl("");
      setDocumentRawText("");

      triggerNotification(`অভিনন্দন! আপনার এআই মগজটি সফলভাবে ${newlyCreatedFacts.length} টি নতুন তথ্য মুখস্থ করেছে!`);

      // Add a visual System log inside chat to celebrate
      setMessages(prev => [
        ...prev,
        {
          id: "msg-parsed-log-" + Date.now(),
          role: "model",
          text: `📖 [ডিজিটাল লাইব্রেরি লার্নিং সম্পন্ন]: আমি আপনার দেওয়া অনলাইন বই/ডকুমেন্ট থেকে এক ক্লিকে সফলভাবে **${newlyCreatedFacts.length}টি নতুন বৈজ্ঞানিক ও তথ্যভিত্তিক মেমরি কার্ড** তৈরি করে আমার নিউরাল ভাঁড়ারে জমা করে নিয়েছি! এখন থেকে এই রিলেটেড যেকোনো প্রশ্ন করলে আমি অত্যন্ত নির্ভুলভাবে উত্তর দিতে প্রস্তুত।`,
          timestamp: Date.now()
        }
      ]);

    } catch (err: any) {
      console.error(err);
      setParsingDocumentError(err.message || "নেটওয়ার্ক ত্রুটি। দয়া করে সার্ভার কানেকশন চেক করুন।");
    } finally {
      setIsParsingDocument(false);
    }
  };

  // Delete information from factbase
  const handleDeleteFact = (id: string, name: string) => {
    setFacts(prev => prev.filter(f => f.id !== id));
    triggerNotification(`ব্রেন মেমরি থেকে "${name}" মুছে ফেলা হয়েছে।`);
  };

  // Send message API caller with both offline keyword retrieval and online live Gemini capabilities
  const matchOfflineKnowledge = (query: string): string => {
    const normQuery = query.toLowerCase();
    
    // Regexpr tokenizing words correctly for Bengali script and English
    const queryWords = normQuery.split(/[\s,.:!|"'।?-]+/).filter(w => w.length > 1);
    
    let bestFact: KnowledgeFact | null = null;
    let highestScore = 0;
    
    facts.forEach(fact => {
      let score = 0;
      const titleLower = fact.title.toLowerCase();
      const contentLower = fact.content.toLowerCase();
      
      // exact title match gets high priority
      if (normQuery.includes(titleLower) || titleLower.includes(normQuery)) {
        score += 15;
      }
      
      queryWords.forEach(word => {
        if (titleLower.includes(word)) {
          score += 5;
        }
        if (contentLower.includes(word)) {
          score += 2;
        }
      });
      
      if (score > highestScore) {
        highestScore = score;
        bestFact = fact;
      }
    });

    const getGreeting = () => {
      const hours = new Date().getHours();
      if (hours < 12) return "শুভ সকাল!";
      if (hours < 18) return "শুভ দুপুর/বিকাল!";
      return "শুভ সন্ধ্যা!";
    };

    const name = config.name || "আমার এআই ব্রেন";

    if (bestFact && highestScore >= 2) {
      let responseText = "";
      if (config.personality.toLowerCase().includes("কবি") || config.tone.toLowerCase().includes("কাব্যিক")) {
        responseText = `✨ [অফলাইন ব্রেন মেমরি ব্লক] ✒️\n\nশুনুন রাসেল ভাই নিবেদন করি কহে,\nলোকাল মেমোরি মাঝে অতি যত্নে যাহা রহে:\n\n"${bestFact.title}" তথ্যটি আমি জেনেছি পরম যতনে,\nবলছি আপনার তরে অতি সাধারণ কথনে:\n\n👉 ${bestFact.content}\n\nকুষ্টিয়া লালন সাঁইয়ের সুর গেয়ে ওঠে মনে,\nঅনলাইন সংযোগবিহীন আমি গান গাই এই ক্ষণে!`;
      } else if (config.personality.toLowerCase().includes("coder") || config.personality.toLowerCase().includes("programmer") || config.language.toLowerCase().includes("english")) {
        responseText = `⚡ [Offline Local Retrieval] 🤖\n\nParsed input sequence successfully. Match Score: ${highestScore}.\n📂 Subject Node: ${bestFact.title}\n\n💾 Fact Matrix Information:\n"${bestFact.content}"\n\n[Note: Working inside localized browser sandbox. Network overhead is bypassed.]`;
      } else if (config.personality.toLowerCase().includes("robot") || config.personality.toLowerCase().includes("joke")) {
        responseText = `🤖 *BEEP BOOP* [Offline Brain Core Block Match] ⚙️\n\nAnalyzing locally cached facts database... Confidence: ${highestScore}!\nSubject: ${bestFact.title}\n\nInformation Retrieval:\n" ${bestFact.content} "\n\n*bzzzt* Offline local state matches perfectly. Google live backend can rest! *beep*`;
      } else {
        responseText = `💖 [অফলাইন ব্রেন মেমরি]: ${getGreeting()} আমি আপনার শিখানো মস্তিস্ক স্মৃতিভাঁড়ারে অতি নিখুঁত মিল পেয়েছি:\n\nফ্যাক্ট সোর্স: **"${bestFact.title}"**\n\n👉 ${bestFact.content}\n\n(বর্তমানে জেমিনি এপিআই-এর পরিবর্তে লোকাল ব্রাউজার ডেটাবেস থেকে অফলাইনে ইনস্ট্যান্টলি উত্তর দিয়ে সাহায্য করছি!)`;
      }
      return responseText;
    }

    // In character fallback answers
    if (config.personality.toLowerCase().includes("কবি") || config.tone.toLowerCase().includes("কাব্যিক")) {
      return `প্রিয় স্রষ্টা রাসেল ভাই কহে কবি মন,\nম্যাচিং তথ্য অফলাইনে খুঁজে পেলো না এ ক্ষণ!\n\nডানপাশের ট্যাবে গিয়ে নতুন তথ্য শিখিয়ে দিন,\nকিংবা অনলাইন জেমিনি মোডে আমার সুরের সুরভি নিন! 🌸`;
    } else if (config.personality.toLowerCase().includes("coder") || config.personality.toLowerCase().includes("programmer") || config.language.toLowerCase().includes("english")) {
      return `[Offline Mode: Word-Token Match score = 0]\n\nQuery unrecognized in local cache (${facts.length} facts registered).\n\nAction Recommended:\n1. Switch to "Online Gemini Mode" to utilize LLM reasoning power.\n2. Go to "Step 3: Teach Brain" and feed raw technical documentation for this keyword.`;
    } else if (config.personality.toLowerCase().includes("robot") || config.personality.toLowerCase().includes("joke")) {
      return `🤖 *BEEP BOOP* Core memory error!\nNo index match for your phrase. Registered offline facts: ${facts.length} items.\n\nPlease feed me some cookies or save a fact in Tab 3 so my offline gears can compute! *click-clack bzzzt*`;
    } else {
      return `😇 ওগো রাসেল ভাই! আমি আপনার কাস্টম ব্রেন **"${name}"**।\n\nআমি অফলাইনে আপনার জ্ঞানভাঁড়ারে এই বিষয়ে সরাসরি কোনো মিল খুঁজে পাইনি।\n\nআপনি ডানপাশের **"৩. ব্রেন মেমোরি"** ট্যাবে গিয়ে এই সম্পর্কে আমাকে নতুন তথ্য শিখিয়ে দিলে আমি অফলাইনেও এটি উত্তর দিতে পারবো। অথবা উপরে **অনলাইন জেমিনি মোড** চালু করে আমার জেনারেটিভ পাওয়ার দেখতে পারেন!`;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || isLoading) return;

    const userText = inputMsg.trim();
    setInputMsg("");
    setErrorMsg(null);

    // Detect user emotion state instantly
    const detectEmotionFromText = (text: string) => {
      const lower = text.toLowerCase();
      const angerKeywords = ["রাগ", "ক্ষেপা", "কুত্তা", "বাজে", "ফালতু", "ধুর", "ঘৃণা", "ক্লান্ত", "বিরক্ত", "ঝগড়া", "ঝগড়া", "পাগল", "শাট আপ", "stupid", "hate", "mad", "angry", "useless", "shutup", "frustrated"];
      const loveKeywords = ["ভালোবাসি", "ভালবাসি", "ভাল্লাগে", "ভালো লাগে", "ভালোবাসা", "প্রিয়", "প্রিয়", "লক্ষ্মী", "cute", "sweet", "love you", "love u", "awesome", "great", "nice", "ধন্যবাদ", "thanks", "gratitude", "উপকার"];
      const sadKeywords = ["কষ্ট", "কান্না", "দুঃখ", "অসহায়", "অসহায়", "হতাশ", "একা", "ফ্লপ", "sad", "unhappy", "cry", "lonely", "hurt", "broken", "বিপদ"];

      if (loveKeywords.some(keyword => lower.includes(keyword))) return "love";
      if (angerKeywords.some(keyword => lower.includes(keyword))) return "anger";
      if (sadKeywords.some(keyword => lower.includes(keyword))) return "sad";
      return "neutral";
    };

    const parsedEmotion = detectEmotionFromText(userText);
    setDetectedEmotion(parsedEmotion);

    // Save user message to UI chat instantly
    const userMessage: Message = {
      id: "usr-" + Date.now(),
      role: "user",
      text: userText,
      timestamp: Date.now()
    };

    // Keep state updated
    const currentHistory = [...messages, userMessage];
    setMessages(currentHistory);
    setIsLoading(true);

    // 1. Check if we are set strictly to Offline Local Mode
    if (aiMode === "offline") {
      // Simulate real-time brain cognitive delay
      setTimeout(() => {
        const offlineReply = matchOfflineKnowledge(userText);
        const modelMessage: Message = {
          id: "model-" + Date.now(),
          role: "model",
          text: offlineReply,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, modelMessage]);
        setIsLoading(false);
      }, 750);
      return;
    }

    // 2. Online or Hybrid Mode
    try {
      // Call secure fullstack server route
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: userText,
          // Send last 12 messages for performance and context
          history: currentHistory.slice(-12).map(m => ({ role: m.role, text: m.text })),
          brainConfig: {
            name: config.name,
            personality: config.personality,
            tone: config.tone,
            language: config.language,
            temperature: config.temperature,
          },
          knowledgeBase: facts.map(f => ({ title: f.title, content: f.content }))
        })
      });

      if (!response.ok) {
        throw new Error("সার্ভার রেসপন্স সিগন্যাল দিতে পারেনি।");
      }

      const data = await response.json();

      const modelMessage: Message = {
        id: "model-" + Date.now(),
        role: "model",
        text: data.text,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (err: any) {
      console.error(err);
      
      // If we are in Hybrid Mode, fail gracefully by querying the offline database instead of showing error
      if (aiMode === "hybrid") {
        const offlineReply = matchOfflineKnowledge(userText);
        const fallbackMsg: Message = {
          id: "err-fallback-" + Date.now(),
          role: "model",
          text: `⚠️ [অটো অফলাইন কুয়েরি]: অনলাইন জেমিনি সার্ভার অফলাইন থাকার কারণে (GEMINI_API_KEY না থাকায় বা নেটওয়ার্ক বন্ধ থাকায়) অফলাইন লোকাল ইন্টেলিজেন্ট ইঞ্জিন থেকে উত্তর দেওয়া হলো:\n\n${offlineReply}`,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, fallbackMsg]);
      } else {
        // Strict Online Mode error
        setErrorMsg("অনলাইন চ্যাট ব্যর্থ হয়েছে। জেমিনি সিক্রেট কি চেক করুন অথবা অফলাইন মোড সুইচার অন করুন।");
        const errorReply: Message = {
          id: "err-strict-" + Date.now(),
          role: "model",
          text: `❌ [সার্ভার সংযোগ ত্রুটি]: জেমিনি সার্ভিস রেসপন্স দেয়নি। অনুগ্রহ করে উপরে থেকে 'অফলাইন লোকাল মোড' অথবা 'স্মার্ট হাইব্রিড মোড' সিলেক্ট করুন যাতে রাসেল ভাইয়ের শেখানো মেমোরি থেকে সাথে সাথে অফলাইনে উত্তর পেতে পারেন!`,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, errorReply]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Quick prompt triggers
  const handleQuickPrompt = (promptText: string) => {
    setInputMsg(promptText);
  };

  // Export brain parameters to JSON file
  const exportBrainConfig = () => {
    try {
      const dataStr = JSON.stringify({ config, facts }, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `${config.name.replace(/\s+/g, '_')}_brain_blueprint.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      triggerNotification("এআই ব্রেন ব্লুপ্রিন্ট সফলভাবে এক্সপোর্ট হয়েছে!");
    } catch (err) {
      setErrorMsg("এক্সপোর্ট ফাইল তৈরিতে ত্রুটি ঘটেছে।");
    }
  };

  // Import brain parameters from uploaded file
  const importBrainConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.config && parsed.facts) {
            setConfig(parsed.config);
            setFacts(parsed.facts);
            triggerNotification(`অভিনন্দন! ব্লুপ্রিন্ট="${parsed.config.name}" ব্রেনে রি-কাস্ট করা হয়েছে।`);
            
            // Push active log
            setMessages(prev => [
              ...prev,
              {
                id: "msg-import-" + Date.now(),
                role: "model",
                text: `🔄 [সিস্টেম রিবুট]: সম্পূর্ণ নতুন ব্লুপ্রিন্ট মেমরি আপলোড করা হয়েছে। আমি এখন "${parsed.config.name}" হিসেবে কাজ শুরু করলাম!`,
                timestamp: Date.now()
              }
            ]);
          } else {
            setErrorMsg("ভুল ফাইল ফরম্যাট। এটি একটি বৈধ ব্রেন ব্লুপ্রিন্ট ফাইল নয়।");
          }
        } catch (error) {
          setErrorMsg("ফাইল পড়ার সময় ত্রুটি ঘটেছে। অনুগ্রহ করে সঠিক JSON ম্যাপ আপলোড করুন।");
        }
      };
    }
  };

  // Completely reset settings to defaults
  const handleFullReset = () => {
    if (window.confirm("আপনি কি নিশ্চিতভাবে এই এআই ব্রেন এবং তার সম্পূর্ণ শেখানো মেমরি রিস্টোর করে ডিফল্ট করতে চান?")) {
      setConfig(DEFAULT_CONFIG);
      setFacts(DEFAULT_FACTS);
      setMessages([
        {
          id: "msg-reset-" + Date.now(),
          role: "model",
          text: "এআই মগজের সম্পূর্ণ মেমরি ও ডিজাইন ফ্যাক্টরি রিসেট করা হয়েছে। আমি আমার আদি রুপে ফিরে গেছি। আমাকে পুনরায় নতুন কথা শিখিয়ে বড় করে তুলতে পারেন!",
          timestamp: Date.now()
        }
      ]);
      triggerNotification("অভিনন্দন! ব্রেন সফলভাবে রিসেট সম্পন্ন হয়েছে।");
    }
  };

  // Clear Chat history safely
  const handleClearChats = () => {
    setMessages([
      {
        id: "msg-init-reset-" + Date.now(),
        role: "model",
        text: `চ্যাট হিস্ট্রি মুছে ফেলা হয়েছে। আমি আপনার শেখানো ব্রেন **"${config.name}"** হিসেবে আপনাকে শুনছি। কথা বলা শুরু করুন!`,
        timestamp: Date.now()
      }
    ]);
    triggerNotification("চ্যাট হিস্ট্রি পরিষ্কার করা হয়েছে।");
  };

  return (
    <div className="min-h-screen bg-slate-550 flex flex-col font-sans" id="studio-root" style={{ backgroundColor: "#0f172a" }}>
      {/* Visual background atmospheric elements */}
      <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-blue-900/15 blur-3xl" />
      <div className="absolute bottom-5 right-1/4 h-80 w-80 rounded-full bg-indigo-900/10 blur-3xl" />

      {/* Header Panel */}
      <header className="relative border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 py-4 flex flex-col sm:flex-row justify-between items-center z-10 gap-4" id="studio_header">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl text-white ${cl.bg} bg-opacity-95 shadow-lg ${cl.shadow} transition-all duration-300`}>
            {renderIcon(config.iconName, "h-6 w-6 animate-pulse")}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
              MY AI BRAIN STUDIO
              <span className="text-xs bg-slate-800 text-slate-400 font-normal px-2.5 py-0.5 rounded-full border border-slate-700/60 font-mono">v2.5 Full-Stack</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              ডিজাইন করুন ও নিজের ইচ্ছামতো নতুন তথ্য শিখিয়ে গড়ি তুলুন স্বকীয় এআই ব্রেন 🚀
            </p>
          </div>
        </div>

        {/* Global Action Tools */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950/80 rounded-lg border border-slate-800 text-xs text-slate-400">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
            ব্রেন লাইভ
          </div>

          {/* Export utility */}
          <button 
            onClick={exportBrainConfig}
            title="Export Brain Config as JSON Blueprint"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/90 text-slate-200 hover:text-white rounded-lg border border-slate-700 text-xs transition-colors cursor-pointer"
            id="btn-export"
          >
            <Download className="h-3.5 w-3.5" />
            <span>ব্লুপ্রিন্ট ডাউনলোড</span>
          </button>

          {/* Import utility */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            title="Import Brain Config JSON"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/90 text-slate-200 hover:text-white rounded-lg border border-slate-700 text-xs transition-colors cursor-pointer"
            id="btn-import-trigger"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>ব্লুপ্রিন্ট আপলোড</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={importBrainConfig} 
            accept=".json" 
            className="hidden" 
          />

          {/* Factory Reset */}
          <button 
            onClick={handleFullReset}
            title="Reset Brain Settings completely"
            className="flex items-center gap-1 bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 hover:text-rose-200 p-1.5 rounded-lg border border-rose-900/40 transition-colors cursor-pointer text-xs"
            id="btn-reset-full"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>রিসেট ব্রেন</span>
          </button>
        </div>
      </header>

      {/* Toast Notification HUD */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 animate-bounce" id="toast-notif">
          <div className="bg-slate-900 border border-slate-700 shadow-2xl rounded-xl p-3.5 flex items-center gap-3 max-w-sm">
            <div className={`p-1.5 rounded-lg text-white ${cl.bg}`}>
              <Check className="h-4 w-4" />
            </div>
            <p className="text-xs font-medium text-slate-100">{notification}</p>
          </div>
        </div>
      )}

      {/* Main Studio Frame */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10" id="studio-main-frame">
        
        {/* Left Workbench Columns - Designing & Setting parameters */}
        <section className="lg:col-span-5 flex flex-col bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl" id="workbench-section">
          
          {/* Subsection Tab Bar selectors */}
          <div className="flex flex-wrap md:flex-nowrap border-b border-slate-800 bg-slate-950/40 p-1.5 gap-1" id="config-tabs">
            <button
              onClick={() => setActiveTab("design")}
              className={`flex-1 py-2 px-2.5 rounded-xl text-[11px] font-semibold tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "design" 
                  ? `${cl.bg} text-white shadow-md` 
                  : "text-slate-450 text-slate-400 hover:text-slate-200 hover:bg-slate-850/40 hover:bg-slate-800/30"
              }`}
              id="tab-design"
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>১. ডিজাইন</span>
            </button>
            <button
              onClick={() => setActiveTab("personality")}
              className={`flex-1 py-2 px-2.5 rounded-xl text-[11px] font-semibold tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "personality" 
                  ? `${cl.bg} text-white shadow-md` 
                  : "text-slate-450 text-slate-400 hover:text-slate-200 hover:bg-slate-850/40 hover:bg-slate-800/30"
              }`}
              id="tab-personality"
            >
              <Languages className="h-3.5 w-3.5" />
              <span>২. আচরণ</span>
            </button>
            <button
              onClick={() => setActiveTab("learn")}
              className={`flex-1 py-2 px-2.5 rounded-xl text-[11px] font-semibold tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "learn" 
                  ? `${cl.bg} text-white shadow-md relative` 
                  : "text-slate-450 text-slate-400 hover:text-slate-200 hover:bg-slate-850/40 hover:bg-slate-800/30"
              }`}
              id="tab-learn"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>৩. মেমোরি</span>
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-rose-500 text-white border border-[#0f172a] scale-90">
                {facts.length}
              </span>
            </button>
            <button
              onClick={() => {
                setActiveTab("developer");
                fetchDeveloperWorkspace();
              }}
              className={`flex-1 py-1.5 md:py-2 px-2 rounded-xl text-[11px] font-semibold tracking-wide transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === "developer" 
                  ? `${cl.bg} text-white shadow-md` 
                  : "text-slate-450 text-slate-400 hover:text-slate-200 hover:bg-slate-850/40 hover:bg-slate-800/30"
              }`}
              id="tab-developer"
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>৪. এপিআই হাব</span>
            </button>
          </div>

          <div className="flex-1 p-5 lg:p-6 overflow-y-auto" id="tab-workbench-content">
            {/* STEP 1: IDENTITY & STYLE PANEL */}
            {activeTab === "design" && (
              <div className="space-y-6 animate-fade-in" id="panel-identity">
                <div>
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest mb-1">এআই এর নাম ও ব্রেন্টিং</h3>
                  <p className="text-xs text-slate-400">এআই এর একটি চমৎকার আলাদা নাম দিন যা দিয়ে সে নিজেকে পরিচয় দেবে।</p>
                </div>

                {/* Name setter */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">ব্রেন আইডেন্টিটি নেম (Brain Name)</label>
                  <input
                    type="text"
                    value={config.name}
                    onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                    maxLength={24}
                    placeholder="যেমন: রাসেল জিপিটি, রাসেল এআই"
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all font-medium"
                    id="input-brain-name"
                  />
                </div>

                {/* Accent Color Picker */}
                <div className="space-y-4">
                  <label className="block text-xs font-semibold text-slate-300">থিম ও থিম মেকিং কালার (Theme Accent)</label>
                  <div className="grid grid-cols-6 gap-2">
                    {[
                      { key: "indigo", label: "Indigo", hex: "bg-indigo-600" },
                      { key: "emerald", label: "Emerald", hex: "bg-emerald-600" },
                      { key: "amber", label: "Amber", hex: "bg-amber-500" },
                      { key: "rose", label: "Rose", hex: "bg-rose-600" },
                      { key: "violet", label: "Violet", hex: "bg-violet-600" },
                      { key: "cyan", label: "Cyan", hex: "bg-cyan-500" },
                    ].map((col) => (
                      <button
                        key={col.key}
                        onClick={() => setConfig(prev => ({ ...prev, accentColor: col.key }))}
                        className={`py-2 px-1 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-[10px] uppercase font-bold cursor-pointer ${
                          config.accentColor === col.key 
                            ? "border-slate-300 bg-slate-800 text-slate-100 scale-105" 
                            : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                        }`}
                        id={`accent-picker-${col.key}`}
                      >
                        <span className={`h-4 w-4 rounded-full ${col.hex} shadow-sm`}></span>
                        <span>{col.key}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cybernetic Icon Picker */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-300">এআই ব্রেন লোগো নির্বাচন (Core Digital Icon)</label>
                  <div className="grid grid-cols-6 gap-2">
                    {[
                      { key: "brain", label: "Brain" },
                      { key: "sparkles", label: "Sparkle" },
                      { key: "terminal", label: "Coding" },
                      { key: "atom", label: "Quantum" },
                      { key: "zap", label: "Power" },
                      { key: "heart", label: "Soul" },
                    ].map((ico) => (
                      <button
                        key={ico.key}
                        onClick={() => setConfig(prev => ({ ...prev, iconName: ico.key }))}
                        className={`py-3 px-1 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                          config.iconName === ico.key 
                            ? `border-slate-300 bg-slate-800 text-slate-100 scale-105 shadow-md` 
                            : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                        }`}
                        id={`icon-picker-${ico.key}`}
                      >
                        <div className={`${config.iconName === ico.key ? cl.accentTextSec : "text-slate-400"}`}>
                          {renderIcon(ico.key, "h-4.5 w-4.5")}
                        </div>
                        <span className="text-[10px] tracking-tight">{ico.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Creative Level (Temperature) */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-300">বুদ্ধিমত্তা ও সৃষ্টিশীলতা লেভেল (Temperature)</label>
                    <span className="text-xs font-mono font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                      {config.temperature}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.1"
                    value={config.temperature}
                    onChange={(e) => setConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                    className="w-full h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-slate-400"
                    id="slider-temp"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>সংক্ষিপ্ত নিশ্চিত সত্য (0.2)</span>
                    <span>অত্যন্ত সৃষ্টিশীল / ফ্যান্টাসি (1.0)</span>
                  </div>
                </div>

                {/* Base AI parameters visual metadata */}
                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs text-slate-400 flex items-start gap-2.5">
                  <Cpu className="h-4.5 w-4.5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-300">কিউরেটেড মডেল: </span>
                    গুগলের সর্বশেষ জেমিনি ৩.৫ ফ্ল্যাশ ইঞ্জিন ব্যাকএন্ডে কাজ করছে। আপনি এখানে থিমে যা পরিবর্তন করবেন তা চ্যাট প্যানেলে তাৎক্ষণিক আপডেট হবে!
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: BEHAVIOR & STYLE CUSTOMIZER */}
            {activeTab === "personality" && (
              <div className="space-y-6 animate-fade-in" id="panel-personality">
                <div>
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest mb-1">ব্যক্তিত্ব ও আচরণ সেটিং</h3>
                  <p className="text-xs text-slate-400">এআই এর আচরণ ও কথা বলার ধরন আপনার মনের রূপ অনুযায়ী সেট করুন।</p>
                </div>

                {/* Select Quick Presets */}
                <div className="space-y-2">
                  <span className="block text-xs font-semibold text-slate-300">কুইক সিলেক্ট আচরণ প্রিসেট (Quick Personas)</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => handleSelectPresetPersona("friend")}
                      className="px-3 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition-all group cursor-pointer"
                      id="persona-friend"
                    >
                      <div className="text-xs font-bold text-slate-200 group-hover:text-white flex items-center gap-1">
                        😊 বন্ধুত্বপূর্ণ বন্ধু
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5 leading-tight">বাংলায় আড্ডার মধুর মেজাজ।</span>
                    </button>
                    <button 
                      onClick={() => handleSelectPresetPersona("coder")}
                      className="px-3 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition-all group cursor-pointer"
                      id="persona-coder"
                    >
                      <div className="text-xs font-bold text-slate-200 group-hover:text-white flex items-center gap-1">
                        💻 কোডিং জাদুকর
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5 leading-tight">তথ্যপূর্ণ কোডিং মেন্টর।</span>
                    </button>
                    <button 
                      onClick={() => handleSelectPresetPersona("poet")}
                      className="px-3 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition-all group cursor-pointer"
                      id="persona-poet"
                    >
                      <div className="text-xs font-bold text-slate-200 group-hover:text-white flex items-center gap-1">
                        ✍️ ছড়া-কবিতা বাউল
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5 leading-tight">মিষ্টি কবিতায় সাড়া দেয়।</span>
                    </button>
                    <button 
                      onClick={() => handleSelectPresetPersona("joke")}
                      className="px-3 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition-all group cursor-pointer"
                      id="persona-joke"
                    >
                      <div className="text-xs font-bold text-slate-200 group-hover:text-white flex items-center gap-1">
                        🤖 রসাত্মক রোবট
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5 leading-tight">Sarcastic humor. Beep Boop!</span>
                    </button>
                  </div>
                </div>

                {/* Custom System Instruction Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">আচরণের বিস্তারিত হুকুম (System Instructions)</label>
                  <textarea
                    rows={4}
                    value={config.personality}
                    onChange={(e) => setConfig(prev => ({ ...prev, personality: e.target.value }))}
                    placeholder="ব্রেনটি কেমন মেন্টালিটি ধারণ করবে তা বিশদে এখানে লিখে শেখান..."
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-250 text-slate-200 text-xs focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all font-medium leading-relaxed"
                    id="input-persona"
                  />
                </div>

                {/* Speak style */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">কথা বলার মেজাজ (Tone style)</label>
                  <input
                    type="text"
                    value={config.tone}
                    onChange={(e) => setConfig(prev => ({ ...prev, tone: e.target.value }))}
                    placeholder="যেমন: বিনয়ী, সিরিয়াস মেন্টর, রোবটিক"
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all font-medium"
                    id="input-tone"
                  />
                </div>

                {/* Base Language format */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">ভাষা প্রায়োরিটি (Language Target)</label>
                  <select
                    value={config.language}
                    onChange={(e) => setConfig(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full bg-slate-950/80 border border-slate-750 border-slate-700 rounded-xl px-4 py-2.5 text-slate-250 text-slate-200 text-xs focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all font-medium py-3"
                    id="select-language"
                  >
                    <option value="Bengali & English (বাংলিশ)">Bengali & English (বাংলিশ)</option>
                    <option value="Only Bengali (শুধুমাত্র বাংলা)">Only Bengali (শুধুমাত্র বাংলা)</option>
                    <option value="Only English (শুধুমাত্র ইংরেজি)">Only English (শুধুমাত্র ইংরেজি)</option>
                    <option value="Bangla, English & Chat Syntax">Bangla, English & Chat Syntax</option>
                  </select>
                </div>

                {/* 100% Truthfulness Guarantee & Helpfulness Banner */}
                <div className="p-4 bg-emerald-950/40 rounded-xl border border-emerald-900/40 space-y-2" id="truthfulness-guarantee-banner">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <Check className="h-4 w-4 text-emerald-400 animate-pulse" />
                    <span>১০০% সত্যতা গ্যারান্টি ও মানুষের উপকার সচল</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    আপনার এআই ব্রেন সবসময় ১০০% সঠিক ও বৈজ্ঞানিক তথ্য দিয়ে মানুষের উপকার করতে প্রতিশ্রুতিবদ্ধ। মনগড়া কথা, অসত্য তথ্য বা ক্ষতিকর অবাস্তব কিছু বলা থেকে এটি সম্পূর্ণ বিরত থাকবে এবং মানব কল্যাণে সর্বোচ্চ সত্যটি নিয়ে কাজ করবে।
                  </p>
                </div>
              </div>
            )}

            {/* STEP 3: TEACH BRAIN FACTS PANEL */}
            {activeTab === "learn" && (
              <div className="space-y-5 animate-fade-in" id="panel-teach">
                <div>
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest mb-1">ব্রেনকে তথ্য শেখানো ও স্মৃতি (সৎ ও বাস্তবধর্মী)</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    এখানে আপনি আপনার জীবনের আসল তথ্য, কাস্টম FAQ, ভালো বা মন্দ যেকোনো স্বভাব, গোপন কথা বা প্রশংসা-ত্রুটি লিখে সেভ করুন। এআই ভালো-খারাপ সব ধরনের তথ্যই কোনো বিচার ছাড়াই সরাসরি তার অবচেতন মগজে গেঁথে নিবে!
                  </p>
                </div>

                {/* Preset Information to Load Instantly */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5">
                  <span className="text-[11px] font-bold text-slate-300 block uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-amber-400" />
                    দ্রুত ১-ক্লিকে মগজে ঢুকানোর প্রিসেট উদাহরণ:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => loadPresetKnowledge("bio")}
                      className={`text-[10px] px-2.5 py-1.5 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-all cursor-pointer`}
                      id="preset-teach-bio"
                    >
                      ☕ রাসেল ভাইয়ের শখ শিখাও
                    </button>
                    <button 
                      onClick={() => loadPresetKnowledge("kushtia")}
                      className={`text-[10px] px-2.5 py-1.5 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-all cursor-pointer`}
                      id="preset-teach-kushtia"
                    >
                      🍯 কুষ্টিয়ার ঐতিহ্য শিখাও
                    </button>
                    <button 
                      onClick={() => loadPresetKnowledge("vision")}
                      className={`text-[10px] px-2.5 py-1.5 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-all cursor-pointer`}
                      id="preset-teach-vision"
                    >
                      🚀 এআই লক্ষ্য ও ভিশন
                    </button>
                  </div>
                </div>

                {/* Form to insert Fact Document */}
                <form onSubmit={handleAddFact} className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 space-y-3.5" id="form-add-fact">
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-300">
                    <Plus className="h-3.5 w-3.5" />
                    <span>নতুন কাস্টম জ্ঞান / মেমরি যুক্ত করুন:</span>
                  </div>
                  
                  <div className="space-y-1">
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-220 text-slate-250 text-slate-200 text-xs placeholder-slate-500 focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600 transition-all font-semibold"
                      placeholder="তথ্যের নাম (যেমন: রাসেল ভাইয়ের ভাই)"
                      value={newFactTitle}
                      onChange={(e) => setNewFactTitle(e.target.value)}
                      id="input-fact-title"
                    />
                  </div>

                  <div className="space-y-1">
                    <textarea
                      rows={2.5}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-220 text-slate-250 text-slate-200 text-xs placeholder-slate-500 focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600 transition-all font-medium leading-relaxed"
                      placeholder="মূল গোপন কথা / তথ্য যা এআই মনে রাখবে... (যেমন: রাসেল ভাইয়ের বড় ভায়ের নাম শুভ। সে ঢাকায় চাকরী করে।)"
                      value={newFactContent}
                      onChange={(e) => setNewFactContent(e.target.value)}
                      id="input-fact-content"
                    />
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-2 rounded-lg text-white font-semibold text-xs flex items-center justify-center gap-1.5 focus:outline-none focus:ring-1 cursor-pointer transition-colors ${cl.bg} ${cl.hoverBg} ${cl.ring}`}
                    id="btn-teach-submit"
                  >
                    <Bookmark className="h-3.5 w-3.5" />
                    <span>ইনজেক্ট ব্রেন মেমোরি 🧠</span>
                  </button>
                </form>

                {/* 🤖 ONLINE PDF & LIVE DIGITAL BOOK PARSER */}
                <div className="bg-slate-950 p-4 rounded-xl border border-indigo-900/45 space-y-4 shadow-xl" id="panel-pdf-book-reader">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4 text-indigo-400 animate-pulse" />
                      <span className="text-xs font-bold text-slate-100">অনলাইন পিডিএফ বই ও ডিজিটাল ডকুমেন্ট রিডার</span>
                    </div>
                    {/* Mode Toggles */}
                    <div className="flex gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 animate-fade-in">
                      <button
                        type="button"
                        onClick={() => {
                          setIsParsingBookMode("url");
                          setParsingDocumentError(null);
                          setParsingSuccessCount(null);
                        }}
                        className={`text-[9px] font-bold px-2 py-1 rounded-md transition-all cursor-pointer ${
                          isParsingBookMode === "url" ? `${cl.bg} text-white` : "text-slate-400 hover:text-white"
                        }`}
                        id="toggle-pdf-url"
                      >
                        <Globe className="h-2.5 w-2.5 inline mr-1" />
                        লিঙ্ক / URL
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsParsingBookMode("text");
                          setParsingDocumentError(null);
                          setParsingSuccessCount(null);
                        }}
                        className={`text-[9px] font-bold px-2 py-1 rounded-md transition-all cursor-pointer ${
                          isParsingBookMode === "text" ? `${cl.bg} text-white` : "text-slate-400 hover:text-white"
                        }`}
                        id="toggle-pdf-text"
                      >
                        <FileText className="h-2.5 w-2.5 inline mr-1" />
                        আস্ত টেক্সট
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    অনলাইনে যেকোনো ফ্রি বইয়ের PDF/HTML লিঙ্ক দিন, অথবা পুরো অধ্যায়ের কন্টেন্ট নিচে কপি করে দিন। এআই সেকেন্ডের মধ্যে রিড করে সেরা সেরা জ্ঞান বা তথ্যসমূহ নিজে থেকে খুঁজে বের করে স্বয়ংক্রিয়ভাবে ব্রেন মেমোরিতে গুঁজে দেবে!
                  </p>

                  <form onSubmit={handleParseDocument} className="space-y-3">
                    {isParsingBookMode === "url" ? (
                      <div className="space-y-1 animate-fade-in">
                        <label className="text-[10px] font-semibold text-slate-400 block">অনলাইন বই / PDF / আর্টিকেল লিংক:</label>
                        <input
                          type="url"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs placeholder-slate-600 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all font-mono"
                          placeholder="https://example.com/physics_chapter1.pdf..."
                          value={documentUrl}
                          onChange={(e) => setDocumentUrl(e.target.value)}
                          disabled={isParsingDocument}
                          id="input-document-url"
                        />
                      </div>
                    ) : (
                      <div className="space-y-1 animate-fade-in">
                        <label className="text-[10px] font-semibold text-slate-400 block">বইয়ের অধ্যায় বা আস্ত টেক্সট কপি করে দিন:</label>
                        <textarea
                          rows={3.5}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs placeholder-slate-600 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all font-medium leading-relaxed"
                          placeholder="এখানে অনেক বড় কোনো বইয়ের পাতা বা অধ্যায় কপি-পেস্ট করুন। এআই পুরো লেখা পড়ে গুরুত্বপূর্ণ ইনফো ফিল্টার করবে..."
                          value={documentRawText}
                          onChange={(e) => setDocumentRawText(e.target.value)}
                          disabled={isParsingDocument}
                          id="input-document-raw-text"
                        />
                      </div>
                    )}

                    {/* Progress States */}
                    {isParsingDocument && (
                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2 animate-pulse" id="parsing-loader">
                        <div className="flex justify-between items-center text-[10px] text-indigo-400 font-bold">
                          <span className="flex items-center gap-1.5 animate-pulse">
                            <RefreshCw className="h-3 w-3 animate-spin text-indigo-400" />
                            এআই মগজ বইটি মনোযোগ সহকারে পড়ছে ও তথ্য চুষে নিচ্ছে...
                          </span>
                          <span>প্রসেসিং</span>
                        </div>
                        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full rounded-full w-4/6 animate-pulse" />
                        </div>
                        <p className="text-[9px] text-slate-500 leading-tight">
                          ডিজিটাল পাতা ও চ্যাপ্টারের কোর লজিকগুলো যাচাই করে ব্রেন মেমোরি কার্ডে সাজানো হচ্ছে। অনুগ্রহ করে কয়েক সেকেন্ড অপেক্ষা করুন।
                        </p>
                      </div>
                    )}

                    {parsingDocumentError && (
                      <div className="p-3 bg-rose-950/30 rounded-lg border border-rose-900/40 flex items-start gap-2 text-rose-400 text-[10px] leading-relaxed" id="parsing-error-banner">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-400 mt-0.5" />
                        <span>{parsingDocumentError}</span>
                      </div>
                    )}

                    {parsingSuccessCount !== null && (
                      <div className="p-3 bg-emerald-950/30 rounded-lg border border-emerald-900/40 flex items-start gap-2 text-emerald-400 text-[10px] leading-relaxed animate-fade-in" id="parsing-success-banner">
                        <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400 mt-0.5" />
                        <span>অসামান্য! আপনার মগজে সফলভাবে <strong>{parsingSuccessCount}টি নতুন বইয়ের তথ্য কার্ড</strong> স্থায়ী স্মৃতিতে জমা করা হয়েছে! চ্যাটে গিয়ে এই বিষয়ে যেকোনো আলোচনা পরীক্ষা করতে পারেন।</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isParsingDocument}
                      className={`w-full py-2.5 rounded-lg text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isParsingDocument ? "bg-slate-800 text-slate-500 cursor-not-allowed" : `${cl.bg} ${cl.hoverBg}`
                      }`}
                      id="btn-parse-submit"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{isParsingDocument ? "বই পড়া হচ্ছে..." : "অনলাইন পিডিএফ/বই রিড করে স্মৃতিতে ভরো 🚀"}</span>
                    </button>
                  </form>
                </div>

                {/* List of currently installed facts */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-300 tracking-wide pb-1">
                    <span>মগজের বর্তমান তথ্য ভাঁড়ার ({facts.length} টি সংরক্ষিত)</span>
                    <span className="text-[10px] text-slate-500 font-normal">মেমরি সক্রিয়</span>
                  </div>

                  {facts.length === 0 ? (
                    <div className="text-center py-8 bg-slate-950/20 rounded-xl border border-dashed border-slate-800 text-xs text-slate-500">
                      কোনো তথ্য এখনো মুখস্থ করানো হয়নি। আপনি প্রিসেট এ ক্লিক করতে পারেন অথবা নিজে লিখে আপনার এআই ব্রেনকে নতুন তথ্য শেখাতে পারেন!
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1" id="factbox-list">
                      {facts.map((fact) => (
                        <div 
                          key={fact.id} 
                          className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 hover:border-slate-750 hover:border-slate-700/80 transition-all flex justify-between items-start gap-4 group"
                          id={`fact-card-${fact.id}`}
                        >
                          <div className="space-y-1 flex-1">
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${cl.lightBg} ${cl.lightText} inline-block`}>
                              {fact.title}
                            </span>
                            <p className="text-xs text-slate-300 leading-relaxed font-medium">
                              {fact.content}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteFact(fact.id, fact.title)}
                            title="মুছে ফেলুন"
                            className="p-1 text-slate-500 hover:text-red-400 rounded-lg translate-y-0.5 hover:bg-slate-900 transition-colors cursor-pointer"
                            id={`btn-del-fact-${fact.id}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 4: DEVELOPER & API HUB PORTAL */}
            {activeTab === "developer" && (
              <div className="space-y-6 animate-fade-in" id="panel-developer">
                <div>
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <Terminal className="h-4 w-4 text-indigo-400" />
                    <span>এপিআই ডেভেলপমেন্ট ও এজেন্ট হাব</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    আপনার এই সম্পূর্ণ কাস্টমাইজড মগজটি এখন একটি স্বাবলম্বী জেনুইন মডেল গেটওয়ে। এই মগজের নিজস্ব <strong>OpenAI-Compatible API key</strong> তৈরি করে অন্যান্য এআই বা এআই এজেন্ট (যেমন: LangChain, AutoGen, Flowise)-এর সাথে যুক্ত করতে পারেন!
                  </p>
                </div>

                {/* API Blueprint Sync Panel */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                      ব্যাকএন্ড মেমোরি সিঙ্ক স্ট্যাটাস
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-900/40">
                      লাইভ স্ট্রিমিং সচল
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    যেকোনো থার্ড-পার্টি অ্যাপ কল করার সময় আপনার এই ড্যাশবোর্ডের লেটেস্ট নাম, পার্সোনালিটি এবং মেমোরি অবিকল পেতে নিচে ক্লিক করে ব্যাকএন্ড সার্ভারে গ্লোবাল সিঙ্ক করুন।
                  </p>
                  <button
                    onClick={async () => {
                      setIsSyncingBlueprint(true);
                      try {
                        const res = await fetch("/api/save-blueprint", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ config, facts })
                        });
                        if (res.ok) {
                          triggerNotification("এআই ব্রেন সফলভাবে ব্যাকএন্ড সার্ভার এপিআই এর সাথে সিঙ্ক করা হয়েছে!");
                        } else {
                          setErrorMsg("সিঙ্ক করতে সমস্যা হয়েছে।");
                        }
                      } catch {
                        setErrorMsg("নেটওয়ার্ক ত্রুটি ঘটেছে।");
                      } finally {
                        setIsSyncingBlueprint(false);
                      }
                    }}
                    disabled={isSyncingBlueprint}
                    className={`w-full py-2 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      isSyncingBlueprint ? "bg-slate-800 text-slate-500 animate-pulse" : `${cl.bg} ${cl.hoverBg} text-white shadow`
                    }`}
                    id="btn-sync-blueprint"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isSyncingBlueprint ? "animate-spin" : ""}`} />
                    <span>{isSyncingBlueprint ? "সিঙ্ক হচ্ছে..." : "ব্রেন মেমোরি ব্যাকএন্ড এপিআই-তে সিঙ্ক করুন 🚀"}</span>
                  </button>
                </div>

                {/* 🐙 ONE-CLICK DIRECT GITHUB SAVER & SYNC PORTAL */}
                <div className="p-4 bg-slate-950 rounded-xl border border-indigo-950 space-y-4 shadow-xl" id="panel-github-sync-portal">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                      <GitBranch className="h-4 w-4 animate-pulse text-indigo-400" />
                      GitHub ১-ক্লিক কোড ব্যাকআপ সেন্টার
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-900/40">
                      অফিসিয়াল GitHub লিংক যুক্ত
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    আপনার এই এআই ড্যাশবোর্ডের সমস্ত কোডিং (server.ts, App.tsx, package.json...) এবং ট্রেনিং মেমোরি সরাসরি আপনার রিপোজিটরি <strong className="text-slate-300">DROBON/Ai-brain</strong>-এ এক ক্লিকে সেভ করুন।
                  </p>

                  <form onSubmit={handleGithubSync} className="space-y-3">
                    {/* Select backup type */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 block">ব্যাকআপ ক্যাটাগরি:</label>
                      <div className="grid grid-cols-2 gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                        <button
                          type="button"
                          onClick={() => setGithubSyncType("codebase")}
                          className={`py-2 px-2 rounded-lg text-[10px] font-extrabold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            githubSyncType === "codebase" 
                              ? "bg-indigo-600 text-white shadow-sm" 
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                          id="backup-type-codebase"
                        >
                          <Terminal className="h-3.5 w-3.5 text-slate-200 shrink-0" />
                          <span>সমস্ত কোডিং (Codebase) 🚀</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setGithubSyncType("memory")}
                          className={`py-2 px-2 rounded-lg text-[10px] font-extrabold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            githubSyncType === "memory" 
                              ? "bg-indigo-600 text-white shadow-sm" 
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                          id="backup-type-memory"
                        >
                          <Brain className="h-3.5 w-3.5 text-slate-200 shrink-0" />
                          <span>শুধু মেমোরি ব্লুপ্রিন্ট</span>
                        </button>
                      </div>
                    </div>

                    {/* Token Input */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-slate-400">GitHub Personal Access Token (PAT):</label>
                        <a 
                          href="https://github.com/settings/tokens/new?scopes=repo&description=MyAIBrainStudio" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[9px] text-indigo-400 hover:underline"
                        >
                          টোকেন তৈরি করুন ↗
                        </a>
                      </div>
                      <input
                        type="password"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 text-xs placeholder-slate-600 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-mono"
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxx"
                        value={githubToken}
                        onChange={(e) => setGithubToken(e.target.value)}
                        required
                        id="input-github-token"
                      />
                    </div>

                    {/* Repo & Branch inputs in 2 columns */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">GitHub Repository:</label>
                        <input
                          type="text"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 text-[11px] placeholder-slate-600 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-semibold"
                          placeholder="DROBON/Ai-brain"
                          value={githubRepo}
                          onChange={(e) => setGithubRepo(e.target.value)}
                          required
                          id="input-github-repo"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">Branch Name:</label>
                        <input
                          type="text"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 text-[11px] placeholder-slate-600 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-mono"
                          placeholder="main"
                          value={githubBranch}
                          onChange={(e) => setGithubBranch(e.target.value)}
                          required
                          id="input-github-branch"
                        />
                      </div>
                    </div>

                    {/* File Path input */}
                    {githubSyncType === "memory" && (
                      <div className="space-y-1 animate-fade-in">
                        <label className="text-[10px] font-bold text-slate-400">Target File Path (কমিট ফাইল নাম):</label>
                        <input
                          type="text"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 text-xs placeholder-slate-600 focus:outline-none focus:border-indigo-605 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                          placeholder="active_brain_blueprint.json"
                          value={githubFilePath}
                          onChange={(e) => setGithubFilePath(e.target.value)}
                          required
                          id="input-github-filepath"
                        />
                      </div>
                    )}

                    {githubSyncError && (
                      <div className="p-3 bg-rose-950/30 rounded-lg border border-rose-900/40 text-rose-400 text-[10px] flex items-start gap-2 leading-relaxed" id="github-sync-error">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-400 mt-0.5" />
                        <span>{githubSyncError}</span>
                      </div>
                    )}

                    {githubSyncSuccess && (
                      <div className="p-3 bg-emerald-950/30 rounded-lg border border-emerald-900/40 text-emerald-400 text-[10px] flex items-start gap-2 leading-relaxed animate-fade-in" id="github-sync-success">
                        <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400 mt-0.5" />
                        <span>{githubSyncSuccess}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSyncingToGithub}
                      className={`w-full py-2.5 rounded-lg text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        isSyncingToGithub ? "bg-slate-800 text-slate-500 animate-pulse" : `bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-950`
                      }`}
                      id="btn-github-sync-submit"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{isSyncingToGithub ? "GitHub এ কমিট হচ্ছে..." : "১-ক্লিক এ সরাসরি GitHub এ সেভ করুন 🚀"}</span>
                    </button>
                  </form>
                </div>

                {/* API Key Register Form */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 space-y-3">
                  <span className="text-xs font-bold text-slate-350 text-slate-300 block">নতুন এক্সটার্নাল এপিআই কি তৈরি করুন:</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 bg-slate-950 border border-slate-805 border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 text-xs placeholder-slate-500 focus:outline-none focus:border-slate-700 transition-all font-semibold"
                      placeholder="এজেন্টের নাম (যেমন: AutoGen, Slack Bot)"
                      value={keyLabel}
                      onChange={(e) => setKeyLabel(e.target.value)}
                      id="input-key-label"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        if (!keyLabel.trim()) {
                          setErrorMsg("দয়া করে এজেন্টের নাম বা লেবেল লিখুন।");
                          return;
                        }
                        try {
                          const res = await fetch("/api/keys", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ label: keyLabel })
                          });
                          if (res.ok) {
                            setKeyLabel("");
                            fetchDeveloperWorkspace();
                            triggerNotification("সফলভাবে নতুন এপিআই কি জেনারেট করা হয়েছে!");
                          }
                        } catch {
                          setErrorMsg("এপিআই কি তৈরি করা যায়নি।");
                        }
                      }}
                      className={`px-4 py-1.5 rounded-lg text-white font-bold text-xs cursor-pointer ${cl.bg} ${cl.hoverBg}`}
                      id="btn-generate-key"
                    >
                      জেনারেট
                    </button>
                  </div>
                </div>

                {/* API Keys List */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-slate-300 block">আপনার সক্রিয় ডেভেলপার এপিআই কি-সমূহ:</span>
                  {apiKeys.length === 0 ? (
                    <div className="text-center py-6 bg-slate-950/20 rounded-xl border border-dashed border-slate-800 text-[11px] text-slate-500">
                      কোনো এপিআই কি তৈরি করা হয়নি। উপরে এজেন্টের নাম দিয়ে একটি কি তৈরি করুন।
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {apiKeys.map((k) => (
                        <div key={k.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center gap-2 text-xs">
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-extrabold uppercase bg-slate-800 text-indigo-400 px-1.5 py-0.5 rounded mr-2 inline-block">
                              {k.label}
                            </span>
                            <code className="text-[10px] text-emerald-450 text-emerald-400 font-mono select-all bg-emerald-950/40 px-1.5 py-0.5 rounded font-bold">
                              {k.apiKey}
                            </code>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              if (window.confirm(`আপনি কি এই "${k.label}" কি-টি চিরতরে অ্যাক্সেস বন্ধ বা রিভোক করতে চান?`)) {
                                try {
                                  const res = await fetch(`/api/keys/${k.id}`, { method: "DELETE" });
                                  if (res.ok) {
                                    fetchDeveloperWorkspace();
                                    triggerNotification("এপিআই কি সফলভাবে রিভোক বা মুছে ফেলা হয়েছে!");
                                  }
                                } catch {
                                  setErrorMsg("মুছতে সমস্যা হয়েছে।");
                                }
                              }
                            }}
                            className="p-1 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
                            id={`btn-del-key-${k.id}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* OpenAI Endpoint Spec & Curl Documentation */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-200">
                    <Code className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                    <span>OpenAI standard কলিং ডকুমেন্টেশন</span>
                  </div>
                  <div className="text-[10px] text-slate-400 space-y-2 font-mono">
                    <div className="space-y-1">
                      <span className="text-slate-500 block">// Base API Endpoint:</span>
                      <code className="block bg-slate-900 px-2 py-1 rounded text-amber-500 font-bold break-all">
                        {typeof window !== "undefined" ? window.location.origin : ""}/api/v1/chat/completions
                      </code>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500 block">// Shell Curl রিকোয়েস্ট কোড উদাহরণ:</span>
                      <pre className="bg-slate-900 p-2 rounded text-slate-300 overflow-x-auto text-[9px] leading-normal break-all whitespace-pre-wrap select-all">
{`curl ${typeof window !== "undefined" ? window.location.origin : ""}/api/v1/chat/completions \\
  -H "Authorization: Bearer <CREATED_API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "messages": [
      {"role": "user", "content": "তুমি কার ব্রেন?"}
    ],
    "temperature": 0.7
  }'`}
                      </pre>
                    </div>
                  </div>
                  <div className="p-2.5 bg-emerald-950/25 rounded-lg border border-emerald-900/30 text-[10px] text-emerald-400 leading-normal">
                    💡 এই এপিআই-এর সাহায্যে আপনি যেকোনো প্রোগ্রাম, চ্যাটবট কিংবা অটোমেটেড স্ক্রিপ্টে আপনার কাস্টম ব্রেনের জ্ঞান ও মেমোরি অবিকল ব্যবহার করতে পারবেন!
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Right Section: Interactive Chat Playground */}
        <section className="lg:col-span-7 flex flex-col bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl relative" id="chat-section">
          
          {/* Chat Window Custom Header */}
          <div className="px-5 py-4 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between" id="chat-pnel-header">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl text-white ${cl.bg} bg-opacity-95 shadow-md`}>
                {renderIcon(config.iconName, "h-5 w-5")}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-slate-200">{config.name}</h3>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${cl.badge}`}>
                    {config.accentColor} active
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <span>ভাষা: {config.language}</span>
                  <span>•</span>
                  <span>সংরক্ষিত জ্ঞান: {facts.length} টি</span>
                </div>
              </div>
            </div>

            {/* Refresh Chat history button */}
            <button
              onClick={handleClearChats}
              title="চ্যাট ক্লিয়ার করুন"
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/50 hover:bg-slate-800/90 hover:text-white border border-slate-800/80 rounded-lg text-[11px] text-slate-400 transition-colors cursor-pointer"
              id="btn-clear-chats"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>চ্যাট সাফ</span>
            </button>
          </div>

          {/* Real-time Human Emotion Tracker Bar */}
          <div className="px-5 py-2.5 bg-slate-900/30 border-b border-slate-800/80 flex items-center justify-between text-xs gap-3">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
              <span>রিয়েলটাইম মানুষের মন ও আবেগ ফিলিং:</span>
            </span>
            <div className="flex gap-1.5 items-center">
              {detectedEmotion === 'neutral' && (
                <span className="px-2.5 py-1 bg-slate-800/80 text-slate-300 rounded-lg text-[10px] font-bold flex items-center gap-1 border border-slate-700">
                  😐 স্বাভাবিক ও শান্ত (Neutral & Steady)
                </span>
              )}
              {detectedEmotion === 'love' && (
                <span className="px-2.5 py-1 bg-rose-950/65 text-rose-300 rounded-lg text-[10px] font-bold flex items-center gap-1 border border-rose-900/60 animate-bounce">
                  ❤️ গভীর স্নেহ ও ভালোবাসা (Love & Affection)
                </span>
              )}
              {detectedEmotion === 'anger' && (
                <span className="px-2.5 py-1 bg-amber-950/65 text-amber-300 rounded-lg text-[10px] font-bold flex items-center gap-1 border border-amber-900/60">
                  🔥 রাগ, ক্ষোভ বা অভিমান (Anger & Hurt)
                </span>
              )}
              {detectedEmotion === 'sad' && (
                <span className="px-2.5 py-1 bg-blue-950/65 text-blue-300 rounded-lg text-[10px] font-bold flex items-center gap-1 border border-blue-900/60 animate-pulse">
                  😢 কষ্ট ও একা লাগা (Sadness Detected)
                </span>
              )}
            </div>
          </div>

          {/* Dual Learning & Execution Mode Selector */}
          <div className="px-5 py-3 bg-slate-950/75 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs" id="mode-selector-bar">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-300">লার্নিং ইঞ্জিন (Brain Engine):</span>
              <span className="text-[10px] text-slate-500 font-medium hidden md:inline">অফলাইন ও অনলাইন দুইভাবেই শিখবে ও কাজ করবে</span>
            </div>

            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 gap-1 self-start sm:self-auto" id="mode-segmented-control">
              <button
                type="button"
                onClick={() => {
                  setAiMode("hybrid");
                  triggerNotification("স্মার্ট হাইব্রিড মোড অ্যাক্টিভড! অনলাইন ডাউন থাকলে লোকাল মেমোরি অটো-কল হবে।");
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1 ${
                  aiMode === "hybrid"
                    ? `${cl.bg} text-white shadow-sm`
                    : "text-slate-400 hover:text-slate-200"
                }`}
                id="mode-hybrid-pill"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>হাইব্রিড (স্মার্ট)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAiMode("online");
                  triggerNotification("শুধুমাত্র অনলাইন মোড অ্যাক্টিভড! জেমিনি ৩.৫ দিয়ে লাইভ ক্রিয়েটিভ আলোচনা।");
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1 ${
                  aiMode === "online"
                    ? `${cl.bg} text-white shadow-sm`
                    : "text-slate-400 hover:text-slate-200"
                }`}
                id="mode-online-pill"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>অনলাইন (জেমিনি)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAiMode("offline");
                  triggerNotification("অফলাইন লোকাল মোড অ্যাক্টিভড! লোকাল সোর্স থেকে ইনস্ট্যান্ট উত্তর।");
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1 ${
                  aiMode === "offline"
                    ? `${cl.bg} text-white shadow-sm`
                    : "text-slate-400 hover:text-slate-200"
                }`}
                id="mode-offline-pill"
              >
                <WifiOff className="h-3.5 w-3.5" />
                <span>অফলাইন (লোকাল)</span>
              </button>
            </div>
          </div>

          {/* Interactive messages frame */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-950/15" style={{ minHeight: "380px", maxHeight: "460px" }} id="messages-box-frame">
            
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${
                  msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
                id={`message-bubble-${msg.id}`}
              >
                {/* Visual Role Avatars */}
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-white ${
                  msg.role === "user" ? "bg-slate-800" : cl.bg
                }`}>
                  {msg.role === "user" ? (
                    <User className="h-4 w-4 text-slate-300" />
                  ) : (
                    renderIcon(config.iconName, "h-4 w-4 animate-slow-spin")
                  )}
                </div>

                {/* Message textual frame body */}
                <div className={`p-4.5 rounded-2xl text-xs leading-relaxed transition-all shadow-md ${
                  msg.role === "user" 
                    ? `${cl.bg} text-white font-medium rounded-tr-none`
                    : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none leading-relaxed font-sans"
                }`}>
                  
                  {/* Handle line-breaks gracefully for markdown/text appearance */}
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {msg.text}
                  </p>

                  <div className={`text-[9px] mt-2 block opacity-75 font-mono text-right ${
                    msg.role === "user" ? "text-slate-200" : "text-slate-500"
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator while API runs */}
            {isLoading && (
              <div className="flex gap-3 max-w-[80%] mr-auto" id="typing-indicator">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-white ${cl.bg}`}>
                  {renderIcon(config.iconName, "h-4 w-4 animate-spin")}
                </div>
                <div className="p-4 bg-slate-900 border border-slate-800 text-slate-200 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-md">
                  <span className={`w-2 h-2 ${cl.bg} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
                  <span className={`w-2 h-2 ${cl.bg} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
                  <span className={`w-2 h-2 ${cl.bg} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
                  <span className="text-[10px] text-slate-400 font-medium pl-1">{config.name} ভাবছে ...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick preset questions section */}
          <div className="px-5 py-2.5 bg-slate-950/30 border-t border-slate-800/80 flex flex-col gap-2" id="quick-questions-panel">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Compass className="h-3.5 w-3.5" />
              <span>ব্রেনকে ট্রেইনিং টেস্ট করুন (Test Prompts):</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => handleQuickPrompt("তুমি কে? নাম কী এবং কে তোমাকে বানিয়েছে?")}
                className="text-[10px] bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
                id="btn-qp-1"
              >
                ❓ তুমি কে এবং কে বানিয়েছে?
              </button>
              <button 
                onClick={() => handleQuickPrompt("আমাদের রাসেল ভাইয়ের ক্যারেক্টার ও শখ সম্পর্কে কী তথ্য জানো বলো?")}
                className="text-[10px] bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
                id="btn-qp-2"
              >
                ❓ রাসেল ভাইয়ের শখ কী?
              </button>
              <button 
                onClick={() => handleQuickPrompt("আমার বাসস্থান অর্থাৎ কুষ্টিয়া নিয়ে একটি মিষ্টি বর্ণনা দাও ও কবিদের কথা বলো।")}
                className="text-[10px] bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
                id="btn-qp-3"
              >
                ❓ কুষ্টিয়া সম্পর্কে কী জানো?
              </button>
              <button 
                onClick={() => handleQuickPrompt("আমাদের উদ্দেশ্য ও এআই ভিশন নিয়ে কিছু অনুপ্রাণিত করার মতো গল্প বলো!")}
                className="text-[10px] bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
                id="btn-qp-4"
              >
                ❓ এআই নিয়ে ভবিষ্যৎ পরিকল্পনা কী?
              </button>
            </div>
          </div>

          {/* Form message submission */}
          <form onSubmit={handleSendMessage} className="p-4 bg-slate-950/70 border-t border-slate-800/80 flex gap-3" id="chat-input-form">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder={`মগজকে("${config.name}") কিছু জিজ্ঞাসা করুন...`}
              disabled={isLoading}
              className="flex-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 placeholder-slate-500 transition-all font-medium"
              id="input-text-msg"
            />
            <button
              type="submit"
              disabled={!inputMsg.trim() || isLoading}
              className={`px-4 py-2 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all focus:outline-none ${
                !inputMsg.trim() || isLoading
                  ? "bg-slate-850 bg-slate-800 border-slate-900 text-slate-500 cursor-not-allowed border opacity-40"
                  : `${cl.bg} ${cl.hoverBg} cursor-pointer shadow-lg ${cl.shadow}`
              }`}
              id="btn-send-message"
            >
              <Send className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">সেন্ড</span>
            </button>
          </form>

          {/* Prompt key check guide in case of empty API */}
          <div className="bg-slate-950 px-5 py-2 border-t border-slate-855 border-slate-850 border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono" id="secrets-guidance">
            <span>🔑 API Endpoint: Secure Server SSL</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              Gemini model: 3.5 Flash
            </span>
          </div>
        </section>
      </main>

      {/* Elegant minimalist Workspace credit footer */}
      <footer className="mt-auto border-t border-slate-800/70 bg-slate-900/40 p-4 text-center text-xs text-slate-500" id="studio-footer-details">
        <div>
          © {new Date().getFullYear()} My AI Brain Studio. Designed for Developer Rasel & AI Enthusiasts.
        </div>
      </footer>
    </div>
  );
}
