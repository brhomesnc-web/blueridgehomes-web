interface GtagEventParams {
  event_category?: string;
  event_label?: string;
  value?: number;
  [key: string]: unknown;
}

interface Window {
  gtag: (command: string, ...args: unknown[]) => void;
  dataLayer: unknown[];
}
