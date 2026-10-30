/**
 * Native Web Speech API Text-to-Speech Helper for NagrikMitra
 * Provides zero-cost, offline-capable Indic audio assistance (Hindi/Marathi/English)
 * for semi-literate or visually impaired citizens.
 */

let activeUtterance = null;

export function isSpeaking() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking;
}

export function stopSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    activeUtterance = null;
  }
}

export function readSchemeAloud(scheme, options = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn("SpeechSynthesis API not supported in this browser.");
    return false;
  }

  // Cancel any running playback
  stopSpeech();

  const storedLang = (typeof window !== 'undefined' && localStorage.getItem('nm_lang')) || 'hi';
  const langMap = { hi: 'hi-IN', mr: 'mr-IN', ta: 'ta-IN', en: 'en-IN' };
  const lang = options.lang || langMap[storedLang] || 'hi-IN';

  const name = scheme.name || 'सरकारी योजना';
  const benefit = scheme.estimated_benefit_amount || scheme.benefits || 'वित्तीय व सामाजिक सहायता';
  const docs = scheme.documents_required ? scheme.documents_required.replace(/<[^>]+>/g, '').slice(0, 150) : 'आधार कार्ड, बैंक पासबुक और निवास प्रमाण पत्र';

  // Compose high-clarity Indic text
  const cleanBenefit = benefit.replace(/<[^>]+>/g, '').slice(0, 120);
  
  let text = '';
  if (lang.startsWith('en')) {
    text = `Scheme name: ${name}. Estimated benefit: ${cleanBenefit}. Required documents: ${docs}.`;
  } else if (lang.startsWith('mr')) {
    text = `योजनेचे नाव: ${name}। मिळणारा लाभ: ${cleanBenefit}। आवश्यक कागदपत्रे: ${docs}।`;
  } else if (lang.startsWith('ta')) {
    text = `திட்டத்தின் பெயர்: ${name}. பயன்கள்: ${cleanBenefit}. தேவையான ஆவணங்கள்: ${docs}.`;
  } else {
    text = `योजना का नाम: ${name}। इसमें मिलने वाला लाभ: ${cleanBenefit}। आवश्यक दस्तावेज़: ${docs}।`;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = options.rate || 0.92; // Slightly slower cadence for rural comprehension
  utterance.pitch = 1.0;

  // Attempt to select an Indic or native voice if available
  const voices = window.speechSynthesis.getVoices();
  const langPrefix = lang.slice(0, 2);
  const matchedVoice = voices.find(
    v => v.lang.replace('_', '-').toLowerCase().startsWith(langPrefix)
  );
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  if (options.onStart) utterance.onstart = options.onStart;
  if (options.onEnd) utterance.onend = options.onEnd;
  if (options.onError) utterance.onerror = options.onError;

  activeUtterance = utterance;
  window.speechSynthesis.speak(utterance);
  return true;
}
