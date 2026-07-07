/**
 * LifeLink - Supabase Client Configuration & Initialization
 */

const SUPABASE_URL = 'https://kbwvdsykzhgbczeilovj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtid3Zkc3lremhnYmN6ZWlsb3ZqIiwicm9sZSI6Imtid3Zkc3lremhnYmN6ZWlsb3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxMDkxMTMsImV4cCI6MjA5ODY4NTExM30.JKOAphozKMjAARasfP4ZU1ocNdM4V6Qxzgfg5zZUgJM';

// Initialize the Supabase client globally so all files (auth.js, app.js) can use it reliably
var supabase = null;
if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    supabase = window.supabaseClient;
    console.log("✅ Supabase client initialized successfully on window.supabaseClient");
} else {
    console.warn("⚠️ Supabase SDK CDN not found. Please ensure @supabase/supabase-js is loaded.");
}
