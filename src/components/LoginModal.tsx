import React, { useState } from 'react';
import { Feather, Lock, KeyRound, CheckCircle2, X, ShieldCheck } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    setTimeout(() => {
      // Demo authentication: allow any passcode or default "writer" / "1234"
      if (passcode.trim() === '' || passcode.length >= 0) {
        onLoginSuccess();
        onClose();
      } else {
        setErrorMsg('Invalid passcode. Please try again.');
      }
      setIsSubmitting(false);
    }, 400);
  };

  const handleQuickDemoLogin = () => {
    onLoginSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#181614]/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#fffef2] dark:bg-[#1f1d1a] border border-[#ebd9c5] dark:border-[#38332c] text-[#2a2724] dark:text-[#f5f2e6] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 bg-[#2a2724] text-[#f5f2e6] flex items-center justify-between border-b border-[#d4a373]/30">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#d4a373]/20 border border-[#d4a373]/40 flex items-center justify-center text-[#d4a373]">
              <Feather className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-normal text-xl text-[#fffef2]">Writer Access Portal</h3>
              <p className="text-xs text-[#d4a373] font-handwriting">Author Content Management System</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-[#f5f2e6]/60 hover:text-[#fffef2]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#2a2724] dark:text-[#f5f2e6] uppercase tracking-wider">
              Writer Passcode / Credentials
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#d4a373] absolute left-3 top-3" />
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter writer access passcode..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none text-xs"
              />
            </div>
            {errorMsg && <p className="text-xs text-red-500 font-bold">{errorMsg}</p>}
          </div>

          <p className="text-xs text-[#2a2724]/70 dark:text-[#f5f2e6]/70 leading-relaxed bg-[#f5f1e3] dark:bg-[#25221e] p-3 rounded-xl border border-[#ebd9c5] dark:border-[#38332c]">
            🔒 Authenticate as author to gain full access to the Account Portal for dynamic website editing, adding published books, managing works-in-progress, and editing BookForest entries.
          </p>

          <div className="space-y-2 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl font-bold bg-[#d4a373] hover:bg-[#c39262] text-[#fffef2] shadow-md transition-all flex items-center justify-center space-x-2 text-xs cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Account Portal'}</span>
            </button>

            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="w-full py-2 rounded-xl font-bold bg-[#2a2724] hover:bg-[#3d3834] text-[#d4a373] border border-[#d4a373]/40 transition-all flex items-center justify-center space-x-1.5 text-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#d4a373]" />
              <span>Quick Demo Sign-In as Evelyn Vance</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
