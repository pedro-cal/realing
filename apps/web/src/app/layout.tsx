import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lingua - AI-Powered Language Platform',
  description: 'Multi-language learning platform powered by AI and social interactions.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased dark:bg-slate-950">
        <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">
                L
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Lingua
              </span>
            </div>
            <nav className="flex items-center space-x-4 text-sm font-medium text-slate-600 dark:text-slate-300">
              <a href="#courses" className="hover:text-indigo-600">Courses</a>
              <a href="#practice" className="hover:text-indigo-600">Audio Practice</a>
              <a href="#social" className="hover:text-indigo-600">Voice Lounges</a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
