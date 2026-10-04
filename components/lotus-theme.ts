import {defineTheme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';

// LotusBuild colours on top of the Astryx neutral theme.
// Values map to the same palette as app/globals.css.
export const lotusTheme = defineTheme({
  name: 'lotus',
  extends: neutralTheme,
  tokens: {
    '--color-background-body': '#f7f5f3',
    '--color-background-surface': '#fdfcfb',
    '--color-background-card': '#fdfcfb',
    '--color-background-muted': '#efebe7',
    '--color-text-primary': '#262626',
    '--color-text-secondary': '#5c5854',
    '--color-text-disabled': '#8a847f',
    '--color-border': '#d6d0ca',
    '--color-border-emphasized': '#262626',
    '--color-accent': '#262626',
    '--color-accent-muted': '#efebe7',
    '--font-family-heading': 'var(--font-libre-caslon), serif',
    '--font-family-body': 'var(--font-public-sans), system-ui, sans-serif',
  },
});
