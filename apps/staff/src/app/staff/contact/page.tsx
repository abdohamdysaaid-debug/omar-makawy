'use client';

import React, { useState, useEffect } from 'react';
import {
  Share2,
  Globe,
  MessageCircle,
  Phone,
  Mail,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useStaffAuth } from '@/context/StaffAuthContext';

export default function StaffContactPage() {
  const { apiClient } = useStaffAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form Fields
  const [facebookUrl, setFacebookUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [xUrl, setXUrl] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [emailAddress, setEmailAddress] = useState('');

  const fetchContactSettings = async () => {
    if (!apiClient) return;
    setLoading(true);
    setError(null);

    try {
      const res: any = await apiClient.get('/admin/settings');
      const settingsMap: Record<string, string> = {};

      if (Array.isArray(res)) {
        res.forEach((item: any) => {
          settingsMap[item.key] = item.value || '';
        });
      } else if (res && typeof res === 'object') {
        Object.keys(res).forEach((k) => {
          settingsMap[k] = typeof res[k] === 'object' ? res[k].value : res[k];
        });
      }

      setFacebookUrl(settingsMap['social_facebook'] || '');
      setYoutubeUrl(settingsMap['social_youtube'] || '');
      setInstagramUrl(settingsMap['social_instagram'] || '');
      setXUrl(settingsMap['social_x'] || '');
      setWhatsappNumber(settingsMap['support_whatsapp'] || '');
      setPhoneNumber(settingsMap['support_phone'] || '');
      setSecondaryPhone(settingsMap['contact_phone_secondary'] || '');
      setEmailAddress(settingsMap['support_email'] || '');
    } catch (err: any) {
      setError(err?.message || 'فشل في تحميل إعدادات التواصل');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactSettings();
  }, [apiClient]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiClient) return;

    setError(null);
    setSuccess(null);

    // Client-side URL Security Validation
    const urls = [
      { key: 'Facebook', value: facebookUrl },
      { key: 'YouTube', value: youtubeUrl },
      { key: 'Instagram', value: instagramUrl },
      { key: 'X / Twitter', value: xUrl },
    ];

    for (const u of urls) {
      const val = u.value.trim();
      if (val !== '' && !val.startsWith('https://')) {
        setError(`رابط ${u.key} يجب أن يبدأ بـ https:// لضمان الأمان.`);
        return;
      }
    }

    setSaving(true);

    try {
      const settingsPayload = [
        { key: 'social_facebook', value: facebookUrl.trim() },
        { key: 'social_youtube', value: youtubeUrl.trim() },
        { key: 'social_instagram', value: instagramUrl.trim() },
        { key: 'social_x', value: xUrl.trim() },
        { key: 'support_whatsapp', value: whatsappNumber.trim() },
        { key: 'support_phone', value: phoneNumber.trim() },
        { key: 'contact_phone_secondary', value: secondaryPhone.trim() },
        { key: 'support_email', value: emailAddress.trim() },
      ];

      await apiClient.put('/admin/settings', { settings: settingsPayload });

      setSuccess('تم حفظ إعدادات السوشيال ميديا والتواصل بنجاح');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err?.message || 'فشل في حفظ إعدادات التواصل');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-neutral-400 space-y-3">
        <RefreshCw className="h-6 w-6 animate-spin mx-auto text-emerald-500" />
        <p className="text-xs">جاري تحميل إعدادات التواصل والتواصل الاجتماعي...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/60">
            <Share2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              السوشيال ميديا والتواصل
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              إدارة وسائل التواصل ومعلومات الاتصال الظاهرة للطلاب والزوار
            </p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs font-semibold">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs font-semibold">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Social Media Links */}
        <div className="bg-[#0e1310] border border-neutral-800/90 rounded-2xl p-5 md:p-6 space-y-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
            <Globe className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">السوشيال ميديا</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* Facebook */}
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-300">Facebook</label>
              <input
                type="url"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder="https://facebook.com/..."
                className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
              />
            </div>

            {/* YouTube */}
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-300">YouTube</label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/..."
                className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
              />
            </div>

            {/* Instagram */}
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-300">Instagram</label>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/..."
                className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
              />
            </div>

            {/* X / Twitter */}
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-300">X / Twitter</label>
              <input
                type="url"
                value={xUrl}
                onChange={(e) => setXUrl(e.target.value)}
                placeholder="https://x.com/..."
                className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Contact Information */}
        <div className="bg-[#0e1310] border border-neutral-800/90 rounded-2xl p-5 md:p-6 space-y-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
            <Phone className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">معلومات التواصل</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* WhatsApp */}
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-300">واتساب (WhatsApp)</label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+201000000000"
                className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-300">رقم الهاتف الرئيسي</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+201000000000"
                className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-300">البريد الإلكتروني</label>
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="support@omarmakawy.com"
                className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
              />
            </div>

            {/* Secondary Phone */}
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-300">رقم هاتف إضافي (اختياري)</label>
              <input
                type="text"
                value={secondaryPhone}
                onChange={(e) => setSecondaryPhone(e.target.value)}
                placeholder="+201100000000"
                className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all"
          >
            {saving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            حفظ التغييرات
          </button>
        </div>
      </form>
    </div>
  );
}
