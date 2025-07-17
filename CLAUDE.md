# CLAUDE.md - Coming Secrets App

## Project Overview

**Coming Secrets** is a Next.js web application that allows users to create time-locked secret messages that can only be opened on a specific future date. The app features a beautiful gradient UI with animated elements and integrates with Google Calendar for notification reminders.

## Tech Stack

- **Framework**: Next.js 15.3.5 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Custom React components
- **Encryption**: CryptoJS for AES encryption
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
│   ├── page.tsx            # Main message creation form
│   ├── globals.css         # Global styles
│   ├── view/
│   │   └── page.tsx        # Secret message viewing page
│   └── calendar/
│       ├── page.tsx        # Calendar integration setup
│       └── success/
│           └── page.tsx    # Success page after calendar setup
└── lib/
    └── crypto.ts           # Encryption/decryption utilities
```

### Key Features

1. **Message Creation** (`src/app/page.tsx:16-30`)
   - Form for creating secret messages with unlock dates
   - Real-time encryption using CryptoJS
   - Quick date selection buttons (1 day, 1 week, 1 month, 1 year)

2. **Time-Locked Viewing** (`src/app/view/page.tsx:26-58`)
   - Decrypts messages only after unlock date
   - Real-time countdown timer
   - Animated UI with floating decorative elements

3. **Calendar Integration** (`src/app/calendar/page.tsx:8-48`)
   - Google Calendar event generation
   - Automatic URL encoding and formatting
   - Calendar reminder with direct message link

4. **Encryption System** (`src/lib/crypto.ts:12-65`)
   - AES encryption with fixed secret key
   - Base64 encoding for URL safety
   - Time validation utilities

## User Stories

### 1. Message Creator
**As a user who wants to send a time-locked message**

- I want to create a secret message that can only be opened on a specific date
- I want to choose from quick date options (1 day, 1 week, 1 month, 1 year) or pick a custom date
- I want to receive a shareable link that I can send to others
- I want to optionally add the unlock date to my Google Calendar as a reminder
- I want the message to be encrypted so it cannot be read before the unlock date

**Acceptance Criteria:**
- Message form requires a message and unlock date (minimum 1 day in future)
- Form validates that unlock date is in the future
- System generates encrypted URL parameter containing the message data
- User is redirected to calendar setup page after message creation
- Calendar integration creates proper Google Calendar event with message link

### 2. Message Recipient
**As a user who receives a time-locked message link**

- I want to click the link and see if the message is available to read
- If the message is locked, I want to see exactly when it will unlock
- I want to see a real-time countdown until the unlock time
- Once unlocked, I want to read the secret message
- I want to be able to create my own secret messages

**Acceptance Criteria:**
- Link automatically detects if message is locked or unlocked
- Locked messages show countdown timer with days, hours, minutes, seconds
- Timer updates every second and automatically unlocks when countdown reaches zero
- Unlocked messages display the full message content
- Error handling for invalid or corrupted links
- Navigation to create new messages

### 3. Calendar User
**As a user who wants calendar reminders**

- I want to add the message unlock date to my Google Calendar
- I want the calendar event to include the direct link to view the message
- I want to see a preview of what will be added to my calendar
- I want to be able to skip calendar integration if I don't want it

**Acceptance Criteria:**
- Calendar setup page shows message details and unlock date
- Google Calendar integration opens in popup window
- Calendar event includes proper title, date, time, and message link
- User can choose to skip calendar integration
- Success page confirms calendar was added and provides shareable link

### 4. Security-Conscious User
**As a user concerned about message security**

- I want my messages to be encrypted so they cannot be read before unlock time
- I want the system to validate unlock dates client-side
- I want error handling for corrupted or invalid message links

**Acceptance Criteria:**
- Messages are encrypted using AES encryption before URL generation
- Decryption only occurs when viewing the message
- System validates unlock dates and shows appropriate error messages
- Invalid or corrupted links show clear error messages

## Key Components

### 1. Message Creation Form (`src/app/page.tsx`)
- **Purpose**: Main interface for creating time-locked messages
- **Features**: 
  - Animated gradient background
  - Quick date selection buttons
  - Form validation
  - Real-time encryption
- **State Management**: Local state for form data and loading states

### 2. Message Viewer (`src/app/view/page.tsx`)
- **Purpose**: Display locked/unlocked messages with countdown
- **Features**:
  - Time validation and countdown timer
  - Animated decorative elements
  - Responsive design
  - Error handling
- **State Management**: Local state for message data and timer

### 3. Calendar Integration (`src/app/calendar/page.tsx`)
- **Purpose**: Google Calendar integration for unlock reminders
- **Features**:
  - Calendar URL generation
  - Popup window handling
  - Message preview
  - Skip option
- **Integration**: Google Calendar API via URL parameters

### 4. Encryption Utilities (`src/lib/crypto.ts`)
- **Purpose**: Handle message encryption/decryption and time validation
- **Functions**:
  - `encryptMessage()`: AES encrypt message data
  - `decryptMessage()`: AES decrypt message data
  - `isDateUnlocked()`: Check if current time >= unlock time
  - `getTimeRemaining()`: Calculate countdown values

## UI/UX Features

### Visual Design
- **Theme**: Radial gradient background (orange → pink → purple)
- **Typography**: Cinzel Decorative for headings, Geist for body text
- **Animations**: CSS keyframes for text effects, floating elements
- **Layout**: Responsive design with mobile-first approach

### Interactive Elements
- **Loading States**: Spinner animations during processing
- **Button Feedback**: Hover effects and color transitions
- **Form Validation**: Real-time validation with error messages
- **Copy Functionality**: One-click link copying with feedback

## Security Considerations

### Current Implementation
- **Encryption**: AES encryption with fixed secret key
- **URL Encoding**: Base64 encoding for URL safety
- **Client-Side Validation**: Date validation prevents early unlocking

### Potential Improvements
- **Key Management**: Consider dynamic key generation
- **Server-Side Validation**: Add server-side unlock time validation
- **Rate Limiting**: Implement to prevent abuse
- **HTTPS**: Ensure all traffic is encrypted

## Future Enhancements

### Planned Features
1. **Email Integration**: Send encrypted messages via email
2. **User Accounts**: Save and manage multiple messages
3. **Message Templates**: Pre-built message formats
4. **Advanced Scheduling**: Recurring messages, timezone support
5. **Delivery Confirmation**: Track when messages are viewed

### Technical Improvements
1. **Database Integration**: Store encrypted messages server-side
2. **API Routes**: RESTful API for message management
3. **Authentication**: User login and message ownership
4. **Mobile App**: React Native companion app
5. **Analytics**: Track message creation and viewing metrics

## Common Tasks

### Adding New Pages
1. Create page component in `src/app/[route]/page.tsx`
2. Use consistent background gradient styling
3. Implement proper loading states and error handling
4. Add navigation links to other pages

### Modifying Encryption
1. Update `src/lib/crypto.ts` with new encryption methods
2. Ensure backward compatibility with existing links
3. Test encryption/decryption thoroughly
4. Update TypeScript interfaces if needed

### Styling Updates
1. Modify `src/app/globals.css` for global styles
2. Use Tailwind classes for component styling
3. Maintain consistent gradient and animation patterns
4. Test responsive design across devices

### Testing Checklist
- [ ] Message creation with various dates
- [ ] Link sharing and access
- [ ] Timer countdown accuracy
- [ ] Calendar integration functionality
- [ ] Error handling for invalid links
- [ ] Responsive design on mobile/tablet
- [ ] Browser compatibility (Chrome, Firefox, Safari)

## Dependencies

### Core Dependencies
- `next`: React framework with App Router
- `react`: UI library
- `react-dom`: React DOM bindings
- `crypto-js`: Encryption library
- `tailwindcss`: CSS framework

### Development Dependencies
- `typescript`: Type checking
- `eslint`: Code linting
- `@types/*`: TypeScript definitions

## Environment Variables
None currently required - all configuration is handled through constants in the code.

## Deployment Notes
- **Platform**: Can be deployed on Vercel, Netlify, or any Node.js hosting
- **Build**: Requires `npm run build` for production
- **Environment**: No special environment variables needed
- **Domain**: Currently references `comingss.netlify.app` in calendar integration

---

*Last updated: Based on codebase analysis as of current session*