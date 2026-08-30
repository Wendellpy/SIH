import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '3D ULPIN Generation & Vertical Property Mapping System | DoLR #26011',
  description: 'Production-grade 3D Cadastral Registry & Vertical Property Mapping System for Ministry of Rural Development, Dept. of Land Resources (Smart India Hackathon #26011). Built for Mumbai BMC Region.',
  icons: {
    icon: '/favicon-v2.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.className}`}>
      <body className="bg-[#0B0F19] text-slate-100 min-h-screen antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
