/**
 * Google Analytics Utilities - OPTIONAL: Custom event tracking functions
 * 
 * This file provides helper functions for tracking specific user interactions.
 * The main GA script is loaded in layout.tsx (required for basic page tracking).
 * 
 * Use these functions to track:
 * - Button clicks (share, create secret)
 * - Form submissions
 * - Feature usage (templates, calendar reminders)
 * - User engagement metrics
 */

declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: Record<string, unknown>) => void;
  }
}

export const GA_MEASUREMENT_ID = 'G-53FQVZMTS5';

export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

export const trackSecretCreated = () => {
  trackEvent('secret_created', 'engagement', 'unlock_date', undefined);
};

export const trackSecretViewed = (isUnlocked: boolean) => {
  trackEvent('secret_viewed', 'engagement', isUnlocked ? 'unlocked' : 'locked');
};

export const trackShareAction = (platform: string) => {
  trackEvent('share', 'social', platform);
};

export const trackCalendarReminder = (provider: string) => {
  trackEvent('calendar_reminder', 'utility', provider);
};

export const trackTemplateUsed = (templateType: string) => {
  trackEvent('template_used', 'creation', templateType);
};