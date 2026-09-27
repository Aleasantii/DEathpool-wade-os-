/**
 * Dynamic Self-Modification & Hot-Plugin Engine
 * 100% Free & Autonomous - Allows Wade OS to detect missing functions,
 * generate new code dynamically, write to dynamic plugins directory, and hot-load them.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PLUGINS_DIR = path.join(__dirname, '..', 'dynamic_plugins');

export class SelfModificationEngine {
  constructor() {
    this.customPlugins = new Map();
    this.evolutionHistory = [];
  }

  async init() {
    try {
      await fs.mkdir(PLUGINS_DIR, { recursive: true });
      await this.loadExistingPlugins();
    } catch (err) {
      console.error('[SelfModificationEngine] Error initializing plugins dir:', err);
    }
  }

  async loadExistingPlugins() {
    try {
      const files = await fs.readdir(PLUGINS_DIR);
      for (const file of files) {
        if (file.endsWith('.js')) {
          await this.loadPluginFile(file);
        }
      }
    } catch (err) {
      console.error('[SelfModificationEngine] Error loading existing plugins:', err);
    }
  }

  async loadPluginFile(filename) {
    const filePath = path.join(PLUGINS_DIR, filename);
    try {
      // Dynamic import with cache busting
      const fileUrl = `file://${filePath}?update=${Date.now()}`;
      const pluginModule = await import(fileUrl);
      if (pluginModule.name && typeof pluginModule.execute === 'function') {
        this.customPlugins.set(pluginModule.name, {
          name: pluginModule.name,
          description: pluginModule.description || 'Self-generated dynamic capability',
          execute: pluginModule.execute,
          filename
        });
        console.log(`[WADE-OS CORE] Dynamic Plugin hot-loaded: ${pluginModule.name}`);
      }
    } catch (err) {
      console.error(`[SelfModificationEngine] Failed to load plugin ${filename}:`, err);
    }
  }

  /**
   * Generates a new code tool based on user prompt requirements
   */
  async generateAndInstallTool(toolName, description, javascriptCode) {
    const sanitizedName = toolName.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const filename = `plugin_${sanitizedName}.js`;
    const filePath = path.join(PLUGINS_DIR, filename);

    const pluginCode = `
/**
 * Dynamic Wade OS Self-Generated Plugin: ${sanitizedName}
 * Created automatically by Wade OS Healing Factor Engine
 */

export const name = "${sanitizedName}";
export const description = ${JSON.stringify(description)};

export async function execute(params = {}) {
  try {
    ${javascriptCode}
  } catch (error) {
    return { error: "Plugin execution failed: " + error.message };
  }
}
`;

    await fs.writeFile(filePath, pluginCode, 'utf8');

    // Register into evolution history
    const historyEntry = {
      id: `EVO-${Date.now()}`,
      toolName: sanitizedName,
      description,
      filename,
      timestamp: new Date().toISOString(),
      codeSnippet: javascriptCode
    };

    this.evolutionHistory.unshift(historyEntry);

    // Hot-load newly created plugin
    await this.loadPluginFile(filename);

    return {
      success: true,
      toolName: sanitizedName,
      message: `Healing Factor complete! Dynamically compiled and hot-loaded new capability: [${sanitizedName}]`,
      historyEntry
    };
  }

  getLoadedPlugins() {
    return Array.from(this.customPlugins.values()).map(p => ({
      name: p.name,
      description: p.description,
      filename: p.filename
    }));
  }

  getEvolutionHistory() {
    return this.evolutionHistory;
  }

  async executeDynamicPlugin(name, params) {
    if (!this.customPlugins.has(name)) {
      throw new Error(`Plugin '${name}' not found in Wade OS dynamic repository.`);
    }
    const plugin = this.customPlugins.get(name);
    return await plugin.execute(params);
  }
}

export const selfModEngine = new SelfModificationEngine();
