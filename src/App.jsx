import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Cpu,
  Zap,
  Flame,
  Code2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  Binary,
  Wrench,
  Bot,
  Layers,
  Activity,
  Award
} from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'wade',
      text: 'Yo, Superhero! WADE OS (Deadpool JARVIS AI) initialized. Dual katanas sharpened, chimichangas warm, ready for orders or dynamic self-modification!',
      toolUsed: 'SYSTEM_BOOT',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [diagnostics, setDiagnostics] = useState(null);
  const [plugins, setPlugins] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'evolution' | 'specs'
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);

  // Custom tool creator form state
  const [customToolName, setCustomToolName] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customCode, setCustomCode] = useState('const value = 42;\nreturn { message: "Hello from dynamic code!", value };');

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch initial status and evolution history
  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      setDiagnostics(data.diagnostics);
      setPlugins(data.activePlugins || []);
    } catch (e) {
      console.error("Error fetching status:", e);
    }
  };

  const fetchEvolution = async () => {
    try {
      const res = await fetch('/api/evolution');
      const data = await res.json();
      setPlugins(data.plugins || []);
      setHistory(data.history || []);
    } catch (e) {
      console.error("Error fetching evolution:", e);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchEvolution();
    const interval = setInterval(() => {
      fetchStatus();
      fetchEvolution();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Deadpool Voice Synthesis (Web Speech API - 100% Free)
  const speakText = (text) => {
    if (!speechEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    // Strip markdown formatting for cleaner speech
    const cleanSpeech = text.replace(/[*_#`~]/g, '').replace(/https?:\/\/\S+/g, 'link');
    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.pitch = 0.9;
    utterance.rate = 1.1;

    // Pick an energetic voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes('es') || v.lang.includes('en'));
    if (preferredVoice) utterance.voice = preferredVoice;

    window.speechSynthesis.speak(utterance);
  };

  // Speech Recognition (Web Speech API)
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Web Speech Recognition.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
    };

    recognition.start();
  };

  // Send message to Wade OS
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage;
    setInputMessage('');

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });
      const data = await res.json();

      if (data.success) {
        const wadeMsg = {
          id: data.data.id,
          sender: 'wade',
          text: data.data.response,
          toolUsed: data.data.toolUsed,
          isSelfModified: data.data.isSelfModified,
          timestamp: new Date(data.data.timestamp).toLocaleTimeString()
        };
        setMessages(prev => [...prev, wadeMsg]);
        speakText(wadeMsg.text);
        if (data.diagnostics) setDiagnostics(data.diagnostics);
        fetchEvolution();
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        sender: 'wade',
        text: "🚨 *[HEALING FACTOR ERROR]* Oops, my spandex ripped! Backend server might be unreachable.",
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Manual Trigger for Dynamic Self-Modification
  const handleManualSelfModify = async (e) => {
    e.preventDefault();
    if (!customToolName || !customCode) return;

    try {
      const res = await fetch('/api/self-modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolName: customToolName,
          description: customDescription,
          javascriptCode: customCode
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`⚡ Healing Factor success! Installed dynamic plugin: ${data.result.toolName}`);
        setCustomToolName('');
        setCustomDescription('');
        fetchEvolution();
        setActiveTab('evolution');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (e) {
      alert(`Failed to execute self modification: ${e.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-mono selection:bg-red-600 selection:text-white">
      {/* HUD Header */}
      <header className="border-b-2 border-red-600/60 bg-zinc-900/90 backdrop-blur px-4 py-3 sticky top-0 z-50 flex items-center justify-between shadow-[0_0_20px_rgba(220,38,38,0.3)]">
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-12 h-12 bg-red-600 rounded-full border-2 border-black shadow-[0_0_15px_#dc2626]">
            {/* Deadpool Eyes Badge */}
            <div className="w-9 h-9 bg-black rounded-full flex items-center justify-between px-1.5 relative overflow-hidden">
              <div className="w-3.5 h-3.5 bg-white rounded-tr-full rounded-bl-full transform rotate-12"></div>
              <div className="w-3.5 h-3.5 bg-white rounded-tl-full rounded-br-full transform -rotate-12"></div>
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </div>

          <div>
            <h1 className="font-extrabold text-2xl tracking-wider text-red-500 uppercase flex items-center gap-2">
              WADE OS <span className="text-xs bg-red-950 text-red-400 border border-red-600/50 px-2 py-0.5 rounded uppercase tracking-normal">Jarvis - Deadpool Edition</span>
            </h1>
            <p className="text-xs text-zinc-400 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-green-500 animate-pulse" /> HEALING FACTOR: <span className="text-green-400 font-bold">{diagnostics?.healingFactor || 'ACTIVE'}</span>
            </p>
          </div>
        </div>

        {/* HUD Quick Stats */}
        <div className="hidden md:flex items-center space-x-6 text-xs">
          <div className="bg-zinc-950 border border-red-900/50 px-3 py-1.5 rounded flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500 animate-bounce" />
            <span>CHIMICHANGAS: <strong className="text-orange-400">{diagnostics?.chimichangaMeter || '88%'}</strong></span>
          </div>

          <div className="bg-zinc-950 border border-red-900/50 px-3 py-1.5 rounded flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>4TH WALL BREAKS: <strong className="text-yellow-400">{diagnostics?.fourthWallBreaks || 42}</strong></span>
          </div>

          <div className="bg-zinc-950 border border-red-900/50 px-3 py-1.5 rounded flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>PLUGINS HOT-LOADED: <strong className="text-cyan-400">{plugins.length}</strong></span>
          </div>
        </div>

        {/* Audio Toggles */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSpeechEnabled(!speechEnabled)}
            className={`p-2 rounded border transition-colors ${speechEnabled ? 'bg-red-950/80 border-red-600 text-red-400' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}
            title="Toggle Deadpool Audio Voice"
          >
            {speechEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Navigation Sidebar */}
        <nav className="w-full md:w-64 bg-zinc-900/70 border-b md:border-b-0 md:border-r border-red-900/40 p-4 flex md:flex-col justify-around md:justify-start gap-2">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded text-sm font-bold tracking-wide transition-all ${
              activeTab === 'chat'
                ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4" />
            MAIN COMMS (CHAT)
          </button>

          <button
            onClick={() => setActiveTab('evolution')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded text-sm font-bold tracking-wide transition-all ${
              activeTab === 'evolution'
                ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4 text-cyan-400" />
            HEALING LAB (SELF-CODE)
          </button>

          <button
            onClick={() => setActiveTab('specs')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded text-sm font-bold tracking-wide transition-all ${
              activeTab === 'specs'
                ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4 text-yellow-400" />
            SYSTEM DIAGNOSTICS
          </button>
        </nav>

        {/* View Content */}
        <main className="flex-1 bg-zinc-950 flex flex-col overflow-hidden relative">
          {/* TAB 1: CHAT COMMS */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-3xl rounded-lg p-4 relative border ${
                        msg.sender === 'user'
                          ? 'bg-zinc-900 border-zinc-700 text-zinc-100'
                          : msg.isSelfModified
                          ? 'bg-red-950/90 border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)] text-zinc-100'
                          : 'bg-zinc-900/90 border-red-900/50 text-zinc-100'
                      }`}
                    >
                      {msg.sender === 'wade' && (
                        <div className="flex items-center justify-between gap-2 border-b border-red-900/50 pb-2 mb-2 text-xs font-bold text-red-400 uppercase tracking-wider">
                          <span className="flex items-center gap-1.5">
                            <Flame className="w-4 h-4 text-red-500" /> WADE OS
                          </span>
                          {msg.toolUsed && (
                            <span className="bg-red-900/40 border border-red-600/50 px-2 py-0.5 rounded text-[10px] text-red-300">
                              TOOL: {msg.toolUsed}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {msg.text}
                      </div>

                      <div className="mt-2 text-[10px] text-zinc-500 text-right">
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="p-4 bg-zinc-900/80 border-t border-red-900/50 flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-3 rounded-lg border transition-all ${
                    isListening ? 'bg-red-600 border-red-500 text-white animate-pulse' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
                  }`}
                  title="Speech Recognition"
                >
                  {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>

                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask Wade OS anything, run code, or say 'modifica tu codigo'..."
                  className="flex-1 bg-zinc-950 border border-red-900/60 rounded-lg px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />

                <button
                  type="submit"
                  disabled={loading || !inputMessage.trim()}
                  className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white px-5 py-3 rounded-lg font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all"
                >
                  {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: HEALING LAB & SELF-MODIFICATION */}
          {activeTab === 'evolution' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="bg-zinc-900/80 border border-red-800/60 rounded-xl p-5 shadow-lg">
                <h2 className="text-xl font-bold text-red-500 flex items-center gap-2 mb-2">
                  <Code2 className="w-6 h-6 text-red-500" />
                  HEALING FACTOR: DYNAMIC CODE SYNTHESIZER
                </h2>
                <p className="text-xs text-zinc-400 mb-4">
                  Wade OS automatically modifies its own source code when encountering unsupported requests. You can also manually inject dynamic JS plugins directly into Wade OS's active runtime!
                </p>

                <form onSubmit={handleManualSelfModify} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-red-400 uppercase mb-1">Plugin Identifier / Tool Name</label>
                      <input
                        type="text"
                        value={customToolName}
                        onChange={(e) => setCustomToolName(e.target.value)}
                        placeholder="e.g. crypto_tracker or joke_bot"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-red-400 uppercase mb-1">Description</label>
                      <input
                        type="text"
                        value={customDescription}
                        onChange={(e) => setCustomDescription(e.target.value)}
                        placeholder="What does this dynamic code do?"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-red-400 uppercase mb-1">Executable JavaScript Function Body</label>
                    <textarea
                      value={customCode}
                      onChange={(e) => setCustomCode(e.target.value)}
                      rows={6}
                      className="w-full bg-zinc-950 border border-zinc-800 font-mono text-sm rounded p-3 text-green-400 focus:outline-none focus:border-red-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all uppercase"
                  >
                    <Wrench className="w-5 h-5" /> Compile & Hot-Load Into Wade OS Runtime
                  </button>
                </form>
              </div>

              {/* Installed Plugins & Evolution Logs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
                  <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2 mb-3">
                    <Layers className="w-5 h-5" /> Active Hot-Loaded Plugins ({plugins.length})
                  </h3>
                  {plugins.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic">No self-generated plugins loaded yet. Ask Wade OS to "modifica tu codigo" in comms!</p>
                  ) : (
                    <div className="space-y-3">
                      {plugins.map((plug, i) => (
                        <div key={i} className="bg-zinc-950 border border-cyan-900/50 p-3 rounded text-xs">
                          <div className="font-bold text-cyan-300 uppercase">{plug.name}</div>
                          <div className="text-zinc-400 mt-1">{plug.description}</div>
                          <div className="text-[10px] text-zinc-600 mt-2 font-mono">Source File: {plug.filename}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
                  <h3 className="text-lg font-bold text-yellow-400 flex items-center gap-2 mb-3">
                    <Binary className="w-5 h-5" /> Evolution History Logs ({history.length})
                  </h3>
                  {history.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic">No code evolution events recorded yet.</p>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {history.map((evo, i) => (
                        <div key={i} className="bg-zinc-950 border border-yellow-900/40 p-3 rounded text-xs">
                          <div className="flex justify-between text-yellow-500 font-bold">
                            <span>{evo.id}</span>
                            <span>{new Date(evo.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <div className="text-zinc-200 mt-1 font-bold">Created Tool: [{evo.toolName}]</div>
                          <div className="text-zinc-400 mt-1">{evo.description}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SYSTEM DIAGNOSTICS */}
          {activeTab === 'specs' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-900/80 border border-red-600/50 p-5 rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.2)]">
                  <div className="text-xs text-red-400 font-bold uppercase mb-1">AI OS Name</div>
                  <div className="text-xl font-black text-red-500">{diagnostics?.name || 'WADE OS'}</div>
                  <div className="text-xs text-zinc-500 mt-2">Personalized JARVIS with Wade Wilson AI Engine</div>
                </div>

                <div className="bg-zinc-900/80 border border-orange-600/50 p-5 rounded-xl shadow-[0_0_15px_rgba(234,88,12,0.2)]">
                  <div className="text-xs text-orange-400 font-bold uppercase mb-1">Chimichanga Fuel Level</div>
                  <div className="text-xl font-black text-orange-500">{diagnostics?.chimichangaMeter || '88%'}</div>
                  <div className="text-xs text-zinc-500 mt-2">Optimal taco-to-spandex energy index</div>
                </div>

                <div className="bg-zinc-900/80 border border-green-600/50 p-5 rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                  <div className="text-xs text-green-400 font-bold uppercase mb-1">Healing Factor Engine</div>
                  <div className="text-xl font-black text-green-500">{diagnostics?.healingFactor || 'OVERCHARGED'}</div>
                  <div className="text-xs text-zinc-500 mt-2">Self-code compilation runtime active</div>
                </div>
              </div>

              {/* Raw Diagnostics JSON Viewer */}
              <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-xl">
                <h3 className="text-sm font-bold text-zinc-300 uppercase mb-3 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-red-500" /> Full Telemetry Diagnostics
                </h3>
                <pre className="bg-zinc-950 p-4 rounded text-xs text-green-400 overflow-x-auto font-mono border border-zinc-800">
                  {JSON.stringify(diagnostics, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
