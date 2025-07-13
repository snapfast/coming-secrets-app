'use client';

import { useState } from 'react';

export default function Home() {
  const [formData, setFormData] = useState({
    senderEmail: '',
    recipientEmail: '',
    message: '',
    unlockDate: ''
  });

  const [generatedLink, setGeneratedLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    try {
      const { encryptMessage } = await import('@/lib/crypto');
      const encrypted = encryptMessage(formData);
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/view?love=${encrypted}`;
      setGeneratedLink(link);
    } catch (error) {
      console.error('Error generating link:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 dark:from-gray-900 dark:to-purple-900 p-8">
      <div className="max-w-2xl mx-auto pt-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white dark:text-purple-100 mb-4">
            Comings Secrets
          </h1>
          <p className="text-lg text-purple-200 dark:text-purple-300">
            Send time-locked messages that can only be opened on a comings date
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-purple-800 dark:border-purple-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-purple-900 dark:text-purple-300 mb-2">
                Secret Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-purple-400 dark:border-purple-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-800 focus:border-purple-800 dark:bg-gray-700 dark:text-white"
                placeholder="Write your secret message here..."
                required
              />
            </div>

            <div>
              <label htmlFor="unlockDate" className="block text-sm font-medium text-purple-900 dark:text-purple-300 mb-2">
                Unlock Date
              </label>
              <input
                type="date"
                id="unlockDate"
                name="unlockDate"
                value={formData.unlockDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-purple-400 dark:border-purple-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-800 focus:border-purple-800 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="senderEmail" className="block text-sm font-medium text-purple-900 dark:text-purple-300 mb-2">
                  Your Email (optional)
                </label>
                <input
                  type="email"
                  id="senderEmail"
                  name="senderEmail"
                  value={formData.senderEmail}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-purple-400 dark:border-purple-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-800 focus:border-purple-800 dark:bg-gray-700 dark:text-white"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="recipientEmail" className="block text-sm font-medium text-purple-900 dark:text-purple-300 mb-2">
                  Recipient's Email (optional)
                </label>
                <input
                  type="email"
                  id="recipientEmail"
                  name="recipientEmail"
                  value={formData.recipientEmail}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-purple-400 dark:border-purple-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-800 focus:border-purple-800 dark:bg-gray-700 dark:text-white"
                  placeholder="recipient@email.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating || !formData.message || !formData.unlockDate}
              className="w-full bg-purple-800 hover:bg-purple-900 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:ring-offset-2 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating...' : 'Generate Secret Link'}
            </button>
          </form>

          {generatedLink && (
            <div className="mt-8 p-6 bg-purple-900/10 dark:bg-purple-900/20 border border-purple-700 dark:border-purple-800 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-200 mb-3">
                Secret Link Generated! 🎉
              </h3>
              <p className="text-sm text-purple-800 dark:text-purple-300 mb-3">
                Share this link with your recipient. They can only view the message after the unlock date.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={generatedLink}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-purple-600 dark:border-purple-600 rounded-md focus:outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className={`px-4 py-2 text-white text-sm font-medium rounded-md transition-all duration-200 ${
                    isCopied 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-purple-800 hover:bg-purple-900'
                  }`}
                >
                  {isCopied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Garden digging icon at the bottom */}
        <div className="flex justify-center mt-16">
          <img src="/icon-garden-dig.svg" alt="Garden Digging" width="120" height="120" />
        </div>
      </div>
    </div>
  );
}
