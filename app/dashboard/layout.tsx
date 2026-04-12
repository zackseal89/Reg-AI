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

  // Fetch profile with company info
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, companies ( name, sector )')
    .eq('id', user.id)
    .single();

  const company = profile?.companies as unknown as { name: string; sector: string } | null;

  return (
    <div className="flex flex-col h-screen bg-cream">
      {/* Header */}
      <header className="bg-white border-b border-black/5 px-4 py-3 flex items-center justify-between shrink-0 safe-top">
        <div className="flex items-center gap-3">
          <span className="text-sm font-serif font-semibold text-accent">RegWatch</span>
          <span className="text-xs text-primary/40">|</span>
          <span className="text-sm font-medium text-primary">{company?.name || 'Client Portal'}</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Profile link */}
          <a
            href="/dashboard/profile"
            className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary"
          >
            {profile?.first_name?.[0]}{profile?.last_name?.[0]}
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
