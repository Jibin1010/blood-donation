/**
 * LifeLink - Supabase Client Configuration & Initialization
 */

const SUPABASE_URL = 'https://kbwvdsykzhgbczeilovj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtid3Zkc3lremhnYmN6ZWlsb3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxMDkxMTMsImV4cCI6MjA5ODY4NTExM30.JKOAphozKMjAARasfP4ZU1ocNdM4V6Qxzgfg5zZUgJM';

// Initialize the Supabase client if the library is loaded
let supabase = null;
if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("✅ Supabase client initialized successfully.");
} else {
    console.warn("⚠️ Supabase SDK not found. Falling back to local storage authentication.");
}
