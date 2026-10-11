import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import EmergencyBanner from '@/components/EmergencyBanner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';

const geistSans = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ReliefAI - Autonomous Disaster Response & Crisis Platform',
  description: 'AI-powered humanitarian disaster management with Gemini multimodal damage detection, live SOS triage, shelter tracking, and volunteer logistics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full dark antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-red-500 selection:text-white">
        <AuthProvider>
          <NotificationProvider>
            <EmergencyBanner />
            <Navbar />
            <main className="flex-1 w-full">{children}</main>
            <Footer />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
