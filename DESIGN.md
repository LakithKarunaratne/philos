# Design

## Layout

Mobile first view with panes representing different purposes.

## Theme

`happy-philo` is the theme name and the Design uses TweakCN theme at https://tweakcn.com/themes/cmu8o5zjc000304la0s2jevx0

Design is centered around approachability, avoids feeling corporate / business or bearuecratic. Also not too funky or playful

- Colors: A comforting palette of warm oranges and earthy tones, like a rich #e67e22 for primary, and a soft #fdfcf8 background in light mode. Dark mode uses deeper, cozy tones.
- Fonts: 'Quicksand' for a friendly sans-serif feel, paired with 'Georgia' for serif.
- Radius: A soft 1rem for a gentle and approachable look.
- Letter Spacing: A neutral 0em for clarity.
- Shadows: Subtle, warm-tinted shadows in light mode, becoming more pronounced in dark mode.


```
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
  --background: #fdfcf8;
  --foreground: #3d3a35;
  --card: #ffffff;
  --card-foreground: #3d3a35;
  --popover: #ffffff;
  --popover-foreground: #3d3a35;
  --primary: #e67e22;
  --primary-foreground: #ffffff;
  --secondary: #f4ede4;
  --secondary-foreground: #5d574d;
  --muted: #f4ede4;
  --muted-foreground: #857e74;
  --accent: #ffefd5;
  --accent-foreground: #d35400;
  --destructive: #e74c3c;
  --destructive-foreground: #ffffff;
  --border: #e8e1d5;
  --input: #e8e1d5;
  --ring: #e67e22;
  --chart-1: #e67e22;
  --chart-2: #27ae60;
  --chart-3: #f1c40f;
  --chart-4: #9b59b6;
  --chart-5: #e74c3c;
  --sidebar: #faf7f2;
  --sidebar-foreground: #5d574d;
  --sidebar-primary: #e67e22;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #f4ede4;
  --sidebar-accent-foreground: #3d3a35;
  --sidebar-border: #e8e1d5;
  --sidebar-ring: #e67e22;
  --font-sans: 'Quicksand', 'Inter', system-ui, sans-serif;
  --font-serif: Georgia, serif;
  --font-mono: monospace;
  --radius: 1rem;
  --shadow-x: 0px;
  --shadow-y: 4px;
  --shadow-blur: 12px;
  --shadow-spread: 0px;
  --shadow-opacity: 0.08;
  --shadow-color: #4a3c2a;
  --shadow-2xs: 0px 4px 12px 0px hsl(33.7500 27.5862% 22.7451% / 0.04);
  --shadow-xs: 0px 4px 12px 0px hsl(33.7500 27.5862% 22.7451% / 0.04);
  --shadow-sm: 0px 4px 12px 0px hsl(33.7500 27.5862% 22.7451% / 0.08), 0px 1px 2px -1px hsl(33.7500 27.5862% 22.7451% / 0.08);
  --shadow: 0px 4px 12px 0px hsl(33.7500 27.5862% 22.7451% / 0.08), 0px 1px 2px -1px hsl(33.7500 27.5862% 22.7451% / 0.08);
  --shadow-md: 0px 4px 12px 0px hsl(33.7500 27.5862% 22.7451% / 0.08), 0px 2px 4px -1px hsl(33.7500 27.5862% 22.7451% / 0.08);
  --shadow-lg: 0px 4px 12px 0px hsl(33.7500 27.5862% 22.7451% / 0.08), 0px 4px 6px -1px hsl(33.7500 27.5862% 22.7451% / 0.08);
  --shadow-xl: 0px 4px 12px 0px hsl(33.7500 27.5862% 22.7451% / 0.08), 0px 8px 10px -1px hsl(33.7500 27.5862% 22.7451% / 0.08);
  --shadow-2xl: 0px 4px 12px 0px hsl(33.7500 27.5862% 22.7451% / 0.20);
  --tracking-normal: 0em;
  --spacing: 0.25rem;
}

.dark {
  --background: #2c2925;
  --foreground: #f7f3ed;
  --card: #36322d;
  --card-foreground: #f7f3ed;
  --popover: #36322d;
  --popover-foreground: #f7f3ed;
  --primary: #ff9f43;
  --primary-foreground: #2c2925;
  --secondary: #4a443d;
  --secondary-foreground: #d4cdc3;
  --muted: #3d3831;
  --muted-foreground: #a19a8e;
  --accent: #5c4d3c;
  --accent-foreground: #ffbd7a;
  --destructive: #ff6b6b;
  --destructive-foreground: #ffffff;
  --border: #4a443d;
  --input: #4a443d;
  --ring: #ff9f43;
  --chart-1: #ff9f43;
  --chart-2: #2ecc71;
  --chart-3: #f1c40f;
  --chart-4: #a29bfe;
  --chart-5: #ff7675;
  --sidebar: #23201d;
  --sidebar-foreground: #d4cdc3;
  --sidebar-primary: #ff9f43;
  --sidebar-primary-foreground: #2c2925;
  --sidebar-accent: #3d3831;
  --sidebar-accent-foreground: #f7f3ed;
  --sidebar-border: #3d3831;
  --sidebar-ring: #ff9f43;
  --font-sans: 'Quicksand', 'Inter', system-ui, sans-serif;
  --font-serif: Georgia, serif;
  --font-mono: monospace;
  --radius: 1rem;
  --shadow-x: 0px;
  --shadow-y: 8px;
  --shadow-blur: 16px;
  --shadow-spread: 0px;
  --shadow-opacity: 0.4;
  --shadow-color: #000000;
  --shadow-2xs: 0px 8px 16px 0px hsl(0 0% 0% / 0.20);
  --shadow-xs: 0px 8px 16px 0px hsl(0 0% 0% / 0.20);
  --shadow-sm: 0px 8px 16px 0px hsl(0 0% 0% / 0.40), 0px 1px 2px -1px hsl(0 0% 0% / 0.40);
  --shadow: 0px 8px 16px 0px hsl(0 0% 0% / 0.40), 0px 1px 2px -1px hsl(0 0% 0% / 0.40);
  --shadow-md: 0px 8px 16px 0px hsl(0 0% 0% / 0.40), 0px 2px 4px -1px hsl(0 0% 0% / 0.40);
  --shadow-lg: 0px 8px 16px 0px hsl(0 0% 0% / 0.40), 0px 4px 6px -1px hsl(0 0% 0% / 0.40);
  --shadow-xl: 0px 8px 16px 0px hsl(0 0% 0% / 0.40), 0px 8px 10px -1px hsl(0 0% 0% / 0.40);
  --shadow-2xl: 0px 8px 16px 0px hsl(0 0% 0% / 1.00);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --font-serif: var(--font-serif);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  --shadow-2xs: var(--shadow-2xs);
  --shadow-xs: var(--shadow-xs);
  --shadow-sm: var(--shadow-sm);
  --shadow: var(--shadow);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
  --shadow-xl: var(--shadow-xl);
  --shadow-2xl: var(--shadow-2xl);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```
