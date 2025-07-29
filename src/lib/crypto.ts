import CryptoJS from 'crypto-js';
import { compress, decompress } from 'brotli-compress';
import { isDateUnlockedServer, getTimeRemainingServer } from './time';

export interface SecretData {
  message: string;
  unlockDate: string;
  createDate: string;
  senderName?: string;
  hint?: string;
}

const SECRET_KEY = 'comings-secrets-app-key';

// Base64URL encoding (URL-safe without padding)
function base64urlEncode(data: Uint8Array): string {
  return btoa(String.fromCharCode(...data))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64urlDecode(str: string): Uint8Array {
  // Add back padding if needed
  const padded = str + '='.repeat((4 - str.length % 4) % 4);
  const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  return new Uint8Array(binary.split('').map(c => c.charCodeAt(0)));
}

// Compression utilities using Brotli
async function compressData(jsonString: string): Promise<string> {
  try {
    const textEncoder = new TextEncoder();
    const textBytes = textEncoder.encode(jsonString);
    const compressed = await compress(textBytes);
    return base64urlEncode(compressed);
  } catch (error) {
    console.error('Brotli compression failed:', error);
    throw new Error('Failed to compress data');
  }
}

async function decompressData(compressedData: string): Promise<string> {
  try {
    const compressed = base64urlDecode(compressedData);
    const decompressed = await decompress(compressed);
    const textDecoder = new TextDecoder();
    return textDecoder.decode(decompressed);
  } catch (error) {
    console.error('Brotli decompression failed:', error);
    throw new Error('Failed to decompress data');
  }
}

export async function encryptMessage(data: SecretData): Promise<string> {
  try {
    // Step 1: Convert to JSON
    const jsonString = JSON.stringify(data);
    
    // Step 2: Compress the data with Brotli
    const compressed = await compressData(jsonString);
    
    // Step 3: Encrypt the compressed data
    const encrypted = CryptoJS.AES.encrypt(compressed, SECRET_KEY).toString();
    
    // Step 4: Make URL-safe (base64url encode)
    const textEncoder = new TextEncoder();
    const urlSafe = base64urlEncode(textEncoder.encode(encrypted));
    
    // Step 5: Add version prefix (v3 for Brotli)
    return 'v3:' + urlSafe;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt message');
  }
}

export async function decryptMessage(encryptedData: string): Promise<SecretData> {
  try {
    if (!encryptedData.startsWith('v3:')) {
      throw new Error('Invalid message format');
    }
    
    // Current Brotli format
    const urlSafeData = encryptedData.substring(3); // Remove 'v3:' prefix
    
    // Step 1: Decode from base64url
    const encryptedBytes = base64urlDecode(urlSafeData);
    const textDecoder = new TextDecoder();
    const encryptedString = textDecoder.decode(encryptedBytes);
    
    // Step 2: Decrypt
    const decrypted = CryptoJS.AES.decrypt(encryptedString, SECRET_KEY);
    const compressedData = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!compressedData) {
      throw new Error('Invalid encrypted data');
    }
    
    // Step 3: Decompress with Brotli
    const jsonString = await decompressData(compressedData);
    
    // Step 4: Parse JSON
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt message');
  }
}

export function isDateUnlocked(unlockDate: string): boolean {
  const unlock = new Date(unlockDate);
  const now = new Date();
  return now >= unlock;
}

export async function isDateUnlockedSecure(unlockDate: string): Promise<boolean> {
  return await isDateUnlockedServer(unlockDate);
}

export function getTimeRemaining(unlockDate: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
} {
  const unlock = new Date(unlockDate);
  const now = new Date();
  const total = unlock.getTime() - now.getTime();
  
  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }
  
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((total % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds, total };
}

export async function getTimeRemainingSecure(unlockDate: string): Promise<{
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}> {
  return await getTimeRemainingServer(unlockDate);
}