# Fonts Directory

## GTSuper Font

Please add the GTSuper font file to this directory:

- **File name:** `GTSuper-Regular.woff2`
- **Weight:** 400 (Regular)
- **Format:** WOFF2 (recommended for web)

### Where to get GTSuper:

1. If you have a license, download from your font provider
2. Convert TTF/OTF to WOFF2 using tools like:
   - https://cloudconvert.com/ttf-to-woff2
   - https://transfonter.org/

### Alternative: Using a similar font

If you don't have GTSuper, you can use a similar geometric sans-serif font:
- GT America
- Circular
- Avenir Next
- Inter (already included)

### Font Configuration

The font is configured in:
- `src/app/layout.tsx` - Font loading with Next.js
- `src/app/globals.css` - Applied to all h1-h6 elements

### Usage

Once the font file is added, all headings (h1-h6) will automatically use GTSuper with a weight of 400.

You can also use the font utility class:
```tsx
<div className="font-[family-name:var(--font-gt-super)]">
  Custom text with GTSuper
</div>
```
