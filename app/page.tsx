import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-2xl bg-white p-12 rounded-xl shadow-sm border border-black/5">
        <h1 className="text-4xl md:text-5xl font-semibold mb-6">RegWatch</h1>
        
        <p className="text-lg text-primary/80 mb-8 max-w-lg mx-auto">
          Exclusive regulatory intelligence platform for clients of MNL Advocates LLP. 
          Stay ahead of changing compliance requirements in Kenya.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            href="/login" 
            className="px-8 py-3 bg-primary text-white rounded-md font-medium hover:bg-primary/90 transition-colors w-full sm:w-auto"
          >
            Client Login
          </Link>
          <a 
            href="mailto:contact@mnladvocates.com?subject=RegWatch Access Request"
            className="px-8 py-3 bg-white text-primary border border-primary/20 rounded-md font-medium hover:bg-cream transition-colors w-full sm:w-auto"
          >
            Request Access
          </a>
        </div>
      </div>
      
      <footer className="mt-16 text-sm text-primary/60">
        &copy; {new Date().getFullYear()} MNL Advocates LLP. All rights reserved.
      </footer>
    </main>
  );
}
