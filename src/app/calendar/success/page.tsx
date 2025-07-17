"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { decryptMessage, SecretData } from "@/lib/crypto";

function SuccessContent() {
  const searchParams = useSearchParams();
  const [secretData, setSecretData] = useState<SecretData | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [messageUrl, setMessageUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [provider, setProvider] = useState<string>('google');

  useEffect(() => {
    const data = searchParams.get("love");
    const providerParam = searchParams.get("provider") || 'google';
    
    if (!data) {
      setError("No message data found in URL");
      setIsLoading(false);
      return;
    }

    try {
      const decrypted = decryptMessage(data);
      setSecretData(decrypted);
      setProvider(providerParam);
      
      // Generate the message URL
      const currentUrl = window.location.origin + '/view?' + searchParams.toString().replace(/&provider=[^&]*/g, '');
      setMessageUrl(currentUrl);
      
      setIsLoading(false);
    } catch {
      setError("Invalid or corrupted message data");
      setIsLoading(false);
    }
  }, [searchParams]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(messageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
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
          <p className="text-white/90 drop-shadow-md font-medium">Loading...</p>
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
        {/* Success Header */}
        <div className="text-center mb-8 relative">
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-green-400/20 rounded-full blur-xl"></div>
          <div className="text-6xl mb-4 relative z-10 drop-shadow-2xl">✅</div>
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-2xl relative z-10" style={{textShadow: '0 0 20px rgba(255,255,255,0.3), 0 0 40px rgba(255,255,255,0.1)'}}>
            Calendar Reminder Added!
          </h1>
          <p className="text-white/90 drop-shadow-lg font-medium relative z-10">
            Your secret message reminder has been added to {provider === 'google' ? 'Google Calendar' : provider === 'apple' ? 'Apple Calendar' : 'Outlook Calendar'}
          </p>
          {/* Decorative line */}
          <div className="mt-4 mx-auto w-24 h-0.5 bg-gradient-to-r from-transparent via-green-400/60 to-transparent"></div>
        </div>

        {/* Success Details Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-6 mb-8 border border-green-400/50 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-green-100/30 rounded-full blur-xl"></div>
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-emerald-100/20 rounded-full blur-xl"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3 drop-shadow-lg">🎉</div>
              <h2 className="text-xl font-semibold text-green-700 mb-2 drop-shadow-sm">
                All Set!
              </h2>
              <p className="text-gray-600 text-sm">
                You&apos;ll receive a {provider === 'google' ? 'Google Calendar' : provider === 'apple' ? 'Apple Calendar' : 'Outlook Calendar'} notification on {new Date(secretData.unlockDate).toLocaleString()}
              </p>
            </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-6 border border-green-200/50 shadow-inner">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-600">{provider === 'google' ? '📅' : provider === 'apple' ? '🍎' : '📧'}</span>
                <span className="text-green-700">
                  Event added to your {provider === 'google' ? 'Google Calendar' : provider === 'apple' ? 'Apple Calendar' : 'Outlook Calendar'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">🔔</span>
                <span className="text-green-700">
                  You&apos;ll get a notification when it&apos;s time
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">🔗</span>
                <span className="text-green-700">
                  Direct link to your message is included
                </span>
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Share Message Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-6 mb-8 border border-white/30 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-100/30 rounded-full blur-xl"></div>
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-100/20 rounded-full blur-xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-xl font-semibold text-purple-900 mb-4 drop-shadow-sm">
              Share Your Message
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Send this link to anyone you want to share the secret message with:
            </p>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={messageUrl}
              readOnly
              className="flex-1 bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
              }`}
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link
            href={`/view?${searchParams.toString()}`}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-center shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            View Message
          </Link>
          
          <Link
            href="/"
            className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-center shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Create Another Message
          </Link>
        </div>

        {/* Tips Card */}
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4 text-center shadow-lg">
          <p className="text-white/90 text-sm drop-shadow-md">
            💡 <strong>Pro Tip:</strong> Check your {provider === 'google' ? 'Google Calendar' : provider === 'apple' ? 'Apple Calendar' : 'Outlook Calendar'} to make sure the event was added correctly. You can edit the event details if needed.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CalendarSuccess() {
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
            <p className="text-white/90 drop-shadow-md font-medium">Loading...</p>
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}