import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase.from('profiles').select('role, first_name, email').eq('id', user.id).single();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="flex h-screen bg-cream">
      <aside className="w-64 bg-zinc-900 text-white flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-serif font-semibold text-white">RegWatch <span className="text-zinc-400 text-sm font-sans block">Admin Operations</span></h2>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          <a href="/admin" className="block px-4 py-2 bg-white/10 rounded">Metrics</a>
          <a href="/admin/lawyers" className="block px-4 py-2 hover:bg-white/5 rounded">Lawyers</a>
          <a href="/admin/clients" className="block px-4 py-2 hover:bg-white/5 rounded">All Clients</a>
          <a href="/admin/audit-logs" className="block px-4 py-2 hover:bg-white/5 rounded">Audit Logs</a>
        </nav>
        <div className="p-4 border-t border-white/10">
          <span className="text-sm">{profile?.email}</span>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-white m-4 rounded-xl shadow-sm border border-black/5 p-8">
        {children}
      </main>
    </div>
  );
}
