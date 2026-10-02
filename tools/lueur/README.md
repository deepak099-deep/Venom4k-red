# Lueur

A tiny, dependency-free Node.js CLI for checking WCAG contrast ratios in UI color pairs.

**Lueur** means “glow” in French: it checks whether foreground text still shines clearly against its background.

## Usage

```bash
node src/cli.js "#ffffff" "#111111"
node src/cli.js --json "#ffffff" "#000000"
```

Batch input:

```json
[
  {"foreground":"#ffffff","background":"#111111"},
  {"foreground":"#777777","background":"#ffffff"}
]
```

```bash
node src/cli.js --file pairs.json
```

The tool reports the ratio plus WCAG AA/AAA results for normal and large text. Exit code 0 means all pairs meet AA for normal text, 1 means at least one pair fails, and 2 means invalid input.

## Technical notes

Lueur converts sRGB channels to linear light, calculates relative luminance, and applies the WCAG contrast formula. It supports three- and six-digit hex colors, makes no network requests, and has no runtime dependencies.

## Testing

```bash
npm test
```
