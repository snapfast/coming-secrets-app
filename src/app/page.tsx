"use client";

import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [formData, setFormData] = useState({
    message: "",
    unlockDate: "",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const { encryptMessage } = await import("@/lib/crypto");
      const encrypted = encryptMessage(formData);
      
      // Generate view URL instead of redirecting to calendar
      const viewUrl = `${window.location.origin}/view?love=${encrypted}`;
      setGeneratedLink(viewUrl);
      setIsGenerating(false);
    } catch (error) {
      console.error("Error generating link:", error);
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      message: "",
      unlockDate: "",
    });
    setGeneratedLink("");
    setCopySuccess(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const setQuickDate = (days: number) => {
    const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const dateString = futureDate.toISOString().split("T")[0];
    setFormData({
      ...formData,
      unlockDate: dateString,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-600 via-pink-600 to-purple-700 dark:from-orange-700 dark:via-pink-700 dark:to-purple-800 p-8">
      <div className="max-w-2xl mx-auto pt-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white drop-shadow-2xl mb-4 tracking-wider" style={{fontFamily: 'var(--font-cinzel-decorative)', textShadow: '0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(255,255,255,0.3)'}}>
            COMINGS{" "}
            <span 
              className="relative inline-block"
              style={{
                background: 'linear-gradient(90deg, white 0%, white 70%, black 80%, black 90%, white 100%)',
                backgroundSize: '300% 100%',
                backgroundPosition: '100% 0',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                animation: 'blackSplash 7s ease-out infinite'
              }}
            >
              SECRETS
            </span>
          </h1>
          <style jsx>{`
            @keyframes blackSplash {
              0% {
                background-position: 100% 0;
              }
              21% {
                background-position: -100% 0;
              }
              100% {
                background-position: 100% 0;
              }
            }
          `}</style>
          <p className="text-lg text-white/90 drop-shadow-md">
            Send time-locked messages that can only be opened on a{" "}
            <span className="text-yellow-300 font-bold italic transform rotate-2 inline-block bg-purple-900/30 px-2 py-1 rounded-lg border-2 border-dashed border-yellow-300/50 animate-pulse">
              comings
            </span>{" "}
            date
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-purple-800 dark:border-purple-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2"
              >
                Secret Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={8}
                value={formData.message}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-purple-400 dark:border-purple-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-800 focus:border-purple-800 dark:bg-gray-700 dark:text-white"
                placeholder="Write your secret message here..."
                required
              />
            </div>

            <div>
              <label
                htmlFor="unlockDate"
                className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2"
              >
                Unlock Date
              </label>
              <input
                type="date"
                id="unlockDate"
                name="unlockDate"
                value={formData.unlockDate}
                onChange={handleChange}
                min={
                  new Date(Date.now() + 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0]
                }
                className="w-full px-3 py-2 border border-purple-400 dark:border-purple-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-800 focus:border-purple-800 dark:bg-gray-700 dark:text-white"
                required
              />
              <div className="mt-3">
                <div className="flex gap-2 flex-wrap justify-center">
                  <button
                    type="button"
                    onClick={() => setQuickDate(1)}
                    className="px-3 py-1 text-xs bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-md transition-colors duration-200"
                  >
                    1 Day
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(7)}
                    className="px-3 py-1 text-xs bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-md transition-colors duration-200"
                  >
                    1 Week
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(30)}
                    className="px-3 py-1 text-xs bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-md transition-colors duration-200"
                  >
                    1 Month
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(365)}
                    className="px-3 py-1 text-xs bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-md transition-colors duration-200"
                  >
                    1 Year
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={
                  isGenerating || !formData.message || !formData.unlockDate
                }
                className="w-auto px-8 bg-purple-800 disabled:bg-gray-400 text-white font-medium py-3 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:ring-offset-2 disabled:cursor-not-allowed"
              >
                {isGenerating ? "Creating Message..." : "Create Secret Message"}
              </button>
            </div>
          </form>

          {/* Generated link section */}
          {generatedLink && (
            <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-4">
                Secret Message Created Successfully!
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                  Shareable Link:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={generatedLink}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-green-300 dark:border-green-600 rounded-md text-sm font-mono text-gray-800 dark:text-gray-200"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-green-600 text-white font-medium rounded-md transition-colors duration-200"
                  >
                    {copySuccess ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Secret Message',
                        text: 'I have a secret message for you!',
                        url: generatedLink
                      });
                    } else {
                      // Fallback for browsers that don't support Web Share API
                      const shareText = `I have a secret message for you! ${generatedLink}`;
                      navigator.clipboard.writeText(shareText);
                      alert('Link copied to clipboard!');
                    }
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 backdrop-blur-sm"
                >
                  📤 Share Message
                </button>
                <button
                  onClick={resetForm}
                  className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-medium rounded-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Create Another
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Features section */}
        <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <p className="text-white/80 text-lg font-medium text-center">
            Added new reminder feature
          </p>
        </div>

        {/* Garden digging icon at the bottom */}
        <div className="flex justify-center mt-16">
          <Image
            src="/icon-garden-dig.svg"
            alt="Garden Digging"
            width={120}
            height={120}
          />
        </div>
      </div>
    </div>
  );
}
