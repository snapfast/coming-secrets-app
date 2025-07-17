# Social Media Preview Setup

## Overview
This app now has Open Graph meta tags configured for rich social media previews on WhatsApp, Telegram, Discord, Twitter, and other platforms.

## Files Created

### 1. `/public/og-image.svg`
- **Size**: 1200x630 pixels (standard social media preview size)
- **Content**: Features the garden digging SVG from the home page
- **Design**: Uses the same gradient background as the home page
- **Text**: "COMING SECRETS" title with tagline
- **Usage**: Main social media preview image

### 2. Open Graph Metadata
- **Location**: `src/app/layout.tsx`
- **Features**: Complete Open Graph and Twitter Card metadata
- **Image**: References the SVG preview image
- **Domain**: Set to `https://comingss.netlify.app`

## To Complete Setup

### Step 1: Convert SVG to PNG/WEBP
You'll need to convert the SVG to actual image formats:

```bash
# Convert SVG to PNG (1200x630)
# Use any SVG to PNG converter or tool like:
# - Online: https://cloudconvert.com/svg-to-png
# - Command line: inkscape, imagemagick, etc.

# Example with imagemagick:
convert -background none -size 1200x630 public/og-image.svg public/og-image.png

# Create WEBP version for WhatsApp
convert public/og-image.png public/og-image.webp
```

### Step 2: Update Image References
Once you have PNG/WEBP files, update the metadata in `src/app/layout.tsx`:

```typescript
images: [
  {
    url: "/og-image.png",  // Changed from .svg to .png
    width: 1200,
    height: 630,
    alt: "Coming Secrets - Send time-locked messages that unlock on a specific date",
  },
],
```

### Step 3: Platform-Specific Optimization
For WhatsApp compatibility, consider using WEBP format:

```typescript
images: [
  {
    url: "/og-image.webp",  // WEBP for WhatsApp
    width: 1200,
    height: 630,
    alt: "Coming Secrets - Send time-locked messages that unlock on a specific date",
  },
],
```

## Testing Social Media Previews

### Tools to Test:
1. **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
2. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
3. **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/
4. **WhatsApp**: Test by sharing the link directly

### Test URLs:
- Homepage: `https://comingss.netlify.app`
- Secret message: `https://comingss.netlify.app/view?love=ENCRYPTED_DATA`

## Platform Compatibility

### ✅ Supported Platforms:
- **WhatsApp**: Requires WEBP format (1200x630)
- **Telegram**: Supports PNG/JPEG (1200x630)
- **Discord**: Supports PNG/JPEG (1200x630)
- **Twitter/X**: Twitter Cards enabled
- **Facebook**: Open Graph enabled
- **LinkedIn**: Open Graph enabled

### Current Status:
- ✅ Open Graph meta tags implemented
- ✅ Twitter Card meta tags implemented
- ✅ SVG preview image created
- ⏳ Need to convert SVG to PNG/WEBP
- ⏳ Need to test on actual platforms

## Design Features

The social media preview includes:
- **Garden digging icon** (scaled up from home page)
- **Gradient background** (matching home page theme)
- **"COMING SECRETS" title** in Cinzel Decorative font
- **Tagline**: "Send time-locked messages that unlock on a specific date"
- **Bottom text**: Feature highlights
- **Consistent branding** with the main application

## Notes
- The SVG format works in most browsers but PNG/WEBP is recommended for broader compatibility
- WhatsApp specifically requires WEBP format for consistent preview rendering
- All metadata is properly configured according to Open Graph Protocol standards