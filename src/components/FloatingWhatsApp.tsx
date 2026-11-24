import { ACADEMY_INFO } from '../data/academyData.ts';

export function FloatingWhatsApp() {
  return (
    <a
      className="floating-contact"
      href={ACADEMY_INFO.whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Amreen's Academy on WhatsApp"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.2 11.7a8.2 8.2 0 0 1-12.1 7.2L3 20l1.2-4.9a8.2 8.2 0 1 1 16-3.4Z" />
        <path d="M8.1 7.9c.2-.5.5-.5.8-.5h.5c.2 0 .4.1.5.4l.7 1.7c.1.2.1.4 0 .6l-.5.6c-.2.2-.2.4 0 .6.4.7 1 1.3 1.7 1.7.2.1.4.1.6-.1l.7-.8c.2-.2.4-.2.6-.1l1.6.8c.2.1.4.3.4.5 0 .4-.2 1.1-.6 1.4-.4.4-1 .6-1.6.5-1-.1-2.4-.7-3.7-1.9-1.1-1-2-2.3-2.2-3.3-.2-.8.1-1.5.5-2.1Z" />
      </svg>
    </a>
  );
}
