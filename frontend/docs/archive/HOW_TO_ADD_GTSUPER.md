# How to Add GTSuper Font - Quick Guide

## Current Status

✅ Font configuration is ready
⏳ Waiting for font file to be added
🔄 Currently using Inter as temporary heading font

## Step-by-Step Instructions

### Step 1: Get the GTSuper Font File

You need the GTSuper font in WOFF2 format. Options:

**Option A: If you have the font license**
- Download GTSuper from your font provider
- Convert to WOFF2 if needed using [CloudConvert](https://cloudconvert.com/ttf-to-woff2)

**Option B: Use a free alternative**
- Download [Inter](https://rsms.me/inter/) (already included, good fallback)
- Or use [Outfit](https://fonts.google.com/specimen/Outfit) from Google Fonts (similar geometric style)

### Step 2: Add the Font File

1. Place your font file here:
   ```
   public/fonts/GTSuper-Regular.woff2
   ```

2. Make sure the filename is exactly: `GTSuper-Regular.woff2`

### Step 3: Uncomment the Font Configuration

**In `src/app/layout.tsx`:**

Find this section (around line 9):
```typescript
// GTSuper font - uncomment when you add the font file to public/fonts/
// import localFont from "next/font/local";
// const gtSuper = localFont({
//   src: [
//     {
//       path: "../../public/fonts/GTSuper-Regular.woff2",
//       weight: "400",
//       style: "normal",
//     },
//   ],
//   variable: "--font-gt-super",
//   display: "swap",
//   fallback: ["system-ui", "sans-serif"],
// });
```

**Uncomment it to:**
```typescript
// GTSuper font
import localFont from "next/font/local";
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

Then find this line (around line 60):
```typescript
<body className={`${inter.variable} font-sans`}>
```

**Change it to:**
```typescript
<body className={`${inter.variable} ${gtSuper.variable} font-sans`}>
```

### Step 4: Update the CSS

**In `src/app/globals.css`:**

Find this section (around line 120):
```css
/* Apply heading font to all headings */
/* Currently using Inter - switch to GTSuper when font file is added */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-inter), system-ui, sans-serif;
  font-weight: 400;
}

/* Uncomment this when GTSuper font is added:
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-gt-super), var(--font-inter), system-ui, sans-serif;
  font-weight: 400;
}
*/
```

**Replace with:**
```css
/* Apply GTSuper to all headings */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-gt-super), var(--font-inter), system-ui, sans-serif;
  font-weight: 400;
}
```

And find this section (around line 135):
```css
.font-heading {
  font-family: var(--font-inter), system-ui, sans-serif;
}

/* Uncomment when GTSuper is added:
.font-heading {
  font-family: var(--font-gt-super), var(--font-inter), system-ui, sans-serif;
}
*/
```

**Replace with:**
```css
.font-heading {
  font-family: var(--font-gt-super), var(--font-inter), system-ui, sans-serif;
}
```

### Step 5: Test

1. Restart your dev server:
   ```bash
   npm run dev
   ```

2. Open your browser and check:
   - All headings should use GTSuper
   - Font weight should be 400
   - No console errors

3. Verify in DevTools:
   ```javascript
   // Run in browser console
   const h1 = document.querySelector('h1');
   console.log(window.getComputedStyle(h1).fontFamily);
   // Should show: GTSuper
   ```

## Quick Alternative: Use Google Fonts Instead

If you don't have GTSuper, you can use a similar Google Font:

**In `src/app/layout.tsx`:**
```typescript
import { Inter, Outfit } from "next/font/google";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400"],
});
```

**In body tag:**
```typescript
<body className={`${inter.variable} ${outfit.variable} font-sans`}>
```

**In `src/app/globals.css`:**
```css
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading), var(--font-inter), system-ui, sans-serif;
  font-weight: 400;
}
```

## Troubleshooting

### Error: Font file not found
- Check the file is at `public/fonts/GTSuper-Regular.woff2`
- Check the filename spelling exactly
- Restart dev server

### Font not loading
- Clear browser cache (Ctrl+Shift+R)
- Check Network tab for 404 errors
- Verify font file format is WOFF2

### Font looks wrong
- Check font weight is 400
- Verify the font file is correct
- Try a different browser

## Need Help?

See the detailed documentation:
- `FONT_SETUP.md` - Complete setup guide
- `FONT_EXAMPLES.md` - Usage examples
- `public/fonts/README.md` - Font file requirements

---

**Current Status:** ✅ Ready to add font file
**Next Step:** Add `GTSuper-Regular.woff2` to `public/fonts/`
