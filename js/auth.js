/**
 * LifeLink - Authentication & Modal Logic (With Supabase Integration & Validation)
 * Uses window.supabaseClient (set in supabase-config.js) to avoid CDN naming collision.
 */

// Shortcut reference to the Supabase client
const sb = window.supabaseClient;

// Modal & Tab Logic
const authModal = document.getElementById('authModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const tabLoginBtn = document.getElementById('tabLoginBtn');
const tabRegisterBtn = document.getElementById('tabRegisterBtn');

function openModal(tab) {
    if (!authModal) return;
    authModal.classList.remove('hidden');
    authModal.classList.add('flex');
    switchTab(tab);
}

function closeModal() {
    if (!authModal) return;
    authModal.classList.add('hidden');
    authModal.classList.remove('flex');
}

function switchTab(tab) {
    if (!loginForm || !registerForm) return;
    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        
        tabLoginBtn?.classList.add('border-blood-600', 'text-blood-600');
        tabLoginBtn?.classList.remove('border-transparent', 'text-gray-600');
        
        tabRegisterBtn?.classList.remove('border-blood-600', 'text-blood-600');
        tabRegisterBtn?.classList.add('border-transparent', 'text-gray-600');
    } else {
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        
        tabRegisterBtn?.classList.add('border-blood-600', 'text-blood-600');
        tabRegisterBtn?.classList.remove('border-transparent', 'text-gray-600');
        
        tabLoginBtn?.classList.remove('border-blood-600', 'text-blood-600');
        tabLoginBtn?.classList.add('border-transparent', 'text-gray-600');
    }
}

// Close modal when clicking outside
if (authModal) {
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) {
            closeModal();
        }
    });
}

// Toast Helper
function showToast(msg) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    if (!toast || !toastMessage) return;
    toastMessage.textContent = msg;
    toast.classList.remove('opacity-0', 'translate-y-2');
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
    }, 4500);
}

// Check if user is already logged in
async function checkLoginState() {
    const authButtons = document.getElementById('authButtons');
    const userProfileState = document.getElementById('userProfileState');
    const welcomeText = document.getElementById('welcomeText');

    if (!authButtons || !userProfileState || !welcomeText) return;

    let user = null;

    // Try checking active Supabase session first
    if (sb) {
        try {
            const { data: { session }, error } = await sb.auth.getSession();
            if (session?.user) {
                const meta = session.user.user_metadata || {};
                user = {
                    name: meta.full_name || session.user.email?.split('@')[0] || "Donor",
                    blood: meta.blood_group || "O+",
                    email: session.user.email
                };
                localStorage.setItem('lifelink_user', JSON.stringify(user));
            }
        } catch (err) {
            console.error("Error checking Supabase session:", err);
        }
    }

    // Fallback to LocalStorage
    if (!user) {
        const activeUser = localStorage.getItem('lifelink_user');
        if (activeUser) {
            try {
                user = JSON.parse(activeUser);
            } catch (e) {
                console.error("Invalid local user data:", e);
            }
        }
    }

    if (user) {
        authButtons.classList.add('hidden');
        userProfileState.classList.remove('hidden');
        userProfileState.classList.add('flex');
        welcomeText.textContent = `Welcome, ${user.name} (${user.blood || 'Donor'})`;
    } else {
        authButtons.classList.remove('hidden');
        userProfileState.classList.add('hidden');
        userProfileState.classList.remove('flex');
    }
}

// Handle Register Submission with Validation
async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const phone = document.getElementById('regPhone').value;
    const blood = document.getElementById('regBlood').value || 'O+';
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword')?.value || "DefaultPass123!";

    // 1. JS Validation for Email / Gmail and Phone Number
    if (typeof window.isValidEmail === 'function' && !window.isValidEmail(email)) {
        showToast("⚠️ Please enter a valid Email / Gmail address (e.g., name@gmail.com)");
        document.getElementById('regEmail')?.focus();
        return;
    }
    if (typeof window.isValidPhone === 'function' && !window.isValidPhone(phone)) {
        showToast("⚠️ Please enter a valid 10-digit Phone Number (e.g., 9876543210)");
        document.getElementById('regPhone')?.focus();
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : "";
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Registering with Supabase...";
    }

    const newUser = { name, phone, blood, email };

    if (sb) {
        try {
            console.log("📤 Signing up user to Supabase:", { email, name, blood });
            const { data, error } = await sb.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: name,
                        phone_number: phone,
                        blood_group: blood,
                        role: 'donor'
                    }
                }
            });

            if (error) {
                console.error("❌ Supabase SignUp Error:", error.message);
                showToast(`⚠️ Supabase Error: ${error.message}`);
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
                return;
            }

            console.log("✅ Supabase auth.signUp success:", data);

            // Explicitly upsert into public.profiles
            if (data?.user?.id) {
                console.log("📤 Upserting profile into public.profiles for user:", data.user.id);
                const { data: profileData, error: profileErr } = await sb.from('profiles').upsert({
                    id: data.user.id,
                    full_name: name,
                    email: email,
                    phone_number: phone,
                    blood_group: blood,
                    role: 'donor',
                    is_available_to_donate: true
                }, { onConflict: 'id' });

                if (profileErr) {
                    console.error("❌ Profile upsert error:", profileErr.message, profileErr);
                    showToast(`⚠️ Profile save error: ${profileErr.message}`);
                } else {
                    console.log("✅ Profile saved to Supabase Table Editor!", profileData);
                }
            }
        } catch (err) {
            console.error("❌ Supabase exception:", err);
        }
    } else {
        console.error("❌ Supabase client (sb) is NULL. Check supabase-config.js and CDN script order.");
        showToast("⚠️ Supabase not connected. Data saved locally only.");
    }

    localStorage.setItem('lifelink_user', JSON.stringify(newUser));
    
    closeModal();
    checkLoginState();
    showToast(`🎉 Registration successful! Saved to Supabase.`);
    
    setTimeout(() => {
        window.location.href = "blood_donor_prototype_v2.html";
    }, 1500);
}

// Handle Login Submission with Validation & Phone Lookup Support
async function handleLogin(e) {
    e.preventDefault();
    const identifier = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword')?.value || "";

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : "";

    // 1. JS Validation: Must be either a valid Email / Gmail or a valid Phone Number
    const isEmailValid = typeof window.isValidEmail === 'function' ? window.isValidEmail(identifier) : identifier.includes('@');
    const isPhoneValid = typeof window.isValidPhone === 'function' ? window.isValidPhone(identifier) : !isNaN(identifier) && identifier.length >= 10;

    if (!isEmailValid && !isPhoneValid) {
        showToast("⚠️ Please enter a valid Gmail / Email address or 10-digit Phone Number");
        document.getElementById('loginEmail')?.focus();
        return;
    }

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Authenticating...";
    }

    let user = null;
    let loginEmail = identifier;

    if (sb && password) {
        try {
            // If user entered a phone number, look up their associated email address in public.profiles!
            if (!isEmailValid && isPhoneValid) {
                console.log("🔍 Phone login detected. Looking up email for phone:", identifier);
                const { data: profile, error: lookupErr } = await sb
                    .from('profiles')
                    .select('email')
                    .eq('phone_number', identifier)
                    .maybeSingle();

                if (profile && profile.email) {
                    console.log("✅ Found associated email for phone number:", profile.email);
                    loginEmail = profile.email;
                } else {
                    console.warn("Could not find email for phone number in public.profiles.");
                }
            }

            let authResult;
            if (typeof window.isValidEmail === 'function' && window.isValidEmail(loginEmail)) {
                authResult = await sb.auth.signInWithPassword({ email: loginEmail, password: password });
            } else {
                authResult = await sb.auth.signInWithPassword({ phone: loginEmail, password: password });
            }

            const { data, error } = authResult;

            if (error) {
                console.error("Supabase SignIn Error:", error.message);
                showToast(`❌ Login Failed: ${error.message}`);
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
                return;
            } else if (data?.user) {
                const meta = data.user.user_metadata || {};
                user = {
                    name: meta.full_name || loginEmail.split('@')[0] || "Donor",
                    blood: meta.blood_group || "O+",
                    email: data.user.email
                };
                console.log("✅ Supabase login success:", data.user);
            }
        } catch (err) {
            console.error("Supabase login exception:", err);
        }
    }

    if (!user) {
        let stored = localStorage.getItem('lifelink_user');
        if (stored) {
            try { user = JSON.parse(stored); } catch (e) {}
        }
        if (!user) {
            user = { name: identifier.split('@')[0] || "Volunteer Donor", blood: "O+", email: identifier };
        }
    }

    localStorage.setItem('lifelink_user', JSON.stringify(user));

    closeModal();
    checkLoginState();
    showToast(`✅ Logged in successfully!`);
    
    setTimeout(() => {
        window.location.href = "blood_donor_prototype_v2.html";
    }, 1500);
}

// Logout logic
async function logoutUser() {
    if (sb) {
        try {
            await sb.auth.signOut();
            console.log("✅ Signed out from Supabase");
        } catch (err) {
            console.error("Error signing out from Supabase:", err);
        }
    }
    localStorage.removeItem('lifelink_user');
    checkLoginState();
    showToast("Logged out successfully.");
}

// Initialize state on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkLoginState);
} else {
    checkLoginState();
}
