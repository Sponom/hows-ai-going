export async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashIpDaily(ip: string, salt: string): Promise<string> {
  const day = new Date().toISOString().slice(0, 10);
  return sha256Hex(`${salt}:${day}:${ip}`);
}

export async function hashAnonToken(token: string, salt: string): Promise<string> {
  return sha256Hex(`${salt}:anon:${token}`);
}
