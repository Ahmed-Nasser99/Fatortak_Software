"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  MessageSquare,
  Copy,
  CheckCircle,
  BarChart3,
  Plus,
  Search,
  Menu,
  X,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Trash2,
  RefreshCw,
  Mic,
  MicOff,
  TrendingUp,
  DollarSign,
  Users,
  ShoppingCart,
  ChevronUp,
  FileText,
  Download,
  Upload,
  FileDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  format,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  parseISO,
} from "date-fns";
import { useLanguage } from "../contexts/LanguageContext";
import { AiChatService, type ChatSession } from "../services/aiChatService";
import { useQuotaGuard } from "../hooks/useQuotaGuard";
import MarkdownRenderer from "@/Helpers/MarkdownRenderer";
import QuotaLimitModal from "@/components/modals/QuotaLimitModal";
import { toast } from "react-toastify";
import AiVisualization from "@/components/Ai/AiVisualization";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface VisualizationData {
  type: "kpi" | "chart";
  data: any;
  chartType?: "line" | "bar" | "pie" | "area";
  title?: string;
  description?: string;
}

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  status?: "sending" | "sent" | "failed";
  visualizationData?: VisualizationData;
}

interface GroupedSessions {
  [key: string]: ChatSession[];
}

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  labelEn: string;
  query: string;
  queryEn: string;
  color: string;
}

const MAX_MESSAGES_TO_SEND = 5;

const formatTimestamp = (d: Date) =>
  d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const quickActions = [
  {
    icon: <TrendingUp className="w-5 h-5" />,
    label: "إجمالي المبيعات",
    labelEn: "Total Sales",
    query: "ما هو إجمالي المبيعات هذا الشهر؟",
    queryEn: "What is the total sales this month?",
    color: "text-blue-500",
  },
  {
    icon: <DollarSign className="w-5 h-5" />,
    label: "صافي الربح",
    labelEn: "Net Profit",
    query: "ما هو صافي الربح هذا الشهر؟",
    queryEn: "What is the net profit this month?",
    color: "text-green-500",
  },
  {
    icon: <Users className="w-5 h-5" />,
    label: "أفضل العملاء",
    labelEn: "Top Customers",
    query: "من هم أفضل 5 عملاء لدي؟",
    queryEn: "Who are my top 5 customers?",
    color: "text-purple-500",
  },
  {
    icon: <ShoppingCart className="w-5 h-5" />,
    label: "المنتجات الأكثر مبيعاً",
    labelEn: "Best Selling Products",
    query: "ما هي المنتجات الأكثر مبيعاً؟",
    queryEn: "What are the best selling products?",
    color: "text-orange-500",
  },
  {
    icon: <FileText className="w-5 h-5" />,
    label: "فواتير الشهر الحالي",
    labelEn: "Invoices This Month",
    query: "عاوز كل الفواتير الشهر ده",
    queryEn: "Show me all invoices this month",
    color: "text-indigo-500",
  },
];

const AIChat: React.FC = () => {
  const { isRTL, t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set()
  );
  const [sessionMenuOpen, setSessionMenuOpen] = useState<string | null>(null);
  const [failedMessageId, setFailedMessageId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationRef = useRef<number>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isListening) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const audioCtx = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);

      source.connect(analyser);
      analyser.fftSize = 256;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      sourceRef.current = source;

      const canvas = canvasRef.current!;
      const canvasCtx = canvas.getContext("2d")!;

      const draw = () => {
        animationRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        // Calculate average volume (rough silence detection)
        const avg =
          dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;

        canvasCtx.fillStyle = "#f3f4f6"; // background
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        // If sound level is very low → draw flat line
        if (avg < 10) {
          canvasCtx.fillStyle = "#d1d5db"; // gray line for silence
          canvasCtx.fillRect(0, canvas.height / 2, canvas.width, 2);
          return;
        }

        // Draw bars for active sound
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const barHeight = dataArray[i] / 2;
          canvasCtx.fillStyle = "#9333ea"; // purple bars
          canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }
      };

      draw();
    });
  }, [isListening]);

  // Initialize speech recognition
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = isRTL ? "ar-SA" : "en-US";

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = () => {
        setIsListening(false);
        toast.error(
          isRTL ? "خطأ في التعرف على الصوت" : "Voice recognition error"
        );
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [isRTL]);

  const getDateGroup = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return isRTL ? "اليوم" : "Today";
    if (isYesterday(date)) return isRTL ? "أمس" : "Yesterday";
    if (isThisWeek(date)) return isRTL ? "هذا الأسبوع" : "This Week";
    if (isThisMonth(date)) return isRTL ? "هذا الشهر" : "This Month";
    return format(date, "MMMM yyyy");
  };

  const {
    checkQuota,
    showQuotaModal,
    quotaModalType,
    closeQuotaModal,
    handleUpgrade,
    quotaUsage,
  } = useQuotaGuard();

  useEffect(() => {
    if (currentSession) {
      let isMounted = true;

      const loadMessages = async () => {
        try {
          const messagesData = await AiChatService.getMessages(currentSession);
          if (isMounted) {
            setMessages(
              messagesData.map((m) => ({
                id: m.id,
                content: m.content,
                sender: m.role === "user" ? "user" : "ai",
                timestamp: new Date(m.createdAt),
                status: "sent",
                visualizationData: m.visualizationData,
              }))
            );
          }
        } catch (error) {
          if (isMounted) {
            setMessages([]);
          }
        }
      };

      loadMessages();

      return () => {
        isMounted = false;
      };
    } else {
      setMessages([]);
    }
  }, [currentSession]);

  const getRecentMessages = useCallback(() => {
    const userMessages = messages
      .filter((m) => m.sender === "user")
      .slice(-MAX_MESSAGES_TO_SEND);
    return userMessages.map((m) => ({
      content: m.content,
      role: "user" as const,
    }));
  }, [messages]);

  const groupedSessions = useMemo(() => {
    const filtered = sessions.filter((session) =>
      session.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const grouped: GroupedSessions = {};
    filtered.forEach((session) => {
      const group = getDateGroup(new Date(session.updatedAt).toISOString());
      if (!grouped[group]) grouped[group] = [];
      grouped[group].push(session);
    });

    const sortedGroups: GroupedSessions = {};
    const groupOrder = isRTL
      ? ["اليوم", "أمس", "هذا الأسبوع", "هذا الشهر"]
      : ["Today", "Yesterday", "This Week", "This Month"];

    groupOrder.forEach((group) => {
      if (grouped[group]) {
        sortedGroups[group] = grouped[group].sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      }
    });

    Object.keys(grouped).forEach((group) => {
      if (!groupOrder.includes(group)) {
        sortedGroups[group] = grouped[group].sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      }
    });

    return sortedGroups;
  }, [sessions, searchQuery, isRTL]);

  const toggleGroup = useCallback((groupName: string) => {
    setCollapsedGroups((prev) => {
      const newCollapsed = new Set(prev);
      if (newCollapsed.has(groupName)) {
        newCollapsed.delete(groupName);
      } else {
        newCollapsed.add(groupName);
      }
      return newCollapsed;
    });
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        window.innerWidth < 1024
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

  useEffect(() => {
    const handleClickOutside = () => setSessionMenuOpen(null);
    if (sessionMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [sessionMenuOpen]);

  useEffect(() => {
    let isMounted = true;
    const loadSessions = async () => {
      try {
        const sessionsData = await AiChatService.getSessions();
        if (isMounted) {
          setSessions(sessionsData);
          setIsLoadingSessions(false);
        }
      } catch (error) {
        if (isMounted) {
          setIsLoadingSessions(false);
        }
      }
    };
    loadSessions();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleVoiceInput = () => {
    if (!recognition) {
      toast.error(
        isRTL
          ? "متصفحك لا يدعم التعرف على الصوت"
          : "Your browser doesn't support voice recognition"
      );
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isLoading) return;

    const canProceed = await checkQuota("ai");
    if (!canProceed) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
      status: "sending",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const recentMessages = getRecentMessages();
      const response = await AiChatService.sendQuery(
        inputMessage,
        currentSession,
        recentMessages
      );

      setCurrentSession(response.sessionId);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === userMessage.id ? { ...m, status: "sent" } : m
        )
      );

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: response.message,
          sender: "ai",
          timestamp: new Date(),
          status: "sent",
          visualizationData: response.visualizationData,
        },
      ]);

      const updatedSessions = await AiChatService.getSessions();
      setSessions(updatedSessions);
      setFailedMessageId(null);
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === userMessage.id ? { ...m, status: "failed" } : m
        )
      );

      setFailedMessageId(userMessage.id);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content:
            t("connectionError") || "Connection error. Please try again.",
          sender: "ai",
          timestamp: new Date(),
          status: "sent",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [
    inputMessage,
    currentSession,
    checkQuota,
    t,
    getRecentMessages,
    isLoading,
  ]);

  const handleRetryMessage = useCallback(async () => {
    if (!failedMessageId || isLoading) return;

    const failedMessage = messages.find((m) => m.id === failedMessageId);
    if (!failedMessage) return;

    setIsLoading(true);
    setFailedMessageId(null);

    try {
      const recentMessages = getRecentMessages();
      const response = await AiChatService.sendQuery(
        failedMessage.content,
        currentSession,
        recentMessages
      );

      setCurrentSession(response.sessionId);

      setMessages((prev) =>
        prev.filter(
          (m) =>
            m.id !== failedMessageId &&
            !(
              m.sender === "ai" &&
              m.content.includes(t("connectionError") || "Connection error")
            )
        )
      );

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: failedMessage.content,
          sender: "user",
          timestamp: new Date(),
          status: "sent",
        },
        {
          id: Date.now().toString() + "-response",
          content: response.message,
          sender: "ai",
          timestamp: new Date(),
          status: "sent",
          visualizationData: response.visualizationData,
        },
      ]);

      const updatedSessions = await AiChatService.getSessions();
      setSessions(updatedSessions);
    } catch (err) {
      setFailedMessageId(failedMessageId);
    } finally {
      setIsLoading(false);
    }
  }, [
    failedMessageId,
    messages,
    currentSession,
    t,
    getRecentMessages,
    isLoading,
  ]);

  const handleNewChat = useCallback(() => {
    setCurrentSession(null);
    setMessages([]);
    setInputMessage("");
    setIsSidebarOpen(false);
  }, []);

  const handleDeleteSession = useCallback(
    async (sessionId: string) => {
      try {
        await AiChatService.deleteSession(sessionId);
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (currentSession === sessionId) {
          handleNewChat();
        }
        setSessionMenuOpen(null);
      } catch (error) {
        toast.error(isRTL ? "فشل حذف المحادثة" : "Failed to delete session");
      }
    },
    [currentSession, handleNewChat, isRTL]
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInputMessage(e.target.value);
      const ta = e.target;
      ta.style.height = "auto";
      ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
    },
    []
  );

  const copyToClipboard = useCallback(
    async (content: string, messageId: string) => {
      try {
        await navigator.clipboard.writeText(content);
        setCopiedId(messageId);
        setTimeout(() => setCopiedId(null), 1800);
        toast.success(isRTL ? "تم النسخ" : "Copied");
      } catch (e) {
        toast.error(isRTL ? "خطأ في النسخ" : "Copy failed");
      }
    },
    [isRTL]
  );

  const handleQuickAction = useCallback(
    (action: QuickAction) => {
      const query = isRTL ? action.query : action.queryEn;
      setInputMessage(query);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 100);
    },
    [isRTL]
  );

  const handleExportChat = useCallback(() => {
    if (messages.length === 0) {
      toast.warn(isRTL ? "لا توجد رسائل للتصدير" : "No messages to export");
      return;
    }

    const chatData = {
      sessionId: currentSession,
      exportedAt: new Date().toISOString(),
      messages: messages.map((m) => ({
        ...m,
        timestamp: m.timestamp.toISOString(),
      })),
    };

    const blob = new Blob([JSON.stringify(chatData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [messages, currentSession, isRTL]);

  const handleImportChat = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsedData = JSON.parse(content);

          if (!parsedData.messages || !Array.isArray(parsedData.messages)) {
            throw new Error("Invalid chat format");
          }

          const importedMessages = parsedData.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          }));

          setMessages(importedMessages);
          toast.success(
            isRTL ? "تم استيراد المحادثة بنجاح" : "Chat imported successfully"
          );
        } catch (error) {
          console.error("Import error:", error);
          toast.error(
            isRTL ? "فشل استيراد الملف" : "Failed to import chat file"
          );
        }
      };
      reader.readAsText(file);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [isRTL]
  );

  const handleExportMessageToPdf = async (messageId: string) => {
    const element = document.getElementById(`message-${messageId}`);
    if (!element) return;

    try {
      toast.info(isRTL ? "جاري إنشاء ملف PDF..." : "Generating PDF...");
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`fatortak-ai-insight-${new Date().toISOString().slice(0, 10)}.pdf`);
      
      toast.success(isRTL ? "تم تحميل ملف PDF" : "PDF Downloaded");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error(isRTL ? "فشل إنشاء ملف PDF" : "Failed to generate PDF");
    }
  };

  const renderMessage = (msg: Message) => (
    <motion.div
      key={msg.id}
      id={`message-${msg.id}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${
        msg.sender === "user" ? "justify-start" : "justify-end"
      } mb-6`}
    >
      <div
        className={`flex items-start gap-3 max-w-[90%] sm:max-w-[85%] md:max-w-[80%] ${
          msg.sender === "user" ? "flex-row" : "flex-row-reverse"
        }`}
      >
        <div
          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
            msg.sender === "user"
              ? "bg-gradient-to-br from-blue-500 to-indigo-600"
              : "bg-gradient-to-br from-purple-500 to-violet-600"
          }`}
        >
          {msg.sender === "user" ? (
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          ) : (
            <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          )}
        </div>

        <div className="group min-w-0 flex-1">
          <div
            className={`px-4 sm:px-5 py-3 sm:py-4 rounded-2xl shadow-sm break-words ${
              msg.sender === "user"
                ? msg.status === "failed"
                  ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                  : "bg-white dark:bg-gray-800 border border-blue-100 dark:border-gray-700 rounded-tr-sm"
                : "bg-white dark:bg-gray-800 border border-purple-100 dark:border-gray-700 rounded-tl-sm"
            }`}
          >
            <div className={`text-sm sm:text-base leading-relaxed ${
              msg.sender === "user" ? "text-gray-800 dark:text-gray-200" : "text-gray-800 dark:text-gray-200"
            }`}>
              {msg.sender === "user" ? (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <MarkdownRenderer content={msg.content} isRTL={isRTL} />
              )}
            </div>

            {msg.visualizationData && (
              <AiVisualization data={msg.visualizationData} />
            )}

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-700/50">
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {formatTimestamp(msg.timestamp)}
                {msg.status === "sending" &&
                  (isRTL ? " (جاري الإرسال...)" : " (Sending...)")}
                {msg.status === "failed" &&
                  (isRTL ? " (فشل الإرسال)" : " (Failed)")}
              </span>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {msg.sender === "ai" && (
                  <>
                    <button
                      onClick={() => handleExportMessageToPdf(msg.id)}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors text-gray-400 hover:text-purple-600"
                      title={isRTL ? "تصدير PDF" : "Export PDF"}
                    >
                      <FileDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      title={isRTL ? "نسخ" : "Copy"}
                    >
                      {copiedId === msg.id ? (
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </button>
                  </>
                )}
                {msg.sender === "user" && msg.status === "failed" && (
                  <button
                    onClick={handleRetryMessage}
                    disabled={isLoading}
                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md text-red-500 transition-colors"
                    title={isRTL ? "إعادة المحاولة" : "Retry"}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div
      className="flex h-screen bg-slate-50 dark:bg-gray-900 overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <>
        <aside
          ref={sidebarRef}
          className={`
      fixed lg:relative z-50 lg:z-auto
      h-full bg-white dark:bg-gray-800
      ${isSidebarOpen ? "w-72 sm:w-80" : "w-20"}
      ${isRTL ? "border-l right-0" : "border-r left-0"} 
      border-gray-200 dark:border-gray-700
      flex flex-col transition-all duration-300 ease-in-out shadow-lg lg:shadow-none
    `}
        >
          {/* Collapse / Expand button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`
        absolute top-6 w-6 h-6 bg-white dark:bg-slate-800 
        border border-slate-300 dark:border-slate-600 rounded-full 
        flex items-center justify-center shadow-md hover:shadow-lg 
        transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-700
        z-10 hidden lg:flex
        ${isRTL ? "-left-3" : "-right-3"}
      `}
          >
            {isSidebarOpen ? (
              !isRTL ? (
                <ChevronLeft className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )
            ) : !isRTL ? (
              <ChevronRight className="w-3 h-3" />
            ) : (
              <ChevronLeft className="w-3 h-3" />
            )}
          </button>

          {/* Header */}
          <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between mb-4">
              {isSidebarOpen && (
                <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {t("chats")}
                </h2>
              )}
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* New Chat Button */}
            <button
              onClick={handleNewChat}
              className={`w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 
          text-white mb-4 h-10 rounded-xl flex items-center justify-center gap-2 text-sm font-medium shadow-md hover:shadow-lg
          transition-all duration-300 transform hover:-translate-y-0.5`}
              title={!isSidebarOpen ? t("newChat") : undefined}
            >
              <Plus className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && (
                <span className="truncate">{t("newChat")}</span>
              )}
            </button>

            {/* Search input - hide when collapsed */}
            {isSidebarOpen && (
              <div className="relative group">
                <Search
                  className={`absolute ${
                    isRTL ? "right-3" : "left-3"
                  } top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-500 transition-colors`}
                />
                <input
                  placeholder={t("search")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full ${isRTL ? "pr-10 pl-3" : "pl-10 pr-3"} 
              h-9 text-sm border border-gray-200 dark:border-gray-600 
              rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
              focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all`}
                />
              </div>
            )}
          </div>

          {/* Chat Sessions */}
          <div className="flex-1 overflow-y-auto min-h-0 overscroll-contain px-2 py-3 custom-scrollbar">
            {isLoadingSessions ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
              </div>
            ) : (
              isSidebarOpen && (
                <div className="space-y-4">
                  {Object.entries(groupedSessions).map(
                    ([groupName, groupSessions]) => (
                      <div key={groupName}>
                        <button
                          className={`flex items-center justify-between w-full px-3 py-2 rounded-lg mb-1 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors group`}
                          onClick={() => toggleGroup(groupName)}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Calendar className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              {groupName}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                            {groupSessions.length}
                          </span>
                        </button>

                        <AnimatePresence>
                          {!collapsedGroups.has(groupName) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden space-y-1"
                            >
                              {groupSessions.map((session) => (
                                <div
                                  key={session.id}
                                  className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                                    currentSession === session.id
                                      ? "bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 shadow-sm"
                                      : "hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent"
                                  }`}
                                  onClick={() => {
                                    setCurrentSession(session.id);
                                    if (window.innerWidth < 1024) setIsSidebarOpen(false);
                                  }}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                      <div className={`font-medium text-sm line-clamp-1 mb-1 ${
                                        currentSession === session.id ? "text-purple-700 dark:text-purple-300" : "text-gray-700 dark:text-gray-300"
                                      }`}>
                                        {session.title}
                                      </div>
                                      <div className="text-xs text-gray-400">
                                        {new Date(session.updatedAt).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </div>
                                    </div>

                                    <div className="relative flex-shrink-0">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSessionMenuOpen(
                                            sessionMenuOpen === session.id ? null : session.id
                                          );
                                        }}
                                        className={`p-1 rounded-md transition-all ${
                                          currentSession === session.id 
                                            ? "opacity-100 hover:bg-purple-100 dark:hover:bg-purple-800/50 text-purple-600" 
                                            : "opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500"
                                        }`}
                                      >
                                        <MoreVertical className="w-4 h-4" />
                                      </button>

                                      {sessionMenuOpen === session.id && (
                                        <div
                                          className={`absolute ${
                                            isRTL ? "left-0" : "right-0"
                                          } top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1 z-20 min-w-[120px] animate-in fade-in zoom-in-95 duration-100`}
                                        >
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteSession(session.id);
                                            }}
                                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                            {t("delete")}
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  )}
                </div>
              )
            )}
          </div>
          
          {/* Footer Actions (Export/Import) */}
          {isSidebarOpen && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex gap-2">
                <button
                  onClick={handleExportChat}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  title={isRTL ? "تصدير المحادثة" : "Export Chat"}
                >
                  <Download className="w-4 h-4" />
                  {isRTL ? "تصدير" : "Export"}
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  title={isRTL ? "استيراد محادثة" : "Import Chat"}
                >
                  <Upload className="w-4 h-4" />
                  {isRTL ? "استيراد" : "Import"}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportChat}
                  accept=".json"
                  className="hidden"
                />
              </div>
            </div>
          )}
        </aside>
      </>

      <main className="flex-1 flex flex-col items-center justify-center relative min-h-0 w-full h-[85dvh] px-4 text-center">
        {/* Top Bar for Mobile */}
        <div className="lg:hidden w-full p-4 flex items-center justify-between bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
          <span className="font-semibold text-gray-900 dark:text-white">Fatortak AI</span>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-xl mb-6 mx-auto transform rotate-3">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              {isRTL ? "مرحباً بك في مساعد فاتورتك" : "Welcome to Fatortak AI"}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-lg">
              {isRTL
                ? "كيف يمكنني مساعدتك في إدارة أعمالك اليوم؟"
                : "How can I help you manage your business today?"}
            </p>
          </motion.div>
        ) : (
          <div className="flex-1 w-full overflow-y-auto custom-scrollbar scroll-smooth pb-32">
            <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
              {messages.map(renderMessage)}

              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-end mb-6"
                >
                  <div className="flex items-start gap-3 flex-row-reverse">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center shadow-sm">
                      <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="flex items-center gap-3 px-5 py-4 bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm border border-purple-100 dark:border-gray-700 shadow-sm">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {t("thinking")}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} className="h-4" />
            </div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className={`w-full sm:w-[70%] bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all duration-300 ease-in-out ${
            inputMessage.includes("\n") ||
            (textareaRef.current && textareaRef.current.scrollHeight > 44)
              ? "rounded-3xl"
              : "rounded-full"
          }`}
        >
          {isListening ? (
            <div className="flex flex-col items-center justify-center gap-3 p-4">
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400 animate-pulse">
                {isRTL ? "جاري الاستماع..." : "Listening..."}
              </span>
              <canvas
                ref={canvasRef}
                height="60"
                className="rounded-xl w-full max-w-md bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700"
              />
              <button 
                onClick={() => setIsListening(false)}
                className="mt-2 text-xs text-gray-500 hover:text-red-500"
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </button>
            </div>
          ) : (
            <div className="flex items-end gap-2 p-2">
              <div className="flex-1 min-w-0">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress}
                  placeholder={
                    isRTL
                      ? "اكتب سؤالك أو استخدم الميكروفون للتحدث..."
                      : "Type your question or use the mic to speak..."
                  }
                  className="w-full max-h-32 bg-transparent border-none focus:ring-0 resize-none py-3 px-4 text-gray-900 dark:text-white placeholder-gray-400 text-base leading-relaxed scrollbar-hide"
                  disabled={isLoading}
                  rows={1}
                  dir={isRTL ? "rtl" : "ltr"}
                />
              </div>
              
              <div className="flex items-center gap-2 pb-1 pr-1 pl-1">
                <button
                  onClick={handleVoiceInput}
                  disabled={isLoading}
                  className={`p-3 rounded-full transition-all duration-200 ${
                    isListening 
                      ? "bg-red-100 text-red-600 animate-pulse" 
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                  }`}
                  title={isRTL ? "الإدخال الصوتي" : "Voice Input"}
                >
                  {isListening ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>
                
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className={`p-3 rounded-full transition-all duration-300 transform ${
                    !inputMessage.trim() || isLoading
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3 mt-6 max-w-[90%]"
          >
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() =>
                  handleInputChange({
                    target: { value: isRTL ? action.query : action.queryEn },
                  } as any)
                }
                className="px-3 py-1.5 text-sm bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 border border-purple-200 dark:border-gray-600 text-purple-700 dark:text-purple-300 rounded-full hover:shadow-md hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                {action.icon}
                <span>{isRTL ? action.label : action.labelEn}</span>
              </button>
            ))}
          </motion.div>
        )}
      </main>

      <QuotaLimitModal
        isOpen={showQuotaModal && quotaModalType === "ai"}
        onClose={closeQuotaModal}
        quotaType="ai"
        currentUsage={quotaUsage?.aiUsed || 0}
        limit={quotaUsage?.aiLimit || 0}
        onUpgrade={handleUpgrade}
      />
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.3);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(156, 163, 175, 0.5);
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default AIChat;
