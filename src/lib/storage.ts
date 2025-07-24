import { SecretData } from './crypto';
import { isDateUnlockedSecure } from './crypto';

export interface ProfileSecret {
  id: string;
  createdAt: string;
  messagePreview: string; // First 50 chars of message
  unlockDate: string;
  senderName?: string;
  hint?: string;
  encryptedUrl: string;
  isUnlocked?: boolean; // Calculated dynamically
}

const STORAGE_KEY = 'coming-secrets-profile';

/**
 * Generate a unique ID for a secret
 */
function generateSecretId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Get message preview (first 50 characters)
 */
function getMessagePreview(message: string): string {
  return message.length > 50 ? message.substring(0, 50) + '...' : message;
}

/**
 * Save a created secret to the user's profile
 */
export function saveSecretToProfile(secretData: SecretData, encryptedUrl: string): string {
  try {
    const existingSecrets = getProfileSecrets();
    
    const profileSecret: ProfileSecret = {
      id: generateSecretId(),
      createdAt: new Date().toISOString(),
      messagePreview: getMessagePreview(secretData.message),
      unlockDate: secretData.unlockDate,
      senderName: secretData.senderName,
      hint: secretData.hint,
      encryptedUrl,
    };
    
    const updatedSecrets = [profileSecret, ...existingSecrets];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSecrets));
    
    return profileSecret.id;
  } catch (error) {
    console.error('Failed to save secret to profile:', error);
    throw new Error('Failed to save secret to profile');
  }
}

/**
 * Get all secrets from the user's profile
 */
export function getProfileSecrets(): ProfileSecret[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to retrieve profile secrets:', error);
    return [];
  }
}

/**
 * Get all secrets with unlock status calculated
 */
export async function getProfileSecretsWithStatus(): Promise<ProfileSecret[]> {
  const secrets = getProfileSecrets();
  
  // Calculate unlock status for each secret
  const secretsWithStatus = await Promise.all(
    secrets.map(async (secret) => ({
      ...secret,
      isUnlocked: await isDateUnlockedSecure(secret.unlockDate),
    }))
  );
  
  return secretsWithStatus;
}

/**
 * Delete a specific secret from the profile
 */
export function deleteSecretFromProfile(secretId: string): boolean {
  try {
    const existingSecrets = getProfileSecrets();
    const filteredSecrets = existingSecrets.filter(secret => secret.id !== secretId);
    
    if (filteredSecrets.length === existingSecrets.length) {
      return false; // Secret not found
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredSecrets));
    return true;
  } catch (error) {
    console.error('Failed to delete secret from profile:', error);
    return false;
  }
}

/**
 * Clear all secrets from the profile
 */
export function clearAllSecrets(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear all secrets:', error);
    return false;
  }
}

/**
 * Get profile statistics
 */
export async function getProfileStatistics(): Promise<{
  totalSecrets: number;
  lockedSecrets: number;
  unlockedSecrets: number;
}> {
  const secrets = await getProfileSecretsWithStatus();
  
  return {
    totalSecrets: secrets.length,
    lockedSecrets: secrets.filter(secret => !secret.isUnlocked).length,
    unlockedSecrets: secrets.filter(secret => secret.isUnlocked).length,
  };
}

/**
 * Check if local storage is available
 */
export function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}