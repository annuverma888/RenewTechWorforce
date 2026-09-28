import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import {
  X,
  Camera,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  ScanLine,
  ExternalLink,
} from 'lucide-react';

const SkillPassportScannerModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('initializing'); // 'initializing' | 'scanning' | 'permission_denied' | 'no_camera' | 'error' | 'success'
  const [errorMessage, setErrorMessage] = useState('');
  const [invalidWarning, setInvalidWarning] = useState('');
  const html5QrCodeRef = useRef(null);
  const isStoppingRef = useRef(false);

  // Stop camera tracks and release scanner safely
  const stopScanner = useCallback(async () => {
    if (isStoppingRef.current) return;
    isStoppingRef.current = true;

    try {
      if (html5QrCodeRef.current) {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      }
    } catch (err) {
      console.warn('[QR Scanner] Error during cleanup:', err);
    } finally {
      html5QrCodeRef.current = null;
      isStoppingRef.current = false;
    }
  }, []);

  // Validate scanned QR code belongs to RenewTech verification system
  const handleDecodedText = useCallback(
    async (decodedText) => {
      console.log('[QR Scanner] Detected text:', decodedText);

      let technicianId = null;

      // Pattern 1: URL with /verify/skill-passport/:id
      const verifyUrlMatch = decodedText.match(/\/verify\/skill-passport\/([a-zA-Z0-9_-]+)/);
      if (verifyUrlMatch && verifyUrlMatch[1]) {
        technicianId = verifyUrlMatch[1];
      }

      // Pattern 2: URL with /passport/:id
      const passportUrlMatch = decodedText.match(/\/passport\/([a-zA-Z0-9_-]+)/);
      if (!technicianId && passportUrlMatch && passportUrlMatch[1]) {
        technicianId = passportUrlMatch[1];
      }

      // Pattern 3: Direct RenewTech passport code (e.g. RT-PASS-XXXXXX)
      if (!technicianId && /^RT-PASS-[a-zA-Z0-9_-]+$/i.test(decodedText.trim())) {
        technicianId = decodedText.trim();
      }

      if (!technicianId) {
        // Invalid QR code detected
        setInvalidWarning('Invalid RenewTech QR Code. Please scan a valid RenewTech Skill Passport QR code.');
        setTimeout(() => setInvalidWarning(''), 4500);
        return;
      }

      // Valid RenewTech QR detected!
      setStatus('success');
      await stopScanner();
      onClose();
      navigate(`/verify/skill-passport/${technicianId}`);
    },
    [navigate, onClose, stopScanner]
  );

  // Start real camera scanner using html5-qrcode
  const startScanner = useCallback(async () => {
    setStatus('initializing');
    setErrorMessage('');
    setInvalidWarning('');
    isStoppingRef.current = false;

    // Small delay to ensure the DOM element #skill-passport-qr-reader is mounted
    await new Promise((resolve) => setTimeout(resolve, 150));

    const element = document.getElementById('skill-passport-qr-reader');
    if (!element) {
      setStatus('error');
      setErrorMessage('Scanner camera container could not be initialized.');
      return;
    }

    try {
      // First check for available video cameras
      const devices = await Html5Qrcode.getCameras().catch((err) => {
        console.warn('[QR Scanner] Error checking cameras:', err);
        return [];
      });

      if (!devices || devices.length === 0) {
        setStatus('no_camera');
        setErrorMessage('No camera was detected on this device.');
        return;
      }

      // Initialize scanner instance
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await stopScanner();
      }

      const scanner = new Html5Qrcode('skill-passport-qr-reader', {
        verbose: false,
      });
      html5QrCodeRef.current = scanner;

      // Prefer rear camera ("environment") on mobile, fallback to available device on desktop
      const cameraConfig = { facingMode: 'environment' };
      const qrConfig = {
        fps: 12,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const qrBoxSize = Math.max(180, Math.floor(minEdge * 0.72));
          return { width: qrBoxSize, height: qrBoxSize };
        },
        aspectRatio: 1.0,
      };

      await scanner.start(
        cameraConfig,
        qrConfig,
        (decodedText) => {
          handleDecodedText(decodedText);
        },
        () => {
          // Frame scanned without QR match (expected during continuous frame feed)
        }
      );

      setStatus('scanning');
    } catch (err) {
      console.error('[QR Scanner] Camera start error:', err);
      const errMsg = err?.toString?.() || '';

      if (
        errMsg.includes('NotAllowedError') ||
        errMsg.includes('Permission') ||
        errMsg.includes('denied')
      ) {
        setStatus('permission_denied');
        setErrorMessage('Camera permission is required to scan a QR code.');
      } else if (errMsg.includes('NotFoundError') || errMsg.includes('DevicesNotFoundError')) {
        setStatus('no_camera');
        setErrorMessage('No camera was detected on this device.');
      } else {
        setStatus('error');
        setErrorMessage(
          'Unable to access camera. Please verify camera permissions in your browser settings.'
        );
      }
    }
  }, [handleDecodedText, stopScanner]);

  // Lifecycle coordinator
  useEffect(() => {
    if (isOpen) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen, startScanner, stopScanner]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Camera size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Scan Skill Passport
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Live camera QR credential verification
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              await stopScanner();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close Scanner"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Camera Viewport */}
        <div className="p-4 sm:p-6 flex flex-col items-center justify-center">
          {/* Live Camera Viewport Container */}
          <div className="relative w-full aspect-square max-w-[270px] xs:max-w-[320px] rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-800 flex items-center justify-center shadow-inner">
            {/* Real HTML5 QR Code Video will be injected here */}
            <div
              id="skill-passport-qr-reader"
              className="w-full h-full object-cover [&>video]:w-full [&>video]:h-full [&>video]:object-cover"
            />

            {/* Overlaid Animated Target Reticle (during active scanning) */}
            {status === 'scanning' && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                {/* Target Corners */}
                <div className="relative w-48 h-48 border-2 border-emerald-400/80 rounded-2xl shadow-lg">
                  {/* Glowing Corner Accents */}
                  <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                  {/* Laser Scan line motion */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-pulse mt-24" />
                </div>
              </div>
            )}

            {/* Initializing State */}
            {status === 'initializing' && (
              <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-4 text-center text-white">
                <div className="w-9 h-9 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-xs font-semibold text-slate-200">
                  Requesting camera permission...
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Please allow camera access when prompted by your browser
                </p>
              </div>
            )}

            {/* Success State */}
            {status === 'success' && (
              <div className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center p-4 text-center text-white animate-in zoom-in-95 duration-200">
                <CheckCircle2 size={44} className="text-emerald-400 mb-2 animate-bounce" />
                <p className="text-sm font-bold text-white">QR Code Verified!</p>
                <p className="text-xs text-emerald-200 mt-0.5">Opening Skill Passport...</p>
              </div>
            )}

            {/* Permission Denied State */}
            {status === 'permission_denied' && (
              <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-5 text-center text-white">
                <AlertCircle size={38} className="text-amber-400 mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">Camera Permission Required</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Camera permission is required to scan a QR code. Please enable camera access in your browser address bar.
                </p>
                <button
                  type="button"
                  onClick={startScanner}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={13} />
                  <span>Try Again</span>
                </button>
              </div>
            )}

            {/* No Camera Detected State */}
            {status === 'no_camera' && (
              <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-5 text-center text-white">
                <Camera size={38} className="text-slate-500 mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">No Camera Detected</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  No camera was detected on this device. You can verify credentials using the verification URL directly.
                </p>
                <button
                  type="button"
                  onClick={startScanner}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={13} />
                  <span>Check Again</span>
                </button>
              </div>
            )}

            {/* General Error State */}
            {status === 'error' && (
              <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-5 text-center text-white">
                <AlertCircle size={38} className="text-rose-400 mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">Camera Unavailable</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {errorMessage || 'Unable to start camera preview. Please check your device permissions.'}
                </p>
                <button
                  type="button"
                  onClick={startScanner}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={13} />
                  <span>Try Again</span>
                </button>
              </div>
            )}
          </div>

          {/* Invalid QR Notification Warning */}
          {invalidWarning && (
            <div className="mt-3.5 w-full bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-800 animate-in slide-in-from-top-2 duration-200">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Invalid QR Code</p>
                <p className="text-[11px] text-rose-700 mt-0.5">{invalidWarning}</p>
              </div>
            </div>
          )}

          {/* User Guidance Instructions */}
          <div className="mt-4 text-center">
            <p className="text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5">
              <ScanLine size={15} className="text-emerald-600" />
              <span>Point your camera at a Skill Passport QR code.</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Align the QR code within the highlighted viewfinder box
            </p>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>RenewTech Verified Scanner</span>
          </div>

          <button
            type="button"
            onClick={async () => {
              await stopScanner();
              onClose();
            }}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Close Scanner
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillPassportScannerModal;
