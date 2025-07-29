export const CALENDAR_EVENT_CONFIG = {
  title: "Coming Secrets: 🔓 Your Message Just Unlocked",
  template: `Your time-locked message is ready to view.

📖 Open: {messageUrl}

Coming Secrets • Time-locked messaging made simple
🕒 Messages that unlock at the perfect moment

Perfect for:
• Milestone celebrations
• Anniversary surprises  
• Future reminders
• Personal time capsules

Secure • Private • Memorable
Try it: comingss.netlify.app`
};

// Helper function to get event details with URL substitution
export function getCalendarEventDetails(messageUrl: string): string {
  return CALENDAR_EVENT_CONFIG.template.replace('{messageUrl}', messageUrl);
}