'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithOtp, verifyOtp } from '@/lib/auth';

export default function LoginForm() {
  const router = useRouter();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(value);
    setError('');
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setError('');
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!phone || phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      await signInWithOtp(phone);
      setMessage('OTP sent to your phone. Please check your messages.');
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(phone, otp);
      setMessage('Login successful! Redirecting...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {step === 'phone' ? (
        <form onSubmit={handleSendOtp} className="space-y-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 bg-gray-100 text-gray-600 text-sm border border-r-0 border-gray-300 rounded-l-md">
                +91
              </span>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="10-digit phone number"
                maxLength={10}
                className="block w-full px-4 py-2 border border-gray-300 rounded-r-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                disabled={loading}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Enter 10-digit mobile number without country code</p>
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">{error}</div>}
          {message && <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-md">{message}</div>}

          <button
            type="submit"
            disabled={loading || phone.length !== 10}
            className="w-full py-2 px-4 bg-primary hover:bg-primary/90 disabled:bg-gray-300 text-white font-medium rounded-md transition duration-200"
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
              Enter OTP
            </label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={handleOtpChange}
              placeholder="6-digit OTP"
              maxLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-center text-2xl tracking-widest"
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500 text-center">OTP sent to +91{phone}</p>
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">{error}</div>}
          {message && <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-md">{message}</div>}

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-2 px-4 bg-primary hover:bg-primary/90 disabled:bg-gray-300 text-white font-medium rounded-md transition duration-200"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <button
            type="button"
            onClick={() => {
              setStep('phone');
              setOtp('');
              setError('');
              setMessage('');
            }}
            disabled={loading}
            className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-300 text-gray-700 font-medium rounded-md transition duration-200"
          >
            Back
          </button>
        </form>
      )}
    </div>
  );
}
