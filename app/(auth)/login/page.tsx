import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const login = async (formData: FormData) => {
    'use server'
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      redirect('/login?error=Could not authenticate user')
    }
    
    // The middleware will handle the redirection to the right dashboard
    redirect('/')
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 bg-cream">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-black/5">
        <h1 className="text-3xl font-semibold mb-2 text-center">Sign In</h1>
        <p className="text-primary/70 text-center mb-8">Enter your credentials to access RegWatch.</p>
        
        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              required 
              className="px-3 py-2 border border-black/10 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              required 
              className="px-3 py-2 border border-black/10 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <button 
            formAction={login}
            className="mt-4 w-full py-2.5 bg-primary text-white rounded-md font-medium hover:bg-primary/90 transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </main>
  );
}
