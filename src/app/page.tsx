"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  const [formData, setFormData] = useState({
    message: "",
    unlockDate: "",
    senderName: "",
    hints: [""],
    template: "",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewTimeRemaining, setPreviewTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const { encryptMessage } = await import("@/lib/crypto");
      const messageData = {
        message: formData.message,
        unlockDate: formData.unlockDate,
        senderName: formData.senderName,
        hints: formData.hints.filter(hint => hint.trim() !== "")
      };
      const encrypted = encryptMessage(messageData);
      
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
      senderName: "",
      hints: [""],
      template: "",
    });
    setGeneratedLink("");
    setCopySuccess(false);
    setShowPreview(false);
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

  const messageTemplates = {
    birthday: "Happy Birthday! 🎉 I hope this message finds you on your special day. Wishing you all the joy and happiness in the world!",
    anniversary: "Happy Anniversary! 💕 Thank you for all the wonderful memories we've shared together. Here's to many more!",
    graduation: "Congratulations on your graduation! 🎓 You've worked so hard for this moment. I'm so proud of you!",
    newyear: "Happy New Year! 🎊 May this year bring you endless opportunities and beautiful moments!",
    valentine: "Happy Valentine's Day! ❤️ You mean the world to me, and I wanted you to know how much I love you!",
    apology: "I'm sorry... 😔 I know I made a mistake, and I want to make things right. Please forgive me.",
    surprise: "Surprise! 🎁 I've been planning this for a while and can't wait for you to see what I have in store!",
    encouragement: "You've got this! 💪 I believe in you and know that you can overcome any challenge that comes your way."
  };

  const applyTemplate = (templateKey: string) => {
    setFormData({
      ...formData,
      message: messageTemplates[templateKey as keyof typeof messageTemplates],
      template: templateKey
    });
  };

  const addHint = () => {
    setFormData({
      ...formData,
      hints: [...formData.hints, ""]
    });
  };

  const removeHint = (index: number) => {
    const newHints = formData.hints.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      hints: newHints.length > 0 ? newHints : [""]
    });
  };

  const updateHint = (index: number, value: string) => {
    const newHints = [...formData.hints];
    newHints[index] = value;
    setFormData({
      ...formData,
      hints: newHints
    });
  };

  const calculateTimeRemaining = useCallback(() => {
    if (!formData.unlockDate) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    
    const now = new Date().getTime();
    const unlock = new Date(formData.unlockDate).getTime();
    const difference = unlock - now;
    
    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      return { days, hours, minutes, seconds };
    }
    
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }, [formData.unlockDate]);

  useEffect(() => {
    if (showPreview) {
      const timer = setInterval(() => {
        setPreviewTimeRemaining(calculateTimeRemaining());
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showPreview, formData.unlockDate, calculateTimeRemaining]);

  const handlePreview = () => {
    setPreviewTimeRemaining(calculateTimeRemaining());
    setShowPreview(true);
  };

  return (
    <div className="page-container p-8">
      <div className="max-w-2xl mx-auto pt-6">
        <Header />

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-purple-800 dark:border-purple-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Message Templates */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Message Templates (Optional)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {Object.entries(messageTemplates).map(([key]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => applyTemplate(key)}
                    className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-md transition-colors duration-200 capitalize"
                  >
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </button>
                ))}
              </div>
            </div>

            {/* Sender Name */}
            <div>
              <label
                htmlFor="senderName"
                className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2"
              >
                From (Optional)
              </label>
              <input
                type="text"
                id="senderName"
                name="senderName"
                value={formData.senderName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-purple-400 dark:border-purple-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-800 focus:border-purple-800 dark:bg-gray-700 dark:text-white"
                placeholder="Your name (will show to recipient)"
              />
            </div>

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

            {/* Hints Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Progressive Hints (Optional)
              </label>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                These hints will be revealed progressively as the unlock date approaches
              </p>
              {formData.hints.map((hint, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={hint}
                    onChange={(e) => updateHint(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-purple-400 dark:border-purple-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-800 focus:border-purple-800 dark:bg-gray-700 dark:text-white"
                    placeholder={`Hint ${index + 1}`}
                  />
                  {formData.hints.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeHint(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-md transition-colors duration-200"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addHint}
                className="px-3 py-1 text-xs bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-md transition-colors duration-200"
              >
                + Add Hint
              </button>
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
                <div className="grid grid-cols-2 sm:flex gap-2 sm:justify-center">
                  <button
                    type="button"
                    onClick={() => setQuickDate(1)}
                    className="px-3 py-2 text-sm bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-md transition-colors duration-200"
                  >
                    1 Day
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(7)}
                    className="px-3 py-2 text-sm bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-md transition-colors duration-200"
                  >
                    1 Week
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(30)}
                    className="px-3 py-2 text-sm bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-md transition-colors duration-200"
                  >
                    1 Month
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(365)}
                    className="px-3 py-2 text-sm bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-md transition-colors duration-200"
                  >
                    1 Year
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                type="button"
                onClick={handlePreview}
                disabled={!formData.message || !formData.unlockDate}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 disabled:bg-gray-400 text-white font-medium rounded-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed"
              >
                Preview
              </button>
              <button
                type="submit"
                disabled={
                  isGenerating || !formData.message || !formData.unlockDate
                }
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 disabled:bg-gray-400 text-white font-medium rounded-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed"
              >
                {isGenerating ? "Creating Message..." : "Create Secret Message"}
              </button>
            </div>
          </form>

          {/* Preview Modal */}
          {showPreview && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6 relative">
                <button
                  onClick={() => setShowPreview(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                >
                  ✕
                </button>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Preview: How Recipients Will See Your Message
                </h3>
                
                {/* Preview Content */}
                <div className="element-background p-4 rounded-lg text-white min-h-[200px] flex flex-col items-center justify-center text-center">
                  {formData.senderName && (
                    <p className="text-sm text-white/80 mb-2">From: {formData.senderName}</p>
                  )}
                  <h4 className="text-xl font-bold mb-4">Secret Message Locked 🔒</h4>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-4">
                    <p className="text-sm mb-2">Unlocks in:</p>
                    <div className="text-2xl font-bold">
                      {previewTimeRemaining.days}d {previewTimeRemaining.hours}h {previewTimeRemaining.minutes}m {previewTimeRemaining.seconds}s
                    </div>
                  </div>
                  {formData.hints.some(hint => hint.trim()) && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-sm">
                      <p className="font-medium mb-1">Hint:</p>
                      <p className="text-white/90">{formData.hints.find(hint => hint.trim()) || "No hints available yet"}</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This is how your message will appear to recipients until the unlock date.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Generated link section */}
          {generatedLink && (
            <div className="mt-8 p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-4">
                Secret Message Created Successfully!
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                  Shareable Link:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={generatedLink}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-purple-300 dark:border-purple-600 rounded-md text-sm font-mono text-gray-800 dark:text-gray-200"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-purple-600 text-white font-medium rounded-md transition-colors duration-200"
                  >
                    {copySuccess ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Secret Message',
                        text: 'I have a secret message for you!',
                        url: generatedLink
                      });
                    } else {
                      const shareText = `I have a secret message for you! ${generatedLink}`;
                      navigator.clipboard.writeText(shareText);
                      alert('Link copied to clipboard!');
                    }
                  }}
                  className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-sm"
                >
                  Share
                </button>
                <button
                  onClick={() => {
                    const whatsappText = encodeURIComponent(`I have a secret message for you! ${generatedLink}`);
                    window.open(`https://wa.me/?text=${whatsappText}`, '_blank');
                  }}
                  className="px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm"
                >
                  WhatsApp
                </button>
                <button
                  onClick={() => {
                    const emailSubject = encodeURIComponent('Secret Message for You');
                    const emailBody = encodeURIComponent(`I have a secret message for you!\n\n${generatedLink}`);
                    window.open(`mailto:?subject=${emailSubject}&body=${emailBody}`, '_blank');
                  }}
                  className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
                >
                  Email
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`I have a secret message for you! ${generatedLink}`);
                    alert('Message copied for Discord!');
                  }}
                  className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-medium rounded-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-sm"
                >
                  Discord
                </button>
                <button
                  onClick={() => {
                    const telegramText = encodeURIComponent(`I have a secret message for you! ${generatedLink}`);
                    window.open(`https://t.me/share/url?url=${encodeURIComponent(generatedLink)}&text=${telegramText}`, '_blank');
                  }}
                  className="px-4 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-medium rounded-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 text-sm"
                >
                  Telegram
                </button>
                <button
                  onClick={() => {
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(generatedLink)}`, '_blank');
                  }}
                  className="px-4 py-3 bg-gradient-to-r from-blue-700 to-blue-800 text-white font-medium rounded-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 text-sm"
                >
                  LinkedIn
                </button>
              </div>
              <div className="flex justify-center mt-4">
                <button
                  onClick={resetForm}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-medium rounded-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Create Another
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Features section */}
        <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <h3 className="text-white text-xl font-semibold text-center mb-4">
            ✨ Key Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/90">
            <div className="flex items-start gap-3">
              <div className="text-yellow-300 text-xl">🔒</div>
              <div>
                <h4 className="font-medium text-white mb-1">Time-Locked Messages</h4>
                <p className="text-sm text-white/80">Messages are encrypted and can only be opened on the date you choose</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-yellow-300 text-xl">🔔</div>
              <div>
                <h4 className="font-medium text-white mb-1">Smart Reminders</h4>
                <p className="text-sm text-white/80">Get notified when your secret message is ready to unlock</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-yellow-300 text-xl">💡</div>
              <div>
                <h4 className="font-medium text-white mb-1">Progressive Hints</h4>
                <p className="text-sm text-white/80">Add optional hints that reveal as the unlock date approaches</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-yellow-300 text-xl">📱</div>
              <div>
                <h4 className="font-medium text-white mb-1">Easy Sharing</h4>
                <p className="text-sm text-white/80">Share via WhatsApp, email, social media, or copy the link</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-yellow-300 text-xl">🎨</div>
              <div>
                <h4 className="font-medium text-white mb-1">Message Templates</h4>
                <p className="text-sm text-white/80">Pre-made templates for birthdays, anniversaries, and special occasions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-yellow-300 text-xl">🎉</div>
              <div>
                <h4 className="font-medium text-white mb-1">Celebration Effects</h4>
                <p className="text-sm text-white/80">Animated countdown and celebration when messages unlock</p>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
