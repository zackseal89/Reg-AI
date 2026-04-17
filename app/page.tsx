import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden bg-[var(--background)]">
      {/* Subtle top border gradient */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-accent to-primary opacity-90" />
      
      <div className="max-w-4xl w-full p-8 md:p-16 relative z-10 flex flex-col items-center">
        {/* Monogram / Logo Placeholder */}
        <div className="mb-10 p-1 border border-primary/10 rounded-full bg-white shadow-sm flex items-center justify-center w-20 h-20">
          <div className="flex items-center justify-center w-full h-full border border-primary/5 rounded-full">
            <span className="font-serif text-3xl text-primary tracking-tighter">MN</span>
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-serif text-primary mb-6 tracking-tight leading-tight">
          Regulatory Intelligence,<br />
          <span className="italic text-primary/80">Refined.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-primary/70 mb-12 max-w-xl mx-auto font-sans leading-relaxed">
          The exclusive foresight platform for clients of MN Legal. 
          Navigate East Africa's regulatory landscape with confidence, guided by human expertise and algorithmic precision.
        </p>

        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center w-full max-w-md">
          <Link 
            href="/login" 
            className="w-full sm:w-auto px-8 py-3.5 bg-primary text-white rounded-md font-medium text-sm tracking-widest uppercase hover:bg-primary/90 transition-all shadow hover:shadow-md focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-[var(--background)]"
          >
            Client Access
          </Link>
          <a 
            href="mailto:info@mnlegal.net?subject=RegWatch Access Request"
            className="w-full sm:w-auto px-8 py-3.5 bg-transparent text-primary border border-primary/20 rounded-md font-medium text-sm tracking-widest uppercase hover:border-accent hover:text-accent transition-all focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-[var(--background)]"
          >
            Request Access
          </a>
        </div>
      </div>
      
      <footer className="absolute bottom-8 text-xs font-sans text-primary/50 tracking-widest uppercase flex flex-col gap-2 items-center">
        <span>&copy; {new Date().getFullYear()} MN Advocates LLP</span>
        <span className="opacity-70 text-[10px]">Local Expertise &middot; Global Talent</span>
      </footer>
    </main>
  );
}
