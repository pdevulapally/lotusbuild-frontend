'use client';

import type {ReactNode} from 'react';
import {Theme} from '@astryxdesign/core/theme';

import {lotusTheme} from '@/components/lotus-theme';

export function Providers({children}: {children: ReactNode}) {
  return <Theme theme={lotusTheme}>{children}</Theme>;
}
