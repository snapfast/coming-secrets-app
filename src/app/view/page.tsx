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
            setIsUnlocked(true);
          }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
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
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 max-w-md w-full text-center border border-white/30 dark:border-gray-700/30 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-100/30 dark:bg-purple-900/30 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-pink-100/20 dark:bg-pink-900/20 rounded-full blur-xl"></div>
            
            <div className="relative z-10">
              <div className="text-6xl mb-4 drop-shadow-lg">🔒</div>
              <h1 className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-4 drop-shadow-sm">
                Secret Locked
              </h1>
              <p className="text-purple-800 dark:text-purple-200 mb-6">
                This secret will unlock on{" "}
                {new Date(secretData.unlockDate).toLocaleString()}
              </p>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 mb-6 border border-purple-200/50 dark:border-purple-700/50 shadow-inner">
              <h2 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
                Time Remaining:
              </h2>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                    {timeRemaining.days}
                  </div>
                  <div className="text-sm text-purple-700 dark:text-purple-300">Days</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-800">
                    {timeRemaining.hours}
                  </div>
                  <div className="text-sm text-purple-700">Hours</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-800">
                    {timeRemaining.minutes}
                  </div>
                  <div className="text-sm text-purple-700">Minutes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-800">
                    {timeRemaining.seconds}
                  </div>
                  <div className="text-sm text-purple-700">Seconds</div>
                </div>
              </div>
            </div>

            <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
              Please check back when the countdown reaches zero!
            </p>
            
            {/* Calendar integration option for viewers */}
            <div className="pt-4 border-t border-purple-300/50 dark:border-purple-600/50">
              <p className="text-sm text-purple-600 dark:text-purple-400 mb-3">
                Want a reminder? Add this to your calendar:
              </p>
              <button
                onClick={() => {
                  const calendarUrl = `/calendar?love=${encodeURIComponent(searchParams.get("love") || "")}`;
                  window.location.href = calendarUrl;
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg"
              >
                📅 Add to Calendar
              </button>
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
            
            {/* Calendar integration option for viewers */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Want to remember this date? Add it to your calendar:
              </p>
              <button
                onClick={() => {
                  const calendarUrl = `/calendar?love=${encodeURIComponent(searchParams.get("love") || "")}`;
                  window.location.href = calendarUrl;
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg"
              >
                📅 Add to Calendar
              </button>
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
