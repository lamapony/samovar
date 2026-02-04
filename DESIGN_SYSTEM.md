# Samovar Design System

## 1. Philosophy
**Academic yet Accessible.** The design should feel structured and trustworthy (like a university textbook) but interactive and modern (like a digital app). It bridges Danish simplicity with the depth of the Russian language.

**Keywords:** Clean, Structured, Typographic, Educational, Focused.

## 2. Color Palette

### Primary Brand
- **Deep Ink (`--text-ink`)**: `#2b2b2b` - Main text, headings. High contrast.
- **Academic Red (`--accent-red`)**: `#a33e3e` - Primary actions, accents, "Classic" feel.
- **Nordic Blue (`--accent-blue`)**: `#2c3e50` - Secondary accents, headers, "Danish" feel.

### Functional
- **Paper White (`--bg-paper`)**: `#f9f9f7` - Main background. Reduces eye strain compared to pure white.
- **Card White (`--bg-card`)**: `#ffffff` - Content blocks, cards.
- **Gold (`--accent-gold`)**: `#D4AF37` - Advanced/Premium features.

### Feedback
- **Success (`--color-success`)**: `#27ae60` - Correct answers, progress.
- **Error (`--color-error`)**: `#c0392b` - Incorrect answers, alerts.
- **Warning (`--color-warning`)**: `#f39c12` - Hints, notes.

## 3. Typography

### Font Families
- **Headings (Serif)**: `Georgia`, `Times New Roman`, serif. Used for: Page Titles, Section Headers, "Academic" notes.
- **Body/UI (Sans-Serif)**: `-apple-system`, `BlinkMacSystemFont`, `Helvetica Neue`, sans-serif. Used for: Body text, UI elements, Buttons, Navigation.

### Scale (Base 16px)
- **Display**: 3rem (48px) - Page Titles
- **H2**: 2rem (32px) - Section Headers
- **H3**: 1.25rem (20px) - Module/Card Headers
- **Body**: 1rem (16px) - Standard text
- **Small**: 0.875rem (14px) - Meta info, notes
- **Micro**: 0.75rem (12px) - Tags, labels

## 4. Layout & Spacing

- **Container**: Max-width `1100px`. Centered.
- **Grid**: 12-column conceptual grid.
  - **Sidebar Layout**: Main content (flexible) + Sidebar (280px).
- **Spacing Unit**: `8px`.
  - xs: 8px
  - s: 16px
  - m: 24px
  - l: 32px
  - xl: 64px

## 5. Components

### Buttons
- **Primary**: Filled `accent-red`, white text. Rounded corners (4px).
- **Secondary**: Outline `accent-red`, `accent-red` text.
- **Interactive**: Pill-shaped for quiz options.

### Cards / Modules
- **Background**: White (`--bg-card`) on paper background (`--bg-paper`).
- **Border**: Subtle, uniform border using `--line-color` (`#e0e0e0`). **No colored left/right borders.**
- **Shadow**: Minimal shadow: `0 2px 8px rgba(0, 0, 0, 0.04)`.
- **Hover**: Slight lift effect (`translateY(-2px)`) with enhanced shadow.
- **Spacing**: Internal padding uses spacing units (`--space-s`, `--space-m`).
- **Philosophy**: Keep cards clean and minimal. Avoid heavy color accents on borders—let typography and content hierarchy do the work.

### Image Placeholders
- **Style**: Light gray background (`#f0f0f0`), dashed border.
- **Content**: Centered text description of the required illustration.
- **Class**: `.img-placeholder`

### Visual Elements & Icons
- **Avoid excessive emojis**. Use them sparingly (max 1-2 per page) or not at all.
- **Prefer typography** for emphasis: bold, italic, color accents.
- **Icons**: If needed, use simple, monochrome SVG icons that match the academic aesthetic.

## 6. Visual Formats
- **Web**: Responsive, accessible.
- **Print/PDF**: High contrast, serif-heavy, ink-saving.
- **Mobile**: Stacked layouts, larger touch targets.





