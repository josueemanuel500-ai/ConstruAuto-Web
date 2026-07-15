import type { DetailedHTMLProps, HTMLAttributes } from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'ca-game': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        whatsapp?: string;
      };
    }
  }
}
