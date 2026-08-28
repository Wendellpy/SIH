import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '3D ULPIN Generation & Vertical Property Mapping System | DoLR #26011',
  description: 'Production-grade 3D Cadastral Registry & Vertical Property Mapping System for Ministry of Rural Development, Dept. of Land Resources (Smart India Hackathon #26011). Built for Mumbai BMC Region.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-slate-100 min-h-screen antialiased overflow-hidden select-none">
        {children}
      </body>
    </html>
  );
}
