import type { Metadata } from 'next';
import { DraftSwitcher } from './_components/DraftSwitcher';

export const metadata: Metadata = {
  title: 'Engineering Club — Landing Drafts',
  description: 'Three landing page drafts for Engineering Club.',
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <DraftSwitcher />
    </>
  );
}
