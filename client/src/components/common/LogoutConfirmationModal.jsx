import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LogOut, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * LogoutConfirmationModal
 * 
 * Reusable modal dialog confirming user intent before executing logout.
 * Conforms to RenewTech design system and WCAG accessibility standards.
 */
const LogoutConfirmationModal = ({
  isOpen = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();
  // Prevent background scrolling while modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Support ESC key to cancel
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoading) {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="logout-confirmation-modal"
          data-testid="logout-confirmation-dialog"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-dialog-title"
          aria-describedby="logout-dialog-description"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={!isLoading ? onCancel : undefined}
            aria-hidden="true"
          />

          {/* Modal Content Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative bg-white rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl border border-slate-200/90 z-10 my-auto text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close 'X' Button */}
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="absolute top-4 right-4 w-9 h-9 min-w-[36px] min-h-[36px] text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>

            <div className="flex items-start gap-4">
              {/* Visual Icon */}
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0 mt-0.5">
                <LogOut size={22} className="stroke-[2.2]" />
              </div>

              {/* Title & Description */}
              <div className="flex-1 min-w-0 pr-6">
                <h3
                  id="logout-dialog-title"
                  data-testid="logout-modal-title"
                  className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug"
                >
                  {t('auth.logoutConfirmTitle', 'Are you sure you want to log out?')}
                </h3>
                <p
                  id="logout-dialog-description"
                  data-testid="logout-modal-description"
                  className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal"
                >
                  {t('auth.logoutConfirmMsg', 'You will need to log in again to access your dashboard.')}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-2.5 sm:gap-3">
              <button
                type="button"
                data-testid="logout-cancel-btn"
                onClick={onCancel}
                disabled={isLoading}
                className="w-full sm:w-auto px-5 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 active:bg-slate-100 transition-colors shadow-2xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-center"
              >
                {t('common.cancel', 'Cancel')}
              </button>

              <button
                type="button"
                data-testid="logout-confirm-btn"
                onClick={onConfirm}
                disabled={isLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 transition-colors shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin shrink-0" />
                    <span>{t('auth.loggingOut', 'Logging out...')}</span>
                  </>
                ) : (
                  <span>{t('navigation.logout', 'Log Out')}</span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LogoutConfirmationModal;
