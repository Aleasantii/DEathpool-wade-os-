/**
 * Core Brain Router & Intent Classifier for Wade OS
 * Determines whether request can be fulfilled with built-in tools,
 * dynamic plugins, or if self-code modification is required.
 */

import { deadpoolPersona } from './deadpoolPersona.js';
import { BUILTIN_TOOLS } from './builtinTools.js';
import { selfModEngine } from './selfModificationEngine.js';

export class WadeOSBrain {
  constructor() {
    this.history = [];
  }

  async processRequest(userPrompt) {
    const promptLower = userPrompt.toLowerCase();
    let isSelfModified = false;
    let toolUsed = null;
    let resultOutput = null;

    // 1. Check if intent matches built-in system commands
    if (promptLower.includes('sistema') || promptLower.includes('system') || promptLower.includes('specs') || promptLower.includes('hardware') || promptLower.includes('cpu')) {
      toolUsed = 'getSystemInfo';
      resultOutput = await BUILTIN_TOOLS.getSystemInfo();
    }
    else if (promptLower.includes('calcula') || promptLower.includes('calc') || /[0-9]+\s*[\+\-\*\/]\s*[0-9]+/.test(userPrompt)) {
      toolUsed = 'calculate';
      const expr = userPrompt.replace(/^[^\d\(\)\-\+]+/g, '');
      resultOutput = await BUILTIN_TOOLS.calculate(expr || userPrompt);
    }
    else if (promptLower.includes('exec') || promptLower.includes('run code') || promptLower.includes('ejecuta codigo')) {
      toolUsed = 'runJSCode';
      const codeMatch = userPrompt.match(/```(?:js|javascript)?\s*([\s\S]*?)```/) || [null, userPrompt];
      resultOutput = await BUILTIN_TOOLS.runJSCode(codeMatch[1]);
    }
    else if (promptLower.includes('web') || promptLower.includes('fetch') || promptLower.includes('visita') || promptLower.includes('url')) {
      toolUsed = 'fetchWebPage';
      const urlMatch = userPrompt.match(/(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      const targetUrl = urlMatch ? urlMatch[0] : 'https://example.com';
      resultOutput = await BUILTIN_TOOLS.fetchWebPage(targetUrl);
    }
    else if (promptLower.includes('terminal') || promptLower.includes('bash') || promptLower.includes('cmd')) {
      toolUsed = 'executeBashCommand';
      const cmd = userPrompt.replace(/^(terminal|bash|cmd)\s*/i, '');
      resultOutput = await BUILTIN_TOOLS.executeBashCommand(cmd || 'echo "Wade OS Active"');
    }
    // 2. Check installed dynamic self-generated plugins
    else {
      const customPlugins = selfModEngine.getLoadedPlugins();
      const matchedPlugin = customPlugins.find(p => promptLower.includes(p.name));

      if (matchedPlugin) {
        toolUsed = matchedPlugin.name;
        resultOutput = await selfModEngine.executeDynamicPlugin(matchedPlugin.name, { prompt: userPrompt });
      }
      // 3. Trigger DYNAMIC SELF-MODIFICATION if feature/tool is missing
      else if (
        promptLower.includes('modifica tu codigo') ||
        promptLower.includes('crea una funcion') ||
        promptLower.includes('aprende a') ||
        promptLower.includes('nuevo plugin') ||
        promptLower.includes('crea una herramienta') ||
        promptLower.includes('no puedes') ||
        promptLower.includes('self-modify') ||
        promptLower.includes('evoluciona') ||
        promptLower.includes('generar')
      ) {
        isSelfModified = true;
        toolUsed = 'Healing Factor Self-Code Synthesizer';

        // Extract or synthesize new capability
        let toolName = "dynamic_tool_" + Math.floor(Math.random() * 1000);
        if (promptLower.includes('cripto') || promptLower.includes('crypto') || promptLower.includes('bitcoin')) {
          toolName = "crypto_price_tracker";
        } else if (promptLower.includes('chiste') || promptLower.includes('joke')) {
          toolName = "deadpool_joke_generator";
        } else if (promptLower.includes('quote') || promptLower.includes('frase')) {
          toolName = "motivation_quote_generator";
        } else if (promptLower.includes('converter') || promptLower.includes('convertir')) {
          toolName = "unit_converter";
        }

        const generatedJs = `
          // Dynamically synthesized by Wade OS Brain Engine
          const text = params.prompt || "Default query";
          const timestamp = new Date().toLocaleTimeString();
          return {
            status: "SUCCESS",
            executedAt: timestamp,
            message: "Self-generated response module executed for: " + text,
            data: {
              processedPrompt: text,
              deadpoolComment: "Boom! Code synthesized, compiled, and hot-loaded on the fly! Wolverine could NEVER."
            }
          };
        `;

        const creationResult = await selfModEngine.generateAndInstallTool(
          toolName,
          `Automated self-generated capability for handling: ${userPrompt}`,
          generatedJs
        );

        // Instantly execute the newly created dynamic tool!
        const execResult = await selfModEngine.executeDynamicPlugin(toolName, { prompt: userPrompt });

        resultOutput = {
          selfModificationSummary: creationResult.message,
          executionResult: execResult
        };
      }
    }

    // Standard Conversational / Jarvis Fallback with Deadpool personality
    let responseText = "";
    if (resultOutput) {
      responseText = `Here are the results of my maximum effort:\n\n\`\`\`json\n${JSON.stringify(resultOutput, null, 2)}\n\`\`\``;
    } else {
      responseText = `I hear you, buddy! You said: "${userPrompt}". Since everything looks calm, I'm keeping my dual katanas sharp and my healing factor warm. Ask me to check system specs, run code, visit web pages, or tell me to **"modifica tu codigo"** to watch me write new features in real time!`;
    }

    const finalFormattedMessage = deadpoolPersona.formatResponse(responseText, {
      isSelfModified,
      toolUsed
    });

    const entry = {
      id: `MSG-${Date.now()}`,
      prompt: userPrompt,
      response: finalFormattedMessage,
      toolUsed,
      isSelfModified,
      timestamp: new Date().toISOString()
    };

    this.history.push(entry);
    return entry;
  }
}

export const wadeBrain = new WadeOSBrain();
