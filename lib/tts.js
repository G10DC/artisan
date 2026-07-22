/**
 * Text-to-Speech (TTS) Module for Artisan Accessibility (DSA / Auditory Learners)
 */

export function generateTtsScript() {
  return `
    function speakText(text) {
      if (!('speechSynthesis' in window)) {
        alert('Il tuo browser non supporta la sintesi vocale (Text-to-Speech).');
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'it-IT';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  `;
}
