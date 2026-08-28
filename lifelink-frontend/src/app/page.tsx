'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import { Button } from '@/components/ui/Button';
import { Canvas } from '@react-three/fiber';
import { HeroGlobe } from '@/components/3d/HeroGlobe';
import { Logo3D } from '@/components/3d/Logo3D';

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 3D Hero Globe */}
      <div className="fixed inset-0 z-0" aria-hidden="true">
        <HeroGlobe />
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 z-5 pointer-events-none overflow-hidden" aria-hidden="true">
        <LoginParticles />
      </div>

      {/* Main Content */}
      <main className="relative z-10 min-h-screen">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-20 px-6 py-4 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <Canvas style={{ width: '100%', height: '100%' }} camera={{ position: [0, 0, 3], fov: 30 }}>
                  <ambientLight intensity={0.8} />
                  <directionalLight position={[5, 5, 5]} intensity={1} />
                  <Logo3D />
                </Canvas>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">
                LifeLink
              </span>
            </Link>
            
            <div className="flex items-center gap-4">
              <ThemeSwitcher />
              <a href="/login" className="btn-ghost">Sign In</a>
              <a href="/register" className="btn-primary">Get Started</a>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-6 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="text-center lg:text-left"
              >
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="inline-block px-4 py-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium mb-6"
                >
                  🚀 Real-time Emergency Blood Network
                </motion.span>
                
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.7 }}
                  className="text-5xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight"
                >
                  Connecting <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">Hospitals</span> & <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">Donors</span> in Real-Time
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-xl"
                >
                  LifeLink connects hospitals with verified blood donors in real-time. 
                  When emergencies happen, every second counts. We make sure the right blood 
                  reaches the right patient at the right time.
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                >
                  <a href="/register" className="btn-primary text-lg px-8 py-4">
                    Join as Donor
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="ml-2"
                    >
                      →
                    </motion.span>
                  </a>
                  <a href="/login" className="btn-outline text-lg px-8 py-4">
                    Hospital Portal
                  </a>
                </motion.div>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="mt-16 grid grid-cols-3 gap-8 text-center"
                >
                  <div>
                    <div className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">50K+</div>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Registered Donors</p>
                  </div>
                  <div>
                    <div className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">1,200+</div>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Partner Hospitals</p>
                  </div>
                  <div>
                    <div className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">2M+</div>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Lives Saved</p>
                  </div>
                </motion.div>
              </motion.div>

              {/* 3D Hero Globe */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="relative"
              >
                <div className="relative aspect-square max-w-xl mx-auto lg:mx-0">
                  <HeroGlobe />
                </div>
                
                {/* Floating Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-8"
                >
                  <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9H9.75a9 9 0 000-18h.25a9 9 0 110 18z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">Real-time</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Matching</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-6 bg-slate-50 dark:bg-slate-900/50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <span className="inline-block px-4 py-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium mb-4">
                Why LifeLink
              </span>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                Built for <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">Emergency Response</span>
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Every feature designed to save time when seconds matter most.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: '🚀', title: 'Real-time Matching', desc: 'AI-powered matching connects donors to hospitals in under 60 seconds', gradient: 'from-red-500 to-red-600' },
                { icon: '🗺️', title: 'Live Map Tracking', desc: 'Real-time donor locations and hospital requests on interactive 3D map', gradient: 'from-blue-500 to-blue-600' },
                { icon: '🔔', title: 'Instant Alerts', desc: 'Push notifications, SMS, and email alerts for critical blood requests', gradient: 'from-amber-500 to-amber-600' },
                { icon: '🛡️', title: 'Verified Network', desc: 'All donors and hospitals verified with medical-grade identity verification', gradient: 'from-green-500 to-green-600' },
                { icon: '📊', title: 'Analytics Dashboard', desc: 'Real-time analytics on blood supply, demand patterns, and response times', gradient: 'from-purple-500 to-purple-600' },
                { icon: '🔒', title: 'HIPAA Compliant', desc: 'End-to-end encryption and full HIPAA compliance for patient data', gradient: 'from-indigo-500 to-indigo-600' },
              ].map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className="group p-8 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-3d transition-all duration-300"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4 bg-gradient-to-br ${feature.gradient}`}>
                    <span className="text-white">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 relative overflow-hidden">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Ready to Save Lives?
              </h2>
              <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                Join thousands of verified donors and hospitals in the LifeLink network. 
                Every registration brings us closer to a world where no patient waits for blood.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/register" className="btn-primary text-lg px-10 py-4">
                  Join LifeLink Today
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="ml-2"
                  >
                    →
                  </motion.span>
                </a>
                <a href="/login" className="btn-outline text-lg px-10 py-4 bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Hospital Portal
                </a>
              </div>
            </motion.div>
          </div>

          {/* Background Decoration */}
          <div className="absolute inset-0 -z-10" aria-hidden="true">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-red-500/5 rounded-full blur-3xl" />
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <Link href="/" className="flex items-center gap-3">
                  <div className="relative w-10 h-10">
                    <Canvas style={{ width: '100%', height: '100%' }} camera={{ position: [0, 0, 3], fov: 30 }}>
                      <ambientLight intensity={0.8} />
                      <directionalLight position={[5, 5, 5]} intensity={1} />
                      <Logo3D />
                    </Canvas>
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">
                    LifeLink
                  </span>
                </Link>
                <p className="mt-4 text-slate-500 dark:text-slate-400 text-sm">
                  Connecting hospitals with verified blood donors in real-time. 
                  Saving lives, one donation at a time.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Product</h4>
                <ul className="space-y-2 text-slate-500 dark:text-slate-400 text-sm">
                  <li><a href="#" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">For Hospitals</a></li>
                  <li><a href="#" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">For Donors</a></li>
                  <li><a href="#" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">API Docs</a></li>
                  <li><a href="#" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Pricing</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Company</h4>
                <ul className="space-y-2 text-slate-500 dark:text-slate-400 text-sm">
                  <li><a href="#" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Press</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Legal</h4>
                <ul className="space-y-2 text-slate-500 dark:text-slate-400 text-sm">
                  <li><a href="#" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Security</a></li>
                  <li><a href="#" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">Compliance</a></li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-slate-200/50 dark:border-slate-700/50 flex flex-col md:flex-row justify-between items-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                © 2024 LifeLink. All rights reserved.
              </p>
              <div className="flex items-center gap-4 mt-4 md:mt-0">
                <a href="#" className="text-slate-400 hover:text-red-500 transition-colors" aria-label="Twitter">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 003 4s-4 9 5 13a11.64 11.64 0 00-7 2c9 5 20 0 20-12.5a6.84 6.84 0 00-.22-2.58c.75.15 1.43.2 2.16.2C21 17 24 12.77 24 7.07 24 5.17 22.9 3.36 20.93 2z"/></svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-red-500 transition-colors" aria-label="GitHub">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.804 2.807 1.28 3.491.98.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.305-.536-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.232 3.301-1.232 3.301-1.232.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-red-500 transition-colors" aria-label="LinkedIn">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.92 3.37-1.92 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.137-.925 2.063-2.064 2.063zm1.782 13.019H3.555V9h3.654v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.455C23.2 24 24 23.227 24 21.499V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </footer>
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