'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Mail, Lock, User, AlertCircle, CheckCircle2, Shield, Phone, MapPin, Upload } from 'lucide-react';

type FormValues = {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone: string;
  bloodGroup: string;
  city: string;
  userType: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormValues>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    bloodGroup: '',
    city: '',
    userType: 'donor',
  });
  const [errors, setErrors] = useState<FormValues>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    bloodGroup: '',
    city: '',
    userType: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const validateForm = () => {
    const newErrors: FormValues = {
      email: !formData.email ? 'Email is required' : !/\\S+@\\S+\\.\\S+/.test(formData.email) ? 'Email is invalid' : '',
      password: !formData.password ? 'Password is required' : formData.password.length < 6 ? 'Password must be at least 6 characters' : '',
      confirmPassword: formData.confirmPassword !== formData.password ? 'Passwords do not match' : '',
      name: !formData.name ? 'Full name is required' : '',
      phone: !formData.phone ? 'Phone number is required' : !/^\\+?[\\d\\s-]{10,}$/.test(formData.phone) ? 'Invalid phone number' : '',
      bloodGroup: !formData.bloodGroup ? 'Blood group is required' : '',
      city: !formData.city ? 'City is required' : '',
      userType: !formData.userType ? 'User type is required' : '',
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === '');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setToast(null);

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            phone: formData.phone,
            blood_group: formData.bloodGroup,
            city: formData.city,
            user_type: formData.userType,
          },
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });
      if (error) {
        setToast({ message: error.message, type: 'error' });
        setIsLoading(false);
      } else {
        setToast({ message: 'Account created! Please verify your email.', type: 'success' });
        setTimeout(() => router.push('/login'), 2000);
      }
    } catch (err: unknown) {
      setToast({ message: err instanceof Error ? err.message : 'An error occurred', type: 'error' });
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof FormValues, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handlePasswordChange = (value: string) => {
    setFormData((prev) => ({ ...prev, password: value }));
    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
  };

  const handleConfirmPasswordChange = (value: string) => {
    setFormData((prev) => ({ ...prev, confirmPassword: value }));
    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
  };

  const handleUserTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, userType: value }));
  };

  const handleBloodGroupChange = (value: string) => {
    setFormData((prev) => ({ ...prev, bloodGroup: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-white">
          Join LifeLink
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 font-medium text-slate-700 dark:text-slate-300">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter your full name"
              className={`w-full px-4 py-2 rounded border border-slate-300/50 dark:border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 ${
                errors.name ? 'input-error border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
              }`}
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium text-slate-700 dark:text-slate-300">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Enter your email"
              className={`w-full px-4 py-2 rounded border border-slate-300/50 dark:border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 ${
                errors.email ? 'input-error border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
              }`}
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium text-slate-700 dark:text-slate-300">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="Enter your phone number"
              className={`w-full px-4 py-2 rounded border border-slate-300/50 dark:border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 ${
                errors.phone ? 'input-error border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
              }`}
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium text-slate-700 dark:text-slate-300">
              Blood Group
            </label>
            <select
              value={formData.bloodGroup}
              onChange={(e) => handleBloodGroupChange(e.target.value)}
              className={`w-full px-4 py-2 rounded border border-slate-300/50 dark:border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 ${
                errors.bloodGroup ? 'input-error border-red-500 focus:border-red-500 focus:border-red-500/20' : ''
              }`}
              disabled={isLoading}
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 font-medium text-slate-700 dark:text-slate-300">
              City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="Enter your city"
              className={`w-full px-4 py-2 rounded border border-slate-300/50 dark:border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 ${
                errors.city ? 'input-error border-red-500 focus:border-red-500 focus:border-red-500/20' : ''
              }`}
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium text-slate-700 dark:text-slate-300">
              User Type
            </label>
            <select
              value={formData.userType}
              onChange={(e) => handleUserTypeChange(e.target.value)}
              className={`w-full px-4 py-2 rounded border border-slate-300/50 dark:border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 ${
                errors.userType ? 'input-error border-red-500 focus:border-red-500 focus:border-red-500/20' : ''
              }`}
              disabled={isLoading}
            >
              <option value="donor">Donor</option>
              <option value="hospital">Hospital</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block mb-2 font-medium text-slate-700 dark:text-slate-300">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              placeholder="Enter password"
              className={`w-full px-4 py-2 rounded border border-slate-300/50 dark:border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 ${
                errors.password ? 'input-error border-red-500 focus:border-red-500 focus:border-red-500/20' : ''
              }`}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label className="block mb-2 font-medium text-slate-700 dark:text-slate-300">
              Confirm Password
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
              placeholder="Confirm password"
              className={`w-full px-4 py-2 rounded border border-slate-300/50 dark:border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 ${
                errors.confirmPassword ? 'input-error border-red-500 focus:border-red-500 focus:border-red-500/20' : ''
              }`}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 dark:hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
          {toast && (
            <div className="mt-4 p-4 rounded-xl border text-sm flex items-center gap-3" role="alert">
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <div>
                <p className="font-medium">{toast.message}</p>
              </div>
            </div>
          )}
        </form>
        <p className="text-center text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-red-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}