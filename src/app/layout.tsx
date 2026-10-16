import type { Metadata } from 'next';
import { Geist, Geist_Mono, Hind_Siliguri } from 'next/font/google';
import './globals.css';
import EmergencyBanner from '@/components/EmergencyBanner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingSOS from '@/components/FloatingSOS';
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

const hindSiliguri = Hind_Siliguri({
  variable: '--font-bangla',
  subsets: ['bengali'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'ReliefAI Bangladesh (রিলিফএআই) - Autonomous Disaster Response & Environmental Protection Platform',
  description: 'AI-driven crisis intelligence for Bangladesh: Multimodal satellite flood detection, cyclone early warnings, Fire Service SAR dispatch, and river pollution telemetry.',
  icons: {
    icon: '/favicon-logo.png',
    shortcut: '/favicon-logo.png',
    apple: '/favicon-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${hindSiliguri.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" type="image/png" href="/favicon-logo.png" />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
        <AuthProvider>
          <NotificationProvider>
            <EmergencyBanner />
            <Navbar />
            <main className="flex-1 w-full">{children}</main>
            <FloatingSOS />
            <Footer />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
