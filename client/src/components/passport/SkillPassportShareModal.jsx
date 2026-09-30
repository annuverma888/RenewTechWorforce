import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Share2,
  Mail,
  ExternalLink,
  ShieldCheck,
  HardDrive,
} from 'lucide-react';

const SkillPassportShareModal = ({ isOpen, onClose, passport, verificationUrl }) => {
  const [copied, setCopied] = useState(false);
  const [nativeShareError, setNativeShareError] = useState('');

  if (!isOpen) return null;

  const technicianName = passport?.technician?.name || 'Verified Technician';
  const passportId = passport?.passportId || 'RT-PASS-VERIFIED';
  const profession = passport?.technician?.profession || 'Certified Renewable Energy Wireman';
  const url = verificationUrl || (typeof window !== 'undefined' ? window.location.href : '');

  const shareTitle = `${technicianName} - Verified Skill Passport (${passportId})`;
  const shareText = `⚡ Verify ${technicianName}'s certified Skill Passport (${profession}) on RenewTech Workforce:\n${url}`;

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleWhatsAppShare = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleTelegramShare = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(
      `⚡ Verify ${technicianName}'s certified Skill Passport (${passportId}) on RenewTech Workforce`
    )}`;
    window.open(tgUrl, '_blank', 'noopener,noreferrer');
  };

  const handleLinkedInShare = () => {
    const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(liUrl, '_blank', 'noopener,noreferrer');
  };

  const handleEmailShare = () => {
    const mailSubject = `Verified Renewable Energy Skill Passport - ${technicianName} (${passportId})`;
    const mailBody = `Hello,\n\nPlease verify the certified Skill Passport credentials for ${technicianName} (${profession}) on RenewTech Workforce:\n\n${url}\n\nCredential ID: ${passportId}\nVerified by RenewTech Workforce Authority.`;
    const mailUrl = `mailto:?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;
    window.location.href = mailUrl;
  };

  const handleDriveShare = async () => {
    setNativeShareError('');
    // Try device native Web Share API first (on mobile/Chrome this gives direct 'Save to Drive' option)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: `⚡ Verify ${technicianName}'s certified Skill Passport credentials (${passportId}) on RenewTech Workforce:`,
          url: url,
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.warn('[Share] Device share error:', err);
      }
    }

    // Direct Google Drive fallback: copy link to clipboard & open Google Drive
    handleCopy();
    setNativeShareError('Public link copied! Opening Google Drive so you can paste or save your passport link...');
    window.open('https://drive.google.com/', '_blank', 'noopener,noreferrer');
    setTimeout(() => setNativeShareError(''), 5500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Share2 size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight">
                Share Skill Passport
              </h2>
              <p className="text-xs text-emerald-200/80">
                Share verified credentials with EPC contractors & clients
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Technician Snippet */}
          <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <img
              src={
                passport?.technician?.profilePhoto ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(technicianName)}&backgroundColor=059669`
              }
              alt={technicianName}
              className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/20 border border-white shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900 truncate">{technicianName}</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                  ✓ Verified
                </span>
              </div>
              <p className="text-xs text-emerald-700 font-semibold truncate">{profession}</p>
              <p className="text-[11px] text-slate-400 font-mono">{passportId}</p>
            </div>
          </div>

          {/* Social & Sharing Apps Grid */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">
              Share directly via
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* WhatsApp */}
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50/60 hover:bg-emerald-100/70 border border-emerald-200/80 text-emerald-950 transition-all hover:-translate-y-0.5 cursor-pointer shadow-2xs group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-110 transition-transform">
                  {/* WhatsApp SVG Icon */}
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-slate-800">WhatsApp</span>
                <span className="text-[10px] text-slate-400">Direct message</span>
              </button>

              {/* Telegram */}
              <button
                type="button"
                onClick={handleTelegramShare}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-sky-50/60 hover:bg-sky-100/70 border border-sky-200/80 text-sky-950 transition-all hover:-translate-y-0.5 cursor-pointer shadow-2xs group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#229ED9] text-white flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-110 transition-transform">
                  {/* Telegram SVG Icon */}
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-slate-800">Telegram</span>
                <span className="text-[10px] text-slate-400">Channel / Chat</span>
              </button>

              {/* Google Drive */}
              <button
                type="button"
                onClick={handleDriveShare}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-50/60 hover:bg-amber-100/70 border border-amber-200/80 text-amber-950 transition-all hover:-translate-y-0.5 cursor-pointer shadow-2xs group"
                title="Save or Share to Google Drive"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-110 transition-transform p-2">
                  {/* Google Drive Official SVG */}
                  <svg className="w-6 h-6" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                    <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47"/>
                    <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
                    <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                    <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                    <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
                  </svg>
                </div>
                <span className="text-xs font-bold text-slate-800">Google Drive</span>
                <span className="text-[10px] text-slate-400">Save to Drive</span>
              </button>

              {/* Email / Gmail */}
              <button
                type="button"
                onClick={handleEmailShare}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-indigo-50/60 hover:bg-indigo-100/70 border border-indigo-200/80 text-indigo-950 transition-all hover:-translate-y-0.5 cursor-pointer shadow-2xs group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-110 transition-transform">
                  <Mail size={18} />
                </div>
                <span className="text-xs font-bold text-slate-800">Email</span>
                <span className="text-[10px] text-slate-400">Send mail</span>
              </button>
            </div>
          </div>

          {nativeShareError && (
            <p className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-center font-medium animate-in fade-in">
              {nativeShareError}
            </p>
          )}

          {/* Copy Link Section */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Or copy public verification link
            </span>
            <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <input
                type="text"
                readOnly
                value={url}
                className="flex-1 px-3 py-1.5 text-xs text-slate-700 font-mono bg-transparent outline-none truncate"
                onClick={(e) => e.target.select()}
              />
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer active:scale-95"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* EPC Security Note */}
          <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-200/70 text-center">
            <p className="text-[11px] text-emerald-900 font-medium">
              🔒 Recipient opens this link directly to verify your credentials. <strong>No login or password needed.</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillPassportShareModal;
