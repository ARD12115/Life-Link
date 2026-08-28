'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Toast } from '@/components/ui/Toast';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import { Canvas } from '@react-three/fiber';
import { supabase } from '@/lib/supabase';

const loginVariants = {
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
    transition: { delay: 0.2 + i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  })
};

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setToast(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setToast({ message: error.message, type: 'error' });
      setIsLoading(false);
    } else {
      setToast({ message: 'Welcome back!', type: 'success' });
      setTimeout(() => router.push('/dashboard'), 1000);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setToast({ message: 'Enter your email first', type: 'error' });
      return;
    }
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setToast({ message: 'Reset link sent to your email', type: 'success' });
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
        <div className="w-full max-w-md">
          
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
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Welcome Back
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 mt-2">
                    Sign in to continue to LifeLink
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
                  {/* Email */}
                  <motion.div 
                    variants={inputVariants} 
                    custom={0}
                    className="relative"
                  >
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@hospital.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={errors.email}
                        className="pl-10"
                        disabled={isLoading}
                        autoFocus
                      />
                      {errors.email && (
                        <motion.span
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-xs flex items-center gap-1"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          {errors.email}
                        </motion.span>
                      )}
                    </div>
                  </motion.div>

                  {/* Password */}
                  <motion.div 
                    variants={inputVariants} 
                    custom={1}
                    className="relative"
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        disabled={isLoading}
                        className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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

                  {/* Submit */}
                  <motion.button
                    variants={inputVariants}
                    custom={2}
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
                          <span>Signing in...</span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="default"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center justify-center gap-2"
                        >
                          <span>Sign In</span>
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
                        Or continue with
                      </span>
                    </div>
                  </div>

                  {/* Social Login */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      type="button"
                      disabled={isLoading}
                      className="gap-2"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span>Google</span>
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      disabled={isLoading}
                      className="gap-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.804 2.807 1.28 3.491.98.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.305-.536-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.232 3.301-1.232 3.301-1.232.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                      </svg>
                      <span>GitHub</span>
                    </Button>
                  </div>
                </form>

                <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  Don&apos;t have an account?{' '}
                  <Link 
                    href="/register" 
                    className="font-semibold text-primary-600 dark:text-primary-400 hover:underline transition-colors"
                  >
                    Sign up
                  </Link>
                </p>
              </motion.div>
            </div>
          </Card>

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