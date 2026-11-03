import type * as React from 'react';

export type ModelViewerProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement> & {
    src?: string;
    'ios-src'?: string;
    poster?: string;
    alt?: string;
    ar?: boolean;
    'ar-modes'?: string;
    'ar-scale'?: string;
    'camera-controls'?: boolean;
    'touch-action'?: string;
    'auto-rotate'?: boolean;
    'auto-rotate-delay'?: number | string;
    'rotation-per-second'?: string;
    'shadow-intensity'?: number | string;
    'shadow-softness'?: number | string;
    exposure?: number | string;
    'environment-image'?: string;
    loading?: 'auto' | 'lazy' | 'eager';
    reveal?: 'auto' | 'manual';
    slot?: string;
  },
  HTMLElement
>;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerProps;
    }
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerProps;
    }
  }
}

declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerProps;
    }
  }
}
