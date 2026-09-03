import './globals.css';

export const metadata = {
  title: 'Live Voting App',
  description: 'Real-time live voting application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
