import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LawyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase.from('profiles').select('role, email').eq('id', user.id).single();

  if (profile?.role !== 'lawyer' && profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="flex h-screen bg-cream">
      <aside className="w-64 bg-primary text-white flex flex-col border-r border-black/10">
        <div className="p-6">
          <h2 className="text-xl font-serif font-semibold text-accent">RegWatch <span className="text-white text-sm font-sans block">Lawyer Portal</span></h2>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          <a href="/lawyer" className="block px-4 py-2 bg-white/10 rounded">Overview</a>
          <a href="/lawyer/clients" className="block px-4 py-2 hover:bg-white/5 rounded">Clients</a>
          <a href="/lawyer/documents" className="block px-4 py-2 hover:bg-white/5 rounded">Documents</a>
          <a href="/lawyer/briefings" className="block px-4 py-2 hover:bg-white/5 rounded">Briefings</a>
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
