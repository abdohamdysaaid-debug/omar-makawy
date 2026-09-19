'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  showRequirements?: boolean;
  placeholder?: string;
  name?: string;
}

export default function PasswordInput({
  value,
  onChange,
  error,
  showRequirements = false,
  placeholder = 'كلمة المرور',
  name = 'password'
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const hasUppercase = /[A-Z]/.test(value);
  const hasLowercase = /[a-z]/.test(value);
  const hasDigit = /[0-9]/.test(value);
  const hasMinLength = value.length >= 8;

  const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center gap-2 text-sm ${met ? 'text-green-500' : 'text-gray-500'}`}>
      {met ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="w-full">
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          name={name}
          className={`input-field w-full rounded-lg border px-4 py-3 pe-12 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-surface-dark dark:text-white font-cairo ${
            error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 end-0 flex items-center pe-3 text-gray-500 hover:text-gray-700 dark:text-gray-400"
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      {error && <p className="mt-1 text-sm text-red-500 font-cairo">{error}</p>}
      
      {showRequirements && (
        <div className="mt-3 flex flex-col gap-1 font-cairo">
          <RequirementItem met={hasUppercase} text="حرف كبير (Uppercase)" />
          <RequirementItem met={hasLowercase} text="حرف صغير (Lowercase)" />
          <RequirementItem met={hasDigit} text="رقم (Digit)" />
          <RequirementItem met={hasMinLength} text="8 أحرف على الأقل" />
        </div>
      )}
    </div>
  );
}
