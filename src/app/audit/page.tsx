import type { Metadata } from 'next';
import { AuditForm } from '@/components/audit/AuditForm';

export const metadata: Metadata = {
  title: 'Audit Your AI Spend',
  description:
    'Enter your team’s AI tools and plans to instantly see where you’re overspending. Free, no login required.',
};

export default function AuditPage() {
  return <AuditForm />;
}
