import React from 'react';
import Link from 'next/link';
import { Inter } from 'next/font/google';
import AuthForm from "../../components/AuthForm";

// Custom font configuration
const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  display: 'swap'
});

export default function Signup() {
  return (
    <div className={`${inter.className} min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12`}>
      <div className="w-full max-w-md space-y-8">
        <div className="bg-white shadow-2xl rounded-2xl border border-slate-100 overflow-hidden transform transition-all hover:scale-[1.01] hover:shadow-3xl duration-300">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-8">
            <div className="flex items-center justify-center mb-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                className="w-12 h-12 text-white stroke-[1.5]"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-center text-white tracking-tight leading-tight">
              Event Hub
            </h1>
            <p className="text-center text-indigo-100 mt-2 font-light text-lg">
              Create Your Account
            </p>
          </div>
          
          <div className="p-8 pt-6">
            <AuthForm type="signup" />
            
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center">
                <div className="w-1/4 border-t border-slate-300"></div>
                <span className="px-4 text-slate-500 text-sm font-medium">
                  Already have an account?
                </span>
                <div className="w-1/4 border-t border-slate-300"></div>
              </div>
              
              <div className="mt-4">
                <Link 
                  href="/" 
                  className="text-indigo-600 hover:text-indigo-800 
                    transition-colors duration-300 
                    font-semibold 
                    bg-indigo-50 hover:bg-indigo-100 
                    px-4 py-2 rounded-full"
                >
                  Login to Your Account
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <footer className="text-center text-slate-500 text-sm">
          <div className="flex justify-center items-center space-x-2">
            <span>© {new Date().getFullYear()} Event Hub</span>
            <span className="text-xs">·</span>
            <Link 
              href="/" 
              className="hover:text-indigo-600 transition-colors"
            >
              Privacy
            </Link>
            <span className="text-xs">·</span>
            <Link 
              href="/" 
              className="hover:text-indigo-600 transition-colors"
            >
              Terms
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}