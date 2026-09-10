export type KeyValueStore = {
  get(key: string): string | null;
  set(key: string, value: string): void;
};

export class MemoryStore implements KeyValueStore {
  private readonly data = new Map<string, string>();

  get(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  set(key: string, value: string): void {
    this.data.set(key, value);
  }
}

export class LocalStorageStore implements KeyValueStore {
  get(key: string): string | null {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(key);
  }

  set(key: string, value: string): void {
    localStorage.setItem(key, value);
  }
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function asAesBytes(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

async function importAesKey(raw: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", asAesBytes(raw), "AES-GCM", false, ["encrypt", "decrypt"]);
}

export async function encryptJson(keyBytes: Uint8Array, value: unknown): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await importAesKey(keyBytes);
  const encoded = new TextEncoder().encode(JSON.stringify(value));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv: asAesBytes(iv) }, key, asAesBytes(encoded)),
  );
  return JSON.stringify({ iv: bytesToBase64(iv), data: bytesToBase64(ciphertext) });
}

export async function decryptJson<T>(keyBytes: Uint8Array, blob: string): Promise<T> {
  const parsed = JSON.parse(blob) as { iv: string; data: string };
  const key = await importAesKey(keyBytes);
  const iv = base64ToBytes(parsed.iv);
  const data = base64ToBytes(parsed.data);
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: asAesBytes(iv) },
    key,
    asAesBytes(data),
  );
  return JSON.parse(new TextDecoder().decode(plain)) as T;
}

export function randomAesKey(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(32));
}

export function encodeKey(bytes: Uint8Array): string {
  return bytesToBase64(bytes);
}

export function decodeKey(value: string): Uint8Array {
  return base64ToBytes(value);
}
