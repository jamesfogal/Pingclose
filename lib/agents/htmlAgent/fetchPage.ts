import tls from 'node:tls';

// ALPN is negotiated during the TLS handshake itself, before any HTTP
// response exists — it's the only reliable way to know if a connection
// actually used HTTP/2. Response headers like Alt-Svc only advertise an
// *alternative* upgrade path and are frequently absent even on live h2.
function detectAlpnProtocol(hostname: string, port: number, timeoutMs = 5000): Promise<string | null> {
  return new Promise((resolve) => {
    const socket = tls.connect({ host: hostname, port, servername: hostname, ALPNProtocols: ['h2', 'http/1.1'], timeout: timeoutMs });
    const finish = (result: string | null) => { socket.removeAllListeners(); socket.destroy(); resolve(result); };
    socket.once('secureConnect', () => finish(socket.alpnProtocol || null));
    socket.once('error', () => finish(null));
    socket.once('timeout', () => finish(null));
  });
}

export interface FetchedPage {
  html: string;
  headers: Record<string, string>;
  alpnProtocol: string | null;
}

// Fetches the target page and races the ALPN probe alongside it so the
// probe adds no latency. Returns null on any failure (network, timeout,
// DNS) — the caller decides what an empty result looks like.
export async function fetchPage(url: string): Promise<FetchedPage | null> {
  try {
    const isHttpsUrl = url.startsWith('https');
    const alpnPromise = isHttpsUrl
      ? detectAlpnProtocol(new URL(url).hostname, Number(new URL(url).port) || 443).catch(() => null)
      : Promise.resolve(null);

    const [res, alpnProtocol] = await Promise.all([
      fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PingClose/1.0; +https://pingclose.com)' },
        signal: AbortSignal.timeout(12000)
      }),
      alpnPromise,
    ]);
    const html = await res.text();
    const headers: Record<string, string> = {};
    res.headers.forEach((value, key) => { headers[key.toLowerCase()] = value; });

    return { html, headers, alpnProtocol };
  } catch (err) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error('AGENT_FAIL: HtmlAgent —', msg);
    return null;
  }
}
