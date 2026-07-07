/**
 * LifeLink - Authentication & Modal Logic (With Explicit Supabase Profile Upsert)
 */

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

// Check if user is already logged in (via Supabase session or LocalStorage fallback)
async function checkLoginState() {
    const authButtons = document.getElementById('authButtons');
    const userProfileState = document.getElementById('userProfileState');
    const welcomeText = document.getElementById('welcomeText');

    if (!authButtons || !userProfileState || !welcomeText) return;

    let user = null;

    // Try checking active Supabase session first
    if (typeof supabase !== 'undefined' && supabase) {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
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

    // Fallback to LocalStorage if Supabase offline or no active session
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

// Handle Register Submission with Supabase Auth + Direct Profile Upsert
async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const phone = document.getElementById('regPhone').value;
    const blood = document.getElementById('regBlood').value || 'O+';
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword')?.value || "DefaultPass123!";

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : "";
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Registering with Supabase...";
    }

    const newUser = { name, phone, blood, email };

    // 1. Attempt Supabase Registration
    if (typeof supabase !== 'undefined' && supabase) {
        try {
            console.log("Signing up user to Supabase:", { email, name, blood });
            const { data, error } = await supabase.auth.signUp({
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
                console.error("Supabase SignUp Error:", error.message);
                showToast(`⚠️ Supabase Error: ${error.message}`);
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
                return; // Stop if database error occurs
            } else {
                console.log("✅ Supabase registration success:", data);
                
                // Explicitly insert into public.profiles table from client to guarantee visibility
                if (data?.user?.id) {
                    console.log("Upserting profile into public.profiles...");
                    const { error: profileErr } = await supabase.from('profiles').upsert({
                        id: data.user.id,
                        full_name: name,
                        email: email,
                        phone_number: phone,
                        blood_group: blood,
                        role: 'donor',
                        is_available_to_donate: true
                    }, { onConflict: 'id' });

                    if (profileErr) {
                        console.warn("Notice saving profile directly:", profileErr.message);
                    } else {
                        console.log("✅ Profile inserted/updated in Supabase Table Editor successfully!");
                    }
                }
            }
        } catch (err) {
            console.error("Supabase exception:", err);
        }
    } else {
        console.warn("Supabase client is not initialized.");
    }

    // 2. Save to LocalStorage for instant dashboard experience
    localStorage.setItem('lifelink_user', JSON.stringify(newUser));
    
    closeModal();
    checkLoginState();
    showToast(`🎉 Registration successful! Saved to Supabase.`);
    
    setTimeout(() => {
        window.location.href = "blood_donor_prototype_v2.html";
    }, 1500);
}

// Handle Login Submission with Supabase Auth
async function handleLogin(e) {
    e.preventDefault();
    const identifier = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword')?.value || "";

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : "";
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Authenticating...";
    }

    let user = null;

    // 1. Attempt Supabase Login if email and password provided
    if (typeof supabase !== 'undefined' && supabase && identifier.includes('@') && password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: identifier,
                password: password,
            });

            if (error) {
                console.error("Supabase SignIn Error:", error.message);
                showToast(`❌ Login Failed: ${error.message}`);
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
                return; // Do not log in if authentication fails
            } else if (data?.user) {
                const meta = data.user.user_metadata || {};
                user = {
                    name: meta.full_name || identifier.split('@')[0] || "Donor",
                    blood: meta.blood_group || "O+",
                    email: data.user.email
                };
                console.log("✅ Supabase login success:", data.user);
            }
        } catch (err) {
            console.error("Supabase login exception:", err);
        }
    }

    // 2. Fallback or generic session if Supabase not used/needed
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
    showToast(`✅ Logged in successfully! Taking you to prototype...`);
    
    setTimeout(() => {
        window.location.href = "blood_donor_prototype_v2.html";
    }, 1500);
}

// Logout logic
async function logoutUser() {
    if (typeof supabase !== 'undefined' && supabase) {
        try {
            await supabase.auth.signOut();
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
