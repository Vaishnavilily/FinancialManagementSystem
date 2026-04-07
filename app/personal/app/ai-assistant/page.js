'use client';
import { useState, useRef, useEffect } from 'react';
import TopBar from '@/components/TopBar';

const SUGGESTIONS = [
  'How can I reduce my monthly expenses?',
  'What is my current savings rate?',
  'How to plan for retirement at 45?',
  'Best tax saving investments in India?',
  'How much emergency fund should I have?',
];

const AI_INSIGHTS = [
  { icon: '💡', title: 'Food Overspend', text: 'Your Food spending exceeded your budget. Meal prepping 3 days/week can save ₹2,500/month.' },
  { icon: '📈', title: 'Investment Tip', text: 'Investing ₹5,000/month in Nifty 50 at 12% CAGR gives ₹44.6L in 15 years.' },
  { icon: '⚠️', title: 'Debt-to-Income', text: 'Prepaying your home loan EMI by ₹2,000/month saves ₹3.8L in total interest.' },
  { icon: '🎯', title: 'Goal Update', text: 'You are 4 months away from completing your New Laptop goal at current pace.' },
];

const BOT_RESPONSES = {
  reduce: 'To reduce monthly expenses:\n1️⃣ Cut subscriptions you rarely use\n2️⃣ Cook at home 3-4 days/week\n3️⃣ Use public transport for short distances\n4️⃣ Set a shopping budget and stick to it.\n\nSmall changes can save ₹5,000–₹10,000/month!',
  savings: 'Your current savings rate is approximately 38% — well above the 30% target for financial independence! 🎉\n\nTip: Automate SIPs on salary day so you save before you spend.',
  retirement: 'To retire at 45, you need roughly 25× your annual expenses (the FIRE number).\n\nAt ₹50,000/month expenses → ₹1.5 Crore corpus needed.\n\nWith ₹20,000/month SIP at 12% CAGR, you can get there in ~18 years.',
  tax: 'Top tax saving options for FY 2024-25:\n1️⃣ 80C — ELSS, PPF, LIC (max ₹1.5L)\n2️⃣ 80D — Health Insurance (max ₹25K)\n3️⃣ NPS 80CCD(1B) — Extra ₹50K deduction\n4️⃣ Section 24 — Home loan interest (up to ₹2L)\n\n💰 Potential savings: ₹60,000–₹80,000 in tax!',
  emergency: 'You should have 6 months of expenses as an emergency fund.\n\nAt your current expense level, that is approximately ₹3–4 Lakhs.\n\nKeep it in a liquid FD or high-yield savings account for easy access.',
  default: 'Great question! Based on your financial profile, I recommend:\n\n• Reviewing your budget allocations monthly\n• Maximizing tax deductions before March 31\n• Building your emergency fund first, then investing\n\nWould you like me to dive deeper into any of these?',
};

function getBotResponse(msg) {
  const m = msg.toLowerCase();
  if (m.includes('reduc') || m.includes('expense')) return BOT_RESPONSES.reduce;
  if (m.includes('saving')) return BOT_RESPONSES.savings;
  if (m.includes('retire')) return BOT_RESPONSES.retirement;
  if (m.includes('tax')) return BOT_RESPONSES.tax;
  if (m.includes('emergency')) return BOT_RESPONSES.emergency;
  return BOT_RESPONSES.default;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! I\'m your AI Financial Assistant. 👋\n\nAsk me anything about budgeting, tax planning, investments, or your financial goals!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text: msg }]);
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setMessages(m => [...m, { role: 'bot', text: getBotResponse(msg) }]);
    setLoading(false);
  };

  return (
    <>
      <TopBar title="AI Financial Assistant" />
      <div className="page-area">

        {/* Top insight strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {AI_INSIGHTS.map((ins, i) => (
            <div key={i} className="card" style={{ padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'default' }}>
              <div style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>{ins.icon}</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>{ins.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{ins.text}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main chat + sidebar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, alignItems: 'start' }}>

          {/* Chat Panel */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Chat header */}
            <div style={{ padding: '14px 20px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🤖</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>FinFlow AI</div>
                <div style={{ fontSize: 11, opacity: 0.75, marginTop: 1 }}>● Online · Powered by smart financial insights</div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 14, minHeight: 340, maxHeight: 420 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                  {m.role === 'bot' && (
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>🤖</div>
                  )}
                  <div style={{
                    maxWidth: '78%', padding: '10px 14px', borderRadius: m.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                    background: m.role === 'user' ? 'var(--primary)' : 'var(--bg)',
                    color: m.role === 'user' ? 'white' : 'var(--text-primary)',
                    border: m.role === 'bot' ? '1px solid var(--border)' : 'none',
                    fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-line',
                  }}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
                  <div style={{ padding: '10px 14px', borderRadius: '4px 14px 14px 14px', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic' }}>
                    Thinking<span style={{ animation: 'none' }}>...</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggestion chips */}
            <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: 6, flexWrap: 'wrap', background: '#fafbfc' }}>
              {SUGGESTIONS.slice(0, 3).map(s => (
                <button key={s} onClick={() => sendMessage(s)} style={{
                  fontSize: 11.5, padding: '5px 11px', borderRadius: 20, border: '1.5px solid var(--border)',
                  background: 'white', cursor: 'pointer', color: 'var(--text-secondary)', fontFamily: 'inherit', transition: 'all 0.15s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
                  {s}
                </button>
              ))}
            </div>

            {/* Input */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, background: 'white' }}>
              <input
                style={{ flex: 1, padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', outline: 'none', transition: 'border 0.15s' }}
                placeholder="Ask anything about your finances..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !loading && sendMessage()}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <button className="btn btn-primary" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                Send
              </button>
            </div>
          </div>

          {/* Sidebar: Quick Ask */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card">
              <div className="card-title">💬 Quick Ask</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => sendMessage(s)} style={{
                    textAlign: 'left', padding: '10px 12px', borderRadius: 8,
                    border: '1.5px solid var(--border)', background: 'white', cursor: 'pointer',
                    fontSize: 12.5, color: 'var(--text-secondary)', transition: 'all 0.15s', fontFamily: 'inherit',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-light)'; e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                    <span>{s}</span>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>→</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="card" style={{ background: 'var(--primary-light)', border: '1px solid var(--primary)22' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginBottom: 8 }}>🔑 Setup AI Key</div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                To connect a real AI model, add your API key in <code style={{ fontSize: 11, background: 'white', padding: '1px 5px', borderRadius: 4 }}>.env.local</code> as <code style={{ fontSize: 11, background: 'white', padding: '1px 5px', borderRadius: 4 }}>OPENAI_API_KEY</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
