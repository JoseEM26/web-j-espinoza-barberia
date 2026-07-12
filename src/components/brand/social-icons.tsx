import type { SVGProps } from "react";

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 21l1.3-3.9A8.5 8.5 0 1 1 8.6 20L4 21Z" />
      <path d="M8.7 8.6c.2-.5.4-.5.7-.5h.5c.2 0 .4 0 .6.4.2.4.6 1.4.7 1.5.1.1.1.3 0 .4-.1.2-.2.3-.3.4-.2.2-.3.3-.1.6.2.4.8 1.2 1.7 1.9 1.1.9 1.9 1.1 2.2 1.2.3.1.5.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1.2.1 1.5.7 1.7.8.2.1.4.2.4.3.1.4.1.8-.1 1.3-.2.4-1.2 1.1-2 1.1-.7 0-1.6-.1-3.5-1.1-2.6-1.4-4.2-3.9-4.4-4.1-.1-.2-1-1.3-1-2.5 0-1.2.6-1.8.8-2Z" />
    </svg>
  );
}
