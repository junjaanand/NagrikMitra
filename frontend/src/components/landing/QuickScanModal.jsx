import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Camera,
  Check,
  RefreshCw,
  Loader2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  SwitchCamera,
  Sparkles,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { scanDocumentFile, scanCameraFrame } from '../../api/client';

export default function QuickScanModal({ isOpen, onClose, onApplyProfile }) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'camera'
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [showRawText, setShowRawText] = useState(false);
  
  // Camera stream refs
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) or 'user' (front)
  const [capturedPreview, setCapturedPreview] = useState(null);

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  const startCamera = async (mode = facingMode) => {
    stopCamera();
    setError(null);
    try {
      const constraints = {
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      setError('Webcam access was denied or is unavailable on this device. You can use file upload or the 1-Click Sample Cards below.');
      setCameraActive(false);
    }
  };

  // Stop camera on unmount or close
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (!isOpen) return null;

  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (cameraActive) {
      startCamera(nextMode);
    }
  };

  const captureCameraFrame = async () => {
    if (!videoRef.current) return;

    const vw = videoRef.current.videoWidth || 1280;
    const vh = videoRef.current.videoHeight || 720;

    // The on-screen card target box is 85% width, standard ID card aspect ratio 1.58:1
    const cardWidth = Math.round(vw * 0.85);
    const cardHeight = Math.round(cardWidth / 1.58);
    const cropX = Math.max(0, Math.round((vw - cardWidth) / 2));
    const cropY = Math.max(0, Math.round((vh - cardHeight) / 2));
    const targetW = Math.min(cardWidth, vw - cropX);
    const targetH = Math.min(cardHeight, vh - cropY);

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    
    // Draw only the targeted card viewfinder region for 2x crispness and no background clutter
    ctx.drawImage(
      videoRef.current,
      cropX, cropY, targetW, targetH,
      0, 0, targetW, targetH
    );

    const base64Data = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedPreview(base64Data);
    stopCamera();
    
    setLoading(true);
    setError(null);
    try {
      const res = await scanCameraFrame(base64Data);
      setScanResult(res);
    } catch (err) {
      setError(err.message || 'Tesseract OCR could not extract clear text. Ensure the document is in focus.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create local object URL for preview
    const previewUrl = URL.createObjectURL(file);
    setCapturedPreview(previewUrl);

    setLoading(true);
    setError(null);
    try {
      const res = await scanDocumentFile(file);
      setScanResult(res);
    } catch (err) {
      setError(err.message || 'Failed to scan document image. Please upload a clear PNG or JPG.');
    } finally {
      setLoading(false);
    }
  };

  // Generate a mock ID card on a virtual canvas for 1-click test evaluations
  const runMockCardTest = async (type = 'aadhaar') => {
    setLoading(true);
    setError(null);
    setCapturedPreview(null);

    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');

    // Background gradient
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Header band
    if (type === 'aadhaar') {
      ctx.fillStyle = '#f97316';
      ctx.fillRect(0, 0, canvas.width, 30);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 30, canvas.width, 30);
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(0, 60, canvas.width, 30);

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 36px Arial';
      ctx.fillText('Government of India / भारत सरकार', 150, 140);
      ctx.font = 'bold 28px Arial';
      ctx.fillText('Unique Identification Authority of India', 150, 180);

      ctx.font = 'bold 32px Arial';
      ctx.fillText('Rajesh Kumar Sharma', 150, 270);
      ctx.font = '26px Arial';
      ctx.fillText('DOB: 15/08/1986', 150, 320);
      ctx.fillText('Gender: MALE / पुरुष', 150, 370);
      ctx.fillText('Address: Lucknow, Uttar Pradesh - 226001', 150, 420);

      ctx.font = 'bold 44px Arial';
      ctx.fillStyle = '#0f172a';
      ctx.fillText('9876 5432 1098', 280, 520);
      ctx.font = 'bold 22px Arial';
      ctx.fillStyle = '#dc2626';
      ctx.fillText('मेरा आधार, मेरी पहचान', 360, 570);
    } else {
      // PAN Card
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, 0, canvas.width, 80);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px Arial';
      ctx.fillText('INCOME TAX DEPARTMENT - GOVT. OF INDIA', 80, 52);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 34px Arial';
      ctx.fillText('Permanent Account Number Card', 80, 160);

      ctx.font = 'bold 36px Arial';
      ctx.fillText('ANANYA SEN GUPTA', 80, 250);
      ctx.font = '26px Arial';
      ctx.fillText('Father Name: Alok Sen Gupta', 80, 310);
      ctx.fillText('Date of Birth: 14/05/2002', 80, 370);

      ctx.font = 'bold 44px monospace';
      ctx.fillStyle = '#1e3a8a';
      ctx.fillText('ABCDE1234F', 80, 470);
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = '#64748b';
      ctx.fillText('Signature: A. S. Gupta', 80, 550);
    }

    const base64Data = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedPreview(base64Data);

    try {
      const res = await scanCameraFrame(base64Data);
      setScanResult(res);
    } catch (err) {
      setError(err.message || 'Mock card OCR test failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    setScanResult(null);
    setError(null);
    setCapturedPreview(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight">
                  Tesseract 5.0 Vision Document Scanner
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
                  WebRTC Live CV
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Aadhaar (UID Masked) • PAN Card • Ration Card Instant Auto-Fill
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        {!scanResult && (
          <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-6 shrink-0">
            <button
              onClick={() => {
                stopCamera();
                setActiveTab('upload');
              }}
              className={`pb-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'upload'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload Document Photo</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('camera');
                startCamera();
              }}
              className={`pb-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'camera'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>WebRTC Live Camera Viewfinder</span>
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {!scanResult ? (
            <div className="space-y-4">
              
              {/* TAB 1: File Upload */}
              {activeTab === 'upload' && (
                <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center hover:border-emerald-400 transition-colors bg-slate-50/60">
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-900 mb-1">
                    Upload Photograph of Identity Document
                  </p>
                  <p className="text-xs text-slate-500 mb-5">
                    Supports Aadhaar, PAN, and Ration Card images (PNG, JPG, WEBP up to 10 MB)
                  </p>

                  <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-md transition-all">
                    <span>Browse Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* TAB 2: WebRTC Live Camera Viewfinder with Target Overlay */}
              {activeTab === 'camera' && (
                <div className="space-y-3">
                  <div className="relative rounded-3xl overflow-hidden bg-slate-950 aspect-[4/3] flex items-center justify-center border-2 border-slate-800 shadow-inner">
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* Camera Targeting Overlay Grid (Card Aspect Ratio Box) */}
                    {cameraActive && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                        <div className="w-full max-w-[85%] aspect-[1.58/1] rounded-2xl border-2 border-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.3)] relative flex flex-col justify-between p-3">
                          {/* 4 Corner Bracket Accents */}
                          <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                          <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                          {/* Center Guidance Text */}
                          <div className="text-center bg-slate-900/80 text-white text-[11px] font-bold px-3 py-1 rounded-full mx-auto backdrop-blur-xs border border-white/20">
                            Fit Aadhaar or PAN Card within the Frame
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-emerald-300 font-mono">
                            <span>ISO 7810 ID-1 Standard</span>
                            <span>Auto Alignment</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Camera Offline prompt */}
                    {!cameraActive && (
                      <div className="text-center space-y-3 p-6 z-10">
                        <Camera className="w-10 h-10 text-slate-500 mx-auto" />
                        <p className="text-xs text-slate-300 font-semibold">
                          Camera stream is idle. Click below to initiate live webcam.
                        </p>
                        <button
                          onClick={() => startCamera()}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
                        >
                          Start Live Camera
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Camera Controls Bar */}
                  {cameraActive && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={captureCameraFrame}
                        className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer transition-all"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Capture Frame & Run OCR</span>
                      </button>

                      <button
                        onClick={toggleCameraFacing}
                        className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        title="Flip Camera (Front/Rear)"
                      >
                        <SwitchCamera className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 1-Click Sample Card Quick Testing Bar */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    1-Click Evaluation Benchmark (Instant Test Cards)
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">No Camera Required</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => runMockCardTest('aadhaar')}
                    disabled={loading}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-emerald-100/60 text-slate-800 text-xs font-bold border border-emerald-300 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <span>Sample Aadhaar (Farmer • UP)</span>
                  </button>

                  <button
                    onClick={() => runMockCardTest('pan')}
                    disabled={loading}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-blue-100/60 text-slate-800 text-xs font-bold border border-blue-300 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <span>Sample PAN (Student • MH)</span>
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center gap-3 text-xs font-semibold text-emerald-800 animate-pulse">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                  <span>Preprocessing image and executing Tesseract OCR neural inference...</span>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-4 rounded-2xl bg-rose-50 text-rose-800 text-xs font-medium border border-rose-200 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          ) : (
            /* Results View */
            <div className="space-y-5 animate-fadeIn">
              
              {/* Success Banner */}
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Computer Vision Recognition Succeeded
                  </span>
                  <h3 className="text-lg font-black text-slate-900">
                    {scanResult.document_type} Card Validated
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-600">
                    <span className="font-semibold text-emerald-700">
                      Confidence: {(scanResult.confidence_score * 100).toFixed(0)}%
                    </span>
                    <span>•</span>
                    <span className="font-mono text-slate-500">Latency: {scanResult.latency_ms} ms</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setScanResult(null);
                    setCapturedPreview(null);
                    if (activeTab === 'camera') startCamera();
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                >
                  Scan Another
                </button>
              </div>

              {/* Extracted Fields Matrix */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Citizen Full Name</span>
                  <span className="font-bold text-slate-900 text-sm block mt-0.5">
                    {scanResult.extracted_data.name || 'Not detected'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Date of Birth & Age</span>
                  <span className="font-bold text-slate-900 text-sm block mt-0.5">
                    {scanResult.extracted_data.dob || 'Not detected'}{' '}
                    {scanResult.extracted_data.age && (
                      <span className="text-emerald-700 font-extrabold">({scanResult.extracted_data.age} Yrs)</span>
                    )}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Gender</span>
                  <span className="font-bold text-slate-900 text-sm block mt-0.5 capitalize">
                    {scanResult.extracted_data.gender || 'Universal / All'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">State / Domicile</span>
                  <span className="font-bold text-slate-900 text-sm block mt-0.5">
                    {scanResult.extracted_data.state || 'Central'}
                  </span>
                </div>

                <div className="col-span-2 p-3.5 rounded-2xl bg-slate-900 text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                      Masked Statutory ID Number
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-400/30">
                      Privacy Preserved
                    </span>
                  </div>
                  <span className="font-mono font-black text-emerald-400 text-base block mt-1">
                    {scanResult.extracted_data.masked_id_number || scanResult.extracted_data.id_number || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Raw OCR Text Toggle */}
              <div className="pt-1">
                <button
                  onClick={() => setShowRawText((v) => !v)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{showRawText ? 'Hide Raw OCR Output' : 'Inspect Raw Tesseract OCR Output'}</span>
                </button>
                {showRawText && (
                  <pre className="mt-2 p-3 rounded-xl bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-700 whitespace-pre-wrap max-h-36 overflow-y-auto">
                    {scanResult.raw_text || 'No raw text available.'}
                  </pre>
                )}
              </div>

              {/* Apply to Profile Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    if (onApplyProfile) {
                      onApplyProfile(scanResult.prefilled_profile || scanResult.extracted_data);
                    }
                    handleClose();
                  }}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 cursor-pointer transition-all"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Apply Extracted Profile & Discover Schemes</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
