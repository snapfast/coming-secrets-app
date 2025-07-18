"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  decryptMessage,
  isDateUnlocked,
  getTimeRemaining,
  SecretData,
} from "@/lib/crypto";

function ViewSecretContent() {
  const searchParams = useSearchParams();
  const [secretData, setSecretData] = useState<SecretData | null>(null);
  const [error, setError] = useState<string>("");
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentHint, setCurrentHint] = useState<string>("");

  useEffect(() => {
    const data = searchParams.get("love");
    if (!data) {
      setError("No secret data found in URL");
      return;
    }

    try {
      const decrypted = decryptMessage(data);
      setSecretData(decrypted);

      const unlocked = isDateUnlocked(decrypted.unlockDate);
      setIsUnlocked(unlocked);

      if (!unlocked) {
        const updateTimer = () => {
          const remaining = getTimeRemaining(decrypted.unlockDate);
          setTimeRemaining(remaining);

          if (remaining.total <= 0) {
            setShowCelebration(true);
            setTimeout(() => {
              setShowCelebration(false);
              setIsUnlocked(true);
            }, 3000);
          }
        };

        // Update progressive hints
        const updateHints = () => {
          if (decrypted.hints && decrypted.hints.length > 0) {
            const remaining = getTimeRemaining(decrypted.unlockDate);
            const now = new Date().getTime();
            const unlockTime = new Date(decrypted.unlockDate).getTime();
            const totalDuration = unlockTime - (now - remaining.total);
            const elapsed = now - (unlockTime - totalDuration);
            const progress = Math.max(0, Math.min(1, elapsed / totalDuration));
            
            const hintIndex = Math.floor(progress * decrypted.hints.length);
            if (hintIndex >= 0 && hintIndex < decrypted.hints.length) {
              setCurrentHint(decrypted.hints[hintIndex]);
            }
          }
        };
        
        updateHints();
        const hintInterval = setInterval(updateHints, 30000); // Update hints every 30 seconds

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => {
          clearInterval(interval);
          clearInterval(hintInterval);
        };
      }
    } catch {
      setError("Invalid or corrupted secret link");
    }
  }, [searchParams]);

  if (error) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center bg-gradient-to-br from-orange-600 via-pink-600 to-purple-700 dark:from-orange-700 dark:via-pink-700 dark:to-purple-800">
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 max-w-md w-full text-center border border-red-400/50 dark:border-red-500/50 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-red-100/30 dark:bg-red-900/30 rounded-full blur-xl"></div>
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-orange-100/20 dark:bg-orange-900/20 rounded-full blur-xl"></div>
          
          <div className="relative z-10">
            <div className="text-red-500 text-6xl mb-4 drop-shadow-sm">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 drop-shadow-sm">
              Error
            </h1>
            <p className="text-gray-700 dark:text-gray-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!secretData) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center bg-gradient-to-br from-orange-600 via-pink-600 to-purple-700 dark:from-orange-700 dark:via-pink-700 dark:to-purple-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/70 mx-auto mb-4 drop-shadow-lg"></div>
          <p className="text-white/90 dark:text-white/80 drop-shadow-md font-medium">Loading secret...</p>
        </div>
      </div>
    );
  }

  // Celebration animation overlay
  if (showCelebration) {
    return (
      <div className="min-h-screen p-8 relative overflow-hidden bg-gradient-to-br from-orange-600 via-pink-600 to-purple-700 dark:from-orange-700 dark:via-pink-700 dark:to-purple-800">
        {/* Celebration Effects */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-4 h-4 bg-yellow-400 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            ></div>
          ))}
        </div>
        
        <div className="flex items-center justify-center min-h-screen relative z-10">
          <div className="text-center">
            <div className="text-9xl mb-4 animate-bounce">🎉</div>
            <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-2xl animate-pulse">
              Unlocking...
            </h1>
            <div className="text-6xl font-bold text-white drop-shadow-2xl animate-pulse">
              3... 2... 1...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen p-8 relative overflow-hidden bg-gradient-to-br from-orange-600 via-pink-600 to-purple-700 dark:from-orange-700 dark:via-pink-700 dark:to-purple-800">
        {/* Floating decorative elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 dark:bg-white/5 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-yellow-300/20 dark:bg-yellow-400/15 rounded-full blur-lg animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-pink-400/15 dark:bg-pink-500/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-purple-300/20 dark:bg-purple-400/15 rounded-full blur-xl animate-bounce" style={{animationDelay: '3s'}}></div>
        
        {/* Create New Message button at top */}
        <div className="max-w-2xl mx-auto pt-8 pb-4 relative z-10">
          <div className="flex justify-end mb-4">
            <Link
              href="/"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:ring-offset-2 shadow-lg backdrop-blur-sm"
            >
              Create New Message
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] relative z-10">
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 max-w-lg w-full text-center border border-white/30 dark:border-gray-700/30 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-100/30 dark:bg-purple-900/30 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-pink-100/20 dark:bg-pink-900/20 rounded-full blur-xl"></div>
            
            <div className="relative z-10">
              {/* Sender Info */}
              {secretData.senderName && (
                <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200/50 dark:border-purple-700/50">
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    From: <span className="font-medium">{secretData.senderName}</span>
                  </p>
                </div>
              )}
              
              <div className="text-6xl mb-4 drop-shadow-lg">🔒</div>
              <h1 className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-4 drop-shadow-sm">
                Secret Locked
              </h1>
              <p className="text-purple-800 dark:text-purple-200 mb-6">
                This secret will unlock on{" "}
                {new Date(secretData.unlockDate).toLocaleString()}
              </p>

              {/* Enhanced Countdown Display */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 mb-6 border border-purple-200/50 dark:border-purple-700/50 shadow-inner">
                <h2 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
                  Time Remaining:
                </h2>
                
                {/* Multiple format display */}
                <div className="mb-4">
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                        {timeRemaining.days}
                      </div>
                      <div className="text-sm text-purple-700 dark:text-purple-300">Days</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                        {timeRemaining.hours}
                      </div>
                      <div className="text-sm text-purple-700 dark:text-purple-300">Hours</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                        {timeRemaining.minutes}
                      </div>
                      <div className="text-sm text-purple-700 dark:text-purple-300">Minutes</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                        {timeRemaining.seconds}
                      </div>
                      <div className="text-sm text-purple-700 dark:text-purple-300">Seconds</div>
                    </div>
                  </div>
                  
                  {/* Alternative format for close deadlines */}
                  {timeRemaining.days === 0 && timeRemaining.hours < 24 && (
                    <div className="mt-3 pt-3 border-t border-purple-200/50 dark:border-purple-700/50">
                      <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Alternative view:</p>
                      <div className="text-lg font-mono text-purple-800 dark:text-purple-200">
                        {String(timeRemaining.hours).padStart(2, '0')}:
                        {String(timeRemaining.minutes).padStart(2, '0')}:
                        {String(timeRemaining.seconds).padStart(2, '0')}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-purple-200/50 dark:bg-purple-800/50 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.max(0, Math.min(100, ((new Date().getTime() - new Date(secretData.unlockDate).getTime() + timeRemaining.total) / (new Date().getTime() - new Date(secretData.unlockDate).getTime() + timeRemaining.total)) * 100))}%`
                    }}
                  ></div>
                </div>
              </div>

              {/* Progressive Hints */}
              {currentHint && (
                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200/50 dark:border-yellow-700/50">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-1">💡 Hint:</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">{currentHint}</p>
                </div>
              )}

              <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
                Please check back when the countdown reaches zero!
              </p>
              
              {/* Inline Calendar Integration */}
              <div className="pt-4 border-t border-purple-300/50 dark:border-purple-600/50">
                <p className="text-sm text-purple-600 dark:text-purple-400 mb-3">
                  Want a reminder?
                </p>
                
                <div className="flex gap-2 justify-center flex-wrap">
                  <button
                    onClick={() => {
                      const eventDate = new Date(secretData.unlockDate);
                      const title = encodeURIComponent('Secret Message Unlocks!');
                      const details = encodeURIComponent(`Your secret message will be available to read. Click to view: ${window.location.href}`);
                      const startDate = eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                      const endDate = new Date(eventDate.getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                      const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}`;
                      window.open(googleUrl, '_blank');
                    }}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium py-2 px-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg text-sm"
                  >
                    📅 Google
                  </button>
                  
                  <button
                    onClick={() => {
                      const eventDate = new Date(secretData.unlockDate);
                      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Coming Secrets//EN
BEGIN:VEVENT
DTSTART:${eventDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${new Date(eventDate.getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:Secret Message Unlocks!
DESCRIPTION:Your secret message will be available to read. Click to view: ${window.location.href}
END:VEVENT
END:VCALENDAR`;
                      const blob = new Blob([icsContent], { type: 'text/calendar' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'secret-message-reminder.ics';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 text-white font-medium py-2 px-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-lg text-sm"
                  >
                    📱 Apple/Outlook
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 relative overflow-hidden bg-gradient-to-br from-orange-600 via-pink-600 to-purple-700 dark:from-orange-700 dark:via-pink-700 dark:to-purple-800">
      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 dark:bg-white/5 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-40 right-20 w-24 h-24 bg-yellow-300/20 dark:bg-yellow-400/15 rounded-full blur-lg animate-bounce" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-pink-400/15 dark:bg-pink-500/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-purple-300/20 dark:bg-purple-400/15 rounded-full blur-xl animate-bounce" style={{animationDelay: '3s'}}></div>
      
      {/* Create New Message button at top */}
      <div className="max-w-2xl mx-auto pt-8 pb-4 relative z-10">
        <div className="flex justify-end mb-4">
          <Link
            href="/"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:scale-105 backdrop-blur-sm"
          >
            Create New Message
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto pt-8 relative z-10">
        <div className="text-center mb-8 relative">
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-green-400/20 rounded-full blur-xl"></div>
          <div className="text-6xl mb-4 relative z-10 drop-shadow-2xl">🎉</div>
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-2xl relative z-10" style={{textShadow: '0 0 20px rgba(255,255,255,0.3), 0 0 40px rgba(255,255,255,0.1)'}}>
            Secret Unlocked!
          </h1>
          <p className="text-white/90 dark:text-white/80 drop-shadow-lg font-medium relative z-10">
            Your time-locked message is now available
          </p>
          {/* Decorative line */}
          <div className="mt-4 mx-auto w-24 h-0.5 bg-gradient-to-r from-transparent via-green-400/60 to-transparent"></div>
        </div>

        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-white/30 dark:border-gray-700/30 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-green-100/30 dark:bg-green-900/30 rounded-full blur-xl"></div>
          <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-emerald-100/20 dark:bg-emerald-900/20 rounded-full blur-xl"></div>
          
          <div className="relative z-10">
          {/* Sender Info */}
          {secretData.senderName && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200/50 dark:border-green-700/50">
              <p className="text-sm text-green-700 dark:text-green-300">
                From: <span className="font-medium">{secretData.senderName}</span>
              </p>
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-purple-900 dark:text-purple-200 mb-2">
              Secret Message:
            </label>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200/50 dark:border-purple-700/50 shadow-inner">
              <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                {secretData.message}
              </p>
            </div>
          </div>

          <div className="text-center pt-4 border-t border-purple-300/50 dark:border-purple-600/50">
            <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
              Unlocked on {new Date(secretData.unlockDate).toLocaleString()}
            </p>
            
            {/* Reaction/Reply Section */}
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200/50 dark:border-green-700/50">
              <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                How did this message make you feel?
              </p>
              <div className="flex gap-2 justify-center flex-wrap">
                <button className="text-2xl px-3 py-2 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-sm transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                  ❤️
                </button>
                <button className="text-2xl px-3 py-2 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-sm transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                  😍
                </button>
                <button className="text-2xl px-3 py-2 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-sm transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                  😭
                </button>
                <button className="text-2xl px-3 py-2 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-sm transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                  😲
                </button>
                <button className="text-2xl px-3 py-2 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-sm transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                  😄
                </button>
                <button className="text-2xl px-3 py-2 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-sm transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                  👏
                </button>
              </div>
              <div className="mt-3">
                <textarea
                  placeholder="Want to send a reply? Write your thoughts here..."
                  className="w-full px-3 py-2 border border-green-300 dark:border-green-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700/80 dark:text-white text-sm"
                  rows={3}
                />
                <button className="mt-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-lg text-sm">
                  Send Reply
                </button>
              </div>
            </div>
            
            {/* Calendar integration option for viewers */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Want to remember this date? Add it to your calendar:
              </p>
              <div className="flex gap-2 justify-center flex-wrap">
                <button
                  onClick={() => {
                    const eventDate = new Date(secretData.unlockDate);
                    const title = encodeURIComponent('Secret Message Unlocked!');
                    const details = encodeURIComponent(`Your secret message was unlocked. Message: ${secretData.message}`);
                    const startDate = eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                    const endDate = new Date(eventDate.getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}`;
                    window.open(googleUrl, '_blank');
                  }}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium py-2 px-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg text-sm"
                >
                  📅 Google Calendar
                </button>
                
                <button
                  onClick={() => {
                    const eventDate = new Date(secretData.unlockDate);
                    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Coming Secrets//EN
BEGIN:VEVENT
DTSTART:${eventDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${new Date(eventDate.getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:Secret Message Unlocked!
DESCRIPTION:Your secret message was unlocked. Message: ${secretData.message}
END:VEVENT
END:VCALENDAR`;
                    const blob = new Blob([icsContent], { type: 'text/calendar' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'secret-message-unlocked.ics';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 text-white font-medium py-2 px-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-lg text-sm"
                >
                  📱 Apple/Outlook
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export default function ViewSecret() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen p-8 flex items-center justify-center bg-gradient-to-br from-orange-600 via-pink-600 to-purple-700 dark:from-orange-700 dark:via-pink-700 dark:to-purple-800">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/70 mx-auto mb-4 drop-shadow-lg"></div>
            <p className="text-white/90 dark:text-white/80 drop-shadow-md font-medium">
              Loading secret...
            </p>
          </div>
        </div>
      }
    >
      <ViewSecretContent />
    </Suspense>
  );
}
