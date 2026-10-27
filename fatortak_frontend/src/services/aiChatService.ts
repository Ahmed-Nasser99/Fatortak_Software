export interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  visualizationData?: VisualizationData;
}

export interface VisualizationData {
  type: "kpi" | "chart";
  data: any;
  chartType?: "line" | "bar" | "pie";
  title?: string;
}

export interface AiChatResponse {
  message: string;
  sessionId: string;
  visualizationData?: VisualizationData;
  history?: ChatMessage[];
}

export class AiChatService {
  private static readonly ENDPOINTS = {
    ASK: "/api/AiQuery/ask",
    SESSIONS: "/api/AiQuery/sessions",
    MESSAGES: "/api/AiQuery/messages",
    DELETE_SESSION: "/api/AiQuery/deleteSessions",
  };

  private static API_BASE_URL =
    import.meta.env.VITE_API_URL || "https://localhost:44338";

  static async sendQuery(
    query: string,
    sessionId: string | null = null,
    chatHistory: Array<{ content: string; role: string }> = []
  ): Promise<AiChatResponse> {
    try {
      const response = await fetch(
        `${AiChatService.API_BASE_URL}${AiChatService.ENDPOINTS.ASK}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: JSON.stringify({
            query: query,
            sessionId: sessionId,
            chatHistory: chatHistory,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        message: data.message,
        sessionId: data.sessionId,
        visualizationData: data.visualizationData,
        history:
          data.chatHistory?.map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            createdAt: new Date(m.createdAt),
          })) || [],
      };
    } catch (error) {
      console.error("AI Chat Service Error:", error);
      throw error;
    }
  }

  static async getSessions(): Promise<ChatSession[]> {
    const response = await fetch(
      `${AiChatService.API_BASE_URL}${AiChatService.ENDPOINTS.SESSIONS}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      }
    );
    return await response.json();
  }

  static async getMessages(sessionId: string): Promise<ChatMessage[]> {
    const response = await fetch(
      `${AiChatService.API_BASE_URL}${AiChatService.ENDPOINTS.MESSAGES}/${sessionId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      }
    );
    return await response.json();
  }

  static async deleteSession(sessionId: string): Promise<void> {
    await fetch(
      `${AiChatService.API_BASE_URL}${AiChatService.ENDPOINTS.DELETE_SESSION}/${sessionId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      }
    );
  }

  static getSuggestedQuestions(isRTL: boolean): string[] {
    return isRTL
      ? [
          "من هم العملاء الأكثر إنفاقًا؟",
          "ما هو إجمالي مبيعات نوفمبر؟",
          "ما المنتجات الأكثر مبيعاً؟",
          "اجمالي المصروفات وتفاصيلها",
        ]
      : [
          "Who are the top spending customers?",
          "What is total sales in November?",
          "What are the best selling items?",
          "Total Expenses With Details",
        ];
  }
}
