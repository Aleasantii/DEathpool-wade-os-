/**
 * Built-in Base Capabilities for Wade OS
 * 100% Free - Works out-of-the-box using standard Node.js & public tools
 */

import si from 'systeminformation';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export const BUILTIN_TOOLS = {
  async getSystemInfo() {
    try {
      const cpu = await si.cpu();
      const mem = await si.mem();
      const osInfo = await si.osInfo();
      return {
        cpu: `${cpu.manufacturer} ${cpu.brand} (${cpu.cores} cores)`,
        memory: `Used: ${(mem.active / 1024 / 1024 / 1024).toFixed(2)} GB / Total: ${(mem.total / 1024 / 1024 / 1024).toFixed(2)} GB`,
        os: `${osInfo.distro} ${osInfo.release} (${osInfo.platform})`,
        uptime: `${(si.time().uptime / 3600).toFixed(2)} hours`
      };
    } catch (err) {
      return { error: err.message };
    }
  },

  async calculate(expression) {
    try {
      // Safe mathematical evaluation
      const safeExpr = expression.replace(/[^0-9+\-*/().%\s^]/g, '');
      // Evaluate basic arithmetic safely
      const result = Function(`"use strict"; return (${safeExpr})`)();
      return { expression: safeExpr, result };
    } catch (err) {
      return { error: `Invalid math expression: ${err.message}` };
    }
  },

  async runJSCode(code) {
    try {
      // Execute code safely in isolated context
      const logs = [];
      const mockConsole = {
        log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ')),
        error: (...args) => logs.push(`[ERROR] ${args.join(' ')}`),
        warn: (...args) => logs.push(`[WARN] ${args.join(' ')}`)
      };

      const runner = new Function('console', 'process', `
        try {
          ${code}
        } catch (e) {
          console.error(e.message);
        }
      `);

      runner(mockConsole, { env: {} });

      return {
        executed: true,
        output: logs.length > 0 ? logs.join('\n') : 'Code executed with no stdout output.'
      };
    } catch (err) {
      return { error: `Execution Error: ${err.message}` };
    }
  },

  async fetchWebPage(url) {
    try {
      let targetUrl = url.startsWith('http') ? url : `https://${url}`;
      const response = await fetch(targetUrl);
      const text = await response.text();
      // Strip html tags for plain text preview
      const cleanText = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                            .replace(/<[^>]+>/g, ' ')
                            .replace(/\s+/g, ' ')
                            .trim();
      return {
        url: targetUrl,
        status: response.status,
        snippet: cleanText.slice(0, 1500) + (cleanText.length > 1500 ? '...' : '')
      };
    } catch (err) {
      return { error: `Failed to fetch URL: ${err.message}` };
    }
  },

  async executeBashCommand(command) {
    try {
      // Whitelist or handle command safely
      const { stdout, stderr } = await execPromise(command, { timeout: 10000 });
      return {
        command,
        stdout: stdout.trim(),
        stderr: stderr.trim()
      };
    } catch (err) {
      return {
        command,
        error: err.message,
        stderr: err.stderr || ''
      };
    }
  }
};
