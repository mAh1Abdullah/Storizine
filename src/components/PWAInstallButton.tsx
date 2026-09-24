import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-1.5 rounded-xl bg-[#d4a373] hover:bg-[#c39262] px-3 py-1.5 text-xs font-bold text-[#181614] shadow-xs transition ${className}`}
        title="Install Storizine as a PWA app"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] px-3 py-1.5 text-xs font-bold text-[#2a2724] dark:text-[#f5f2e6] hover:bg-[#f5f1e3] transition ${className}`}
          title="Install Storizine on iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#d4a373]" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-2xl bg-[#fffef2] dark:bg-[#1c1917] p-6 shadow-2xl border border-[#ebd9c5] dark:border-[#38332c]">
              <div className="flex items-center justify-between pb-3 border-b border-[#ebd9c5] dark:border-[#38332c]">
                <h3 className="text-base font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6]">
                  Install on iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-[#2a2724]/60 dark:text-[#f5f2e6]/60 hover:text-black dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-3 text-xs text-[#2a2724]/80 dark:text-[#f5f2e6]/80 leading-relaxed">
                1. Tap the <strong>Share</strong> button (box with arrow pointing up) in Safari&apos;s bottom toolbar.<br />
                2. Scroll down and tap <strong>Add to Home Screen</strong>.<br />
                3. Open Storizine directly from your home screen for full offline reading!
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-[#d4a373] py-2 text-xs font-bold text-[#181614] hover:bg-[#c39262] transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
