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
            <div className="cs-form-wrapper">
              <div className="cs-error-card">
                <div className="cs-empty-icon">
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
            <div className="cs-form-wrapper">
              <div className="cs-content-center">
                <div className="cs-loading-spinner"></div>
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
      <div className="cs-page-layout">
        <div className="cs-page-content">
          <div className="cs-page-inner">
            <Header />

            <div className="cs-form-wrapper">
              <div className="cs-content-center">
                <h1 className="cs-celebration-title">
                  Unlocking...
                </h1>
                <div className="cs-celebration-countdown">
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
      <div className="cs-page-layout">
        <div className="cs-page-content">
          <div className="cs-page-inner">
            <Header />

            <div className="cs-form-wrapper">
              {/* Create New Message button */}
              <div className="cs-flex-center cs-mb-4">
                <Link
                  href="/"
                  className="cs-button-success"
                >
                  Create New Message
                </Link>
              </div>

              {/* Sender Info */}
              {secretData.senderName && (
                <div className="cs-sender-info">
                  <p className="cs-sender-text">
                    From:{" "}
                    <span className="cs-font-medium">
                      {secretData.senderName}
                    </span>
                  </p>
                </div>
              )}

              <h1 className="cs-secret-title">
                Secret Locked
              </h1>
              <p className="cs-secret-description">
                This secret will unlock on{" "}
                {new Date(secretData.unlockDate).toLocaleString()}
              </p>

              {/* Enhanced Countdown Display */}
              <div className="cs-countdown-container">
                <h2 className="cs-countdown-title">
                  Time Remaining:
                </h2>

                {/* Multiple format display */}
                <div className="cs-grid-countdown">
                  <div>
                    <div className="cs-countdown-number">
                      {timeRemaining.days}
                    </div>
                    <div className="cs-countdown-label">
                      Days
                    </div>
                  </div>
                  <div>
                    <div className="cs-countdown-number">
                      {timeRemaining.hours}
                    </div>
                    <div className="cs-countdown-label">
                      Hours
                    </div>
                  </div>
                  <div>
                    <div className="cs-countdown-number">
                      {timeRemaining.minutes}
                    </div>
                    <div className="cs-countdown-label">
                      Minutes
                    </div>
                  </div>
                  <div>
                    <div className="cs-countdown-number">
                      {timeRemaining.seconds}
                    </div>
                    <div className="cs-countdown-label">
                      Seconds
                    </div>
                  </div>
                </div>

                {/* Alternative format for close deadlines */}
                {timeRemaining.days === 0 && timeRemaining.hours < 24 && (
                  <div className="cs-countdown-alternative">
                    <p className="cs-countdown-alternative-label">
                      Alternative view:
                    </p>
                    <div className="cs-countdown-digital">
                      {String(timeRemaining.hours).padStart(2, "0")}:
                      {String(timeRemaining.minutes).padStart(2, "0")}:
                      {String(timeRemaining.seconds).padStart(2, "0")}
                    </div>
                  </div>
                )}

                {/* Progress bar */}
                <div className="cs-progress-container">
                  <div
                    className="cs-progress-bar"
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
                <div className="cs-hint-container">
                  <p className="cs-hint-label">
                    Hint:
                  </p>
                  <p className="cs-hint-text">
                    {secretData.hint}
                  </p>
                </div>
              )}

              <p className="cs-reminder-text">
                Please check back when the countdown reaches zero!
              </p>

              {/* Smart Reminders - Vertical Layout */}
              <div className="cs-calendar-section">
                <p className="cs-calendar-intro">
                  Get notified when this unlocks:
                </p>

                <div className="cs-flex-column gap-3">
                  {/* Google Calendar */}
                  <button
                    onClick={() => handleAddToCalendar("google")}
                    className="cs-calendar-button-google"
                  >
                    <div className="cs-calendar-decorative-blue"></div>
                    <div className="cs-calendar-content">
                      <div className="cs-calendar-logo">
                        <Image
                          src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"
                          alt="Google"
                          width={60}
                          height={20}
                          className="cs-calendar-logo"
                        />
                      </div>
                      <div className="cs-calendar-name-blue">
                        Calendar
                      </div>
                      <div className="cs-calendar-description">
                        Opens in new window
                      </div>
                    </div>
                  </button>

                  {/* Apple Calendar */}
                  <button
                    onClick={() => handleAddToCalendar("apple")}
                    className="cs-calendar-button-apple"
                  >
                    <div className="cs-calendar-decorative-gray"></div>
                    <div className="cs-calendar-content">
                      <div className="cs-calendar-logo">
                        <Image
                          src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
                          alt="Apple"
                          width={20}
                          height={24}
                          className="cs-calendar-logo-inverted"
                        />
                      </div>
                      <div className="cs-calendar-name-gray">
                        Calendar
                      </div>
                      <div className="cs-calendar-description">
                        Downloads .ics file
                      </div>
                    </div>
                  </button>

                  {/* Outlook Calendar */}
                  <button
                    onClick={() => handleAddToCalendar("outlook")}
                    className="cs-calendar-button-outlook"
                  >
                    <div className="cs-calendar-decorative-blue"></div>
                    <div className="cs-calendar-content">
                      <div className="cs-calendar-logo">
                        <Image
                          src="https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg"
                          alt="Microsoft"
                          width={60}
                          height={13}
                          className="cs-calendar-logo"
                        />
                      </div>
                      <div className="cs-calendar-name-blue">
                        Outlook Calendar
                      </div>
                      <div className="cs-calendar-description">
                        Opens in new window
                      </div>
                    </div>
                  </button>
                </div>

                {calendarError && (
                  <div className="cs-calendar-error">
                    <p className="cs-calendar-error-text">
                      <strong>Error:</strong> {calendarError}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Footer />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cs-page-layout">
      <div className="cs-page-content">
        <div className="cs-page-inner">
          <Header />

          <div className="cs-form-wrapper">
            {/* Create New Message button */}
            <div className="cs-flex-center cs-mb-4">
              <Link
                href="/"
                className="cs-button-success cs-button-hover-scale"
              >
                Create New Message
              </Link>
            </div>

            {/* Sender Info */}
            {secretData.senderName && (
              <div className="cs-unlocked-sender">
                <p className="cs-unlocked-sender-text">
                  From: <span className="cs-font-medium">{secretData.senderName}</span>
                </p>
              </div>
            )}

            {/* Hint */}
            {secretData.hint && (
              <div className="cs-unlocked-hint">
                <p className="cs-unlocked-hint-text">
                  Hint: <span className="cs-font-medium">{secretData.hint}</span>
                </p>
              </div>
            )}

            {/* Message */}
            <div className="cs-unlocked-message">
              <p className="cs-unlocked-message-text">
                {secretData.message}
              </p>
            </div>

            {/* Timestamp */}
            <div className="cs-unlocked-timestamp-section">
              <p className="cs-unlocked-timestamp-text">
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
              <div className="cs-form-wrapper">
                <div className="cs-content-center">
                  <div className="cs-loading-spinner"></div>
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
