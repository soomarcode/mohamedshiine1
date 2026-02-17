
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase;

try {
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('YOUR_SUPABASE_URL')) {
        const msg = 'Supabase URL or Key is missing. Check your .env file or Vercel Environment Variables!';
        console.error(msg);
        // Display error on screen for debugging
        if (typeof document !== 'undefined') {
            const errDiv = document.createElement('div');
            errDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;background:red;color:white;padding:20px;z-index:9999;text-align:center;font-weight:bold;';
            errDiv.innerText = msg;
            document.body.appendChild(errDiv);
        }
        // Create a dummy client to prevent crash
        supabase = {
            auth: {
                getSession: () => Promise.resolve({ data: { session: null } }),
                onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
                signUp: () => Promise.reject(new Error('Supabase not configured. Check console.')),
                signInWithPassword: () => Promise.reject(new Error('Supabase not configured. Check console.')),
            }
        };
    } else {
        supabase = createClient(supabaseUrl, supabaseKey);
    }
} catch (error) {
    console.error('Supabase initialization failed:', error);
    // Fallback
    supabase = { auth: { getSession: () => Promise.resolve({}), onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }) } };
}

export { supabase };
