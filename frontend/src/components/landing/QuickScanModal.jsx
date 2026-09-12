import React, { useState, useRef } from 'react';
import { X, Upload, Camera, Check, RefreshCw, Loader2, ArrowRight } from 'lucide-react';
import { scanDocumentFile, scanCameraFrame } from '../../api/client';

export default function QuickScanModal({ isOpen, onClose, onApplyProfile }) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'camera'
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  
  // Camera stream refs
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);

  if (!isOpen) return null;

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      setError('Camera access denied or unavailable. Please use file upload instead.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  const captureCameraFrame = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const base64Data = canvas.toDataURL('image/jpeg');
    stopCamera();
    
    setLoading(true);
    setError(null);
    try {
      const res = await scanCameraFrame(base64Data);
      setScanResult(res);
    } catch (err) {
      setError(err.message || 'Failed to extract text from camera snapshot');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    try {
      const res = await scanDocumentFile(file);
      setScanResult(res);
    } catch (err) {
      setError(err.message || 'Failed to scan document image');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    setScanResult(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">
              Tesseract 5.0 Vision OCR
            </span>
            <h2 className="text-lg font-extrabold text-slate-900">
              Scan Aadhaar or PAN Card
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        {!scanResult && (
          <div className="flex border-b border-slate-100 bg-slate-50 px-6 pt-3 gap-6">
            <button
              onClick={() => {
                stopCamera();
                setActiveTab('upload');
              }}
              className={`pb-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors ${
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
              className={`pb-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors ${
                activeTab === 'camera'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Live Camera Stream</span>
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6">
          {!scanResult ? (
            <div>
              {activeTab === 'upload' ? (
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-emerald-400 transition-colors bg-slate-50/50">
                  <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-800 mb-1">
                    Upload photo of Aadhaar or PAN Card
                  </p>
                  <p className="text-xs text-slate-500 mb-4">PNG, JPG, JPEG up to 10 MB</p>

                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer shadow-xs">
                    <span>Browse Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {!cameraActive && (
                      <button
                        onClick={startCamera}
                        className="absolute px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-md"
                      >
                        Start Live Camera
                      </button>
                    )}
                  </div>

                  {cameraActive && (
                    <button
                      onClick={captureCameraFrame}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Capture & Extract Information</span>
                    </button>
                  )}
                </div>
              )}

              {loading && (
                <div className="mt-4 p-4 rounded-xl bg-slate-50 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-700">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Processing document through Tesseract OCR neural engine...</span>
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
                  {error}
                </div>
              )}
            </div>
          ) : (
            /* Results Display */
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-700 uppercase">
                    Extraction Succeeded
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {scanResult.document_type} Card Detected
                  </h3>
                  <p className="text-xs text-slate-500">
                    Confidence: {(scanResult.confidence_score * 100).toFixed(0)}% • Processed in {scanResult.latency_ms} ms
                  </p>
                </div>
                <button
                  onClick={() => setScanResult(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700"
                >
                  Rescan
                </button>
              </div>

              {/* Extracted Fields Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Full Name</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {scanResult.extracted_data.name || 'Not detected'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Date of Birth</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {scanResult.extracted_data.dob || 'Not detected'}{' '}
                    {scanResult.extracted_data.age && `(Age: ${scanResult.extracted_data.age})`}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Gender</span>
                  <span className="font-bold text-slate-800 text-sm capitalize">
                    {scanResult.extracted_data.gender || 'Universal / All'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">State of Residence</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {scanResult.extracted_data.state || 'Central'}
                  </span>
                </div>

                <div className="col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Masked ID Number</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">
                    {scanResult.extracted_data.masked_id_number || scanResult.extracted_data.id_number || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Apply to Profile Action */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    onApplyProfile(scanResult.prefilled_profile);
                    handleClose();
                  }}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
                >
                  <Check className="w-4 h-4" />
                  <span>Use This Profile to Find Schemes</span>
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
