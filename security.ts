import type { Request, Response, NextFunction } from 'express';

// ------------------------------------------------------------------
// 1. Anti-SSRF URL Validation & Safe Fetcher
// ------------------------------------------------------------------

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  'metadata.google.internal',
  '169.254.169.254',
  'instance-data',
]);

export function isPrivateIp(ip: string): boolean {
  // IPv4 private ranges
  if (/^10\./.test(ip)) return true;
  if (/^192\.168\./.test(ip)) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) return true;
  if (/^127\./.test(ip)) return true;
  if (/^169\.254\./.test(ip)) return true;
  if (/^0\./.test(ip)) return true;

  // IPv6 local/private ranges
  if (/^(fc00|fd00|fe80|::1)/i.test(ip)) return true;

  return false;
}

export function validateSafePublicUrl(rawUrl: string): { safe: boolean; reason?: string; url?: URL } {
  try {
    const parsed = new URL(rawUrl);

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { safe: false, reason: 'Solo se permiten protocolos HTTP y HTTPS.' };
    }

    const hostname = parsed.hostname.toLowerCase();

    if (BLOCKED_HOSTNAMES.has(hostname)) {
      return { safe: false, reason: `Acceso restringido a host interno o de metadatos: ${hostname}` };
    }

    if (isPrivateIp(hostname)) {
      return { safe: false, reason: `Acceso restringido a dirección IP privada o de bucle local: ${hostname}` };
    }

    // Block non-standard or internal ports (e.g. redis 6379, ssh 22, internal dev ports)
    if (parsed.port && !['80', '443', '8080', '8443'].includes(parsed.port)) {
      return { safe: false, reason: `Puerto restringido por política anti-SSRF: ${parsed.port}` };
    }

    return { safe: true, url: parsed };
  } catch (err: any) {
    return { safe: false, reason: `URL malformada: ${err.message}` };
  }
}

export async function safeFetchPublicPage(rawUrl: string, maxBytes: number = 300000): Promise<{
  url: string;
  statusCode: number;
  title: string;
  textContent: string;
  charCount: number;
}> {
  let currentUrl = rawUrl;
  let hops = 0;
  const maxHops = 3;

  while (hops < maxHops) {
    const validation = validateSafePublicUrl(currentUrl);
    if (!validation.safe || !validation.url) {
      throw new Error(`[Seguridad Anti-SSRF]: ${validation.reason}`);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    let response: any;
    try {
      response = await fetch(currentUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; WADE-OS-Bot/3.0; +https://wade-os.local)',
          'Accept': 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.8',
        },
        redirect: 'manual', // Never follow redirects blindly without validating target
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    // Check redirect
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const loc = response.headers.get('location');
      if (!loc) {
        throw new Error('Redirección recibida sin cabecera Location');
      }
      const nextUrl = new URL(loc, currentUrl).toString();
      currentUrl = nextUrl;
      hops++;
      continue;
    }

    if (!response.ok) {
      throw new Error(`El servidor respondió con código HTTP ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/') && !contentType.includes('html') && !contentType.includes('json') && !contentType.includes('xml')) {
      throw new Error(`Tipo de contenido no textual no admitido: ${contentType}`);
    }

    const text = await response.text();
    const truncated = text.slice(0, maxBytes);

    // Extract title
    const titleMatch = truncated.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : validation.url.hostname;

    // Clean HTML tags, script, style, comments
    const cleanText = truncated
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 4000);

    return {
      url: currentUrl,
      statusCode: response.status,
      title,
      textContent: cleanText,
      charCount: cleanText.length,
    };
  }

  throw new Error('Límite de redirecciones excedido');
}

// ------------------------------------------------------------------
// 2. Sliding Window Rate Limiter (20 chats per minute per IP)
// ------------------------------------------------------------------

interface RateLimitRecord {
  timestamps: number[];
}

export function createRateLimiter(limit: number = 20, windowMs: number = 60000) {
  const store = new Map<string, RateLimitRecord>();

  // Cleanup old records every 2 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of store.entries()) {
      record.timestamps = record.timestamps.filter((t) => now - t < windowMs);
      if (record.timestamps.length === 0) {
        store.delete(ip);
      }
    }
  }, 120000);

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();

    let record = store.get(ip);
    if (!record) {
      record = { timestamps: [] };
      store.set(ip, record);
    }

    record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

    if (record.timestamps.length >= limit) {
      const oldest = record.timestamps[0];
      const waitSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
      res.setHeader('Retry-After', waitSeconds);
      res.status(429).json({
        error: `Límite de tasa alcanzado: máximo ${limit} consultas por minuto por IP para proteger tu cuota de Gemini.`,
        retryAfterSeconds: waitSeconds,
        wadeNote: '*[Wade pone una mano en el pecho]* ¡Tranquilo, Jefe! Estamos protegiendo la cuota antes de que el API nos mande al refrigerador.',
      });
      return;
    }

    record.timestamps.push(now);
    next();
  };
}

// ------------------------------------------------------------------
// 3. Optional Authentication Token Guard
// ------------------------------------------------------------------

export function requireToken(req: Request, res: Response, next: NextFunction): void {
  const expectedToken = process.env.API_AUTH_TOKEN;
  // If no auth token is configured in environment, allow transparent access (development mode)
  if (!expectedToken) {
    return next();
  }

  const authHeader = req.headers.authorization || '';
  const xApiToken = req.headers['x-api-token'];

  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;
  const provided = bearerToken || (typeof xApiToken === 'string' ? xApiToken : null);

  if (provided === expectedToken) {
    return next();
  }

  res.status(401).json({
    error: 'Token de autorización inválido o ausente.',
    hint: 'Envía la cabecera Authorization: Bearer <API_AUTH_TOKEN>',
  });
};
