import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Terminal, 
  Globe, 
  GitBranch, 
  TrendingUp, 
  Cpu, 
  ShieldAlert, 
  Download, 
  Volume2, 
  Code2, 
  Play, 
  Check, 
  AlertCircle,
  Copy,
  ExternalLink,
  Zap,
  Sparkles,
  Search,
  Database,
  Key,
  Hash,
  FileText,
  Palette,
  QrCode,
  Clock,
  Layers,
  ArrowRightLeft,
  Send,
  Monitor
} from 'lucide-react';
import { 
  playUiClick, 
  playSwordClash, 
  playGunshot, 
  playChimichangaCrunch, 
  playTvaZap, 
  playComedicHorn 
} from '../../utils/audio';

interface CommunityAgentsHubProps {
  onSpeak?: (text: string) => void;
}

export const CommunityAgentsHub: React.FC<CommunityAgentsHubProps> = ({ onSpeak }) => {
  const [activeSection, setActiveSection] = useState<
    'swarm' | 'tools15' | 'catalog100' | 'terminal' | 'scraper' | 'planner' | 'crypto' | 'benchmark' | 'soundboard'
  >('tools15');

  // 1. Swarm State
  const [selectedAgent, setSelectedAgent] = useState<'dopinder' | 'logan' | 'blind_al' | 'colossus' | 'tva'>('dopinder');
  const [agentTaskInput, setAgentTaskInput] = useState('');
  const [agentResult, setAgentResult] = useState<any>(null);
  const [isAgentRunning, setIsAgentRunning] = useState(false);

  // 2. Terminal State
  const [cliInput, setCliInput] = useState('ls -la');
  const [cliOutput, setCliOutput] = useState<string>('WADE-OS Virtual Terminal v3.0 [Chromebook Edition]\nEscribe un comando para interactuar con ~/wade-os: ls, cat server.py, free -h, uname -a, top, python3');
  const [isCliRunning, setIsCliRunning] = useState(false);

  // 3. Scraper & Planner
  const [scrapeUrl, setScrapeUrl] = useState('https://news.ycombinator.com');
  const [scrapedData, setScrapedData] = useState<any>(null);
  const [isScraping, setIsScraping] = useState(false);

  const [planGoal, setPlanGoal] = useState('Construir un bot de trading de chimichangas con SQLite');
  const [workflowPlan, setWorkflowPlan] = useState<any>(null);
  const [isPlanning, setIsPlanning] = useState(false);

  // 4. Crypto & Benchmark
  const [marketQuotes, setMarketQuotes] = useState<any[]>([]);
  const [isFetchingQuotes, setIsFetchingQuotes] = useState(false);
  const [benchResult, setBenchResult] = useState<any>(null);
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  // 5. TOP 15 TOOLS STATE
  const [selectedTool15, setSelectedTool15] = useState<
    'github' | 'netdiag' | 'sqlite' | 'regex' | 'json' | 'token' | 'hash' | 'markdown' | 'wcag' | 'qr' | 'cron' | 'diff' | 'unit' | 'http' | 'device'
  >('github');

  // Tool inputs & outputs
  const [ghRepo, setGhRepo] = useState('facebook/react');
  const [ghData, setGhData] = useState<any>(null);

  const [netHost, setNetHost] = useState('google.com');
  const [netData, setNetData] = useState<any>(null);

  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM mercenarios');
  const [sqlData, setSqlData] = useState<any>(null);

  const [regexPattern, setRegexPattern] = useState('[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}');
  const [regexText, setRegexText] = useState('Escribe a wade@chimichanga.com o logan@x-men.org');
  const [regexData, setRegexData] = useState<any>(null);

  const [jsonInput, setJsonInput] = useState('{"nombre":"Wade Wilson","alter_ego":"Deadpool","armas":["Katanas","Pistolas 9mm"]}');
  const [jsonData, setJsonData] = useState<any>(null);

  const [tokenLength, setTokenLength] = useState(32);
  const [tokenData, setTokenData] = useState<any>(null);

  const [hashInput, setHashInput] = useState('Chimichanga Time!');
  const [hashData, setHashData] = useState<any>(null);

  const [mdInput, setMdInput] = useState('# Plan de Ataque de Wade\n\n1. Comprar chimichangas.\n2. Molestar a Wolverine.\n3. Salvar el multiverso.');
  const [mdData, setMdData] = useState<any>(null);

  const [fgColor, setFgColor] = useState('#ffffff');
  const [bgColor, setBgColor] = useState('#d01012');
  const [wcagData, setWcagData] = useState<any>(null);

  const [qrText, setQrText] = useState('https://github.com/google');
  const [qrData, setQrData] = useState<any>(null);

  const [cronExpr, setCronExpr] = useState('*/15 9-18 * * 1-5');
  const [cronData, setCronData] = useState<any>(null);

  const [diffOrig, setDiffOrig] = useState('def attack():\n  target = "villain"\n  return True');
  const [diffMod, setDiffMod] = useState('def attack():\n  target = "francis"\n  use_katana()\n  return True');
  const [diffData, setDiffData] = useState<any>(null);

  const [unitVal, setUnitVal] = useState(2048);
  const [unitFrom, setUnitFrom] = useState('MiB');
  const [unitTo, setUnitTo] = useState('GiB');
  const [unitData, setUnitData] = useState<any>(null);

  const [httpUrl, setHttpUrl] = useState('https://httpbin.org/get');
  const [httpData, setHttpData] = useState<any>(null);

  const [deviceData, setDeviceData] = useState<any>(null);

  // 6. CATALOG 100 STATE
  const [catalog100, setCatalog100] = useState<any[]>([]);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogFilter, setCatalogFilter] = useState('ALL');
  const [executingToolId, setExecutingToolId] = useState<number | null>(null);
  const [executedToolResult, setExecutedToolResult] = useState<any>(null);

  const handleExecuteCatalogTool = async (toolId: number) => {
    setExecutingToolId(toolId);
    playTvaZap();
    try {
      const res = await fetch('/api/tools/execute-catalog-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolId }),
      });
      const data = await res.json();
      if (data.success) {
        setExecutedToolResult(data);
        playSwordClash();
      }
    } catch {} finally {
      setExecutingToolId(null);
    }
  };

  // Load Catalog
  useEffect(() => {
    fetch('/api/tools/catalog-100')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCatalog100(d.catalog);
      })
      .catch(() => {});
  }, []);

  // ----------------------------------------------------
  // Action Handlers
  // ----------------------------------------------------
  const handleDispatchAgent = async () => {
    setIsAgentRunning(true);
    playTvaZap();
    try {
      const res = await fetch('/api/agents/delegate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: selectedAgent, task: agentTaskInput || 'Revisión táctica general' }),
      });
      const data = await res.json();
      if (data.success) {
        setAgentResult(data.agentResponse);
        if (data.agentResponse.sound === 'sword') playSwordClash();
        else if (data.agentResponse.sound === 'horn') playComedicHorn();
        else playUiClick();

        if (onSpeak && data.agentResponse.message) {
          onSpeak(data.agentResponse.message);
        }
      }
    } catch (e) {
    } finally {
      setIsAgentRunning(false);
    }
  };

  const handleRunCli = async () => {
    if (!cliInput.trim()) return;
    setIsCliRunning(true);
    playUiClick();
    try {
      const res = await fetch('/api/terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cliInput }),
      });
      const data = await res.json();
      setCliOutput((prev) => `${prev}\n\n$ ${cliInput}\n${data.output}`);
    } catch (e) {
      setCliOutput((prev) => `${prev}\n\n$ ${cliInput}\nError en la ejecución del comando.`);
    } finally {
      setIsCliRunning(false);
    }
  };

  const handleRunGithub = async () => {
    playUiClick();
    const res = await fetch('/api/tools/github-inspect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repo: ghRepo }),
    });
    const d = await res.json();
    setGhData(d);
  };

  const handleRunNetDiag = async () => {
    playUiClick();
    const res = await fetch('/api/tools/network-diag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: netHost }),
    });
    const d = await res.json();
    setNetData(d);
  };

  const handleRunSql = async () => {
    playSwordClash();
    const res = await fetch('/api/tools/sql-runner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: sqlQuery }),
    });
    const d = await res.json();
    setSqlData(d);
  };

  const handleRunRegex = async () => {
    playUiClick();
    const res = await fetch('/api/tools/regex-lab', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pattern: regexPattern, text: regexText }),
    });
    const d = await res.json();
    setRegexData(d);
  };

  const handleRunJson = async (action: 'format' | 'minify') => {
    playUiClick();
    const res = await fetch('/api/tools/json-tool', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonString: jsonInput, action }),
    });
    const d = await res.json();
    setJsonData(d);
  };

  const handleRunToken = async () => {
    playUiClick();
    const res = await fetch('/api/tools/token-gen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ length: tokenLength }),
    });
    const d = await res.json();
    setTokenData(d);
  };

  const handleRunHash = async () => {
    playUiClick();
    const res = await fetch('/api/tools/crypto-hash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: hashInput }),
    });
    const d = await res.json();
    setHashData(d);
  };

  const handleRunMarkdown = async () => {
    playUiClick();
    const res = await fetch('/api/tools/markdown-tool', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markdown: mdInput }),
    });
    const d = await res.json();
    setMdData(d);
  };

  const handleRunWcag = async () => {
    playUiClick();
    const res = await fetch('/api/tools/color-auditor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fgColor, bgColor }),
    });
    const d = await res.json();
    setWcagData(d);
  };

  const handleRunQr = async () => {
    playUiClick();
    const res = await fetch('/api/tools/qr-gen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: qrText }),
    });
    const d = await res.json();
    setQrData(d);
  };

  const handleRunCron = async () => {
    playUiClick();
    const res = await fetch('/api/tools/cron-tool', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expression: cronExpr }),
    });
    const d = await res.json();
    setCronData(d);
  };

  const handleRunDiff = async () => {
    playSwordClash();
    const res = await fetch('/api/tools/text-diff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ original: diffOrig, modified: diffMod }),
    });
    const d = await res.json();
    setDiffData(d);
  };

  const handleRunUnit = async () => {
    playUiClick();
    const res = await fetch('/api/tools/unit-convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: unitVal, from: unitFrom, to: unitTo }),
    });
    const d = await res.json();
    setUnitData(d);
  };

  const handleRunHttp = async () => {
    playUiClick();
    const res = await fetch('/api/tools/http-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: httpUrl }),
    });
    const d = await res.json();
    setHttpData(d);
  };

  const handleRunDevice = async () => {
    playUiClick();
    const res = await fetch('/api/tools/device-info');
    const d = await res.json();
    setDeviceData(d);
  };

  // Filter Catalog
  const filteredCatalog = catalog100.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(catalogSearch.toLowerCase()) || c.category.toLowerCase().includes(catalogSearch.toLowerCase());
    const matchesCat = catalogFilter === 'ALL' || c.category === catalogFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex flex-col h-full space-y-3 font-mono text-xs text-zinc-200 pr-1">
      {/* Top Main Navigation Bar */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 shrink-0 scrollbar-none">
        <button
          onClick={() => { playUiClick(); setActiveSection('tools15'); }}
          className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 shrink-0 ${
            activeSection === 'tools15' ? 'bg-rose-950 text-rose-300 border-rose-500 font-bold shadow' : 'bg-zinc-900 text-zinc-400 border-white/[0.06]'
          }`}
        >
          <Sparkles size={13} className="text-amber-400" />
          <span>Top 15 Super-Tools</span>
        </button>

        <button
          onClick={() => { playUiClick(); setActiveSection('catalog100'); }}
          className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 shrink-0 ${
            activeSection === 'catalog100' ? 'bg-amber-950 text-amber-300 border-amber-500 font-bold shadow' : 'bg-zinc-900 text-zinc-400 border-white/[0.06]'
          }`}
        >
          <Layers size={13} />
          <span>Catálogo 100 Funciones</span>
        </button>

        <button
          onClick={() => { playUiClick(); setActiveSection('swarm'); }}
          className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 shrink-0 ${
            activeSection === 'swarm' ? 'bg-cyan-950 text-cyan-300 border-cyan-500 font-bold shadow' : 'bg-zinc-900 text-zinc-400 border-white/[0.06]'
          }`}
        >
          <Users size={13} />
          <span>Sub-Agentes</span>
        </button>

        <button
          onClick={() => { playUiClick(); setActiveSection('terminal'); }}
          className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 shrink-0 ${
            activeSection === 'terminal' ? 'bg-emerald-950 text-emerald-300 border-emerald-500 font-bold shadow' : 'bg-zinc-900 text-zinc-400 border-white/[0.06]'
          }`}
        >
          <Terminal size={13} />
          <span>Terminal CLI</span>
        </button>

        <button
          onClick={() => { playUiClick(); setActiveSection('soundboard'); }}
          className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 shrink-0 ${
            activeSection === 'soundboard' ? 'bg-yellow-950 text-yellow-300 border-yellow-500 font-bold shadow' : 'bg-zinc-900 text-zinc-400 border-white/[0.06]'
          }`}
        >
          <Volume2 size={13} />
          <span>Soundboard</span>
        </button>
      </div>

      {/* ================================================================= */}
      {/* 1. TOP 15 SUPER-TOOLS SUITE */}
      {/* ================================================================= */}
      {activeSection === 'tools15' && (
        <div className="flex-1 flex flex-col space-y-2 overflow-hidden">
          {/* Tool Selector Chips */}
          <div className="flex gap-1 overflow-x-auto pb-1 shrink-0 scrollbar-none">
            {[
              { id: 'github', label: '🐙 GitHub', fn: handleRunGithub },
              { id: 'netdiag', label: '🌐 Red & Ping', fn: handleRunNetDiag },
              { id: 'sqlite', label: '🗄️ SQLite Virtual', fn: handleRunSql },
              { id: 'regex', label: '🧬 Regex Lab', fn: handleRunRegex },
              { id: 'json', label: '📦 JSON Tool', fn: () => handleRunJson('format') },
              { id: 'token', label: '🔑 Token Gen', fn: handleRunToken },
              { id: 'hash', label: '🔒 Hash & Base64', fn: handleRunHash },
              { id: 'markdown', label: '📝 Markdown Calc', fn: handleRunMarkdown },
              { id: 'wcag', label: '🎨 Color WCAG', fn: handleRunWcag },
              { id: 'qr', label: '📱 Código QR', fn: handleRunQr },
              { id: 'cron', label: '⏳ Cron Parser', fn: handleRunCron },
              { id: 'diff', label: '📊 Diff Comparer', fn: handleRunDiff },
              { id: 'unit', label: '📐 Conversor', fn: handleRunUnit },
              { id: 'http', label: '📡 HTTP Tester', fn: handleRunHttp },
              { id: 'device', label: '🖥️ Hardware Info', fn: handleRunDevice },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  playUiClick();
                  setSelectedTool15(t.id as any);
                  t.fn();
                }}
                className={`px-2.5 py-1 rounded-md text-[10px] whitespace-nowrap border transition-all ${
                  selectedTool15 === t.id
                    ? 'bg-rose-950 text-rose-300 border-rose-500 font-bold'
                    : 'bg-zinc-900/90 text-zinc-400 border-white/[0.05] hover:text-zinc-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Active Tool Body */}
          <div className="flex-1 overflow-y-auto space-y-2.5 p-3 bg-zinc-900/40 rounded-xl border border-white/[0.06]">
            {/* Tool 1: GitHub */}
            {selectedTool15 === 'github' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-rose-400">
                  <span>Inspector de Repositorios GitHub</span>
                  <button onClick={handleRunGithub} className="text-[10px] text-zinc-400 hover:text-white">Consultar</button>
                </div>
                <input
                  type="text"
                  value={ghRepo}
                  onChange={(e) => setGhRepo(e.target.value)}
                  placeholder="ej: facebook/react"
                  className="w-full px-2.5 py-1.5 bg-black/50 border border-white/[0.08] rounded text-zinc-200 text-xs"
                />
                {ghData && (
                  <div className="p-2.5 bg-black/60 rounded border border-white/[0.06] space-y-1 text-[11px]">
                    <div className="font-bold text-white">{ghData.repo}</div>
                    <div className="text-zinc-400">{ghData.description}</div>
                    <div className="flex gap-3 text-amber-400 pt-1">
                      <span>★ {ghData.stars}</span>
                      <span>⑂ {ghData.forks}</span>
                      <span>Issues: {ghData.openIssues}</span>
                      <span>Licencia: {ghData.license}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tool 2: Network Diag */}
            {selectedTool15 === 'netdiag' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-cyan-400">
                  <span>Diagnóstico de Red, DNS & Latencia</span>
                  <button onClick={handleRunNetDiag} className="text-[10px] text-zinc-400 hover:text-white">Probar</button>
                </div>
                <input
                  type="text"
                  value={netHost}
                  onChange={(e) => setNetHost(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-black/50 border border-white/[0.08] rounded text-zinc-200 text-xs"
                />
                {netData && (
                  <div className="p-2.5 bg-black/60 rounded border border-white/[0.06] grid grid-cols-2 gap-2 text-[11px]">
                    <div>Host: <span className="text-white font-bold">{netData.target}</span></div>
                    <div>Latencia: <span className="text-emerald-400 font-bold">{netData.latencyMs} ms</span></div>
                    <div>Status HTTP: <span className="text-white font-bold">{netData.httpStatus}</span></div>
                    <div>Calificación: <span className="text-cyan-400 font-bold">{netData.grade}</span></div>
                  </div>
                )}
              </div>
            )}

            {/* Tool 3: SQLite In-Memory */}
            {selectedTool15 === 'sqlite' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-emerald-400">
                  <span>Motor SQLite en Memoria (Tabla 'mercenarios')</span>
                  <button onClick={handleRunSql} className="text-[10px] text-emerald-400 font-bold hover:underline">Ejecutar SQL</button>
                </div>
                <input
                  type="text"
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-black/50 border border-white/[0.08] rounded text-zinc-200 text-xs font-mono"
                />
                {sqlData && sqlData.rows && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[10px] border-collapse">
                      <thead>
                        <tr className="border-b border-white/[0.08] text-zinc-400">
                          {sqlData.columns.map((c: string) => <th key={c} className="p-1">{c}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {sqlData.rows.map((r: any, idx: number) => (
                          <tr key={idx} className="border-b border-white/[0.04] text-zinc-200">
                            {sqlData.columns.map((c: string) => <td key={c} className="p-1">{r[c]}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Tool 4: Regex Lab */}
            {selectedTool15 === 'regex' && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-amber-400">Laboratorio Regex & Extractor</div>
                <input
                  type="text"
                  value={regexPattern}
                  onChange={(e) => setRegexPattern(e.target.value)}
                  placeholder="Expresión Regular"
                  className="w-full px-2.5 py-1.5 bg-black/50 border border-white/[0.08] rounded text-zinc-200 text-xs font-mono"
                />
                <textarea
                  rows={2}
                  value={regexText}
                  onChange={(e) => setRegexText(e.target.value)}
                  className="w-full p-2 bg-black/50 border border-white/[0.08] rounded text-zinc-200 text-xs font-mono"
                />
                <button onClick={handleRunRegex} className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded">
                  Buscar Coincidencias
                </button>
                {regexData && (
                  <div className="p-2 bg-black/60 rounded text-[11px] space-y-1">
                    <div>Coincidencias encontradas: <span className="font-bold text-amber-400">{regexData.matchesCount}</span></div>
                    {regexData.matches.map((m: string, i: number) => (
                      <div key={i} className="p-1 bg-zinc-900 rounded font-mono text-emerald-300">{m}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tool 5: JSON Tool */}
            {selectedTool15 === 'json' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-purple-400">
                  <span>Validador y Formateador JSON</span>
                  <div className="flex gap-2">
                    <button onClick={() => handleRunJson('format')} className="text-[10px] text-purple-300 font-bold">Embellecer</button>
                    <button onClick={() => handleRunJson('minify')} className="text-[10px] text-zinc-400">Minificar</button>
                  </div>
                </div>
                <textarea
                  rows={3}
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="w-full p-2 bg-black/50 border border-white/[0.08] rounded text-zinc-200 text-xs font-mono"
                />
                {jsonData && (
                  <pre className="p-2 bg-black/70 rounded text-[10px] text-emerald-400 overflow-x-auto max-h-40">
                    {jsonData.result}
                  </pre>
                )}
              </div>
            )}

            {/* Tool 6: Token Gen */}
            {selectedTool15 === 'token' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-rose-400">
                  <span>Generador Criptográfico de Tokens & Claves</span>
                  <button onClick={handleRunToken} className="text-[10px] text-rose-400 font-bold">Generar Nuevo</button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-400">Longitud:</span>
                  <input
                    type="range"
                    min={12}
                    max={64}
                    value={tokenLength}
                    onChange={(e) => setTokenLength(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="font-bold text-white">{tokenLength}</span>
                </div>
                {tokenData && (
                  <div className="p-2 bg-black/60 rounded border border-rose-500/30 space-y-1">
                    <div className="font-mono text-emerald-300 select-all break-all">{tokenData.token}</div>
                    <div className="text-[10px] text-zinc-400">Entropía: {tokenData.entropyBits} bits • {tokenData.strength}</div>
                  </div>
                )}
              </div>
            )}

            {/* Tool 7: Hash & Base64 */}
            {selectedTool15 === 'hash' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-yellow-400">
                  <span>Calculador de Hash (SHA-256, MD5) & Base64</span>
                  <button onClick={handleRunHash} className="text-[10px] text-yellow-400 font-bold">Calcular</button>
                </div>
                <input
                  type="text"
                  value={hashInput}
                  onChange={(e) => setHashInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-black/50 border border-white/[0.08] rounded text-zinc-200 text-xs"
                />
                {hashData && (
                  <div className="space-y-1.5 text-[10px] font-mono">
                    <div className="p-1.5 bg-black/60 rounded">
                      <span className="text-zinc-500">SHA-256: </span>
                      <span className="text-emerald-300 break-all">{hashData.sha256}</span>
                    </div>
                    <div className="p-1.5 bg-black/60 rounded">
                      <span className="text-zinc-500">MD5: </span>
                      <span className="text-amber-300 break-all">{hashData.md5}</span>
                    </div>
                    <div className="p-1.5 bg-black/60 rounded">
                      <span className="text-zinc-500">Base64: </span>
                      <span className="text-cyan-300 break-all">{hashData.base64Encoded}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tool 8: Markdown Analyzer */}
            {selectedTool15 === 'markdown' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-zinc-300">
                  <span>Analizador de Markdown, Palabras & Tokens LLM</span>
                  <button onClick={handleRunMarkdown} className="text-[10px] text-white font-bold">Analizar</button>
                </div>
                <textarea
                  rows={3}
                  value={mdInput}
                  onChange={(e) => setMdInput(e.target.value)}
                  className="w-full p-2 bg-black/50 border border-white/[0.08] rounded text-zinc-200 text-xs"
                />
                {mdData && (
                  <div className="p-2 bg-black/60 rounded grid grid-cols-2 gap-2 text-[11px]">
                    <div>Palabras: <span className="font-bold text-white">{mdData.wordCount}</span></div>
                    <div>Caracteres: <span className="font-bold text-white">{mdData.charCount}</span></div>
                    <div>Tokens estimados: <span className="font-bold text-emerald-400">{mdData.estimatedTokens}</span></div>
                    <div>Tiempo lectura: <span className="font-bold text-white">{mdData.readingTimeMin}</span></div>
                  </div>
                )}
              </div>
            )}

            {/* Tool 9: Color WCAG */}
            {selectedTool15 === 'wcag' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-rose-400">
                  <span>Auditor de Contraste y Accesibilidad WCAG 2.1</span>
                  <button onClick={handleRunWcag} className="text-[10px] text-rose-400 font-bold">Verificar</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-400">Texto (HEX):</label>
                    <input
                      type="text"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-full px-2 py-1 bg-black/50 rounded text-xs border border-white/[0.08]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400">Fondo (HEX):</label>
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-full px-2 py-1 bg-black/50 rounded text-xs border border-white/[0.08]"
                    />
                  </div>
                </div>
                {wcagData && (
                  <div className="p-2.5 bg-black/60 rounded space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span>Ratio de Contraste:</span>
                      <span className="font-bold text-emerald-400">{wcagData.contrastRatio}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span>Nivel AA: {wcagData.wcagAA}</span>
                      <span>Nivel AAA: {wcagData.wcagAAA}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tool 10: QR Code */}
            {selectedTool15 === 'qr' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-amber-400">
                  <span>Generador de Código QR SVG</span>
                  <button onClick={handleRunQr} className="text-[10px] text-amber-400 font-bold">Generar</button>
                </div>
                <input
                  type="text"
                  value={qrText}
                  onChange={(e) => setQrText(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-black/50 border border-white/[0.08] rounded text-zinc-200 text-xs"
                />
                {qrData && (
                  <div className="flex justify-center p-3 bg-black/60 rounded">
                    <img src={qrData.svgDataUri} alt="QR Code" className="w-28 h-28 rounded-lg shadow-lg border border-white/[0.08]" />
                  </div>
                )}
              </div>
            )}

            {/* Tool 11: Cron Parser */}
            {selectedTool15 === 'cron' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-cyan-400">
                  <span>Parser de Expresiones Cron & Próximas Ejecuciones</span>
                  <button onClick={handleRunCron} className="text-[10px] text-cyan-400 font-bold">Interpretar</button>
                </div>
                <input
                  type="text"
                  value={cronExpr}
                  onChange={(e) => setCronExpr(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-black/50 border border-white/[0.08] rounded text-zinc-200 text-xs font-mono"
                />
                {cronData && (
                  <div className="p-2.5 bg-black/60 rounded space-y-1.5 text-[11px]">
                    <div className="text-zinc-300 font-bold">{cronData.humanDescription}</div>
                    <div className="text-[10px] text-zinc-500 uppercase pt-1">Próximas 5 Ejecuciones:</div>
                    {cronData.nextRuns.map((r: string, i: number) => (
                      <div key={i} className="text-[10px] text-emerald-400 font-mono">→ {r}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tool 12: Diff */}
            {selectedTool15 === 'diff' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-emerald-400">
                  <span>Comparador de Diferencias de Código (Diff)</span>
                  <button onClick={handleRunDiff} className="text-[10px] text-emerald-400 font-bold">Comparar</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <textarea
                    rows={2}
                    value={diffOrig}
                    onChange={(e) => setDiffOrig(e.target.value)}
                    className="p-1.5 bg-black/50 rounded text-[10px] font-mono border border-white/[0.06]"
                  />
                  <textarea
                    rows={2}
                    value={diffMod}
                    onChange={(e) => setDiffMod(e.target.value)}
                    className="p-1.5 bg-black/50 rounded text-[10px] font-mono border border-white/[0.06]"
                  />
                </div>
                {diffData && (
                  <div className="p-2 bg-black/80 rounded font-mono text-[10px] space-y-0.5 max-h-32 overflow-y-auto">
                    {diffData.diff.map((d: any, idx: number) => (
                      <div
                        key={idx}
                        className={
                          d.type === 'added'
                            ? 'text-emerald-400 bg-emerald-950/40 px-1'
                            : d.type === 'removed'
                            ? 'text-red-400 bg-red-950/40 px-1 line-through'
                            : 'text-zinc-500 px-1'
                        }
                      >
                        {d.type === 'added' ? '+ ' : d.type === 'removed' ? '- ' : '  '}
                        {d.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tool 13: Unit Convert */}
            {selectedTool15 === 'unit' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-yellow-400">
                  <span>Conversor de Almacenamiento & Monedas</span>
                  <button onClick={handleRunUnit} className="text-[10px] text-yellow-400 font-bold">Convertir</button>
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    value={unitVal}
                    onChange={(e) => setUnitVal(Number(e.target.value))}
                    className="w-24 px-2 py-1 bg-black/50 rounded text-xs border border-white/[0.08]"
                  />
                  <select
                    value={`${unitFrom}->${unitTo}`}
                    onChange={(e) => {
                      const [f, t] = e.target.value.split('->');
                      setUnitFrom(f);
                      setUnitTo(t);
                    }}
                    className="flex-1 px-2 py-1 bg-black/50 rounded text-xs border border-white/[0.08] text-zinc-300"
                  >
                    <option value="MiB->GiB">MiB → GiB</option>
                    <option value="GiB->MiB">GiB → MiB</option>
                    <option value="KB->MB">KB → MB</option>
                    <option value="Celsius->Fahrenheit">Celsius → Fahrenheit</option>
                    <option value="USD->EUR">USD → EUR</option>
                  </select>
                </div>
                {unitData && (
                  <div className="p-2.5 bg-black/60 rounded text-sm font-['Bangers'] text-amber-300 tracking-wider">
                    {unitData.value} {unitData.from} = {unitData.convertedValue} {unitData.to}
                  </div>
                )}
              </div>
            )}

            {/* Tool 14: HTTP Request */}
            {selectedTool15 === 'http' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-cyan-400">
                  <span>Probador de APIs REST / Endpoint Tester</span>
                  <button onClick={handleRunHttp} className="text-[10px] text-cyan-400 font-bold">Enviar Petición</button>
                </div>
                <input
                  type="text"
                  value={httpUrl}
                  onChange={(e) => setHttpUrl(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-black/50 border border-white/[0.08] rounded text-zinc-200 text-xs font-mono"
                />
                {httpData && (
                  <div className="p-2.5 bg-black/60 rounded space-y-1 text-[10px] font-mono">
                    <div className="flex justify-between">
                      <span>Status: <span className="font-bold text-emerald-400">{httpData.statusCode}</span></span>
                      <span>Latencia: <span className="font-bold text-white">{httpData.latencyMs} ms</span></span>
                    </div>
                    <pre className="p-1.5 bg-zinc-950 rounded text-zinc-400 overflow-x-auto max-h-24">
                      {httpData.sampleResponse}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Tool 15: Device Hardware */}
            {selectedTool15 === 'device' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-purple-400">
                  <span>Telemetría de Servidor Node & Hardware Host</span>
                  <button onClick={handleRunDevice} className="text-[10px] text-purple-400 font-bold">Actualizar</button>
                </div>
                {deviceData && (
                  <div className="p-2.5 bg-black/60 rounded grid grid-cols-2 gap-2 text-[11px]">
                    <div>Plataforma: <span className="font-bold text-white">{deviceData.serverPlatform}</span></div>
                    <div>Host: <span className="font-bold text-white">{deviceData.serverHostname}</span></div>
                    <div>Cores: <span className="font-bold text-white">{deviceData.cpuCores} Cores</span></div>
                    <div>RAM Total: <span className="font-bold text-white">{deviceData.memoryTotal}</span></div>
                    <div>RAM Usada: <span className="font-bold text-emerald-400">{deviceData.memoryUsed}</span></div>
                    <div>Node.js: <span className="font-bold text-zinc-400">{deviceData.nodeVersion}</span></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 2. CATALOG OF 100 FUNCTIONS */}
      {/* ================================================================= */}
      {activeSection === 'catalog100' && (
        <div className="flex-1 flex flex-col space-y-2 overflow-hidden">
          <div className="p-2.5 bg-zinc-900/60 rounded-xl border border-white/[0.06] space-y-2 shrink-0">
            <div className="flex justify-between items-center">
              <span className="font-bold text-amber-400 text-xs">Catálogo Oficial de 100 Funciones WADE-OS</span>
              <span className="text-[10px] text-zinc-500 font-mono">{filteredCatalog.length} de 100</span>
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search size={12} className="absolute left-2.5 top-2.5 text-zinc-500" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Buscar función (ej: Docker, SQLite, DNS, Memoria)..."
                  className="w-full pl-8 pr-3 py-1.5 bg-black/50 border border-white/[0.08] rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <select
                value={catalogFilter}
                onChange={(e) => setCatalogFilter(e.target.value)}
                className="px-2 py-1.5 bg-zinc-900 border border-white/[0.08] rounded-lg text-xs text-zinc-300"
              >
                <option value="ALL">Todas las Categorías</option>
                <option value="Web & Scraping">Web & Scraping</option>
                <option value="Code & Terminal">Code & Terminal</option>
                <option value="Agent Swarm">Agent Swarm</option>
                <option value="Memory & Storage">Memory & Storage</option>
                <option value="Security & OSINT">Security & OSINT</option>
                <option value="Voice & Audio">Voice & Audio</option>
                <option value="Developer Utilities">Developer Utilities</option>
              </select>
            </div>
          </div>

          {/* Execution Result Banner */}
          {executedToolResult && (
            <div className="p-3 bg-zinc-950 border border-amber-500/40 rounded-xl space-y-1 text-xs animate-fade-in shrink-0">
              <div className="flex justify-between items-center">
                <span className="font-bold text-amber-300">
                  Herramienta #{executedToolResult.toolId} Ejecutada (100% Funcional)
                </span>
                <button
                  onClick={() => setExecutedToolResult(null)}
                  className="text-[10px] text-zinc-500 hover:text-white"
                >
                  Cerrar
                </button>
              </div>
              <pre className="p-2 bg-black/60 rounded text-[10px] text-emerald-400 font-mono overflow-x-auto max-h-28">
                {JSON.stringify(executedToolResult.result, null, 2)}
              </pre>
            </div>
          )}

          {/* Catalog List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {filteredCatalog.map((fn) => (
              <div
                key={fn.id}
                className="p-2 rounded-lg bg-zinc-900/80 border border-white/[0.05] hover:border-amber-500/30 flex items-center justify-between transition-all gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-mono text-zinc-500 w-6 shrink-0">#{fn.id}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-zinc-200 truncate">{fn.name}</div>
                    <div className="text-[9px] text-zinc-500 truncate">{fn.category}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleExecuteCatalogTool(fn.id)}
                    disabled={executingToolId === fn.id}
                    title="Ejecutar esta función con el Super-Agente Wade"
                    className="px-2 py-1 rounded bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-500/40 text-[9px] font-bold flex items-center gap-1 transition-all"
                  >
                    <Zap size={10} className={executingToolId === fn.id ? 'animate-bounce text-yellow-300' : 'text-amber-400'} />
                    <span>{executingToolId === fn.id ? 'Ejecutando...' : 'Ejecutar'}</span>
                  </button>

                  <span
                    className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold ${
                      fn.status === 'ACTIVE'
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    100%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 3. SUB-AGENTS SWARM (CrewAI Roles) */}
      {/* ================================================================= */}
      {activeSection === 'swarm' && (
        <div className="flex-1 overflow-y-auto space-y-3">
          <div className="p-3 bg-zinc-900/60 rounded-xl border border-white/[0.06] space-y-2">
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
              Seleccionar Agente Especializado:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {[
                { id: 'dopinder', name: '🚕 Dopinder', role: 'Intel & Web Recon' },
                { id: 'logan', name: '⚔️ Logan', role: 'Code & Security Slayer' },
                { id: 'blind_al', name: '🕶️ Blind Al', role: 'Sarcastic TL;DR' },
                { id: 'colossus', name: '🛡️ Colossus', role: 'System Sentinel' },
                { id: 'tva', name: '⏳ TVA Agent', role: 'Chrono Automator' },
              ].map((ag) => (
                <button
                  key={ag.id}
                  onClick={() => setSelectedAgent(ag.id as any)}
                  className={`p-2 rounded-lg text-left border transition-all ${
                    selectedAgent === ag.id
                      ? 'bg-rose-950/70 border-rose-500 text-white font-bold'
                      : 'bg-zinc-900/90 border-white/[0.05] text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="text-xs">{ag.name}</div>
                  <div className="text-[9px] text-zinc-500 truncate">{ag.role}</div>
                </button>
              ))}
            </div>

            <div className="pt-2 flex gap-1.5">
              <input
                type="text"
                value={agentTaskInput}
                onChange={(e) => setAgentTaskInput(e.target.value)}
                placeholder="Orden para el agente..."
                className="flex-1 px-3 py-1.5 bg-black/40 border border-white/[0.08] rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500"
              />
              <button
                onClick={handleDispatchAgent}
                disabled={isAgentRunning}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1 shrink-0"
              >
                <Play size={11} />
                <span>{isAgentRunning ? 'Lanzando...' : 'Despachar'}</span>
              </button>
            </div>
          </div>

          {/* Agent Execution Card */}
          {agentResult && (
            <div className="p-3 bg-zinc-950 border border-rose-500/40 rounded-xl space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-300">{agentResult.agentName}</span>
                <span className="text-[10px] text-zinc-500">{agentResult.timestamp}</span>
              </div>
              <p className="text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap">{agentResult.message}</p>
              
              {agentResult.findings && (
                <div className="space-y-1 pt-1 text-[11px] text-zinc-300">
                  {agentResult.findings.map((f: string, i: number) => (
                    <div key={i} className="p-1.5 bg-zinc-900/70 rounded border border-white/[0.04]">
                      {f}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* 4. VIRTUAL TERMINAL CLI */}
      {/* ================================================================= */}
      {activeSection === 'terminal' && (
        <div className="flex-1 flex flex-col space-y-2 overflow-hidden">
          <div className="flex-1 p-3 bg-black/80 border border-white/[0.08] rounded-xl overflow-y-auto font-mono text-[11px] text-emerald-400 whitespace-pre-wrap leading-relaxed">
            {cliOutput}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRunCli();
            }}
            className="flex gap-1.5 shrink-0"
          >
            <span className="py-2 text-rose-500 font-bold select-none">$</span>
            <input
              type="text"
              value={cliInput}
              onChange={(e) => setCliInput(e.target.value)}
              placeholder="ls, cat server.py, free -h, uptime..."
              className="flex-1 px-3 py-1.5 bg-zinc-900 border border-white/[0.08] rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={isCliRunning}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-black font-bold rounded-lg transition-colors"
            >
              Ejecutar
            </button>
          </form>
        </div>
      )}

      {/* ================================================================= */}
      {/* 5. SOUNDBOARD */}
      {/* ================================================================= */}
      {activeSection === 'soundboard' && (
        <div className="flex-1 overflow-y-auto space-y-3">
          <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">
            Matriz de Sonidos Tácticos de Wade:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { label: '🔫 Disparo Táctico', fn: playGunshot },
              { label: '⚔️ Choque de Katanas', fn: playSwordClash },
              { label: '🌮 Crunch Chimichanga', fn: playChimichangaCrunch },
              { label: '⚡ Descarga TVA Zap', fn: playTvaZap },
              { label: '📢 Bocina de Dopinder', fn: playComedicHorn },
            ].map((snd, idx) => (
              <button
                key={idx}
                onClick={snd.fn}
                className="p-3 bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.08] rounded-xl text-left text-zinc-200 hover:text-white transition-all transform active:scale-95"
              >
                <div className="text-xs font-semibold">{snd.label}</div>
                <div className="text-[9px] text-zinc-500 mt-0.5">Disparar Web Audio</div>
              </button>
            ))}
          </div>

          <div className="pt-2">
            <a
              href="/api/tools/export-bundle"
              download="wade-os-backup.json"
              className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/[0.12] rounded-xl text-zinc-200 hover:text-white font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Download size={14} />
              <span>Exportar Backup Completo (~/wade-os-backup.json)</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
