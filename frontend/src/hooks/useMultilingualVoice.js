import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LANG_CODE_MAP = {
  hi: 'hi-IN',
  mr: 'mr-IN',
  ta: 'ta-IN',
  en: 'en-IN'
};

export function useMultilingualVoice() {
  const { i18n } = useTranslation();
  const currentShort = (i18n.language || 'en').split('-')[0];
  const [voiceLang, setVoiceLang] = useState(LANG_CODE_MAP[currentShort] || 'hi-IN');

  useEffect(() => {
    const handleSync = (e) => {
      const code = ((e.detail || i18n.language || 'en').split('-')[0]).toLowerCase();
      setVoiceLang(LANG_CODE_MAP[code] || 'hi-IN');
    };

    window.addEventListener('nm-language-changed', handleSync);
    return () => window.removeEventListener('nm-language-changed', handleSync);
  }, [i18n.language]);

  const speak = (text) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceLang;
    utterance.rate = 0.92;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) => v.lang.replace('_', '-').startsWith(voiceLang.slice(0, 2)));
    if (matchedVoice) utterance.voice = matchedVoice;

    window.speechSynthesis.speak(utterance);
  };

  return { voiceLang, speak };
}

export default useMultilingualVoice;
