declare global {
  interface Window {
    __PCMR_STANDALONE_PREVIEW__?: boolean;
  }
}

// Only the exported HTML artifact enables this mode. The server uses the real API.
export const standalonePreview = window.__PCMR_STANDALONE_PREVIEW__ === true;
