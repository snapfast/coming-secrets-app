import CryptoJS from 'crypto-js';
import { isDateUnlockedServer, getTimeRemainingServer } from './time';

export interface SecretData {
  message: string;
  unlockDate: string;
  senderName?: string;
  hints?: string[];
}

const SECRET_KEY = 'comings-secrets-app-key';

export function encryptMessage(data: SecretData): string {
  try {
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
    return encodeURIComponent(encrypted);
  } catch {
    throw new Error('Failed to encrypt message');
  }
}

export function decryptMessage(encryptedData: string): SecretData {
  try {
    const decoded = decodeURIComponent(encryptedData);
    const decrypted = CryptoJS.AES.decrypt(decoded, SECRET_KEY);
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!jsonString) {
      throw new Error('Invalid encrypted data');
    }
    
    return JSON.parse(jsonString);
  } catch {
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