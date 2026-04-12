export default async function AdminPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold mb-2">Platform Metrics</h1>
      <p className="text-zinc-500 mb-8">Overview of system usage, active clients, and audit trails.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 border border-black/10 rounded-lg">
          <h3 className="text-sm font-medium text-zinc-500 mb-1 uppercase tracking-wider">Total Clients</h3>
          <p className="text-3xl font-semibold">0</p>
        </div>
        <div className="p-6 border border-black/10 rounded-lg">
          <h3 className="text-sm font-medium text-zinc-500 mb-1 uppercase tracking-wider">Active Lawyers</h3>
          <p className="text-3xl font-semibold">0</p>
        </div>
        <div className="p-6 border border-black/10 rounded-lg">
          <h3 className="text-sm font-medium text-zinc-500 mb-1 uppercase tracking-wider">Docs Published</h3>
          <p className="text-3xl font-semibold">0</p>
        </div>
        <div className="p-6 border border-black/10 rounded-lg">
          <h3 className="text-sm font-medium text-zinc-500 mb-1 uppercase tracking-wider">Briefings Sent</h3>
          <p className="text-3xl font-semibold">0</p>
        </div>
      </div>
    </div>
  );
}
