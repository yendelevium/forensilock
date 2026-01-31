export async function generateNotebookKey() {
  return window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
  );
}

export async function wrapKeyForServer(aesKey: CryptoKey) {
  const pem = process.env.NEXT_PUBLIC_PUBLIC_KEY;
  if (!pem) throw new Error("Public Key not found in Environment");

  const binaryDerString = window.atob(pem.replace(/-----(BEGIN|END) PUBLIC KEY-----/g, "").replace(/\s/g, ""));
  const binaryDer = new Uint8Array(binaryDerString.length);
  for (let i = 0; i < binaryDerString.length; i++) binaryDer[i] = binaryDerString.charCodeAt(i);
  
  const serverKey = await window.crypto.subtle.importKey(
    "spki",
    binaryDer.buffer,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["wrapKey"]
  );
  
  const wrapped = await window.crypto.subtle.wrapKey(
    "raw",
    aesKey,
    serverKey,
    { name: "RSA-OAEP" }
  );
  
  return window.btoa(String.fromCharCode(...new Uint8Array(wrapped)));
}

export async function encryptNote(text: string, aesKey: CryptoKey) {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(text);
  
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    aesKey,
    encoded
  );
  
  const buffer = new Uint8Array(iv.byteLength + encrypted.byteLength);
  buffer.set(iv, 0);
  buffer.set(new Uint8Array(encrypted), iv.byteLength);
  
  return window.btoa(String.fromCharCode(...buffer));
}

export async function decryptNote(base64: string, aesKey: CryptoKey) {
  try {
    const data = Uint8Array.from(window.atob(base64), c => c.charCodeAt(0));
    const iv = data.slice(0, 12);
    const ciphertext = data.slice(12);
    
    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      aesKey,
      ciphertext
    );
    
    return new TextDecoder().decode(decrypted);
  } catch (e) {
    return "Locked Note";
  }
}

export async function importNotebookKey(rawKeyBase64: string) {
  const binaryString = window.atob(rawKeyBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);

  return window.crypto.subtle.importKey(
    "raw",
    bytes,
    { name: "AES-GCM" },
    true,
    ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
  );
}