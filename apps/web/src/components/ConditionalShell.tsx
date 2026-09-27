'use client';

import { usePathname } from 'next/navigation';
import AppShell from './AppShell';

// Pages that render without the AppShell sidebar
const SHELL_FREE = ['/', '/login'];

export default function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (SHELL_FREE.includes(pathname)) {
    return <>{children}</>;
  }

  return <AppShell>{children}</AppShell>;
}
