"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  decryptMessage,
  isDateUnlockedSecure,
  SecretData,
} from "@/lib/crypto";
import { trackSecretViewed, trackCalendarReminder } from "@/lib/analytics";
import { initTimeSync, getTimeRemainingServerSync } from "@/lib/time";

// Generate Google Calendar URL with proper encoding
function generateGoogleCalendarUrl(
  unlockDate: string,
  messageUrl: string
): string {
  const startDate = new Date(unlockDate);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

  // Format dates as YYYYMMDDTHHMMSSZ (UTC)
  const formatDate = (date: Date) => {
    return date
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  };

  const startFormatted = formatDate(startDate);
  const endFormatted = formatDate(endDate);

  const eventDetails = {
    action: "TEMPLATE",
    text: "Secret Message Ready to Open",
    dates: `${startFormatted}/${endFormatted}`,
    details: ` Your secret message is ready to open! \n\nClick the link to view it: ${messageUrl}\n\n✨ Created with Coming Secrets - Send time-locked messages that unlock on a specific date!\n\n🔒 Perfect for:\n• Birthday surprises\n• Anniversary messages\n• Future reminders\n• Secret reveals\n• Time capsule notes\n\n🌟 Try it yourself at comingss.netlify.app\n\n#ComingSecrets #TimeLocked #SecretMessage #TimeCapule`,
    location: "",
    sf: "true",
    output: "xml",
  };

  const params = new URLSearchParams(eventDetails);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// Generate Outlook Calendar URL with proper encoding
function generateOutlookCalendarUrl(
  unlockDate: string,
  messageUrl: string
): string {
  const startDate = new Date(unlockDate);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

  const eventDetails = {
    subject: "Secret Message Ready to Open",
    startdt: startDate.toISOString(),
    enddt: endDate.toISOString(),
    body: ` Your secret message is ready to open! \n\nClick the link to view it: ${messageUrl}\n\n✨ Created with Coming Secrets - Send time-locked messages that unlock on a specific date!\n\n🔒 Perfect for:\n• Birthday surprises\n• Anniversary messages\n• Future reminders\n• Secret reveals\n• Time capsule notes\n\n🌟 Try it yourself at comingss.netlify.app\n\n#ComingSecrets #TimeLocked #SecretMessage #TimeCapule`,
    location: "",
    path: "/calendar/action/compose",
  };

  const params = new URLSearchParams(eventDetails);
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

// Generate Apple Calendar iCal/ICS file content
function generateAppleCalendarICS(
  unlockDate: string,
  messageUrl: string
): string {
  const startDate = new Date(unlockDate);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

  const formatDate = (date: Date) => {
    return date
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  };

  const startFormatted = formatDate(startDate);
  const endFormatted = formatDate(endDate);

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Coming Secrets//EN
BEGIN:VEVENT
DTSTAMP:${formatDate(new Date())}
DTSTART:${startFormatted}
DTEND:${endFormatted}
SUMMARY:Secret Message Ready to Open
DESCRIPTION: Your secret message is ready to open! \n\nClick the link to view it: ${messageUrl}\n\n✨ Created with Coming Secrets - Send time-locked messages that unlock on a specific date!\n\n🔒 Perfect for:\n• Birthday surprises\n• Anniversary messages\n• Future reminders\n• Secret reveals\n• Time capsule notes\n\n🌟 Try it yourself at comingss.netlify.app\n\n#ComingSecrets #TimeLocked #SecretMessage #TimeCapule
END:VEVENT
END:VCALENDAR`;
}

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
  const [calendarError, setCalendarError] = useState<string>("");

  const handleAddToCalendar = (provider: string) => {
    if (!secretData) return;

    trackCalendarReminder(provider);
    setCalendarError("");
    const currentUrl = window.location.href;

    try {
      if (provider === "google") {
        const calendarUrl = generateGoogleCalendarUrl(
          secretData.unlockDate,
          currentUrl
        );

        // Open Google Calendar in popup window
        const popup = window.open(
          calendarUrl,
          "google-calendar-popup",
          "width=800,height=600,scrollbars=yes,resizable=yes,location=yes"
        );

        // Check if popup was blocked
        if (!popup || popup.closed || typeof popup.closed === "undefined") {
          setCalendarError(
            "Popup blocked. Please allow popups for this site and try again."
          );
          return;
        }

        // Focus the popup if it opened successfully
        if (popup) {
          popup.focus();
        }
      } else if (provider === "outlook") {
        const calendarUrl = generateOutlookCalendarUrl(
          secretData.unlockDate,
          currentUrl
        );

        // Open Outlook Calendar in popup window
        const popup = window.open(
          calendarUrl,
          "outlook-calendar-popup",
          "width=800,height=600,scrollbars=yes,resizable=yes,location=yes"
        );

        // Check if popup was blocked
        if (!popup || popup.closed || typeof popup.closed === "undefined") {
          setCalendarError(
            "Popup blocked. Please allow popups for this site and try again."
          );
          return;
        }

        // Focus the popup if it opened successfully
        if (popup) {
          popup.focus();
        }
      } else if (provider === "apple") {
        // Generate and download ICS file for Apple Calendar
        const icsContent = generateAppleCalendarICS(
          secretData.unlockDate,
          currentUrl
        );

        const blob = new Blob([icsContent], {
          type: "text/calendar;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "secret-message-reminder.ics";
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Calendar integration error:", error);
      setCalendarError(
        `Failed to add reminder to ${
          provider === "google"
            ? "Google Calendar"
            : provider === "apple"
            ? "Apple Calendar"
            : "Outlook Calendar"
        }. Please try again.`
      );
    }
  };

  useEffect(() => {
    const initializeSecretViewing = async () => {
      const data = searchParams.get("love");
      if (!data) {
        setError("No secret data found in URL");
        return;
      }

      try {
        // Initialize time synchronization
        await initTimeSync();
        
        const decrypted = await decryptMessage(data);
        setSecretData(decrypted);

        // Use secure server time for unlock check
        const unlocked = await isDateUnlockedSecure(decrypted.unlockDate);
        setIsUnlocked(unlocked);
        
        // Track secret viewing
        trackSecretViewed(unlocked);

        if (!unlocked) {
          const updateTimer = () => {
            // Use server time synchronously for frequent timer updates
            const remaining = getTimeRemainingServerSync(decrypted.unlockDate);
            setTimeRemaining(remaining);

            if (remaining.total <= 0) {
              setShowCelebration(true);
              setTimeout(() => {
                setShowCelebration(false);
                setIsUnlocked(true);
                // Track when message unlocks
                trackSecretViewed(true);
              }, 3000);
            }
          };

          updateTimer(); // Initial call
          
          const timerInterval = setInterval(updateTimer, 1000);

          return () => {
            clearInterval(timerInterval);
          };
        }
      } catch (error) {
        console.error("Error loading secret:", error);
        setError("Failed to load secret message");
      }
    };

    initializeSecretViewing();
  }, [searchParams]);

  if (error) {
    return (
      <div className="cs-page-layout">
        <div className="cs-page-content">
          <div className="cs-page-inner">
            <Header />
            <div className="cs-error-container">
              <div className="cs-error-card">
                <div className="text-red-500 text-6xl mb-4">
                  ❌
                </div>
                <div className="cs-error-title">
                  Error
                </div>
                <div className="cs-error-message">{error}</div>
              </div>
            </div>
            <Footer />
          </div>
        </div>
      </div>
    );
  }

  if (!secretData) {
    return (
      <div className="cs-page-layout">
        <div className="cs-page-content">
          <div className="cs-page-inner">
            <Header />
            <div className="cs-loading-container">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/70 mx-auto mb-4 drop-shadow-lg"></div>
                <p className="cs-loading-text">
                  Loading secret...
                </p>
              </div>
            </div>
            <Footer />
          </div>
        </div>
      </div>
    );
  }

  // Celebration animation overlay
  if (showCelebration) {
    return (
      <div className="cs-page-layout relative overflow-hidden">
        <div className="cs-page-content">
          <div className="cs-page-inner">
            <Header />

            <div className="flex items-center justify-center min-h-[50vh] pb-8 relative z-10">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-2xl">
                  Unlocking...
                </h1>
                <div className="text-2xl text-white drop-shadow-2xl">
                  3... 2... 1...
                </div>
              </div>
            </div>
            <Footer />
          </div>
        </div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="cs-page-layout relative overflow-hidden">
        {/* Floating decorative elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 dark:bg-white/5 rounded-full blur-xl animate-pulse"></div>
        <div
          className="absolute top-40 right-20 w-24 h-24 bg-yellow-300/20 dark:bg-yellow-400/15 rounded-full blur-lg animate-bounce"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-40 left-1/4 w-40 h-40 bg-pink-400/15 dark:bg-pink-500/10 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-20 right-1/3 w-28 h-28 bg-purple-300/20 dark:bg-purple-400/15 rounded-full blur-xl animate-bounce"
          style={{ animationDelay: "3s" }}
        ></div>

        <div className="cs-page-content">
          <div className="cs-page-inner relative z-10">
            <Header />

            {/* Create New Message button */}
            <div className="cs-flex-center mb-4">
              <Link
                href="/"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:ring-offset-2 shadow-lg backdrop-blur-sm"
              >
                Create New Message
              </Link>
            </div>

          <div className="flex items-center justify-center min-h-[50vh] pb-8">
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 mb-8 max-w-2xl w-full text-center border border-white/30 dark:border-gray-700/30 relative overflow-hidden">
              {/* Decorative background elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-100/30 dark:bg-purple-900/30 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-pink-100/20 dark:bg-pink-900/20 rounded-full blur-xl"></div>

              <div className="relative z-10">
                {/* Sender Info */}
                {secretData.senderName && (
                  <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200/50 dark:border-purple-700/50">
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      From:{" "}
                      <span className="font-medium">
                        {secretData.senderName}
                      </span>
                    </p>
                  </div>
                )}

                <h1 className="text-3xl font-bold text-purple-900 dark:text-purple-100 mb-4 drop-shadow-sm">
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
                        <div className="text-sm text-purple-700 dark:text-purple-300">
                          Days
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                          {timeRemaining.hours}
                        </div>
                        <div className="text-sm text-purple-700 dark:text-purple-300">
                          Hours
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                          {timeRemaining.minutes}
                        </div>
                        <div className="text-sm text-purple-700 dark:text-purple-300">
                          Minutes
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                          {timeRemaining.seconds}
                        </div>
                        <div className="text-sm text-purple-700 dark:text-purple-300">
                          Seconds
                        </div>
                      </div>
                    </div>

                    {/* Alternative format for close deadlines */}
                    {timeRemaining.days === 0 && timeRemaining.hours < 24 && (
                      <div className="mt-3 pt-3 border-t border-purple-200/50 dark:border-purple-700/50">
                        <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">
                          Alternative view:
                        </p>
                        <div className="text-lg font-mono text-purple-800 dark:text-purple-200">
                          {String(timeRemaining.hours).padStart(2, "0")}:
                          {String(timeRemaining.minutes).padStart(2, "0")}:
                          {String(timeRemaining.seconds).padStart(2, "0")}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-purple-200/50 dark:bg-purple-800/50 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(
                            100,
                            ((new Date().getTime() -
                              new Date(secretData.unlockDate).getTime() +
                              timeRemaining.total) /
                              (new Date().getTime() -
                                new Date(secretData.unlockDate).getTime() +
                                timeRemaining.total)) *
                              100
                          )
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Hint */}
                {secretData.hint && (
                  <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200/50 dark:border-yellow-700/50">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-1">
                      Hint:
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      {secretData.hint}
                    </p>
                  </div>
                )}

                <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
                  Please check back when the countdown reaches zero!
                </p>

                {/* Smart Reminders */}
                <div className="pt-4 border-t border-purple-300/50 dark:border-purple-600/50">
                  <p className="text-sm text-purple-600 dark:text-purple-400 mb-3 text-center">
                    Get notified when this unlocks:
                  </p>

                  <div className="cs-flex-column gap-3 mb-4">
                    {/* Google Calendar */}
                    <button
                      onClick={() => handleAddToCalendar("google")}
                      className="group bg-white dark:bg-gray-800 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md hover:shadow-lg transition-all duration-200 relative overflow-hidden border border-gray-200 dark:border-gray-700"
                    >
                      <div className="absolute -top-2 -right-2 w-12 h-12 bg-blue-100/30 dark:bg-blue-900/30 rounded-full blur-lg"></div>
                      <div className="relative z-10 text-center">
                        <div className="mb-2">
                          <Image
                            src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"
                            alt="Google"
                            width={60}
                            height={20}
                            className="mx-auto"
                          />
                        </div>
                        <div className="text-xs text-blue-500 dark:text-blue-400 font-medium">
                          Calendar
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Opens in new window
                        </div>
                      </div>
                    </button>

                    {/* Apple Calendar */}
                    <button
                      onClick={() => handleAddToCalendar("apple")}
                      className="group bg-white dark:bg-gray-800 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-md hover:shadow-lg transition-all duration-200 relative overflow-hidden border border-gray-200 dark:border-gray-700"
                    >
                      <div className="absolute -top-2 -right-2 w-12 h-12 bg-gray-100/30 dark:bg-gray-900/30 rounded-full blur-lg"></div>
                      <div className="relative z-10 text-center">
                        <div className="mb-2">
                          <Image
                            src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
                            alt="Apple"
                            width={20}
                            height={24}
                            className="mx-auto dark:invert"
                          />
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                          Calendar
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Downloads .ics file
                        </div>
                      </div>
                    </button>

                    {/* Outlook Calendar */}
                    <button
                      onClick={() => handleAddToCalendar("outlook")}
                      className="group bg-white dark:bg-gray-800 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md hover:shadow-lg transition-all duration-200 relative overflow-hidden border border-gray-200 dark:border-gray-700"
                    >
                      <div className="absolute -top-2 -right-2 w-12 h-12 bg-blue-100/30 dark:bg-blue-900/30 rounded-full blur-lg"></div>
                      <div className="relative z-10 text-center">
                        <div className="mb-2">
                          <Image
                            src="https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg"
                            alt="Microsoft"
                            width={60}
                            height={13}
                            className="mx-auto"
                          />
                        </div>
                        <div className="text-xs text-blue-500 dark:text-blue-400 font-medium">
                          Outlook Calendar
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Opens in new window
                        </div>
                      </div>
                    </button>
                  </div>

                  {calendarError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-center">
                      <p className="text-red-600 dark:text-red-400 text-sm">
                        <strong>Error:</strong> {calendarError}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
            <Footer />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cs-page-layout relative overflow-hidden">
      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 dark:bg-white/5 rounded-full blur-xl animate-pulse"></div>
      <div
        className="absolute top-40 right-20 w-24 h-24 bg-yellow-300/20 dark:bg-yellow-400/15 rounded-full blur-lg animate-bounce"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute bottom-40 left-1/4 w-40 h-40 bg-pink-400/15 dark:bg-pink-500/10 rounded-full blur-2xl animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>
      <div
        className="absolute bottom-20 right-1/3 w-28 h-28 bg-purple-300/20 dark:bg-purple-400/15 rounded-full blur-xl animate-bounce"
        style={{ animationDelay: "3s" }}
      ></div>

      <div className="cs-page-content">
        <div className="cs-page-inner relative z-10">
          <Header />

          {/* Create New Message button */}
          <div className="cs-flex-center mb-4">
            <Link
              href="/"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:scale-105 backdrop-blur-sm"
            >
              Create New Message
            </Link>
          </div>

        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 mb-8 border border-white/30 dark:border-gray-700/30">
          {/* Sender Info */}
          {secretData.senderName && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                From: <span className="font-medium">{secretData.senderName}</span>
              </p>
            </div>
          )}

          {/* Hint */}
          {secretData.hint && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Hint: <span className="font-medium">{secretData.hint}</span>
              </p>
            </div>
          )}

          {/* Message */}
          <div className="mb-4">
            <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
              {secretData.message}
            </p>
          </div>

          {/* Timestamp */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Unlocked on {new Date(secretData.unlockDate).toLocaleString()}
            </p>
          </div>
        </div>

          <Footer />
        </div>
      </div>
    </div>
  );
}

export default function ViewSecret() {
  return (
    <Suspense
      fallback={
        <div className="cs-page-layout">
          <div className="cs-page-content">
            <div className="cs-page-inner">
              <Header />
              <div className="cs-loading-container">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/70 mx-auto mb-4 drop-shadow-lg"></div>
                  <p className="cs-loading-text">
                    Loading secret...
                  </p>
                </div>
              </div>
              <Footer />
            </div>
          </div>
        </div>
      }
    >
      <ViewSecretContent />
      
    </Suspense>
  );
}
