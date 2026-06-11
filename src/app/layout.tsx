import type { Metadata, Viewport } from 'next';
import { AppProviders } from '@/providers';
import { AppShell } from '@/components/layout/AppShell';
import './globals.css';

export const viewport: Viewport = {
  // Cream theme color so the mobile browser chrome never renders dark.
  themeColor: '#FAF7F0',
};

export const metadata: Metadata = {
  title: {
    default: 'AuditIQ — Free AI Spend Audit',
    template: '%s | AuditIQ',
  },
  description:
    'Discover where your team is overspending on AI tools. Free audit, instant results, no account required.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  ),
  openGraph: {
    title: 'AuditIQ — Free AI Spend Audit',
    description:
      'Discover where your team is overspending on AI tools. Free audit, instant results, no account required.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@600,700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-cream text-ink">
        <AppProviders>
          <AppShell>
            {children}
          </AppShell>
        </AppProviders>
      </body>
    </html>
  );
}

