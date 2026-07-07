/**
 * LifeLink - Supabase Client Configuration & Initialization
 * 
 * IMPORTANT: The CDN sets window.supabase = { createClient }.
 * We must capture that reference BEFORE declaring any variable
 * named 'supabase' (which would overwrite window.supabase in global scope).
 */

const SUPABASE_URL = 'https://kbwvdsykzhgbczeilovj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtid3Zkc3lremhnYmN6ZWlsb3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxMDkxMTMsImV4cCI6MjA5ODY4NTExM30.JKOAphozKMjAARasfP4ZU1ocNdM4V6Qxzgfg5zZUgJM';

// Capture the CDN library reference BEFORE any var declaration can overwrite it
const _supabaseLib = window.supabase;

// Create the client using a DIFFERENT variable name to avoid collision
window.supabaseClient = null;

if (_supabaseLib && typeof _supabaseLib.createClient === 'function') {
    window.supabaseClient = _supabaseLib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("✅ Supabase client initialized successfully. Ready to send data.");
} else {
    console.error("❌ Supabase SDK CDN did not load. Check your internet connection or script order in HTML.");
}

// Global Validation Helpers for Email/Gmail and Phone Number
window.isValidEmail = function(email) {
    if (!email) return false;
    // Enforces valid email format (e.g., user@domain.tld or user@gmail.com)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
};

window.isValidPhone = function(phone) {
    if (!phone) return false;
    // Verifies a valid 10 to 15 digit mobile phone number
    const cleaned = phone.replace(/[\s\-()]/g, '');
    const phoneRegex = /^(\+?\d{1,3})?\d{10}$/;
    const digitsOnly = cleaned.replace(/\D/g, '');
    return phoneRegex.test(cleaned) && digitsOnly.length >= 10 && digitsOnly.length <= 15;
};
