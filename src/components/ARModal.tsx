import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Box,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Share2,
  Check,
  QrCode,
  Smartphone,
  RotateCw,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import QRCodeLib from 'qrcode';
import { Dish } from '../types/cafe';
import { DISHES, CAFE_CONFIG, BACKUP_FALLBACK_GLB_MODEL } from '../config/cafeConfig';

interface ARModalProps {
  dish: Dish | null;
  onClose: () => void;
  onSelectDish: (dish: Dish) => void;
  onAddToCart: (dish: Dish) => void;
}

export const ARModal: React.FC<ARModalProps> = ({
  dish,
  onClose,
  onSelectDish,
  onAddToCart,
}) => {
  const [modelLoading, setModelLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const [triedBackup, setTriedBackup] = useState(false);
  const [currentModelUrl, setCurrentModelUrl] = useState('');
  const [canActivateAR, setCanActivateAR] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showQRPanel, setShowQRPanel] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [showHint, setShowHint] = useState(true);

  const modelViewerRef = useRef<any>(null);
  const qrContainerRef = useRef<HTMLDivElement>(null);

  // Dynamically load Google's model-viewer from jsdelivr on first modal open (Requirement A.1 & D)
  useEffect(() => {
    if (typeof window !== 'undefined' && !customElements.get('model-viewer')) {
      const existing = document.querySelector('script[src*="model-viewer"]');
      if (!existing) {
        const script = document.createElement('script');
        script.type = 'module';
        script.src = 'https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js';
        document.head.appendChild(script);
      }
    }
  }, []);

  // Detect mobile & default views
  useEffect(() => {
    const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
      navigator.userAgent
    );
    setIsMobileDevice(isMobile);
    if (!isMobile) {
      setShowQRPanel(true);
    }
  }, []);

  // Sync dish and reset model states
  useEffect(() => {
    if (!dish) return;
    setCurrentModelUrl(dish.modelSrc);
    setTriedBackup(false);
    setLoadError(false);
    setModelLoading(true);
    setLoadProgress(15);
    setShowHint(true);

    const hintTimer = setTimeout(() => {
      setShowHint(false);
    }, 4000);

    return () => clearTimeout(hintTimer);
  }, [dish?.id]);

  // Generate QR Code linking to ?dish=<id> (Requirement A.3)
  useEffect(() => {
    if (!dish) return;

    const url = new URL(window.location.href);
    url.searchParams.set('dish', dish.id);
    const targetUrl = url.toString();

    // Try cdnjs QRCodeJS first if available, otherwise use npm qrcode
    let rendered = false;
    if (typeof (window as any).QRCode === 'function' && qrContainerRef.current) {
      try {
        qrContainerRef.current.innerHTML = '';
        new (window as any).QRCode(qrContainerRef.current, {
          text: targetUrl,
          width: 140,
          height: 140,
          colorDark: '#140A06',
          colorLight: '#F5E9DA',
          correctLevel: 2, // M
        });
        rendered = true;
      } catch (err) {
        rendered = false;
      }
    }

    // High resolution data URL fallback / parallel
    QRCodeLib.toDataURL(
      targetUrl,
      {
        width: 200,
        margin: 1.5,
        color: {
          dark: '#140A06',
          light: '#F5E9DA',
        },
      },
      (err, dataUrl) => {
        if (!err && dataUrl) {
          setQrDataUrl(dataUrl);
        }
      }
    );
  }, [dish?.id, showQRPanel]);

  // Model-viewer event listeners (error, load, progress, AR detection)
  useEffect(() => {
    const mv = modelViewerRef.current;
    if (!mv) return;

    const handleLoad = () => {
      setModelLoading(false);
      setLoadError(false);
      setLoadProgress(100);

      // Check if AR is actually supported (Requirement A.2)
      if (typeof mv.canActivateAR === 'boolean') {
        setCanActivateAR(mv.canActivateAR);
      } else {
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        setCanActivateAR(isMobile);
      }
    };

    const handleProgress = (event: any) => {
      if (event.detail && typeof event.detail.totalProgress === 'number') {
        setLoadProgress(Math.min(95, Math.round(event.detail.totalProgress * 100)));
      }
    };

    const handleError = () => {
      // Automatic second fallback model attempt (Requirement A.1)
      if (!triedBackup && dish && dish.modelSrc !== BACKUP_FALLBACK_GLB_MODEL) {
        setTriedBackup(true);
        setCurrentModelUrl(BACKUP_FALLBACK_GLB_MODEL);
        setModelLoading(true);
        setLoadProgress(30);
      } else {
        setModelLoading(false);
        setLoadError(true);
        setCanActivateAR(false);
      }
    };

    const handleARStatus = (event: any) => {
      if (event.detail?.status === 'failed') {
        setCanActivateAR(false);
      }
    };

    mv.addEventListener('load', handleLoad);
    mv.addEventListener('progress', handleProgress);
    mv.addEventListener('error', handleError);
    mv.addEventListener('ar-status', handleARStatus);

    return () => {
      mv.removeEventListener('load', handleLoad);
      mv.removeEventListener('progress', handleProgress);
      mv.removeEventListener('error', handleError);
      mv.removeEventListener('ar-status', handleARStatus);
    };
  }, [currentModelUrl, triedBackup, dish]);

  // Navigation
  const currentIndex = dish ? DISHES.findIndex((d) => d.id === dish.id) : 0;

  const handlePrevDish = () => {
    const nextIdx = currentIndex <= 0 ? DISHES.length - 1 : currentIndex - 1;
    onSelectDish(DISHES[nextIdx]);
  };

  const handleNextDish = () => {
    const nextIdx = currentIndex >= DISHES.length - 1 ? 0 : currentIndex + 1;
    onSelectDish(DISHES[nextIdx]);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrevDish();
      if (e.key === 'ArrowRight') handleNextDish();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  const handleShareLink = () => {
    if (!dish) return;
    const url = new URL(window.location.href);
    url.searchParams.set('dish', dish.id);
    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleRetry = () => {
    setLoadError(false);
    setTriedBackup(false);
    if (dish) {
      setCurrentModelUrl(dish.modelSrc);
      setModelLoading(true);
      setLoadProgress(20);
    }
  };

  if (!dish) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`AR 3D View of ${dish.name}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/95 backdrop-blur-xl animate-fade-in"
    >
      {/* Full screen on mobile (100dvh), scroll in one place only with fixed header (Requirement A.4) */}
      <div className="relative w-full h-[100dvh] sm:h-[90vh] sm:max-w-6xl bg-gradient-to-b from-[#1C1009] to-[#120804] sm:rounded-[36px] border border-[#C8956B]/30 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Fixed Header Bar */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-[#F5E9DA]/10 z-30 bg-[#1A0F0A]/95 backdrop-blur-md">
          {/* Dish Identification */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
            <div className="p-2 rounded-xl bg-[#C8956B]/20 text-[#C8956B] shrink-0">
              <Box className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#C8956B] truncate">
                  3D AR Experience
                </span>
                {/* WebXR Ready badge only appears when AR is really supported and model hasn't failed (Requirement A.2) */}
                {canActivateAR && !loadError && (
                  <span className="inline-block text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    WebXR Ready
                  </span>
                )}
              </div>
              {/* Title wraps to two lines on mobile without clipping (Requirement A.4) */}
              <h2 className="font-serif text-base sm:text-xl md:text-2xl text-[#F5E9DA] leading-tight line-clamp-2">
                {dish.name}
              </h2>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Desktop QR toggle */}
            {!isMobileDevice && (
              <button
                onClick={() => setShowQRPanel(!showQRPanel)}
                className={`p-2.5 min-w-[44px] min-h-[44px] rounded-full border transition-colors cursor-pointer flex items-center justify-center ${
                  showQRPanel
                    ? 'border-[#C8956B] bg-[#C8956B] text-[#140A06]'
                    : 'border-[#F5E9DA]/20 hover:border-[#C8956B] text-[#F5E9DA]'
                }`}
                title="Scan to view on mobile camera"
                aria-label="Toggle QR Code for Mobile AR"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            )}

            {/* Share link button */}
            <button
              onClick={handleShareLink}
              className="p-2.5 min-w-[44px] min-h-[44px] rounded-full border border-[#F5E9DA]/20 hover:border-[#C8956B] text-[#F5E9DA] transition-colors cursor-pointer flex items-center justify-center"
              title="Copy shareable AR link"
              aria-label="Share AR link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>

            {/* Close button with >= 44px tap target */}
            <button
              onClick={onClose}
              className="p-2.5 min-w-[44px] min-h-[44px] rounded-full border border-[#F5E9DA]/20 hover:border-[#C8956B] hover:bg-[#C8956B] text-[#F5E9DA] hover:text-[#140A06] transition-colors cursor-pointer flex items-center justify-center"
              aria-label="Close AR Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Container (one scroll container on mobile) */}
        <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row">
          
          {/* Main 3D Stage Area: At least 55vh on mobile (Requirement A.4) */}
          <div className="relative w-full h-[55vh] min-h-[55vh] lg:h-full lg:flex-1 bg-gradient-to-b from-[#2B1810]/50 to-[#140A06] flex items-center justify-center overflow-hidden shrink-0">
            
            {/* Gesture Hint at TOP of viewer, fading out after 4 seconds (Requirement A.4) */}
            <div
              className={`absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-opacity duration-700 ${
                showHint ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#140A06]/85 backdrop-blur-md border border-[#C8956B]/30 text-[11px] font-mono text-[#F5E9DA] shadow-lg">
                <RotateCw className="w-3 h-3 text-[#C8956B]" />
                <span>Drag to rotate • Pinch to zoom</span>
              </div>
            </div>

            {/* Loading Progress Bar & Indicator (Requirement A.1) */}
            {modelLoading && !loadError && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#1A0F0A]/85 backdrop-blur-sm pointer-events-none p-4">
                <div className="w-10 h-10 rounded-full border-2 border-[#C8956B]/30 border-t-[#C8956B] animate-spin" />
                <div className="w-48 bg-[#140A06] rounded-full h-1.5 overflow-hidden border border-[#C8956B]/20">
                  <div
                    className="h-full bg-[#C8956B] transition-all duration-300 ease-out"
                    style={{ width: `${loadProgress}%` }}
                  />
                </div>
                <span className="font-mono text-xs uppercase tracking-wider text-[#C8956B]">
                  {triedBackup ? 'Loading Adaptive 3D Mesh...' : 'Loading 3D Spatial Model...'} {loadProgress}%
                </span>
              </div>
            )}

            {/* Error Fallback: Unclipped text, crisp photo with object-fit: cover, no blur (Requirement A.4) */}
            {loadError && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-5 text-center bg-[#1A0F0A] overflow-y-auto">
                <div className="max-w-md w-full space-y-3.5 my-auto">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 text-[#C8956B] flex items-center justify-center mx-auto border border-[#C8956B]/30">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl text-[#F5E9DA]">
                      3D Model Network Timeout
                    </h3>
                    <p className="text-xs text-[#F5E9DA]/75 mt-1 font-light leading-relaxed">
                      High-resolution visual preview is active below. You can also view this dish on mobile or retry loading.
                    </p>
                  </div>

                  {/* Fallback image: object-fit cover, proper aspect ratio, crisp and unblurred (Requirement A.4) */}
                  <div className="w-44 h-44 sm:w-52 sm:h-52 mx-auto rounded-2xl overflow-hidden border border-[#C8956B]/40 shadow-xl bg-[#24130C]">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-1">
                    <button
                      onClick={handleRetry}
                      className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-full bg-[#C8956B] hover:bg-[#F5E9DA] text-[#140A06] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry 3D</span>
                    </button>
                    {!isMobileDevice && (
                      <button
                        onClick={() => setShowQRPanel(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-full border border-[#F5E9DA]/20 text-[#F5E9DA] text-xs font-semibold hover:border-[#C8956B] transition-colors cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5 text-[#C8956B]" />
                        <span>Phone AR</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Google <model-viewer> (Requirements A.1, A.2, A.5) */}
            <model-viewer
              ref={modelViewerRef}
              src={currentModelUrl}
              ios-src={dish.iosSrc}
              poster={dish.poster || dish.image}
              alt={`3D representation of ${dish.name}`}
              ar
              ar-modes="webxr scene-viewer quick-look"
              ar-scale="auto"
              ar-placement="floor"
              camera-controls
              touch-action="pan-y"
              auto-rotate
              auto-rotate-delay="800"
              rotation-per-second="20deg"
              shadow-intensity="1.2"
              shadow-softness="0.8"
              exposure="1.0"
              environment-image="neutral"
              loading="eager"
              className="w-full h-full cursor-grab active:cursor-grabbing"
            >
              {/* "View in your space" button: Clear, fully opaque cream pill at bottom centre of 3D area (Requirement A.2 & A.5) */}
              {canActivateAR && !loadError && (
                <div
                  slot="ar-button"
                  id="ar-button"
                  className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-auto"
                >
                  <button
                    className="inline-flex items-center justify-center gap-2.5 px-6 py-3 min-h-[48px] rounded-full bg-[#F5E9DA] hover:bg-[#C8956B] text-[#140A06] text-xs font-bold tracking-wider uppercase shadow-2xl transition-all duration-300 cursor-pointer active:scale-95 border-2 border-[#140A06]/20 font-sans"
                    aria-label="View this dish in your physical space with Augmented Reality"
                  >
                    <Box className="w-4 h-4 text-[#140A06]" />
                    <span>View in your space</span>
                  </button>
                  {/* Note under the button (Requirement A.5) */}
                  <p className="text-[10px] text-[#F5E9DA]/80 bg-[#140A06]/80 px-2.5 py-0.5 rounded-full backdrop-blur-sm mt-1.5 text-center font-mono max-w-xs shadow-md">
                    AR works best in Chrome (Android) or Safari (iPhone) on the deployed link.
                  </p>
                </div>
              )}

              {/* Native progress bar slot */}
              <div slot="progress-bar" className="w-full h-1 bg-[#140A06]">
                <div
                  className="h-full bg-[#C8956B] transition-all duration-200"
                  style={{ width: `${loadProgress}%` }}
                />
              </div>
            </model-viewer>

            {/* Prev / Next Dish Navigation Buttons */}
            <button
              onClick={handlePrevDish}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-[#140A06]/80 hover:bg-[#C8956B] text-[#F5E9DA] hover:text-[#140A06] border border-[#F5E9DA]/20 transition-all duration-300 shadow-xl cursor-pointer flex items-center justify-center min-w-[44px] min-h-[44px]"
              aria-label="Previous dish"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextDish}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-[#140A06]/80 hover:bg-[#C8956B] text-[#F5E9DA] hover:text-[#140A06] border border-[#F5E9DA]/20 transition-all duration-300 shadow-xl cursor-pointer flex items-center justify-center min-w-[44px] min-h-[44px]"
              aria-label="Next dish"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Details & Desktop QR Sidebar */}
          <div className="w-full lg:w-96 p-5 sm:p-7 bg-[#170D07] border-t lg:border-t-0 lg:border-l border-[#F5E9DA]/10 flex flex-col justify-between space-y-5">
            
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold tracking-widest uppercase text-[#C8956B]">
                  {dish.category}
                </span>
                <span className="font-mono text-[#F5E9DA]/60">
                  Dish {currentIndex + 1} of {DISHES.length}
                </span>
              </div>

              <div>
                <h3 className="font-serif text-xl sm:text-2xl text-[#F5E9DA] leading-snug">
                  {dish.name}
                </h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-mono text-2xl font-bold text-[#F5E9DA]">
                    {CAFE_CONFIG.currencySymbol}{dish.price}
                    <sup className="text-xs font-normal text-[#C8956B]">.00</sup>
                  </span>
                  {dish.calories && (
                    <span className="text-xs text-[#F5E9DA]/50 font-mono">
                      · {dish.calories} kcal
                    </span>
                  )}
                  {dish.prepTime && (
                    <span className="text-xs text-[#F5E9DA]/50 font-mono">
                      · {dish.prepTime}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#F5E9DA]/75 leading-relaxed font-light">
                {dish.description}
              </p>

              {/* Tasting Notes */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C8956B]">
                  Sensory Notes
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {dish.tastingNotes.map((note, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-[#2B1810] border border-[#C8956B]/30 text-[11px] text-[#F5E9DA]/90 font-mono"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>

              {dish.roastOrigin && (
                <div className="p-3 rounded-xl bg-[#140A06] border border-[#F5E9DA]/10 text-xs">
                  <span className="text-[10px] uppercase tracking-wider text-[#C8956B] block">
                    Estate Provenance
                  </span>
                  <span className="text-[#F5E9DA] font-medium block mt-0.5">
                    {dish.roastOrigin}
                  </span>
                </div>
              )}
            </div>

            {/* Desktop / Non-AR QR Code Assistance Panel (Requirement A.2 & A.3) */}
            {(!canActivateAR || !isMobileDevice || showQRPanel) && (
              <div className="p-4 rounded-2xl bg-[#140A06] border border-[#C8956B]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-[#C8956B]" />
                    <span className="text-xs font-semibold text-[#F5E9DA]">
                      Scan to view in AR on Phone
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#C8956B]">iOS & Android</span>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="p-2 rounded-xl bg-[#F5E9DA] shrink-0 shadow-md flex items-center justify-center">
                    {/* Rendered QR image or cdnjs container */}
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt={`Scan QR code to open ${dish.name} in AR on mobile`}
                        className="w-24 h-24 object-contain"
                      />
                    ) : (
                      <div ref={qrContainerRef} className="w-24 h-24 flex items-center justify-center" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] text-[#F5E9DA]/75 font-light leading-snug">
                      Open camera app on your phone and tap the banner to place this dish on your table.
                    </p>
                    <p className="text-[10px] text-[#C8956B] font-mono">
                      Deep link: ?dish={dish.id}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Add to Cart CTA */}
            <div className="pt-3 border-t border-[#F5E9DA]/10 space-y-2.5">
              <button
                onClick={() => onAddToCart(dish)}
                className="w-full flex items-center justify-center gap-2 py-3.5 min-h-[48px] rounded-full bg-[#C8956B] hover:bg-[#F5E9DA] text-[#140A06] font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-xl cursor-pointer active:scale-95"
                aria-label={`Add ${dish.name} to order`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add {dish.name.split(' ')[0]} to Order</span>
              </button>

              <button
                onClick={onClose}
                className="w-full text-center text-xs text-[#F5E9DA]/50 hover:text-[#F5E9DA] transition-colors py-2 cursor-pointer min-h-[44px] flex items-center justify-center"
                aria-label="Back to cafe menu"
              >
                Back to Cafe Menu
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
