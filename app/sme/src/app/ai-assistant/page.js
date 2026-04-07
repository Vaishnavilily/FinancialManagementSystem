"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Sparkles } from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";
import "./page.css";

const SUGGESTIONS = [
  "How can I improve cash flow this month?",
  "What should I do about overdue invoices?",
  "How do I set up a simple chart of accounts?",
  "What KPIs should I track weekly?",
  "How can I reduce vendor spend without risk?",
];

const AI_INSIGHTS = [
  {
    icon: "📌",
    title: "Receivables",
    text: "If receivables are rising, send reminders at 3/7/14 days and offer card/UPI payment links on invoices.",
  },
  {
    icon: "⚖️",
    title: "Payables",
    text: "Batch vendor payments twice a month to reduce admin time and keep better control of cash outflows.",
  },
  {
    icon: "🧾",
    title: "Invoicing",
    text: "Standardize invoice terms (Net 7/15/30) and add late fees to reduce collection time.",
  },
  {
    icon: "🔍",
    title: "Reconciliation",
    text: "Reconcile weekly to catch duplicates, missing entries, and mismatched amounts early.",
  },
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text:
        "Hi! I’m your Finflow SME assistant.\n\nAsk me about cash flow, invoices, bills, reconciliation, reporting, or operational best practices.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");
    setError(null);
    const nextMessages = [...messages, { role: "user", text: msg }];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const res = await authFetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success) {
        const errText =
          json?.error ||
          (res.status === 500
            ? "Server error. Check that GEMINI_API_KEY is set (e.g. in Vercel Environment Variables)."
            : "Request failed.");
        throw new Error(errText);
      }

      setMessages((m) => [
        ...m,
        {
          role: "bot",
          text: String(json.text || "").trim() || "I couldn’t generate a response.",
        },
      ]);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Something went wrong.";
      setError(message);
      setMessages((m) => [
        ...m,
        {
          role: "bot",
          text: `Couldn’t reach the AI service.\n\n${message}\n\nTry again in a moment. If this persists, confirm \`GEMINI_API_KEY\` is set for this environment (local: \`.env.local\`; production: Vercel → Project → Settings → Environment Variables).`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-page">
      <header className="ai-header">
        <div className="ai-title">
          <div className="ai-icon">
            <Bot size={18} />
          </div>
          <div>
            <h1>AI Assistant</h1>
            <p className="ai-subtitle">Fast answers for SME finance workflows.</p>
          </div>
        </div>
        <div className="ai-badge">
          <Sparkles size={14} />
          Gemini (server API)
        </div>
      </header>

      {error && (
        <div className="wave-card ai-banner-error" role="alert">
          <strong>Connection issue:</strong> {error}
        </div>
      )}

      <section className="ai-insights">
        {AI_INSIGHTS.map((ins) => (
          <div key={ins.title} className="wave-card ai-insight-card">
            <div className="ai-insight-icon">{ins.icon}</div>
            <div>
              <div className="ai-insight-title">{ins.title}</div>
              <div className="ai-insight-text">{ins.text}</div>
            </div>
          </div>
        ))}
      </section>

      <section className="ai-grid">
        <div className="wave-card ai-chat">
          <div className="ai-chat-top">
            <div className="ai-chat-avatar">🤖</div>
            <div>
              <div className="ai-chat-name">Finflow AI</div>
              <div className="ai-chat-status">● Online</div>
            </div>
          </div>

          <div className="ai-chat-body">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`ai-msg-row ${m.role === "user" ? "user" : "bot"}`}
              >
                {m.role === "bot" && <div className="ai-msg-avatar">🤖</div>}
                <div className={`ai-msg ${m.role}`}>{m.text}</div>
              </div>
            ))}

            {loading && (
              <div className="ai-msg-row bot">
                <div className="ai-msg-avatar">🤖</div>
                <div className="ai-msg bot ai-thinking">Thinking…</div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className="ai-chips">
            {SUGGESTIONS.slice(0, 3).map((s) => (
              <button key={s} className="ai-chip" onClick={() => sendMessage(s)}>
                {s}
              </button>
            ))}
          </div>

          <div className="ai-input-row">
            <input
              className="ai-input"
              placeholder="Ask about invoices, cash flow, reconciliation…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              className="wave-btn-primary ai-send"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
            >
              Send
            </button>
          </div>
        </div>

        <div className="ai-side">
          <div className="wave-card">
            <div className="ai-side-title">Quick Ask</div>
            <div className="ai-side-list">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="ai-side-item" onClick={() => sendMessage(s)}>
                  <span>{s}</span>
                  <span className="ai-side-arrow">→</span>
                </button>
              ))}
            </div>
          </div>

          <div className="wave-card ai-note">
            <div className="ai-note-title">Production setup</div>
            <p className="ai-note-text">
              Chat calls the server route <code className="ai-code">POST /api/chat</code>, which uses{" "}
              <code className="ai-code">GEMINI_API_KEY</code> (never exposed to the browser). For local dev,
              put the key in <code className="ai-code">.env.local</code>. On Vercel, add the same variable under
              Project → Settings → Environment Variables, then redeploy.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
