"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { decryptMessage, SecretData } from "@/lib/crypto";

// Generate Apple Calendar iCal/ICS file content
function generateAppleCalendarICS(unlockDate: string, messageUrl: string): string {
  const startDate = new Date(unlockDate);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration
  
  // Format dates for iCal (YYYYMMDDTHHMMSSZ)
  const formatICalDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };
  
  const startFormatted = formatICalDate(startDate);
  const endFormatted = formatICalDate(endDate);
  const nowFormatted = formatICalDate(new Date());
  
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Coming Secrets//EN
BEGIN:VEVENT
UID:${Date.now()}@comingsecrets.app
DTSTAMP:${nowFormatted}
DTSTART:${startFormatted}
DTEND:${endFormatted}
SUMMARY:Secret Message Ready to Open
DESCRIPTION:🎉 Your secret message is ready to open! 🎉\n\nClick the link to view it: ${messageUrl}\n\n✨ Created with Coming Secrets - Send time-locked messages that unlock on a specific date!\n\n🔒 Perfect for:\n• Birthday surprises\n• Anniversary messages\n• Future reminders\n• Secret reveals\n• Time capsule notes\n\n🌟 Try it yourself at comingss.netlify.app\n\n#ComingSecrets #TimeLocked #SecretMessage #TimeCapule
LOCATION:
END:VEVENT
END:VCALENDAR`;
  
  return icsContent;
}

// Generate Outlook Calendar URL with proper encoding
function generateOutlookCalendarUrl(unlockDate: string, messageUrl: string): string {
  const startDate = new Date(unlockDate);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration
  
  // Format dates for Outlook (ISO format)
  const startFormatted = startDate.toISOString();
  const endFormatted = endDate.toISOString();
  
  const eventDetails = {
    subject: 'Secret Message Ready to Open',
    startdt: startFormatted,
    enddt: endFormatted,
    body: `🎉 Your secret message is ready to open! 🎉\n\nClick the link to view it: ${messageUrl}\n\n✨ Created with Coming Secrets - Send time-locked messages that unlock on a specific date!\n\n🔒 Perfect for:\n• Birthday surprises\n• Anniversary messages\n• Future reminders\n• Secret reveals\n• Time capsule notes\n\n🌟 Try it yourself at comingss.netlify.app\n\n#ComingSecrets #TimeLocked #SecretMessage #TimeCapule`,
    location: '',
    allday: 'false',
    path: '/calendar/action/compose',
    rru: 'addevent'
  };
  
  const params = new URLSearchParams(eventDetails);
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

// Generate Google Calendar URL with proper encoding
function generateGoogleCalendarUrl(unlockDate: string, messageUrl: string): string {
  const startDate = new Date(unlockDate);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration
  
  // Format dates as YYYYMMDDTHHMMSSZ (UTC)
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };
  
  const startFormatted = formatDate(startDate);
  const endFormatted = formatDate(endDate);
  
  const eventDetails = {
    action: 'TEMPLATE',
    text: 'Secret Message Ready to Open',
    dates: `${startFormatted}/${endFormatted}`,
    details: `🎉 Your secret message is ready to open! 🎉

Click the link to view it: ${messageUrl}

✨ Created with Coming Secrets - Send time-locked messages that unlock on a specific date!

🔒 Perfect for:
• Birthday surprises
• Anniversary messages
• Future reminders
• Secret reveals
• Time capsule notes

🌟 Try it yourself at comingss.netlify.app

#ComingSecrets #TimeLocked #SecretMessage #TimeCapule`,
    location: '',
    sf: 'true',
    output: 'xml'
  };
  
  const params = new URLSearchParams(eventDetails);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function CalendarSetupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [secretData, setSecretData] = useState<SecretData | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [calendarError, setCalendarError] = useState<string>("");

  useEffect(() => {
    const data = searchParams.get("love");
    if (!data) {
      setError("No message data found in URL");
      setIsLoading(false);
      return;
    }

    try {
      const decrypted = decryptMessage(data);
      setSecretData(decrypted);
      setIsLoading(false);
    } catch {
      setError("Invalid or corrupted message data");
      setIsLoading(false);
    }
  }, [searchParams]);

  const handleAddToCalendar = (provider: string) => {
    if (!secretData) return;
    
    setCalendarError("");
    const currentUrl = window.location.origin + '/view?' + searchParams.toString();
    
    try {
      if (provider === 'google') {
        const calendarUrl = generateGoogleCalendarUrl(secretData.unlockDate, currentUrl);
        
        // Open Google Calendar in popup window
        const popup = window.open(
          calendarUrl, 
          'google-calendar-popup',
          'width=800,height=600,scrollbars=yes,resizable=yes,location=yes'
        );
        
        // Check if popup was blocked
        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
          setCalendarError('Popup blocked. Please allow popups for this site and try again.');
          return;
        }
        
        // Focus the popup if it opened successfully
        if (popup) {
          popup.focus();
        }
      } else if (provider === 'outlook') {
        const calendarUrl = generateOutlookCalendarUrl(secretData.unlockDate, currentUrl);
        
        // Open Outlook Calendar in popup window
        const popup = window.open(
          calendarUrl, 
          'outlook-calendar-popup',
          'width=800,height=600,scrollbars=yes,resizable=yes,location=yes'
        );
        
        // Check if popup was blocked
        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
          setCalendarError('Popup blocked. Please allow popups for this site and try again.');
          return;
        }
        
        // Focus the popup if it opened successfully
        if (popup) {
          popup.focus();
        }
      } else if (provider === 'apple') {
        const icsContent = generateAppleCalendarICS(secretData.unlockDate, currentUrl);
        
        // Create and download ICS file
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'secret-message-reminder.ics';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
      
      // Redirect to success page
      setTimeout(() => {
        router.push(`/calendar/success?${searchParams.toString()}&provider=${provider}`);
      }, 1000);
    } catch (error) {
      console.error('Calendar integration error:', error);
      setCalendarError(`Failed to add to ${provider === 'google' ? 'Google Calendar' : provider === 'apple' ? 'Apple Calendar' : 'Outlook Calendar'}. Please try again.`);
    }
  };

  const handleSkip = () => {
    router.push(`/view?${searchParams.toString()}`);
  };

  if (isLoading) {
    return (
      <div 
        className="min-h-screen p-8 flex items-center justify-center"
        style={{
          background: "radial-gradient(circle at 30% 35%, rgb(194 65 12) 15%, rgb(190 24 93) 40%, rgb(88 28 135) 70%)",
        }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/70 mx-auto mb-4 drop-shadow-lg"></div>
          <p className="text-white/90 drop-shadow-md font-medium">Setting up your calendar reminder...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="min-h-screen p-8 flex items-center justify-center"
        style={{
          background: "radial-gradient(circle at 30% 35%, rgb(194 65 12) 15%, rgb(190 24 93) 40%, rgb(88 28 135) 70%)",
        }}
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 max-w-md w-full text-center border border-red-400/50 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-red-100/30 rounded-full blur-xl"></div>
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-orange-100/20 rounded-full blur-xl"></div>
          
          <div className="relative z-10">
            <div className="text-red-500 text-6xl mb-4 drop-shadow-sm">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4 drop-shadow-sm">
              Error
            </h1>
            <p className="text-gray-700 mb-6">{error}</p>
            <Link
              href="/"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Create New Message
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!secretData) return null;

  return (
    <div 
      className="min-h-screen p-8 relative overflow-hidden"
      style={{
        background: "radial-gradient(circle at 30% 35%, rgb(194 65 12) 15%, rgb(190 24 93) 40%, rgb(88 28 135) 70%)",
      }}
    >
      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-40 right-20 w-24 h-24 bg-yellow-300/20 rounded-full blur-lg animate-bounce" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-pink-400/15 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-purple-300/20 rounded-full blur-xl animate-bounce" style={{animationDelay: '3s'}}></div>
      <div className="max-w-2xl mx-auto pt-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 relative">
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          <div className="text-6xl mb-4 relative z-10 drop-shadow-2xl">📅</div>
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-2xl relative z-10" style={{textShadow: '0 0 20px rgba(255,255,255,0.3), 0 0 40px rgba(255,255,255,0.1)'}}>
            Add Calendar Reminder
          </h1>
          <p className="text-white/90 drop-shadow-lg font-medium relative z-10">
            Never miss your secret message unlock date
          </p>
          {/* Decorative line */}
          <div className="mt-4 mx-auto w-24 h-0.5 bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
        </div>

        {/* Message Preview Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-6 mb-8 border border-white/30 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-100/30 rounded-full blur-xl"></div>
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-pink-100/20 rounded-full blur-xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-xl font-semibold text-purple-900 mb-4 drop-shadow-sm">
              Your Message Details
            </h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-purple-700 dark:text-purple-300 font-medium">
                Unlock Date:
              </span>
              <span className="text-gray-900 dark:text-white font-semibold">
                {new Date(secretData.unlockDate).toLocaleString()}
              </span>
            </div>
            
            {secretData.senderEmail && (
              <div className="flex justify-between items-center">
                <span className="text-purple-700 dark:text-purple-300 font-medium">
                  From:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {secretData.senderEmail}
                </span>
              </div>
            )}
            
            {secretData.recipientEmail && (
              <div className="flex justify-between items-center">
                <span className="text-purple-700 dark:text-purple-300 font-medium">
                  To:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {secretData.recipientEmail}
                </span>
              </div>
            )}
          </div>
          </div>
        </div>

        {/* Calendar Setup Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 mb-8 border border-white/30 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-100/30 rounded-full blur-xl"></div>
          <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-indigo-100/20 rounded-full blur-xl"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3 drop-shadow-lg">🗓️</div>
              <h3 className="text-xl font-semibold text-purple-900 mb-2 drop-shadow-sm">
                Calendar Event Details
              </h3>
              <p className="text-gray-600 text-sm">
                This will be added to your selected calendar
              </p>
            </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-6 border border-purple-200/50 shadow-inner">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-purple-700 dark:text-purple-300 font-medium">
                  Event Title:
                </span>
                <span className="text-gray-900 dark:text-white">
                  Secret Message Ready to Open
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700 dark:text-purple-300 font-medium">
                  Date & Time:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {new Date(secretData.unlockDate).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700 dark:text-purple-300 font-medium">
                  Duration:
                </span>
                <span className="text-gray-900 dark:text-white">
                  1 hour
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-purple-700 dark:text-purple-300 font-medium">
                  Description:
                </span>
                <span className="text-gray-900 dark:text-white text-right max-w-xs">
                  Includes link to view your message
                </span>
              </div>
            </div>
          </div>

          {/* Calendar Provider Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-purple-900 mb-4 text-center drop-shadow-sm">
              Choose Your Calendar
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {/* Google Calendar */}
              <button
                onClick={() => handleAddToCalendar('google')}
                className="group bg-white hover:bg-blue-50 border-2 border-blue-200 hover:border-blue-400 rounded-xl p-6 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden"
              >
                <div className="absolute -top-2 -right-2 w-16 h-16 bg-blue-100/30 rounded-full blur-lg group-hover:bg-blue-200/50 transition-all duration-200"></div>
                <div className="relative z-10 text-center">
                  <div className="text-3xl mb-2">📅</div>
                  <div className="text-xl font-bold text-blue-600 mb-1">Google</div>
                  <div className="text-sm text-blue-500 font-medium">Calendar</div>
                  <div className="text-xs text-gray-600 mt-2">Opens in new window</div>
                </div>
              </button>

              {/* Apple Calendar */}
              <button
                onClick={() => handleAddToCalendar('apple')}
                className="group bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-400 rounded-xl p-6 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden"
              >
                <div className="absolute -top-2 -right-2 w-16 h-16 bg-gray-100/30 rounded-full blur-lg group-hover:bg-gray-200/50 transition-all duration-200"></div>
                <div className="relative z-10 text-center">
                  <div className="text-3xl mb-2">🍎</div>
                  <div className="text-xl font-bold text-gray-800 mb-1">Apple</div>
                  <div className="text-sm text-gray-600 font-medium">Calendar</div>
                  <div className="text-xs text-gray-600 mt-2">Downloads .ics file</div>
                </div>
              </button>

              {/* Outlook Calendar */}
              <button
                onClick={() => handleAddToCalendar('outlook')}
                className="group bg-white hover:bg-blue-50 border-2 border-blue-200 hover:border-blue-400 rounded-xl p-6 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden"
              >
                <div className="absolute -top-2 -right-2 w-16 h-16 bg-blue-100/30 rounded-full blur-lg group-hover:bg-blue-200/50 transition-all duration-200"></div>
                <div className="relative z-10 text-center">
                  <div className="text-3xl mb-2">📧</div>
                  <div className="text-xl font-bold text-blue-600 mb-1">Outlook</div>
                  <div className="text-sm text-blue-500 font-medium">Calendar</div>
                  <div className="text-xs text-gray-600 mt-2">Opens in new window</div>
                </div>
              </button>
            </div>
          </div>
          
          {/* Error Message */}
          {calendarError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              <strong>Error:</strong> {calendarError}
            </div>
          )}
          
          {/* Skip Button */}
          <div className="text-center">
            <button
              onClick={handleSkip}
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-medium py-3 px-8 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Skip for Now
            </button>
          </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4 text-center shadow-lg">
          <p className="text-white/90 text-sm drop-shadow-md">
            💡 <strong>Tip:</strong> Choose your preferred calendar app. After adding the reminder, you&apos;ll get the shareable link to send to others
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CalendarSetup() {
  return (
    <Suspense
      fallback={
        <div 
          className="min-h-screen p-8 flex items-center justify-center"
          style={{
            background: "radial-gradient(circle at 30% 35%, rgb(194 65 12) 15%, rgb(190 24 93) 40%, rgb(88 28 135) 70%)",
          }}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/70 mx-auto mb-4 drop-shadow-lg"></div>
            <p className="text-white/90 drop-shadow-md font-medium">Setting up your calendar reminder...</p>
          </div>
        </div>
      }
    >
      <CalendarSetupContent />
    </Suspense>
  );
}