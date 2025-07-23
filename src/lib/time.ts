/**
 * Server UTC Time Utilities
 * 
 * Provides secure time synchronization using server UTC time instead of local device time.
 * This prevents users from manipulating their device clock to unlock messages early.
 */


let timeOffset: number | null = null;
let lastSyncTime: number = 0;
const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches UTC time from a reliable server source
 */
async function fetchServerTime(): Promise<number> {
  try {
    // Use WorldTimeAPI for UTC time - no API key required
    const response = await fetch('https://worldtimeapi.org/api/timezone/UTC', {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch server time');
    }
    
    const data = await response.json();
    return new Date(data.datetime).getTime();
  } catch (error) {
    console.warn('WorldTimeAPI failed, trying fallback method:', error);
    
    // Fallback: Use HTTP Date header from our own server or any CORS-enabled server
    try {
      const response = await fetch(window.location.origin + '/', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      const dateHeader = response.headers.get('date');
      if (dateHeader) {
        return new Date(dateHeader).getTime();
      }
      throw new Error('No date header found');
    } catch (fallbackError) {
      console.warn('HTTP date header fallback failed:', fallbackError);
      
      // Last resort: Use local time but warn about potential security issue
      console.warn('Using local time - security warning: users can manipulate device clock');
      return Date.now();
    }
  }
}

/**
 * Synchronizes local time with server time and calculates offset
 */
async function syncTime(): Promise<void> {
  const localTime = Date.now();
  const serverTime = await fetchServerTime();
  
  timeOffset = serverTime - localTime;
  lastSyncTime = localTime;
  
  console.log(`Time synchronized. Offset: ${timeOffset}ms`);
}

/**
 * Gets the current server UTC time
 * Automatically syncs if needed or if too much time has passed
 */
export async function getServerTime(): Promise<number> {
  const now = Date.now();
  
  // Sync if we haven't synced yet or if it's been too long
  if (timeOffset === null || (now - lastSyncTime) > SYNC_INTERVAL) {
    await syncTime();
  }
  
  return now + (timeOffset || 0);
}

/**
 * Gets server time synchronously using cached offset
 * Use this for frequent operations like timers
 */
export function getServerTimeSync(): number {
  if (timeOffset === null) {
    console.warn('Time not synchronized yet, using local time');
    return Date.now();
  }
  
  return Date.now() + timeOffset;
}

/**
 * Checks if a date has been unlocked based on server time
 */
export async function isDateUnlockedServer(unlockDate: string): Promise<boolean> {
  const serverTime = await getServerTime();
  const unlockTime = new Date(unlockDate).getTime();
  
  return serverTime >= unlockTime;
}

/**
 * Gets time remaining using server time
 */
export async function getTimeRemainingServer(unlockDate: string): Promise<{
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}> {
  const serverTime = await getServerTime();
  const unlockTime = new Date(unlockDate).getTime();
  const difference = unlockTime - serverTime;

  if (difference > 0) {
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, total: difference };
  }

  return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
}

/**
 * Gets time remaining synchronously using cached server time
 * Use this for frequent timer updates
 */
export function getTimeRemainingServerSync(unlockDate: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
} {
  const serverTime = getServerTimeSync();
  const unlockTime = new Date(unlockDate).getTime();
  const difference = unlockTime - serverTime;

  if (difference > 0) {
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, total: difference };
  }

  return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
}

/**
 * Initialize time synchronization on app load
 */
export async function initTimeSync(): Promise<void> {
  try {
    await syncTime();
  } catch (error) {
    console.error('Failed to initialize time sync:', error);
  }
}