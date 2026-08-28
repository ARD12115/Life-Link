'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2, Mail, Lock, User, AlertCircle, CheckCircle2, Shield, Phone, MapPin, Droplets } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Toast } from '@/components/ui/Toast';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import { Canvas } from '@react-three/fiber';
import { supabase } from '@/lib/supabase';

const registerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const inputVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({ 
    opacity: 1, 
    x: 0,
    transition: { delay: 0.15 + i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  })
};

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bloodGroup: '',
    city: '',
    password: '',
    confirmPassword: '',
    userType: 'donor'
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    else if (formData.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) newErrors.phone = 'Invalid phone number';
    
    if (!formData.bloodGroup) newErrors.bloodGroup = 'Blood group is required';
    
    if (!formData.city.trim()) newErrors.city = 'City is required';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setToast(null);

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
      }
    });

    if (error) {
      setToast({ message: error.message, type: 'error' });
      setIsLoading(false);
    } else {
      setToast({ message: 'Account created! Please verify your email.', type: 'success' });
      setTimeout(() => router.push('/login'), 2000);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handlePasswordChange = (value: string) => {
    setFormData(prev => ({ ...prev, password: value }));
    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
  };

  const handleConfirmPasswordChange = (value: string) => {
    setFormData(prev => ({ ...prev, confirmPassword: value }));
    if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
  };

  const handleUserTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, userType: value }));
  };

  const handleBloodGroupChange = (value: string) => {
    setFormData(prev => ({ ...prev, bloodGroup: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setToast(null);

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
      }
    });

    if (error) {
      setToast({ message: error.message, type: 'error' });
      setIsLoading(false);
    } else {
      setToast({ message: 'Account created! Please verify your email.', type: 'success' });
      setTimeout(() => router.push('/login'), 2000);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handlePasswordChange = (value: string) => {
    setFormData(prev => ({ ...prev, password: value }));
    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
  };

  const handleConfirmPasswordChange = (value: string) => {
    setFormData(prev => ({ ...prev, confirmPassword: value }));
    if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 3D Background */}
      <div className="fixed inset-0 z-0" aria-hidden="true">
        <LoginBackground />
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 z-5 pointer-events-none overflow-hidden" aria-hidden="true">
        <LoginParticles />
      </div>

      {/* Main Content */}
      <main className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          
          {/* Header with Theme Switcher */}
          <div className="flex justify-between items-center mb-10">
            <motion.div 
              initial={{ opacity: 0, y: -20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Link href="/" className="flex items-center gap-3">
                <div className="relative w-10 h-10">
                  <Canvas 
                    style={{ width: '100%', height: '100%' }} 
                    camera={{ position: [0, 0, 3], fov: 30 }}
                  >
                    <ambientLight intensity={0.8} />
                    <directionalLight position={[5, 5, 5]} intensity={1} />
                    <Logo3D />
                  </Canvas>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">
                  LifeLink
                </span>
              </Link>
            </motion.div>

            <ThemeSwitcher />
          </div>

          {/* Card */}
          <Card className="relative backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-700/50">
            <div className="p-8">
              <motion.div 
                initial="hidden" 
                animate="visible" 
                variants={loginVariants}
                className="space-y-5"
              >
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Create Account
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 mt-2">
                    Join the LifeLink emergency blood network
                  </p>
                </div>

                {/* Toast */}
                <AnimatePresence>
                  {toast && (
                    <motion.div
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
                        toast.type === 'error' 
                          ? 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-400 border border-red-200 dark:border-red-800'
                          : 'bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-400 border border-green-200 dark:border-green-800'
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="text-sm font-medium">{toast.message}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  {/* User Type Selection */}
                  <motion.div 
                    variants={inputVariants} 
                    custom={0}
                  >
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      I am a
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {['donor', 'hospital'].map((type) => (
                        <motion.button
                          key={type}
                          type="button"
                          onClick={() => handleUserTypeChange(type)}
                          className={`relative p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                            formData.userType === type
                              ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                              : 'border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-600'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {type === 'donor' ? (
                            <Droplets className="w-6 h-6 text-red-600 dark:text-red-400" />
                          ) : (
                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          )}
                          <span className="font-medium capitalize">{type}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Name */}
                  <motion.div 
                    variants={inputVariants} 
                    custom={1}
                  >
                    <Input
                      id="name"
                      type="text"
                      autoComplete="name"
                      placeholder="John Doe"
                      label="Full Name"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      error={errors.name}
                      leftIcon={<User className="w-5 h-5" />}
                      disabled={isLoading}
                    />
                  </motion.div>

                  {/* Email */}
                  <motion.div 
                    variants={inputVariants} 
                    custom={2}
                  >
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@hospital.com"
                      label="Email Address"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      error={errors.email}
                      leftIcon={<Mail className="w-5 h-5" />}
                      disabled={isLoading}
                    />
                  </motion.div>

                  {/* Phone */}
                  <motion.div 
                    variants={inputVariants} 
                    custom={3}
                  >
                    <Input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+1 (555) 000-0000"
                      label="Phone Number"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      error={errors.phone}
                      leftIcon={<Phone className="w-5 h-5" />}
                      disabled={isLoading}
                    />
                  </motion.div>

                  {/* Blood Group */}
                  <motion.div 
                    variants={inputVariants} 
                    custom={4}
                  >
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Blood Group
                    </label>
                    <select
                      value={formData.bloodGroup}
                      onChange={(e) => handleBloodGroupChange(e.target.value)}
                      className="input w-full"
                      disabled={isLoading}
                    >
                      <option value="" disabled>Select blood group</option>
                      {bloodGroups.map((group) => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                    {errors.bloodGroup && (
                      <motion.span
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-xs mt-1 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.bloodGroup}
                      </motion.span>
                    )}
                  </motion.div>

                  {/* City */}
                  <motion.div 
                    variants={inputVariants} 
                    custom={5}
                  >
                    <Input
                      id="city"
                      type="text"
                      autoComplete="address-level2"
                      placeholder="New York"
                      label="City"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      error={errors.city}
                      leftIcon={<MapPin className="w-5 h-5" />}
                      disabled={isLoading}
                    />
                  </motion.div>

                  {/* Password */}
                  <motion.div 
                    variants={inputVariants} 
                    custom={6}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Password
                      </label>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handlePasswordChange}
                        error={errors.password}
                        className="pl-10 pr-12"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                      {errors.password && (
                        <motion.span
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-xs flex items-center gap-1"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          {errors.password}
                        </motion.span>
                      )}
                    </div>
                  </motion.div>

                  {/* Confirm Password */}
                  <motion.div 
                    variants={inputVariants} 
                    custom={7}
                  >
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        error={errors.confirmPassword}
                        className="pl-10 pr-12"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                      {errors.confirmPassword && (
                        <motion.span
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-xs flex items-center gap-1"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          {errors.confirmPassword}
                        </motion.span>
                      )}
                    </div>
                  </motion.div>

                  {/* Submit */}
                  <motion.button
                    variants={inputVariants}
                    custom={8}
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl shadow-lg hover:from-red-700 hover:to-red-800 focus:ring-4 focus:ring-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ borderRadius: 'var(--radius-xl)' }}
                  >
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center justify-center gap-2"
                        >
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Creating account...</span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="default"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center justify-center gap-2"
                        >
                          <span>Create Account</span>
                          <motion.span
                            animate={{ x: [0, 4, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                          >
                            →
                          </motion.span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white/80 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 backdrop-blur">
                        Already have an account?
                      </span>
                    </div>
                  </div>

                  <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                    <Link 
                      href="/login" 
                      className="font-semibold text-primary-600 dark:text-primary-400 hover:underline transition-colors"
                    >
                      Sign in
                    </Link>
                  </p>
                </form>

                {/* Security Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="mt-6 text-center"
                >
                  <div className="flex items-center justify-center gap-2 text-slate-400 dark:text-slate-500 text-xs">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-2.5" />
                    </svg>
                    <span>Secured by Supabase Auth</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

/* 3D Background Components */
function LoginBackground() {
  return (
    <Canvas
      style={{ width: '100%', height: '100%' }}
      camera={{ position: [0, 0, 10], fov: 45 }}
      className="fixed inset-0"
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <fog attach="fog" args={['#0f172a', 5, 20]} />
      
      <Suspense fallback={null}>
        <FloatingElements count={30} />
      </Suspense>
    </Canvas>
  );
}

function LoginParticles() {
  return (
    <Canvas
      style={{ width: '100%', height: '100%' }}
      camera={{ position: [0, 0, 50], fov: 75 }}
      className="fixed inset-0"
    >
      <Suspense fallback={null}>
        <ParticleSystem count={100} />
      </Suspense>
    </Canvas>
  );
}

function FloatingElements({ count }: { count: number }) {
  const elements = Array.from({ length: count }, (_, i) => (
    <FloatingElement key={i} index={i} total={count} />
  ));
  return <group>{elements}</group>;
}

function FloatingElement({ index, total }: { index: number; total: number }) {
  const progress = index / total;
  const angle = progress * Math.PI * 2;
  const radius = 8 + Math.random() * 4;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const y = (Math.random() - 0.5) * 6;
  
  const size = 0.2 + Math.random() * 0.5;
  const speed = 0.2 + Math.random() * 0.3;
  
  return (
    <mesh
      position={[x, y, z]}
      scale={size}
      rotation={[Math.random(), Math.random(), Math.random()]}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color="#ef4444" 
        transparent 
        opacity={0.3}
        roughness={0.7}
        metalness={0.2}
      />
      <FloatAnimation speed={speed} />
    </mesh>
  );
}

function FloatAnimation({ speed }: { speed: number }) {
  const { clock } = useThree();
  const ref = useRef<THREE.Mesh>(null!);
  
  useFrame(() => {
    if (ref.current) {
      ref.current.position.y += Math.sin(clock.getElapsedTime() * speed) * 0.01;
      ref.current.rotation.y += 0.002;
    }
  });
  
  return null;
}

function ParticleSystem({ count }: { count: number }) {
  const particles = Array.from({ length: count }, (_, i) => (
    <Particle key={i} index={i} />
  ));
  return <points>{particles}</points>;
}

function Particle({ index }: { index: number }) {
  const position = useMemo(() => [
    (Math.random() - 0.5) * 100,
    (Math.random() - 0.5) * 100,
    (Math.random() - 0.5) * 100
  ], []);
  
  const size = Math.random() * 2 + 0.5;
  const opacity = Math.random() * 0.5 + 0.1;
  const speed = Math.random() * 0.5 + 0.2;
  
  return (
    <mesh position={position} scale={size}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial 
        color="#ef4444" 
        transparent 
        opacity={opacity}
        sizeAttenuation
      />
      <FloatAnimation speed={speed} />
    </mesh>
  );
}

function Logo3D() {
  const group = useRef<THREE.Group>(null);
  const { clock } = useThree();
  
  useFrame(() => {
    if (group.current) {
      group.current.rotation.y = clock.getElapsedTime() * 0.3;
      group.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
    }
  });
  
  return (
    <group ref={group}>
      <mesh>
        <torusGeometry args={[0.8, 0.25, 16, 32]} />
        <meshStandardMaterial 
          color="#ef4444" 
          roughness={0.3} 
          metalness={0.7}
        />
      </mesh>
      <mesh>
        <torusGeometry args={[0.5, 0.15, 12, 24]} />
        <meshStandardMaterial 
          color="#ef4444" 
          roughness={0.3} 
          metalness={0.7}
        />
        <meshRotation rotation={[Math.PI / 2, 0, 0]} />
      </mesh>
    </group>
  );
}