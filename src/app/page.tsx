"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MessageTemplatesDialog from "@/components/MessageTemplatesDialog";
import { trackSecretCreated, trackShareAction, trackTemplateUsed } from "@/lib/analytics";
import { saveSecretToProfile, isStorageAvailable } from "@/lib/storage";

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

      // Save to profile if storage is available
      try {
        if (isStorageAvailable()) {
          saveSecretToProfile(messageData, viewUrl);
        }
      } catch (error) {
        console.error("Failed to save to profile:", error);
        // Don't block the user flow if profile saving fails
      }

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
    <div className="cs-page-layout">
      <div className="cs-page-content">
        <div className="cs-page-inner">
          <Header />

          <div className="cs-form-wrapper">
            <form onSubmit={handleSubmit} className="cs-form-section">

              {/* Sender Name */}
              <div className="cs-field-container">
                <div className="cs-field-header">
                  <label
                    htmlFor="senderName"
                    className="cs-field-label"
                  >
                    From (Optional)
                  </label>
                  <span className={`${formData.senderName.length > 100 ? 'cs-field-counter-error' : 'cs-field-counter'}`}>
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
                  className={`${formData.senderName.length > 100 ? 'cs-field-input-error' : 'cs-field-input'}`}
                  placeholder="Your name (max 100 characters)"
                />
                {formData.senderName.length > 100 && (
                  <p className="cs-field-error-message">
                    Name exceeds 100 character limit
                  </p>
                )}
              </div>

              <div className="cs-field-container">
                <div className="cs-field-header">
                  <label
                    htmlFor="message"
                    className="cs-field-label"
                  >
                    Secret Message
                  </label>
                  <div className="flex items-center gap-3">
                    <span className={`${formData.message.length > 1000 ? 'cs-field-counter-error' : 'cs-field-counter'}`}>
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
                  className={`${formData.message.length > 1000 ? 'cs-field-textarea-error' : 'cs-field-textarea'}`}
                  placeholder="Write your secret message here... (max 1000 characters)"
                  required
                />
                {formData.message.length > 1000 && (
                  <p className="cs-field-error-message">
                    Message exceeds 1000 character limit
                  </p>
                )}
              </div>

              {/* Hint Section */}
              <div className="cs-field-container">
                <div className="cs-field-header">
                  <label
                    htmlFor="hint"
                    className="cs-field-label"
                  >
                    Hint (Optional)
                  </label>
                  <span className={`${formData.hint.length > 200 ? 'cs-field-counter-error' : 'cs-field-counter'}`}>
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
                  className={`${formData.hint.length > 200 ? 'cs-field-input-error' : 'cs-field-input'}`}
                  placeholder="Optional hint for the recipient (max 200 characters)"
                />
                {formData.hint.length > 200 && (
                  <p className="cs-field-error-message">
                    Hint exceeds 200 character limit
                  </p>
                )}
              </div>

              <div className="cs-field-container">
                <label
                  htmlFor="unlockDate"
                  className="cs-field-label"
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
                  className="cs-field-input"
                  required
                />
                <div className="cs-quick-date-container">
                  <div className="cs-quick-date-grid">
                    <button
                      type="button"
                      onClick={() => setQuickDate(1)}
                      className="cs-quick-date-button"
                    >
                      1 Day
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate(7)}
                      className="cs-quick-date-button"
                    >
                      1 Week
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate(30)}
                      className="cs-quick-date-button"
                    >
                      1 Month
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate(365)}
                      className="cs-quick-date-button"
                    >
                      1 Year
                    </button>
                  </div>
                </div>
              </div>

              <div className="cs-form-button-container">
                <button
                  type="submit"
                  disabled={
                    isGenerating || !formData.message || !formData.unlockDate
                  }
                  className="cs-button-green"
                >
                  {isGenerating ? "Creating Message..." : "Create Secret Message"}
                </button>
              </div>
            </form>


            {/* Generated link section */}
            {generatedLink && (
              <div className="cs-success-container">
                <h3 className="cs-success-title">
                  Secret Message Created Successfully!
                </h3>

                <div className="cs-success-field">
                  <label className="cs-success-label">
                    Shareable Link:
                  </label>
                  <div className="cs-success-input-container">
                    <input
                      type="text"
                      value={generatedLink}
                      readOnly
                      className="cs-success-input"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="cs-button-green"
                    >
                      {copySuccess ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="cs-success-actions">
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
                    className="cs-button-green"
                  >
                    Share
                  </button>
                </div>
                <div className="cs-success-reset-container">
                  <button
                    onClick={resetForm}
                    className="cs-success-reset-button"
                  >
                    Create Another
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Features section */}
          <div className="cs-features-container">
            <h3 className="cs-features-title">
              Key Features
            </h3>
            <div className="cs-features-list">
              <div>
                <h4 className="cs-features-item">Time-Locked Messages</h4>
              </div>
              <div>
                <h4 className="cs-features-item">Smart Reminders</h4>
              </div>
              <div>
                <h4 className="cs-features-item">Your secrets are safe with us. We keep them completely private.</h4>
              </div>
              <div>
                <h4 className="cs-features-item">Easy Sharing</h4>
              </div>
              <div>
                <h4 className="cs-features-item">Nobody can unlock your secrets before the due date, not even you. Try Hard.</h4>
              </div>
              <div>
                <h4 className="cs-features-item">Send Feedback - smartrahulrdb [at] gmail [dot] com</h4>
              </div>
            </div>
          </div>

          <Footer />
        </div>
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
