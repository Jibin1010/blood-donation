/**
 * LifeLink - Authentication & Modal Logic (Landing Page)
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
    }, 3000);
}

// Check if user is already logged in
function checkLoginState() {
    const activeUser = localStorage.getItem('lifelink_user');
    const authButtons = document.getElementById('authButtons');
    const userProfileState = document.getElementById('userProfileState');
    const welcomeText = document.getElementById('welcomeText');

    if (!authButtons || !userProfileState || !welcomeText) return;

    if (activeUser) {
        const user = JSON.parse(activeUser);
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

// Handle Register Submission
function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const phone = document.getElementById('regPhone').value;
    const blood = document.getElementById('regBlood').value;
    const email = document.getElementById('regEmail').value;

    const newUser = { name, phone, blood, email };
    
    // Save to LocalStorage
    localStorage.setItem('lifelink_user', JSON.stringify(newUser));
    
    closeModal();
    checkLoginState();
    showToast(`🎉 Registration successful! Redirecting to dashboard...`);
    
    // Auto redirect after 1.5 seconds
    setTimeout(() => {
        window.location.href = "blood_donor_prototype_v2.html";
    }, 1500);
}

// Handle Login Submission
function handleLogin(e) {
    e.preventDefault();
    const identifier = document.getElementById('loginEmail').value;
    
    // Check existing user or create a generic session
    let user = localStorage.getItem('lifelink_user');
    if (user) {
        user = JSON.parse(user);
    } else {
        user = { name: identifier.split('@')[0] || "Volunteer Donor", blood: "O+" };
        localStorage.setItem('lifelink_user', JSON.stringify(user));
    }

    closeModal();
    checkLoginState();
    showToast(`✅ Logged in successfully! Taking you to prototype...`);
    
    // Auto redirect after 1.5 seconds
    setTimeout(() => {
        window.location.href = "blood_donor_prototype_v2.html";
    }, 1500);
}

// Logout logic
function logoutUser() {
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
