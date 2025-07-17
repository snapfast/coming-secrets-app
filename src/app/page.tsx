"use client";

import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [formData, setFormData] = useState({
    senderEmail: "",
    recipientEmail: "",
    message: "",
    unlockDate: "",
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const { encryptMessage } = await import("@/lib/crypto");
      const encrypted = encryptMessage(formData);
      
      // Redirect to calendar setup page instead of showing link
      window.location.href = `/calendar?love=${encrypted}`;
    } catch (error) {
      console.error("Error generating link:", error);
      setIsGenerating(false);
    }
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
    <div
      className="min-h-screen bg-gradient-radial from-orange-500 via-pink-500 to-purple-600 dark:from-orange-600 dark:via-pink-600 dark:to-purple-700 p-8"
      style={{
        background:
          "radial-gradient(circle at 30% 35%, rgb(194 65 12) 15%, rgb(190 24 93) 40%, rgb(88 28 135) 70%)",
      }}
    >
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
                className="block text-sm font-semibold text-gray-800 mb-2"
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
                className="block text-sm font-semibold text-gray-800 mb-2"
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
                    className="px-3 py-1 text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-md transition-colors duration-200"
                  >
                    1 Day
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(7)}
                    className="px-3 py-1 text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-md transition-colors duration-200"
                  >
                    1 Week
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(30)}
                    className="px-3 py-1 text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-md transition-colors duration-200"
                  >
                    1 Month
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(365)}
                    className="px-3 py-1 text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-md transition-colors duration-200"
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
                className="w-auto px-8 bg-purple-800 hover:bg-purple-900 disabled:bg-gray-400 text-white font-medium py-3 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:ring-offset-2 disabled:cursor-not-allowed"
              >
                {isGenerating ? "Creating Message..." : "Create Secret Message"}
              </button>
            </div>
          </form>

        </div>

        {/* Features section */}
        <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <p className="text-white/80 text-lg font-medium text-center">
            More features coming soon!
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
