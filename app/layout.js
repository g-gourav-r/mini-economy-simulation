import './globals.css';

export const metadata = {
  title: 'Mini-Economy | Financial Literacy Simulation',
  description: 'Projector, Volunteer POS, Bank Desk & Game Master Control for Kids Mini-Economy',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#ffffff',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full bg-gray-100 text-gray-900">
      <body className="min-h-full bg-gray-100 text-gray-900 antialiased selection:bg-emerald-500 selection:text-white flex flex-col">
        {children}
      </body>
    </html>
  );
}
