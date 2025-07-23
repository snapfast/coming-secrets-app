"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MessageTemplatesDialog from "@/components/MessageTemplatesDialog";
import { trackSecretCreated, trackShareAction, trackTemplateUsed } from "@/lib/analytics";

export default function Home() {
  const [formData, setFormData] = useState({
    message: "",
    unlockDate: "",
    senderName: "",
    hint: "",
    template: "",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate character limits
    if (formData.message.length > 1000) {
      alert("Message exceeds 1000 character limit");
      return;
    }
    
    if (formData.senderName.length > 100) {
      alert("Sender name exceeds 100 character limit");
      return;
    }
    
    if (formData.hint.length > 200) {
      alert("Hint exceeds 200 character limit");
      return;
    }
    
    setIsGenerating(true);

    try {
      const { encryptMessage } = await import("@/lib/crypto");
      const messageData = {
        message: formData.message,
        unlockDate: formData.unlockDate,
        senderName: formData.senderName,
        hint: formData.hint.trim() || undefined
      };
      const encrypted = await encryptMessage(messageData);
      
      // Generate view URL instead of redirecting to calendar
      const viewUrl = `${window.location.origin}/view?love=${encrypted}`;
      setGeneratedLink(viewUrl);
      trackSecretCreated();
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
      hint: "",
      template: "",
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
    trackTemplateUsed(templateKey);
  };



  return (
    <div className="page-container p-8">
      <div className="max-w-4xl mx-auto pt-6">
        <Header />

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-purple-800 dark:border-purple-700">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Sender Name */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="senderName"
                  className="block text-sm font-semibold text-gray-800 dark:text-gray-200"
                >
                  From (Optional)
                </label>
                <span className={`text-xs ${formData.senderName.length > 100 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {formData.senderName.length}/100
                </span>
              </div>
              <input
                type="text"
                id="senderName"
                name="senderName"
                maxLength={100}
                value={formData.senderName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-800 focus:border-purple-800 dark:bg-gray-700 dark:text-white ${
                  formData.senderName.length > 100 
                    ? 'border-red-400 dark:border-red-600' 
                    : 'border-purple-400 dark:border-purple-600'
                }`}
                placeholder="Your name (max 100 characters)"
              />
              {formData.senderName.length > 100 && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Name exceeds 100 character limit
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="message"
                  className="block text-sm font-semibold text-gray-800 dark:text-gray-200"
                >
                  Secret Message
                </label>
                <div className="flex items-center gap-3">
                  <span className={`text-xs ${formData.message.length > 1000 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {formData.message.length}/1000
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowTemplatesDialog(true)}
                    className="text-xs px-2 py-1 bg-green-100 dark:bg-green-800/50 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-700/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                  >
                    Use Template
                  </button>
                </div>
              </div>
              <textarea
                id="message"
                name="message"
                rows={8}
                maxLength={1000}
                value={formData.message}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-800 focus:border-purple-800 dark:bg-gray-700 dark:text-white ${
                  formData.message.length > 1000 
                    ? 'border-red-400 dark:border-red-600' 
                    : 'border-purple-400 dark:border-purple-600'
                }`}
                placeholder="Write your secret message here... (max 1000 characters)"
                required
              />
              {formData.message.length > 1000 && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Message exceeds 1000 character limit
                </p>
              )}
            </div>

            {/* Hint Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="hint"
                  className="block text-sm font-semibold text-gray-800 dark:text-gray-200"
                >
                  Hint (Optional)
                </label>
                <span className={`text-xs ${formData.hint.length > 200 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {formData.hint.length}/200
                </span>
              </div>
              <input
                type="text"
                id="hint"
                name="hint"
                maxLength={200}
                value={formData.hint}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-800 focus:border-purple-800 dark:bg-gray-700 dark:text-white ${
                  formData.hint.length > 200 
                    ? 'border-red-400 dark:border-red-600' 
                    : 'border-purple-400 dark:border-purple-600'
                }`}
                placeholder="Optional hint for the recipient (max 200 characters)"
              />
              {formData.hint.length > 200 && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Hint exceeds 200 character limit
                </p>
              )}
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
                    className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-md transition-colors duration-200"
                  >
                    1 Day
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(7)}
                    className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-md transition-colors duration-200"
                  >
                    1 Week
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(30)}
                    className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-md transition-colors duration-200"
                  >
                    1 Month
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(365)}
                    className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-md transition-colors duration-200"
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
                className="w-full sm:w-auto px-8 py-2 bg-gradient-to-r from-green-600 to-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed"
              >
                {isGenerating ? "Creating Message..." : "Create Secret Message"}
              </button>
            </div>
          </form>


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
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={generatedLink}
                    readOnly
                    className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-purple-300 dark:border-purple-600 rounded-lg text-sm font-mono text-gray-800 dark:text-gray-200"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="w-full sm:w-auto px-8 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    {copySuccess ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => {
                    trackShareAction('native_share');
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
                  className="w-full sm:w-auto px-8 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Share
                </button>
              </div>
              <div className="flex justify-center mt-4">
                <button
                  onClick={resetForm}
                  className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-medium rounded-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
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
            Key Features
          </h3>
          <div className="gap-4 text-white/90">
            <div>
              <h4 className="font-medium text-white">Time-Locked Messages</h4>
            </div>
            <div>
              <h4 className="font-medium text-white">Smart Reminders</h4>
            </div>
            <div>
              <h4 className="font-medium text-white">Your secrets are safe with us. We keep them completely private.</h4>
            </div>
            <div>
              <h4 className="font-medium text-white">Easy Sharing</h4>
            </div>
            <div>
              <h4 className="font-medium text-white">Nobody can unlock your secrets before the due date, not even you. Try Hard.</h4>
            </div>
            <div>
              <h4 className="font-medium text-white">Send Feedback - smartrahulrdb [at] gmail [dot] com</h4>
            </div>
          </div>
        </div>

        <Footer />
      </div>

      {/* Message Templates Dialog */}
      <MessageTemplatesDialog
        isOpen={showTemplatesDialog}
        onClose={() => setShowTemplatesDialog(false)}
        onSelectTemplate={applyTemplate}
        templates={messageTemplates}
      />
    </div>
  );
}
