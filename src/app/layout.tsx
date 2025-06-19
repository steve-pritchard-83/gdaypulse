import './globals.css';

export const metadata = {
  title: "G'dayPulse",
  description: 'DORA + OKR Dashboard for futrcrew.com',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
