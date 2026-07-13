export function getAuth(): string {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  if (!login || !password) throw new Error('DataForSEO credentials not configured');
  return 'Basic ' + Buffer.from(`${login}:${password}`).toString('base64');
}

export async function dataforSeoPost(path: string, body: unknown): Promise<unknown> {
  const attempt = async () => fetch(`https://api.dataforseo.com${path}`, {
    method: 'POST',
    headers: { Authorization: getAuth(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  let res = await attempt();
  if (!res.ok) {
    console.warn(`DataForSEO ${path} failed (${res.status}), retrying once`);
    res = await attempt();
  }
  if (!res.ok) throw new Error(`DataForSEO ${path} error: ${res.status}`);
  return res.json();
}
