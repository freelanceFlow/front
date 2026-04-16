'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Receipt,
  Briefcase,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/homepage', icon: LayoutDashboard },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Prestations', href: '/prestations', icon: Briefcase },
  { name: 'Factures', href: '/invoices', icon: Receipt },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-background flex h-screen w-64 flex-col border-r">
      <div className="flex h-16 items-center border-b px-6">
        <span className="text-lg font-bold tracking-tight">FreelanceFlow</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          // Vérifie si le lien actuel correspond à l'URL du navigateur
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground shadow-sm' // Style quand actif
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground' // Style par défaut
              )}
            >
              <item.icon
                className={cn('h-4 w-4', isActive ? 'text-primary' : '')}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </Button>
      </div>
    </aside>
  );
}
