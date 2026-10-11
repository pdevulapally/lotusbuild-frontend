'use client';

import type {ReactNode} from 'react';
import {Theme} from '@astryxdesign/core/theme';
import {ToastViewport} from '@astryxdesign/core/Toast';

import {lotusTheme} from '@/components/lotus-theme';

export function Providers({children}: {children: ReactNode}) {
  return (
    <Theme theme={lotusTheme} mode="light">
      <ToastViewport position="topEnd" maxVisible={3}>
        {children}
      </ToastViewport>
    </Theme>
  );
}
