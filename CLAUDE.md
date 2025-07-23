# CLAUDE.md - Coming Secrets App

## Project Overview

**Coming Secrets** is a Next.js web application that allows users to create time-locked secret messages that can only be opened on a specific future date. The app features a beautiful gradient UI with animated elements and smart reminders through calendar systems (for locked messages only).

## Tech Stack

- **Framework**: Next.js 15.3.5 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Custom React components
- **Encryption**: CryptoJS for AES encryption with Brotli compression
- **Compression**: Brotli compression for URL size optimization
- **Time Security**: Server-synchronized UTC time (WorldTimeAPI)
- **Fonts**: Google Fonts (Geist, Geist Mono, Cinzel Decorative)
- **Build Tool**: Turbopack (dev mode)

## Development Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint
```

## Architecture

### File Structure
```
src/
├── app/
│   ├── layout.tsx          # Root layout with fonts and metadata
│   ├── page.tsx            # Message creation form with character limits (1000 chars)
│   ├── globals.css         # Global styles
│   ├── view/
│   │   └── page.tsx        # Message viewing with single hint (no reactions/calendar)
│   ├── test/
│   │   └── page.tsx        # Comprehensive 1000-word integrity testing suite
└── lib/
    ├── crypto.ts           # Brotli compression + AES encryption (v3 format only)
    ├── time.ts             # Server time synchronization utilities
    └── analytics.ts        # Google Analytics tracking functions
```

### Key Features

1. **Alpha Message Creation** (`src/app/page.tsx`)
   - Form with message templates for common occasions
   - Preview functionality showing recipient experience
   - Single hint system (always visible)
   - Enhanced sharing options (WhatsApp, Email, Discord, Telegram, LinkedIn)
   - Sender personalization with optional name field
   - Character limits: 1000 chars message, 100 chars sender, 200 chars hint
   - Real-time Brotli compression + AES encryption

2. **Simplified Time-Locked Viewing** (`src/app/view/page.tsx`)
   - Single hint display (always visible, no progressive unlock)
   - Enhanced countdown with multiple formats and progress bar
   - Celebration animations for unlock moment
   - Calendar reminders only for locked messages (hidden after unlock)
   - No reaction/reply system (removed for alpha)
   - Sender context display

3. **Smart Reminders Integration** (Locked Messages Only)
   - Calendar buttons with logos (Google, Apple, Outlook)
   - Inline integration within viewer flow (locked state only)
   - Popup handling for web calendars
   - ICS file generation for offline calendars
   - Error handling for blocked popups

4. **Brotli Compression + AES Encryption** (`src/lib/crypto.ts`)
   - Brotli compression for significant URL size reduction
   - AES encryption with fixed secret key
   - v3 format only (no backward compatibility for alpha)
   - Support for sender name and single hint
   - Base64URL encoding for URL safety
   - Secure time validation using server-synchronized time

5. **Server Time Security System** (`src/lib/time.ts`)
   - Clock manipulation prevention via server UTC time synchronization
   - WorldTimeAPI integration with multi-layer fallbacks
   - Cached time offset with periodic re-synchronization
   - Secure unlock validation resistant to device clock changes

6. **Analytics Integration** (`src/lib/analytics.ts`)
   - Google Analytics tracking for all user interactions
   - Message creation, template usage, and sharing analytics
   - Calendar integration and viewing behavior tracking
   - Complete user journey analytics

7. **Comprehensive Testing Suite** (`src/app/test/page.tsx`)
   - 1000-word message integrity testing
   - SHA-256 cryptographic verification
   - Character-by-character data preservation testing
   - Unicode, emoji, and special character handling
   - Compression ratio and performance analysis
   - Random and deterministic test modes

## Enhanced User Flows

### Flow 1: Message Creator (Sender) - Enhanced
**User Journey:** Template → Create → Preview → Share → Track

1. **Template Selection** (Optional)
   - Choose from 8 pre-built templates (birthday, anniversary, graduation, etc.)
   - Templates auto-fill message content
   - Customizable after selection

2. **Alpha Message Creation**
   - Write or customize message content (max 1000 characters)
   - Add optional sender name for personalization (max 100 characters)
   - Add single hint that's always visible (max 200 characters)
   - Choose unlock date (quick options or custom)
   - Preview how recipients will see the message

3. **Advanced Sharing**
   - Copy generated view URL to clipboard
   - Share via multiple platforms (WhatsApp, Email, Discord, Telegram, LinkedIn)
   - Social media integration with platform-specific formatting
   - Clean, emoji-free interface

**Alpha Features:**
- Message preview with live countdown simulation
- Template system for common occasions
- Single hint system (always visible)
- Sender personalization with character limits
- Multi-platform sharing with proper formatting
- Brotli compression for optimized URL lengths

### Flow 2: Message Viewer (Recipient) - Alpha Simplified
**User Journey:** View → Remind → Unlock → Read

1. **Simplified Viewing Experience**
   - Sender name display when provided
   - Single hint always visible (no progressive unlock)
   - Enhanced countdown with multiple formats
   - Progress bar showing time elapsed
   - Celebration animations for unlock

2. **Smart Reminders Integration** (Locked Messages Only)
   - Calendar buttons directly in viewer (locked state only)
   - Support for Google, Apple, and Outlook calendars
   - One-click reminder setup
   - Error handling for blocked popups
   - Hidden after message unlocks

3. **Post-Unlock Experience** (Simplified)
   - Celebration effects with confetti animation
   - Message display with sender context
   - No reaction/reply system (removed for alpha)
   - Clean, focused reading experience

**Alpha Features:**
- Single hint system (always visible)
- Multi-format countdown display
- Celebration animations
- Calendar setup only for locked messages
- Simplified post-unlock experience
- Brotli-compressed URLs for better sharing

## User Stories - Enhanced

### 1. Enhanced Message Creator
**As a user who wants to send a personalized time-locked message**

- I want to use pre-built templates for common occasions
- I want to preview how my message will look to recipients
- I want to add my name so recipients know who sent it
- I want to include a single hint that's always visible
- I want to share via multiple platforms easily
- I want a clean, professional sharing interface

**New Acceptance Criteria:**
- Template selection with 8 common occasion types
- Preview modal showing recipient experience with live countdown
- Sender name field for personalization
- Single hint field with 200 character limit
- Enhanced sharing grid with 6 platforms (no emojis)
- Purple-themed success section

### 2. Enhanced Message Viewer
**As a recipient who wants an engaging waiting experience**

- I want to see who sent me the message
- I want to see a single hint that's always visible
- I want an engaging countdown with different formats
- I want celebration effects when the message unlocks
- I want easy reminder setup without navigating away (locked messages only)

**Alpha Acceptance Criteria:**
- Sender name display in both locked and unlocked states
- Single hint always visible (no progressive unlock)
- Multi-format countdown (grid view + digital clock for close dates)
- Progress bar showing time remaining
- Celebration animation with confetti effects
- Calendar buttons only visible for locked messages
- No reaction/reply system (removed for alpha)

### 3. Smart Reminders User
**As a user who wants convenient reminder setup**

- I want beautiful, professional calendar integration buttons
- I want to set reminders without leaving the message page
- I want support for my preferred calendar system
- I want clear feedback if something goes wrong
- I want one-click setup for each calendar type

**New Acceptance Criteria:**
- Professional calendar buttons with logos and descriptions
- Support for Google (popup), Apple (ICS download), Outlook (popup)
- Inline integration within locked views only
- Error handling with clear user feedback
- Responsive design for all screen sizes

## Enhanced Key Components

### 1. Alpha Message Creation Form (`src/app/page.tsx`)
- **Purpose**: Streamlined message creation with templates and preview
- **Alpha Features**: 
  - Template selection grid with 8 common occasions
  - Sender name field for personalization (100 char limit)
  - Single hint field (200 char limit)
  - Preview modal with live countdown simulation
  - Enhanced sharing options (6 platforms)
  - Purple-themed success section
- **State Management**: State for templates, preview, single hint, and sharing

### 2. Simplified Message Viewer (`src/app/view/page.tsx`)
- **Purpose**: Clean viewing experience with calendar reminders for locked messages
- **Alpha Features**:
  - Single hint display (always visible)
  - Multi-format countdown display
  - Celebration animations
  - Calendar buttons (locked messages only)
  - Sender context display
  - Centered "Create New Message" button
  - Natural footer positioning with optimal spacing
- **State Management**: State for single hint, celebrations, and calendar integration (locked only)
- **Layout**: Consistent vertical layout with centered elements and proper content-footer spacing

### 3. Smart Reminders Integration (Locked Messages Only)
- **Purpose**: Calendar integration for locked messages only
- **Features**:
  - Beautiful calendar buttons with logos
  - Google Calendar popup integration
  - Apple Calendar ICS file generation
  - Outlook Calendar popup integration
  - Error handling for blocked popups
- **Integration**: Direct integration within locked message view only

### 4. Alpha Brotli Compression + AES Encryption (`src/lib/crypto.ts`)
- **Purpose**: Efficient compression and encryption for alpha product
- **Alpha Functions**:
  - Brotli compression for significant URL size reduction
  - Support for optional sender name (100 char limit)
  - Support for single hint (200 char limit)
  - v3 format only (no backward compatibility)
  - Enhanced TypeScript interfaces
  - Base64URL encoding for URL safety

## Enhanced UI/UX Features

### Alpha Visual Elements
- **Template Grid**: 2x4 grid with colored buttons for message templates
- **Preview Modal**: Full-screen modal showing recipient experience
- **Single Hint Display**: Always visible hint card
- **Calendar Buttons**: Professional cards with logos (locked messages only)
- **Celebration Effects**: Confetti animation with countdown

### Enhanced Design System

#### Updated Color Palette
- **Primary Gradient**: `bg-gradient-to-br from-orange-600 via-pink-600 to-purple-700`
- **Success Theme**: Updated to purple (`bg-purple-50 dark:bg-purple-900/20`)
- **Template Buttons**: Blue theme (`bg-blue-100 dark:bg-blue-800`)
- **Calendar Cards**: White cards with colored accents
- **Celebration**: Yellow confetti with bounce animations

#### Alpha Component Patterns
- **Template Grid**: `grid-cols-2 sm:grid-cols-4 gap-2` for template selection
- **Preview Modal**: Fixed overlay with centered content
- **Calendar Cards**: Vertical layout with `flex flex-col gap-3` (locked messages only)
- **Sharing Grid**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3`
- **Button Positioning**: Centered buttons using `flex justify-center`
- **Content Spacing**: Optimal `pb-8` and `mb-8` spacing for footer separation

### Enhanced Accessibility
- **Focus Management**: Proper focus handling in modals and forms
- **Keyboard Navigation**: Full keyboard support for all new features
- **Screen Reader Support**: Proper ARIA labels for complex components
- **Error Handling**: Clear error messages for calendar integration
- **Loading States**: Proper loading indicators for all async operations

## Enhanced Security Considerations

### Server Time Synchronization Security
- **Clock Manipulation Prevention**: Uses server-synchronized UTC time to prevent users from changing device clocks to unlock messages early
- **WorldTimeAPI Integration**: Primary time source via `https://worldtimeapi.org/api/timezone/UTC`
- **Multi-Layer Fallback**: WorldTimeAPI → HTTP Date headers → Local time (with security warning)
- **Time Offset Caching**: Calculates and caches server-client time difference for performance
- **Periodic Re-sync**: Automatically re-synchronizes every 5 minutes to maintain accuracy

### Security Functions (`src/lib/time.ts`)
- `getServerTime()`: Async function for accurate server time
- `getServerTimeSync()`: Synchronous function using cached offset for frequent operations
- `isDateUnlockedServer()`: Secure unlock validation using server time
- `getTimeRemainingServer()`: Secure countdown using server time
- `initTimeSync()`: Initialize time synchronization on app load

### Alpha Encryption & Validation
- **Brotli + AES Encryption**: Compression with encryption supporting sender name and single hint
- **Secure Time Validation**: All unlock checks use `isDateUnlockedSecure()` instead of local time
- **v3 Format Only**: No backward compatibility for alpha product
- **Client-Side Validation**: Enhanced date validation with server time
- **Error Handling**: Improved error messages for invalid data and time sync failures

### Data Structure (Alpha)
```typescript
interface SecretData {
  message: string;       // Max 1000 characters
  unlockDate: string;
  senderName?: string;   // Optional sender name (max 100 chars)
  hint?: string;         // Single optional hint (max 200 chars)
}
```

## Enhanced Testing Checklist

### Alpha Feature Testing
- [ ] Template selection and application
- [ ] Preview modal functionality with countdown
- [ ] Single hint display (always visible)
- [ ] Sender name display in both states
- [ ] Character limits: 1000/100/200 chars (message/sender/hint)
- [ ] Enhanced sharing options (6 platforms)
- [ ] Calendar integration only for locked messages
- [ ] Calendar buttons hidden after unlock
- [ ] Celebration animations
- [ ] Analytics tracking for all user interactions
- [ ] Brotli compression and URL optimization
- [ ] v3 format encryption/decryption
- [ ] No reaction/reply system (removed)
- [ ] Mobile responsiveness for all features

### Security Testing
- [ ] Server time synchronization on page load
- [ ] Clock manipulation resistance (change device time, verify unlock doesn't work early)
- [ ] WorldTimeAPI fallback to HTTP Date headers
- [ ] Time offset caching and 5-minute re-sync
- [ ] Secure unlock validation using server time
- [ ] Error handling for time sync failures

### Existing Feature Testing
- [ ] Message creation with various dates
- [ ] Link sharing and access
- [ ] Timer countdown accuracy
- [ ] Error handling for invalid links
- [ ] Responsive design on mobile/tablet
- [ ] Browser compatibility (Chrome, Firefox, Safari)
- [ ] Dark mode support

## Recent Layout Improvements (January 2025)

### UI/UX Design Decisions
- **Vertical Layout Priority**: Changed from horizontal grids to vertical layouts for better mobile experience
- **Centered Navigation**: "Create New Message" button centered for better visual balance
- **Footer Positioning**: Moved from fixed positioning to natural document flow
- **Optimal Spacing**: Reduced spacing from 32 units to 8 units (`pb-8`, `mb-8`) to match home page consistency
- **Clean Layout**: Removed excessive padding that created awkward gaps between content and footer

### Layout Changes Applied
1. **Calendar Buttons**: Changed from `grid-cols-3` to `flex flex-col` for vertical stacking
2. **Button Centering**: Updated navigation buttons from `justify-end` to `justify-center`
3. **Footer Integration**: Removed fixed positioning wrappers, uses natural flow
4. **Spacing Consistency**: Applied consistent `pb-8` and `mb-8` across all page states
5. **Content Separation**: Proper spacing between main content and footer without excessive gaps

### Design Philosophy
- **"Less is More"**: Reduced spacing creates cleaner, more professional appearance
- **Consistency**: Matching spacing patterns between home and view pages
- **Mobile-First**: Vertical layouts work better on smaller screens
- **Natural Flow**: Footer follows document flow rather than fixed positioning

## Common Tasks - Enhanced

### Adding New Templates
1. Update `messageTemplates` object in `src/app/page.tsx`
2. Add new template with appropriate content
3. Test template application and preview
4. Ensure template content works with single hint system

### Modifying Calendar Integration
1. Update calendar generation functions for new providers
2. Test popup handling and ICS file generation
3. Update button styling and descriptions
4. Test error handling for blocked popups

### Enhancing Sharing Options
1. Add new platform to sharing grid
2. Implement platform-specific URL formatting
3. Test platform integration and fallbacks
4. Update button styling consistency

### Layout Modifications
1. Maintain vertical layout pattern for new components
2. Use `flex justify-center` for button positioning
3. Apply consistent spacing (`pb-8`, `mb-8`) for content separation
4. Avoid fixed positioning unless absolutely necessary
5. Test spacing on both mobile and desktop viewports

## Performance Optimizations

### New Optimizations
- **useCallback**: Proper memoization for timer functions
- **Component Splitting**: Separate components for complex features
- **Lazy Loading**: Dynamic imports for calendar functions
- **Error Boundaries**: Proper error handling for all new features

### Bundle Size Considerations
- **External Images**: Uses CDN for platform logos
- **Code Splitting**: Calendar functions loaded on demand
- **Tree Shaking**: Unused template functions eliminated

## Dependencies - Enhanced

### Core Dependencies
- `next`: React framework with App Router
- `react`: UI library with hooks
- `react-dom`: React DOM bindings
- `crypto-js`: Encryption library
- `tailwindcss`: CSS framework

### Development Dependencies
- `typescript`: Type checking
- `eslint`: Code linting with enhanced rules
- `@types/*`: TypeScript definitions

## Deployment Notes - Enhanced

### Build Requirements
- **Static Images**: External CDN images for platform logos
- **Build Size**: Optimized with proper tree shaking
- **Environment**: No additional environment variables needed
- **Performance**: Enhanced with proper memoization

### Production Considerations
- **Calendar Integration**: Popup handling requires proper CORS setup
- **Image Loading**: External images may need CSP configuration
- **Error Handling**: Proper error boundaries for all new features

---

## Current App State (January 2025) - Alpha Version

### Major Alpha Changes Completed
1. **Simplified Hints System**: Changed from progressive hints to single always-visible hint
2. **Removed Reaction System**: Eliminated emoji reactions and reply functionality for cleaner UX
3. **Calendar Button Management**: Hidden calendar reminders after message unlocks
4. **Brotli Compression**: Implemented Brotli compression with AES encryption (v3 format)
5. **Character Limits**: Enforced 1000/100/200 character limits for message/sender/hint
6. **Backward Compatibility Removal**: v3 format only, no legacy support for alpha product
7. **Comprehensive Testing Suite**: Added `/test` page for 1000-word message integrity testing

### Current Feature Set (Alpha)
- ✅ Message creation with templates and preview
- ✅ Single hint system (always visible)
- ✅ Character limits with validation
- ✅ Brotli compression + AES encryption
- ✅ Server time synchronization
- ✅ Calendar reminders (locked messages only)
- ✅ Multi-platform sharing
- ✅ Analytics tracking
- ✅ Comprehensive testing suite
- ❌ Progressive hints (removed)
- ❌ Reaction/reply system (removed)
- ❌ Calendar buttons for unlocked messages (removed)
- ❌ Backward compatibility (removed)

### View Page Layout (`src/app/view/page.tsx`)
- **Navigation**: Centered "Create New Message" button for better visual balance
- **Content Layout**: Vertical-first design with proper spacing
- **Calendar Integration**: Vertical stacking of calendar options (locked messages only)
- **Footer**: Natural document flow positioning with consistent spacing
- **Spacing System**: Optimized `pb-8` and `mb-8` values matching home page design
- **Responsive Design**: Mobile-optimized vertical layouts throughout

### Footer Component (`src/components/Footer.tsx`)
- **Simple Design**: Clean garden icon without excessive margins
- **Natural Positioning**: Flows with document rather than fixed positioning
- **Consistent Spacing**: Matches home page footer treatment

### Design System Consistency
- **Cross-Page Harmony**: View page now matches home page spacing and layout patterns
- **Mobile-First Approach**: Vertical layouts prioritized for better mobile UX
- **Clean Aesthetics**: Reduced excessive spacing for professional appearance
- **Centered Elements**: Key navigation elements centered for visual balance

---

### Testing Suite (`src/app/test/page.tsx`)
- **Comprehensive Testing**: 1000-word message integrity verification
- **Two Test Modes**: Random (with special chars/emojis) and Deterministic (predictable sequence)
- **SHA-256 Verification**: Cryptographic hashing for data integrity confirmation
- **Character Analysis**: Unicode, emoji, and special character preservation testing
- **Performance Metrics**: Compression ratio analysis and URL length validation
- **Error Detection**: Precise character-level difference reporting

### Dependencies (Alpha)
```json
{
  "brotli-compress": "^1.3.3",    // New: Brotli compression
  "crypto-js": "^4.2.0",          // AES encryption
  "next": "^15.3.5",              // React framework
  "react": "^19.0.0",             // UI library
  "tailwindcss": "^4"             // CSS framework
}
```

---

*Last updated: January 2025 - Alpha version with Brotli compression, simplified UX, character limits, comprehensive testing suite, and removal of backward compatibility*