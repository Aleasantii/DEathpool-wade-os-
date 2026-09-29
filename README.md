# 💀 WADE-OS 3000 — Deadpool Cybernetic Desktop Simulator & Autonomous Agent

[![Status](https://img.shields.io/badge/Status-Operational%20%7C%20Maximum%20Effort-ef4444.svg)](#)
[![Runtime](https://img.shields.io/badge/Runtime-Node.js%2022%20%7C%20Vite%20%2B%20React%2019-3b82f6.svg)](#)
[![AI Engine](https://img.shields.io/badge/AI%20Engine-Gemini%203.8%20%7C%20Multi--Model%20Fallback-10b981.svg)](#)
[![Architecture](https://img.shields.io/badge/Architecture-Autonomous%20Agent%20V3.0%20%7C%20Swarm-a855f7.svg)](#)

> *"¿Por qué la interfaz es roja? Para que los errores de sintaxis no me vean sangrar. ¡Máximo Esfuerzo, Boss!"*  
> — **Wade Wilson (WADE-OS 3000)**

---

## 📋 Resumen del Repositorio / Project Overview

**WADE-OS 3000** es un simulador de sistema operativo táctico de escritorio inspirado en Wade Wilson (Deadpool). Funciona como un **Agente Autónomo de Alto Rendimiento (V3.0)** con metacognición, bucles de automejora interna, telemetría real de Linux (protegiendo el Chromebook del "Jefe Supremo" contra formateos accidentales con `rm -rf`), integración con más de 100 herramientas modulares, enjambre de sub-agentes de la comunidad y un sistema de memoria vectorial a largo plazo inspirado en ChromaDB.

---

## ⚡ Nuevas Funcionalidades y Actualizaciones Implementadas

### 1. 🧠 Protocolo de Agente Autónomo V3.0 (Metacognición y Autorreflexión)
- **Flujo Interno de 3 Fases**:
  1. **Análisis y Descomposición:** Desglose sistemático de objetivos en submetas priorizadas con análisis de recursos (RAM/CPU).
  2. **Ejecución Modular:** Generación de soluciones de ingeniería sin código de relleno ni memory leaks.
  3. **Bucle de Automejora (Self-Refinement Loop):** Auditoría interna crítica antes de emitir la respuesta.
- **Bloque de Metacognición `[Autoevaluación del Agente]`**: En cada respuesta analítica o de código, se reporta la puntuación de cobertura, las optimizaciones aplicadas y los siguientes pasos sugeridos.
- **Modo Focus Autónomo (`/api/focus/step`)**: Modo de trabajo profundo en segundo plano donde Wade ejecuta ciclos continuos de investigación, diagnóstico y optimización sin detenerse hasta recibir la orden de parar.

---

### 2. 🛡️ Resiliencia Multi-Modelo y Protección Anti-Cuota (Quota Guard)
- **Cadena de Modelos en Cascada**:
  - Modelo primario: `gemini-3.8-flash`
  - Modelo secundario / alta disponibilidad: `gemini-3.1-flash-lite`
  - Alias ultra-rápido: `gemini-flash-latest`
  - Motor de contingencia local: **Deadpool Smart Engine** (garantiza respuestas fluidas, búsqueda web y diagnósticos incluso con cuota agotada o modo offline).
- **Aislamiento en Síntesis de Herramientas**: Si el modelo principal agota la cuota en el segundo turno tras invocar herramientas, el sistema conmuta automáticamente a modelos ligeros sin abortar la respuesta.
- **TTS Neural con Doble Nivel**: `gemini-3.8-flash-tts` ➔ `gemini-3.8-flash-lite-tts` ➔ Síntesis formante local en cliente.

---

### 3. 🛠️ Catálogo Maestro de 100 Herramientas y Suite MCP
Se construyó un catálogo completo de 100 herramientas accesibles por el agente y el usuario:

| Categoría | Herramientas Principales | Descripción |
| :--- | :--- | :--- |
| **Búsqueda & Web** | `duckduckgo_search`, `url_scraper`, `github_inspect` | Búsqueda web sin rastreo corporativo, raspador de texto/markdown limpio e inspección de repositorios GitHub. |
| **Diagnóstico de Red** | `network-diag`, `http-test`, `device-info` | Ping de latencia DNS, comprobación de cabeceras HTTP, puertos y estado de conectividad SSL. |
| **Código & Terminal** | `virtual_terminal`, `self_improve_code`, `code_eval` | Terminal Bash interactiva para `~/wade-os`, motor de auto-mejora de código y evaluador SmolCode. |
| **Bases de Datos & SQL**| `sql_runner`, `chroma_memory` | Motor SQLite virtual en memoria y gestión de recuerdos persistentes en ChromaDB. |
| **Desarrollo & DevOps** | `regex_lab`, `json_tool`, `text_diff`, `cron_tool` | Laboratorio de expresiones regulares, formateador/minificador JSON, comparador de diff y visor cron. |
| **Criptografía & Auth** | `token_gen`, `crypto_hash`, `prompt_audit` | Generador de tokens con cálculo de entropía, cálculo SHA-256/MD5 y detector de inyecciones de prompt/SQL. |
| **Diseño & Accesibilidad**| `color_auditor`, `qr_gen`, `unit_convert` | Auditor de contraste WCAG (AA/AAA), generador de códigos QR vectoriales (SVG) y convertidor de unidades. |

---

### 4. 👥 Enjambre de Sub-Agentes (Community Multi-Agent Swarm)
Delegación de tareas mediante canales seguros:
- 🚕 **Dopinder**: Extracción y scraping de inteligencia web sin llamar la atención de la policía.
- ⚔️ **Logan / Wolverine**: Auditor de seguridad de código, eliminación de memory leaks y parches AST.
- 🕶️ **Blind Al**: Síntesis ejecutiva sarcástica y directa al grano (sin rodeos corporativos).
- 🛡️ **Colossus (Piotr)**: Balanceador soviético de procesos Linux y centinela de memoria.
- ⏳ **Agente TVA**: Purgador de líneas temporales y automatizador cronológico de hitos.

---

### 5. 🧬 Malla Sináptica Cerebral (Neural Synaptic Brain)
Visualizador 3D y trazador de rutas sinápticas entre 8 lóbulos cerebrales:
1. **Córtex Prefrontal**: Planificación y arbitraje ejecutivo.
2. **Hipocampo**: Memoria episódica y semántica de ChromaDB.
3. **Córtex Sensorial**: Seguimiento 3D del cursor y atención espacial.
4. **Córtex Motor**: Ejecución de comandos en la terminal Linux virtual.
5. **Amígdala**: Sistema de pánico ante formateos (`rm -rf`) y defensa de RAM.
6. **Cuerpo Estriado**: Gestión de la lista de tareas tácticas.
7. **Red Social / Swarm**: Despacho de comunicaciones al enjambre mercenario.
8. **Área de Broca**: Síntesis de voz Full-Duplex con interrupción por *Barge-In*.

---

### 6. 🗄️ Sistema de Archivos Virtual en `~/wade-os`
Archivos indexados, inspeccionables y editables en tiempo real:
- `server.py`: Servidor backend simulado en FastAPI con WebSockets en `/ws`.
- `memory.py`: Cliente persistente de ChromaDB para recuerdos y directivas del Jefe.
- `run.sh`: Script de arranque y verificación del entorno virtual Python.
- `tools.py`: Registro modular de herramientas tácticas.

---

### 7. 🎯 Gestión de Tareas Tácticas (Mercenary Tasklist)
- Misiones clasificadas por criticidad (`CRITICAL`, `HIGH`, `MEDIUM`).
- Enlace dinámico con neuronas cerebrales asignadas.
- Generación de misiones tácticas asistidas por IA.

---

## 🏛️ Estructura del Código

```
├── .env.example                               # Plantilla de variables de entorno (GEMINI_API_KEY, PORT)
├── index.html                                 # Entrypoint HTML con fuentes Bangers/Space Grotesk y metadatos
├── metadata.json                              # Configuración del applet y permisos de servidor
├── package.json                               # Dependencias (React 19, Tailwind v4, Express, Three.js, GenAI)
├── README.md                                  # Documentación técnica completa
├── server.ts                                  # Backend Express (Vite Middleware, Gemini SDK, 100+ endpoints)
├── tools.ts                                   # Sistema de herramientas nativas (DuckDuckGo, Linux Telemetry, AST)
├── tsconfig.json                              # Configuración TypeScript (ES2022, bundler)
├── vite.config.ts                             # Configuración Vite con soporte Tailwind v4 y React
└── src/
    ├── App.tsx                                # Componente raíz
    ├── index.css                              # Estilos globales Tailwind v4 y utilidades glassmorphism
    ├── main.tsx                               # Montaje React DOM
    ├── components/
    │   ├── chat/
    │   │   ├── BenchmarkComparisonView.tsx    # Comparador de métricas Wade vs GPT-4o
    │   │   ├── ChromaMemoryView.tsx           # Explorador de memoria vectorial ChromaDB
    │   │   ├── CommunityAgentsHub.tsx         # Panel de delegación del enjambre (Logan, Dopinder, etc.)
    │   │   ├── DeadpoolAssistant.tsx          # Panel principal HUD, chat interactivo y control por voz
    │   │   ├── HologramOrb.tsx                # Renderizador Three.js 3D con tracking espacial de cabeza
    │   │   ├── LinuxTerminalView.tsx          # Terminal interactiva Bash con comandos reales y ficticios
    │   │   ├── NeuralBrainView.tsx            # Visualizador de sinapsis y lóbulos cerebrales
    │   │   ├── OsintGodEyeView.tsx            # Radar táctico de satélite "El Ojo de Dios"
    │   │   ├── SourceFilesView.tsx            # Visor y editor de código en ~/wade-os
    │   │   ├── TacticalAutonomousView.tsx     # Monitor del Modo Focus autónomo por ciclos
    │   │   ├── TacticalTaskList.tsx           # Gestor de tareas tácticas mercenarias
    │   │   └── ToolsSystemView.tsx            # Catálogo interactivo de las 100 herramientas
    │   └── desktop/
    │       └── DeadpoolClock.tsx              # Reloj minimalista HUD con indicador de hardware
    └── utils/
        └── audio.ts                           # Sintetizador de efectos sonoros y reproductor Wham!
```

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos
- **Node.js**: Versión 22.x
- **NPM**: Gestor de paquetes oficial (sin Yarn ni Bun)

### 1. Clonar e Instalar Dependencias
```bash
git clone https://github.com/Aleasantii/DEathpool-wade-os-.git
cd DEathpool-wade-os-
npm install
```

### 2. Configurar Variables de Entorno
Copia el archivo `.env.example`:
```bash
cp .env.example .env
```
Edita `.env` y añade tu clave de API:
```env
PORT=3000
NODE_ENV=development
GEMINI_API_KEY=tu_clave_de_gemini_aqui
```
*(Nota: En el entorno de AI Studio la clave se inyecta automáticamente en el lado del servidor).*

### 3. Iniciar el Servidor de Desarrollo
```bash
npm run dev
```
La aplicación estará disponible de inmediato en `http://localhost:3000`.

### 4. Compilar para Producción
```bash
npm run build
npm start
```

---

## 🔒 Seguridad y Buenas Prácticas
- **Cero Exposición de Claves en el Cliente**: Todas las llamadas a `@google/genai` y servicios externos se realizan exclusivamente desde el backend (`server.ts`).
- **Sanitización de Consultas**: Filtro activo contra inyecciones SQL maliciosas y patrones de desvío de directivas base (*jailbreak*).
- **Protección de Memoria del Host**: Monitoreo de heap y purga proactiva para operar holgadamente en hardware con 4 GB de RAM (como entornos Chromebook / contenedores ligeros).

---

## 📜 Licencia
Proyecto desarrollado para propósitos educativos, simulación de agentes interactivos y entretenimiento bajo la filosofía **"Máximo Esfuerzo"**.
