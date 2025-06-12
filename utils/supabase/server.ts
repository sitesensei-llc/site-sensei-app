import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types_db';

// Define a function to create a Supabase client for server-side operations
// The function takes a cookie store created with next/headers cookies as an argument
export const createClient = () => {
  const cookieStore = cookies();

  return createServerClient<Database>(
    // Pass Supabase URL and anonymous key from the environment to the client
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,

    // Define a cookies object with methods for interacting with the cookie store and pass it to the client
    {
      cookies: {
        // The get method is used to retrieve a cookie by its name
        get: async (name: string) => {
          const cookieStore = await cookies(); // Get the cookies object
          return cookieStore.get(name)?.value || null;
        },
        
        // The set method is used to set a cookie with a given name, value, and options
        set: async (name: string, value: string, options: CookieOptions) => {
          try {
            const cookieStore = await cookies(); // <--- this line added
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Middleware will usually refresh session anyway, so you can safely ignore this in server components
          }
        },
        
        // The remove method is used to delete a cookie by its name
        remove: async (name: string, options: CookieOptions) => {
          try {
            const cookieStore = await cookies(); // <-- await it!
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Safe to ignore in server components; sessions will refresh via middleware
          }
        }
        
      }
    }
  );
};
