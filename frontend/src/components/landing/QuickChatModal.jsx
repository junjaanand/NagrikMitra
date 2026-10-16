import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Bot,
  User,
  Sparkles,
  Loader2,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Languages,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { sendChatMessage } from '../../api/client';
import { useProfile } from '../../context/ProfileContext';

const QUICK_SUGGESTIONS = [
  { label: '🌾 किसान योजनाएं (PM-Kisan)', text: 'मुझे किसान सम्मान निधि और कृषि योजनाओं के बारे में बताएं।' },
  { label: '👩 महिला स्वरोजगार', text: 'महिलाओं के लिए स्वयं सहायता समूह और सब्सिडी योजनाएं क्या हैं?' },
  { label: '🎓 College Scholarships', text: 'What scholarship schemes are available for college students?' },
  { label: '🏥 Ayushman Bharat', text: 'How do I check eligibility and apply for the Ayushman Bharat health card?' },
];

export default function QuickChatModal({ isOpen, onClose }) {
  const { profile, updateProfile } = useProfile();
  
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'नमस्ते! मैं नागरिक मित्र (NagrikMitra) हूँ। आप मुझसे हिंदी या अंग्रेजी में किसी भी सरकारी कल्याणकारी योजना के बारे में पूछ सकते हैं। आप बोल भी सकते हैं!',
      sources: [],
      recommended_schemes: [],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState('hi-IN'); // 'hi-IN' or 'en-IN'
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const [syncNotice, setSyncNotice] = useState(null);

  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Initialize Web Speech API for voice dictation
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = language;

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        // Automatically send voice query for seamless conversational experience
        if (transcript.trim()) {
          executeChat(transcript.trim(), true);
        }
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      setAutoSpeak(true); // Auto-enable speech synthesis when using voice
      try {
        recognitionRef.current.start();
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  const speakText = (text, idx = null) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (speakingIdx === idx) {
        setSpeakingIdx(null);
        return;
      }
      
      // Clean up markdown characters like ** and #
      const cleanText = text.replace(/[*#_`]/g, '').slice(0, 300);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = /[\u0900-\u097F]/.test(cleanText) ? 'hi-IN' : 'en-IN';
      
      utterance.onend = () => setSpeakingIdx(null);
      utterance.onerror = () => setSpeakingIdx(null);
      
      setSpeakingIdx(idx);
      window.speechSynthesis.speak(utterance);
    }
  };

  const executeChat = async (userText, fromVoice = false) => {
    if (!userText || loading) return;

    setInput('');
    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const historyPayload = newMessages.slice(-6).map((m) => ({ role: m.role, content: m.content }));
      const res = await sendChatMessage(userText, historyPayload, profile);

      const assistantMsg = {
        role: 'assistant',
        content: res.reply,
        sources: res.sources || [],
        provider: res.provider,
        model: res.model,
        tier: res.tier,
        extracted_slots: res.extracted_slots,
        updated_profile: res.updated_profile,
        recommended_schemes: res.recommended_schemes || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If voice dictation was used or autoSpeak is on, synthesize speech
      if (fromVoice || autoSpeak) {
        speakText(res.reply, newMessages.length);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'माफ़ कीजिए, सर्वर से संपर्क नहीं हो पाया। कृपया पुनः प्रयास करें। (Server connection error, please retry).',
          sources: [],
          recommended_schemes: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;
    executeChat(input.trim(), false);
  };

  // Sync extracted attributes to global profile
  const handleSyncProfile = (slots) => {
    if (!slots) return;
    const cleanSlots = {};
    Object.entries(slots).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') {
        cleanSlots[k] = v;
      }
    });
    updateProfile(cleanSlots);
    setSyncNotice('Applied extracted demographic parameters to your active Citizen Profile!');
    setTimeout(() => setSyncNotice(null), 4000);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex justify-end">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-slate-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold tracking-tight">NagrikMitra AI Voice Assistant</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
                  RAG Grounded
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Bidirectional Voice (Hindi & English) • Groq Llama 3.3 70B
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage((l) => (l === 'hi-IN' ? 'en-IN' : 'hi-IN'))}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
              title="Switch Voice Recognition Language"
            >
              <Languages className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'hi-IN' ? 'हिंदी (IN)' : 'English (IN)'}</span>
            </button>

            {/* Auto-Speech Audio Toggle */}
            <button
              onClick={() => {
                if (autoSpeak) window.speechSynthesis?.cancel();
                setAutoSpeak((s) => !s);
              }}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                autoSpeak
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title={autoSpeak ? 'Audio Speech enabled' : 'Audio Speech muted'}
            >
              {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={() => {
                window.speechSynthesis?.cancel();
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sync Notification Banner */}
        {syncNotice && (
          <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{syncNotice}</span>
            </div>
            <button onClick={() => setSyncNotice(null)} className="text-emerald-600 hover:text-emerald-900">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-slate-50 border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider whitespace-nowrap pl-1">
            Try Asking:
          </span>
          {QUICK_SUGGESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => executeChat(q.text, false)}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-[11px] font-semibold text-slate-700 whitespace-nowrap transition-colors cursor-pointer shrink-0"
            >
              {q.label}
            </button>
          ))}
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shrink-0 mt-1 shadow-xs">
                  🤖
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm shadow-xs ${
                  m.role === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none space-y-3'
                }`}
              >
                {/* Message Body */}
                <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>

                {/* Assistant Slot Extraction & Recommendations */}
                {m.role === 'assistant' && (
                  <>
                    {/* Extracted Slots Banner */}
                    {m.extracted_slots && Object.values(m.extracted_slots).some((v) => v !== null && v !== '') && (
                      <div className="p-2.5 rounded-xl bg-purple-50/80 border border-purple-200/80 text-xs text-purple-900 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-purple-600" />
                            Detected Profile Attributes
                          </span>
                          <button
                            onClick={() => handleSyncProfile(m.extracted_slots)}
                            className="text-[10px] font-bold text-purple-700 hover:text-purple-900 underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>Save to Profile</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {Object.entries(m.extracted_slots).map(([k, v]) => {
                            if (v === null || v === '' || v === undefined) return null;
                            return (
                              <span key={k} className="px-2 py-0.5 rounded bg-white text-[10px] font-bold text-purple-800 border border-purple-200">
                                {k}: {String(v)}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Recommended Schemes mini cards */}
                    {m.recommended_schemes && m.recommended_schemes.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                          Grounded Relevant Schemes ({m.recommended_schemes.length}):
                        </span>
                        <div className="space-y-1.5">
                          {m.recommended_schemes.map((s, sIdx) => (
                            <div
                              key={sIdx}
                              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-900 line-clamp-1">{s.name}</span>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                                  {s.state || 'Central'}
                                </span>
                              </div>
                              {s.benefits && (
                                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{s.benefits}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer Actions: Text-to-Speech + Source Attribution */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <button
                        onClick={() => speakText(m.content, i)}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                          speakingIdx === i ? 'text-rose-600 font-bold animate-pulse' : 'text-emerald-700 hover:text-emerald-800'
                        }`}
                        title="Listen to response"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{speakingIdx === i ? 'Speaking...' : 'Listen (बोलकर सुनें)'}</span>
                      </button>

                      {m.sources && m.sources.length > 0 && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          Source: {m.sources[0].name.slice(0, 20)}...
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start items-center text-slate-500 text-xs pl-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>NagrikMitra RAG pipeline is analyzing official ministry databases...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Listening Soundwave Banner */}
        {isListening && (
          <div className="p-3 bg-rose-50 border-t border-rose-200 flex items-center justify-between text-rose-800 text-xs font-bold animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping inline-block" />
              <span>Listening ({language === 'hi-IN' ? 'हिंदी में बोलिए' : 'Speak now in English'})...</span>
            </div>
            <span className="text-[10px] text-rose-600">Click mic again to stop</span>
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-2">
            {/* Mic Toggle Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-600 text-white border-rose-700 shadow-md animate-bounce'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
              title={isListening ? 'Stop listening' : 'Speak query in Hindi or English'}
            >
              {isListening ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-600" />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isListening
                  ? 'सुन रहा हूँ... बोलिए...'
                  : language === 'hi-IN'
                  ? 'सरकारी योजना के बारे में पूछें या माइक दबाकर बोलें...'
                  : 'Ask about any government scheme or use mic...'
              }
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
