/**
 * Seva Kendra Slip (CSC Token) & WhatsApp Share Generator for NagrikMitra
 * Allows citizens to download an official printable/mobile token to show at
 * Gram Panchayats, CSC VLE Kiosks, or Tehsildar offices.
 */

export function generateKendraSlip(scheme, profile = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 1200;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 900, 1200);

  // Decorative Border
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 8;
  ctx.strokeRect(20, 20, 860, 1160);

  // Header Banner (Emerald Gradient)
  const grad = ctx.createLinearGradient(0, 20, 900, 160);
  grad.addColorStop(0, '#064e3b');
  grad.addColorStop(1, '#059669');
  ctx.fillStyle = grad;
  ctx.fillRect(24, 24, 852, 140);

  // Header Typography
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Segoe UI", Roboto, sans-serif';
  ctx.fillText('नागरिक मित्र — सेवा केंद्र पर्ची (CSC Token)', 50, 85);
  ctx.font = '18px "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#a7f3d0';
  ctx.fillText('NagrikMitra: AI-Powered Citizen Services Navigator • Government Welfare Slip', 50, 125);

  // Scheme Identity Section
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 28px "Segoe UI", Roboto, sans-serif';
  const schemeName = scheme.name || 'Welfare Scheme';
  ctx.fillText(schemeName.length > 46 ? schemeName.slice(0, 44) + '...' : schemeName, 50, 220);

  // Metadata Tags
  ctx.fillStyle = '#0284c7';
  ctx.font = 'bold 18px "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`🏛️ अधिकार क्षेत्र: ${scheme.state === 'Central' ? 'भारत सरकार (Central)' : scheme.state}`, 50, 260);
  ctx.fillText(`📂 श्रेणी: ${scheme.category || 'General Welfare'}`, 500, 260);

  // Benefit Highlight Box
  ctx.fillStyle = '#ecfdf5';
  ctx.fillRect(50, 290, 800, 100);
  ctx.strokeStyle = '#a7f3d0';
  ctx.lineWidth = 2;
  ctx.strokeRect(50, 290, 800, 100);

  ctx.fillStyle = '#065f46';
  ctx.font = 'bold 18px "Segoe UI", Roboto, sans-serif';
  ctx.fillText('अनुमानित सहायता / लाभ (Estimated Benefit):', 70, 325);
  ctx.fillStyle = '#047857';
  ctx.font = 'bold 26px "Segoe UI", Roboto, sans-serif';
  const benefitTxt = scheme.estimated_benefit_amount || scheme.benefits || 'वित्तीय व सामाजिक सहायता';
  ctx.fillText(benefitTxt.slice(0, 52), 70, 365);

  // Required Documents Checklist Card
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(50, 420, 800, 440);
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(50, 420, 800, 440);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 22px "Segoe UI", Roboto, sans-serif';
  ctx.fillText('📋 साथ ले जाने वाले आवश्यक दस्तावेज़ (Mandatory Documents):', 70, 460);

  // Parse documents
  const rawDocs = scheme.documents_required
    ? scheme.documents_required.split(/[,;\n•]/).map(d => d.replace(/<[^>]+>/g, '').trim()).filter(d => d.length > 2)
    : ['आधार कार्ड (Aadhaar Card)', 'बैंक खाता पासबुक (Bank Passbook)', 'राशन कार्ड (Ration Card)', 'निवास प्रमाण पत्र (Domicile)'];

  const displayDocs = rawDocs.slice(0, 7);
  ctx.font = '18px "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#334155';

  displayDocs.forEach((doc, idx) => {
    const yPos = 505 + (idx * 48);
    // Draw checkbox
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 2;
    ctx.strokeRect(70, yPos - 16, 20, 20);
    // Draw text
    ctx.fillText(`${idx + 1}.  ${doc}`, 105, yPos);
  });

  // Physical Location Guidance Box
  ctx.fillStyle = '#fffbeb';
  ctx.fillRect(50, 885, 800, 160);
  ctx.strokeStyle = '#fde68a';
  ctx.lineWidth = 2;
  ctx.strokeRect(50, 885, 800, 160);

  ctx.fillStyle = '#92400e';
  ctx.font = 'bold 20px "Segoe UI", Roboto, sans-serif';
  ctx.fillText('🏛️ कहाँ जमा करें? (Where to Apply Physically):', 70, 925);
  ctx.font = '16px "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#78350f';
  ctx.fillText('1. अपने नज़दीकी कॉमन सर्विस सेंटर (CSC VLE Kiosk) पर जाकर ऑनलाइन पंजीकरण कराएं।', 70, 960);
  ctx.fillText('2. या ग्राम पंचायत कार्यालय / तहसील समाज कल्याण विभाग में यह पर्ची और मूल दस्तावेज़ दिखाएं।', 70, 995);
  ctx.fillText('3. सीएससी लोकेटर: locator.csccloud.in | हेल्पलाइन: 14599 / 1800-3000-3468', 70, 1025);

  // Footer / Verification Seal
  const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  ctx.fillStyle = '#64748b';
  ctx.font = '14px "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`NagrikMitra Token ID: NM-${(scheme.slug || 'SCHEME').toUpperCase().slice(0, 12)}-${Date.now().toString().slice(-4)} • Generated on: ${now}`, 50, 1080);
  ctx.fillText('नोट: यह पर्ची एक नागरिक सहायता मार्गदर्शन टोकन है। अंतिम पात्रता विभागीय सत्यापन पर निर्भर है।', 50, 1105);

  // Download Trigger
  const downloadLink = document.createElement('a');
  downloadLink.download = `CSC_Parchee_${scheme.slug || 'scheme'}.png`;
  downloadLink.href = canvas.toDataURL('image/png');
  downloadLink.click();
}

export async function shareOnWhatsApp(scheme, profile = {}) {
  const name = scheme.name || 'सरकारी योजना';
  const benefit = scheme.estimated_benefit_amount || scheme.benefits || 'वित्तीय व सामाजिक सहायता';
  const docs = scheme.documents_required
    ? scheme.documents_required.replace(/<[^>]+>/g, '').split(/[,;\n]/).slice(0, 4).join(', ')
    : 'आधार कार्ड, बैंक पासबुक';
  const url = scheme.apply_url || scheme.official_url || window.location.href;

  const shareText = `*🏛️ नागरिक मित्र (NagrikMitra) — योजना विवरण*\n\n` +
    `*योजना का नाम:* ${name}\n` +
    `*अधिकार क्षेत्र:* ${scheme.state || 'Central'}\n` +
    `*मिलने वाला लाभ:* ${benefit.slice(0, 100)}\n\n` +
    `*📋 आवश्यक दस्तावेज़:* ${docs}\n\n` +
    `*🔗 आवेदन पोर्टल:* ${url}\n\n` +
    `_नागरिक मित्र (NagrikMitra) AI द्वारा जनरेटेड_`;

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: name,
        text: shareText,
        url: url
      });
      return true;
    } catch (e) {
      // User cancelled or unsupported, fallback to WhatsApp web link
    }
  }

  // Fallback to WhatsApp URL
  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  window.open(waUrl, '_blank', 'noopener,noreferrer');
  return true;
}
