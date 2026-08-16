const whatsappUrl = "https://wa.me/919610335679?text=Hello%20Raman%20Store%2C%20I%20have%20an%20enquiry.";

export function WhatsAppEnquiry() {
  return (
    <a
      className="whatsappEnquiry"
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact Raman Store on WhatsApp at 9610335679"
    >
      <span className="whatsappIcon" aria-hidden="true">
        <svg viewBox="0 0 32 32" role="img">
          <path fill="currentColor" d="M16.04 3A12.89 12.89 0 0 0 5.1 22.7L3 29l6.48-2.02A12.93 12.93 0 1 0 16.04 3Zm0 23.67a10.7 10.7 0 0 1-5.45-1.49l-.39-.23-3.84 1.2 1.25-3.74-.25-.39a10.72 10.72 0 1 1 8.68 4.65Zm5.88-8.02c-.32-.16-1.9-.94-2.2-1.04-.3-.11-.51-.16-.73.16-.21.32-.83 1.04-1.02 1.26-.19.21-.38.24-.7.08-.32-.16-1.36-.5-2.59-1.6a9.67 9.67 0 0 1-1.79-2.23c-.19-.32-.02-.5.14-.66.15-.14.32-.38.49-.57.16-.19.21-.32.32-.54.11-.21.05-.4-.03-.56-.08-.16-.73-1.76-1-2.41-.26-.63-.53-.54-.73-.55h-.62c-.21 0-.56.08-.86.4-.3.33-1.13 1.11-1.13 2.7s1.16 3.14 1.32 3.35c.16.22 2.28 3.48 5.52 4.88.77.33 1.37.53 1.84.68.77.24 1.47.21 2.03.13.62-.09 1.9-.78 2.17-1.53.27-.76.27-1.41.19-1.54-.08-.14-.3-.22-.62-.38Z"/>
        </svg>
      </span>
      <span className="whatsappCopy"><strong>WhatsApp enquiries</strong><small>+91 96103 35679</small></span>
    </a>
  );
}
