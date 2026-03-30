# UI Design System

```typescript
// src/styles/themes.css

:root {
  /* Light Theme (Default) */
  --color-primary: #3B82F6;
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #06B6D4;

  --bg-primary: #FFFFFF;
  --bg-secondary: #F9FAFB;
  --bg-tertiary: #F3F4F6;

  --text-primary: #111827;
  --text-secondary: #6B7280;
  --text-tertiary: #9CA3AF;

  --border-light: #E5E7EB;
  --border-default: #D1D5DB;
  --border-dark: #9CA3AF;

  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

[data-theme='dark'] {
  --color-primary: #60A5FA;
  --color-success: #34D399;
  --color-warning: #FBBF24;
  --color-error: #F87171;
  --color-info: #22D3EE;

  --bg-primary: #1F2937;
  --bg-secondary: #111827;
  --bg-tertiary: #0F172A;

  --text-primary: #F3F4F6;
  --text-secondary: #D1D5DB;
  --text-tertiary: #9CA3AF;

  --border-light: #374151;
  --border-default: #4B5563;
  --border-dark: #6B7280;
}
```

/_ Base Styles _/
body {
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
sans-serif;
background-color: var(--bg-primary);
color: var(--text-primary);
line-height: 1.5;
}

h1 {
font-size: 2rem;
font-weight: 700;
letter-spacing: -0.5px;
}

h2 {
font-size: 1.5rem;
font-weight: 700;
letter-spacing: -0.3px;
}

h3 {
font-size: 1.25rem;
font-weight: 700;
letter-spacing: -0.1px;
}

h4 {
font-size: 1rem;
font-weight: 700;
}

p {
font-size: 0.875rem;
color: var(--text-secondary);
}

code {
font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
font-size: 0.8rem;
background-color: var(--bg-tertiary);
padding: 2px 4px;
border-radius: 3px;
}

/_ Animations _/
@keyframes fadeIn {
from {
opacity: 0;
}
to {
opacity: 1;
}
}

@keyframes slideIn {
from {
transform: translateY(10px);
opacity: 0;
}
to {
transform: translateY(0);
opacity: 1;
}
}

.fade-in {
animation: fadeIn 150ms ease-out;
}

.slide-in {
animation: slideIn 300ms ease-out;
}

```

```
