import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BottomNav from "./bottom-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, companies ( name, sector )')
    .eq('id', user.id)
    .single();

  const company = profile?.companies as unknown as { name: string; sector: string } | null;

  const initials = [profile?.first_name?.[0], profile?.last_name?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase() || '?'

  return (
    <div className="flex flex-col h-screen bg-[var(--background)]">

      {/* Header — elegant top bar */}
      <header
        className="h-[60px] bg-[var(--background)]/80 backdrop-blur-xl border-b border-primary/5 px-5 flex items-center justify-between shrink-0 z-40 sticky top-0"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        {/* Brand + company */}
        <div className="flex items-center gap-3">
          <span className="text-lg font-serif font-bold text-accent tracking-tight flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            RegWatch
          </span>
          <span className="text-primary/15 font-light text-xl -mt-1">|</span>
          <span className="text-[14px] font-medium text-primary/70 truncate max-w-[160px] md:max-w-[300px]">
             {company?.name || 'Client Portal'}
          </span>
        </div>

        {/* Avatar */}
        <a
          href="/dashboard/profile"
          className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-[12px] font-semibold text-white shadow hover:bg-primary/90 transition-transform active:scale-95 duration-200"
          aria-label="Profile"
        >
          {initials}
        </a>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto pb-24 px-4 pt-6 md:px-8 max-w-5xl w-full mx-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
