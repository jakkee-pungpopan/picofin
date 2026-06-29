import './globals.css';
export const metadata = { title: 'NovaBank Admin', description: 'Demo admin dashboard' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><body>
      <div className="banner">⚠ Demo only — This is a demo banking system. Do not use for real financial transactions.</div>
      {children}
    </body></html>
  );
}
