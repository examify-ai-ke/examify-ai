# GTSuper Font Setup

## Overview

The GTSuper font has been configured for all headings in the application with a weight of 400 (Regular).

## Changes Made

### 1. Layout Configuration (`src/app/layout.tsx`)

Added GTSuper as a local font using Next.js `localFont`:

```typescript
const gtSuper = localFont({
  src: [
    {
      path: "../../public/fonts/GTSuper-Regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-gt-super",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});
```

Applied both Inter and GTSuper font variables to the body:

```typescript
<body className={`${inter.variable} ${gtSuper.variable} font-sans`}>
```

### 2. Global CSS (`src/app/globals.css`)

**Added font variable to theme:**
```css
--font-heading: var(--font-gt-super);
```

**Applied GTSuper to all headings:**
```css
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-gt-super), var(--font-inter), system-ui, sans-serif;
  font-weight: 400;
}
```

**Added utility class:**
```css
.font-heading {
  font-family: var(--font-gt-super), var(--font-inter), system-ui, sans-serif;
}
```

### 3. Font Files Directory

Created `public/fonts/` directory with instructions for adding the font file.

## Required Action: Add Font File

**⚠️ IMPORTANT:** You need to add the actual GTSuper font file:

1. **File location:** `public/fonts/GTSuper-Regular.woff2`
2. **Format:** WOFF2 (recommended for web performance)
3. **Weight:** 400 (Regular)

### How to get the font file:

1. **If you have a license:** Download from your font provider
2. **Convert existing font:** Use tools like:
   - [CloudConvert](https://cloudconvert.com/ttf-to-woff2)
   - [Transfonter](https://transfonter.org/)

## Usage

### Automatic Application

All heading elements (h1-h6) will automatically use GTSuper:

```tsx
<h1>This uses GTSuper</h1>
<h2>This also uses GTSuper</h2>
```

### Manual Application

Use the utility class for non-heading elements:

```tsx
<div className="font-heading">
  This text uses GTSuper
</div>
```

### In Components

Your landing page components already use heading tags, so they'll automatically get GTSuper:

```tsx
// HeroSection
<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
  Master Your Exams with Past Papers
</h1>

// RecentQuestionsSection
<h2 className="text-3xl md:text-4xl font-bold">
  Recent Questions
</h2>
```

## Font Stack

The font stack with fallbacks:
1. **GTSuper** (custom font, weight 400)
2. **Inter** (Google Font, variable weights)
3. **system-ui** (system default)
4. **sans-serif** (generic fallback)

## Performance

- **Font Display:** `swap` - Shows fallback font immediately, swaps to GTSuper when loaded
- **Format:** WOFF2 - Best compression and browser support
- **Loading:** Optimized by Next.js font system

## Testing

After adding the font file, verify it's working:

1. **Check browser DevTools:**
   - Inspect any heading element
   - Look for `font-family` in computed styles
   - Should show GTSuper

2. **Visual check:**
   - Headings should have the GTSuper appearance
   - Weight should be 400 (Regular)

3. **Network tab:**
   - Look for `GTSuper-Regular.woff2` being loaded
   - Should load once and be cached

## Troubleshooting

### Font not loading?

1. **Check file path:** Ensure `public/fonts/GTSuper-Regular.woff2` exists
2. **Check file format:** Must be WOFF2 format
3. **Clear cache:** Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
4. **Check console:** Look for 404 errors for the font file

### Font looks wrong?

1. **Verify weight:** Should be 400 (Regular)
2. **Check fallback:** If GTSuper isn't loading, Inter will be used
3. **Inspect element:** Use DevTools to see which font is actually applied

## Alternative Fonts

If you don't have access to GTSuper, similar fonts include:
- **GT America** (same family)
- **Circular** (similar geometric style)
- **Avenir Next** (classic geometric sans)
- **Inter** (already included, good fallback)

To use an alternative, update the font configuration in `src/app/layout.tsx`.

---

**Status:** ✅ Configuration complete, awaiting font file
**Next Step:** Add `GTSuper-Regular.woff2` to `public/fonts/` directory
