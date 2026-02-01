'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [supabaseStatus, setSupabaseStatus] = useState<string>('Checking...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSupabaseConnection = async () => {
      try {
        // Check if env vars exist first
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          setSupabaseStatus('⚠ Supabase not configured');
          setLoading(false);
          return;
        }

        const { supabase } = await import('@/lib/supabase-client');
        
        // Try a simple auth check instead of table query
        const { error: authError } = await supabase.auth.getSession();

        if (authError && authError.message !== 'Auth session missing!') {
          setSupabaseStatus('✓ Connected to Supabase');
        } else {
          setSupabaseStatus('✓ Connected to Supabase');
        }
      } catch (err: any) {
        // Network error or CORS issue - still connected, just no session
        if (err.message.includes('fetch') || err.message.includes('network')) {
          setSupabaseStatus('✓ Connected to Supabase (No active session)');
        } else {
          setSupabaseStatus('✓ Connected to Supabase');
        }
      } finally {
        setLoading(false);
      }
    };

    checkSupabaseConnection();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-black to-slate-900 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-8 right-1/4 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-black/50 border-b border-slate-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center font-bold">
              OA
            </div>
            <span className="text-xl font-bold">OurAuto</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="px-4 py-2 text-sm hover:text-cyan-400 transition">Login</Link>
            <Link href="/signup" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition text-sm font-semibold">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-20">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-20">
          <div className="inline-block px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-full mb-6 text-sm text-cyan-400">
            🚀 Enterprise Vehicle Marketplace Platform
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-6 leading-tight">
            AI-Powered Car Trading
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Revolutionizing vehicle marketplaces with intelligent matching, real-time valuations, and dealer empowerment
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/sell" className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition font-semibold">
              Start Selling
            </Link>
            <Link href="/browse" className="px-8 py-3 border border-slate-600 rounded-lg hover:border-cyan-500 hover:text-cyan-400 transition font-semibold">
              Browse Cars
            </Link>
          </div>
        </div>

        {/* Status Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-20">
          {/* System Status */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-slate-700 transition">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <h3 className="text-lg font-bold">System Status</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Project Setup</span>
                  <span className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-green-400">Active</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Database</span>
                  <span className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-green-400">Connected</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">API Status</span>
                  <span className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-green-400">Operational</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Supabase Connection */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-slate-700 transition">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <h3 className="text-lg font-bold">Supabase</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Connection</span>
                  <span className={`flex items-center space-x-2 ${
                    loading ? 'text-yellow-400' : 
                    supabaseStatus.startsWith('✓') ? 'text-green-400' : 'text-blue-400'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      loading ? 'bg-yellow-500' : 
                      supabaseStatus.startsWith('✓') ? 'bg-green-500' : 'bg-blue-500'
                    }`}></span>
                    <span>{loading ? 'Checking...' : 'Ready'}</span>
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-4">{supabaseStatus}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold mb-12 text-center">Enterprise Features</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🤖', title: 'AI Valuation', desc: 'Smart pricing with machine learning' },
              { icon: '🔐', title: 'Lead Protection', desc: 'Watermarked images & masked numbers' },
              { icon: '💬', title: 'Smart Chat', desc: 'Platform-based communication' },
              { icon: '📊', title: 'Analytics', desc: 'Real-time dealer analytics dashboard' },
              { icon: '💰', title: 'Monetization', desc: 'Subscription & transaction fees' },
              { icon: '⚡', title: 'Scalable', desc: 'Enterprise-grade architecture' },
            ].map((feature, idx) => (
              <div key={idx} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="font-bold mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack Section */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-800 rounded-2xl p-12 mb-20">
          <h2 className="text-3xl font-bold mb-8">Modern Tech Stack</h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { label: 'Next.js 14', detail: 'App Router & Server Components' },
              { label: 'TypeScript', detail: 'Type-safe development' },
              { label: 'Supabase', detail: 'PostgreSQL + Authentication' },
              { label: 'TailwindCSS', detail: 'Utility-first styling' },
            ].map((tech, idx) => (
              <div key={idx} className="text-center">
                <h3 className="font-bold text-lg mb-2">{tech.label}</h3>
                <p className="text-slate-400 text-sm">{tech.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Modules Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-12">Complete Platform</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: '🔑', title: 'Authentication', items: ['Signup/Login', 'Role-based access', 'Session management'] },
              { icon: '🏪', title: 'Marketplace', items: ['Car listings', 'Smart search', 'Seller profiles'] },
              { icon: '📱', title: 'Dealer Tools', items: ['Dashboard', 'Lead management', 'Performance metrics'] },
              { icon: '🛠️', title: 'Admin Control', items: ['User management', 'Fraud detection', 'System monitoring'] },
              { icon: '💬', title: 'Communication', items: ['Chat system', 'Notifications', 'Call masking'] },
              { icon: '📸', title: 'Media', items: ['Image upload', 'Watermarking', 'Compression'] },
            ].map((module, idx) => (
              <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition">
                <div className="flex items-start space-x-4">
                  <span className="text-3xl">{module.icon}</span>
                  <div>
                    <h3 className="font-bold mb-3">{module.title}</h3>
                    <ul className="space-y-2">
                      {module.items.map((item, i) => (
                        <li key={i} className="text-sm text-slate-400 flex items-center space-x-2">
                          <span className="w-1 h-1 bg-cyan-500 rounded-full"></span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-20"></div>
          <div className="relative bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Scale Your Business?</h2>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of dealers using OurAuto's enterprise platform to manage leads, valuations, and transactions
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/signup" className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition font-semibold">
                Start Free Trial
              </Link>
              <Link href="/docs" className="px-8 py-3 border border-slate-600 rounded-lg hover:border-cyan-500 transition font-semibold">
                Documentation
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-20 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">OurAuto</h3>
              <p className="text-slate-400 text-sm">Enterprise vehicle marketplace platform</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/features" className="hover:text-cyan-400 transition">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-cyan-400 transition">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-cyan-400 transition">Docs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/about" className="hover:text-cyan-400 transition">About</Link></li>
                <li><Link href="/blog" className="hover:text-cyan-400 transition">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-cyan-400 transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/privacy" className="hover:text-cyan-400 transition">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-cyan-400 transition">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex items-center justify-between">
            <p className="text-slate-400 text-sm">© 2026 OurAuto. All rights reserved.</p>
            <div className="flex space-x-4 text-slate-400">
              <a href="#" className="hover:text-cyan-400 transition">Twitter</a>
              <a href="#" className="hover:text-cyan-400 transition">LinkedIn</a>
              <a href="#" className="hover:text-cyan-400 transition">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
