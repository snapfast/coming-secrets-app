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
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-red-900 p-8 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full text-center border border-purple-800 dark:border-purple-700">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Error
          </h1>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!secretData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 dark:from-gray-900 dark:to-purple-900 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading secret...</p>
        </div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 dark:from-gray-900 dark:to-purple-900 p-8">
        {/* Create New Message button at top */}
        <div className="max-w-2xl mx-auto pt-8 pb-4">
          <div className="flex justify-end mb-4">
            <Link
              href="/"
              className="bg-purple-800 hover:bg-purple-900 text-white font-medium py-2 px-6 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:ring-offset-2"
            >
              Create New Message
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full text-center border border-purple-800 dark:border-purple-700">
            <div className="text-purple-500 text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-4">
              Secret Locked
            </h1>
            <p className="text-purple-800 dark:text-purple-300 mb-6">
              This secret will unlock on{" "}
              {new Date(secretData.unlockDate).toLocaleString()}
            </p>

            <div className="bg-purple-900/10 dark:bg-purple-900/20 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
                Time Remaining:
              </h2>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <div className="text-2xl font-bold text-purple-800">
                    {timeRemaining.days}
                  </div>
                  <div className="text-sm text-purple-700">Days</div>
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

            <p className="text-sm text-purple-700 dark:text-purple-400">
              Please check back when the countdown reaches zero!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 dark:from-gray-900 dark:to-purple-900 p-8">
      {/* Create New Message button at top */}
      <div className="max-w-2xl mx-auto pt-8 pb-4">
        <div className="flex justify-end mb-4">
          <Link
            href="/"
            className="bg-purple-800 hover:bg-purple-900 text-white font-medium py-2 px-6 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:ring-offset-2"
          >
            Create New Message
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto pt-8">
        <div className="text-center mb-8">
          <div className="text-purple-500 text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-white dark:text-purple-100 mb-2">
            Secret Unlocked!
          </h1>
          <p className="text-purple-200 dark:text-purple-300">
            Your time-locked message is now available
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-purple-800 dark:border-purple-700">
          {secretData.senderEmail && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-purple-900 dark:text-purple-300 mb-1">
                From:
              </label>
              <p className="text-gray-900 dark:text-white">
                {secretData.senderEmail}
              </p>
            </div>
          )}

          {secretData.recipientEmail && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-purple-900 dark:text-purple-300 mb-1">
                To:
              </label>
              <p className="text-gray-900 dark:text-white">
                {secretData.recipientEmail}
              </p>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-purple-900 dark:text-purple-300 mb-2">
              Secret Message:
            </label>
            <div className="bg-purple-900/10 dark:bg-purple-900/20 rounded-lg p-4">
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                {secretData.message}
              </p>
            </div>
          </div>

          <div className="text-center pt-4 border-t border-purple-800 dark:border-purple-600">
            <p className="text-sm text-purple-700 dark:text-purple-400 mb-4">
              Unlocked on {new Date(secretData.unlockDate).toLocaleString()}
            </p>
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
        <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 dark:from-gray-900 dark:to-purple-900 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">
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
