/**
 * LifeLink - Dashboard & Emergency Network Application Logic
 */

// 1. Geolocation API & Dummy Data for Hospitals
const findHospitalBtn = document.getElementById('findHospitalBtn');
const locationDisplay = document.getElementById('locationDisplay');
const hospitalListContainer = document.getElementById('hospitalListContainer');
const hospitalList = document.getElementById('hospitalList');

const dummyHospitals = [
    { name: "City General Hospital", dist: "1.2 km" },
    { name: "Metro Blood Bank", dist: "3.4 km" },
    { name: "Community Health Clinic", dist: "5.1 km" }
];

if (findHospitalBtn && hospitalListContainer) {
    findHospitalBtn.addEventListener('click', () => {
        if (!hospitalListContainer.classList.contains('hidden') && findHospitalBtn.textContent === "Close Hospital List") {
            hospitalListContainer.classList.add('hidden');
            findHospitalBtn.textContent = "Find a Hospital Near Me";
            return;
        }

        if ("geolocation" in navigator) {
            findHospitalBtn.textContent = "Locating...";
            hospitalListContainer.classList.remove('hidden');
            if (hospitalList) {
                hospitalList.innerHTML = `<li class="p-4 text-sm text-gray-500 text-center">Requesting permission...</li>`;
            }
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude.toFixed(4);
                    const lon = position.coords.longitude.toFixed(4);
                    findHospitalBtn.textContent = "Close Hospital List";
                    if (locationDisplay) {
                        locationDisplay.textContent = `Your Location: ${lat}, ${lon}`;
                    }
                    
                    if (hospitalList) {
                        hospitalList.innerHTML = '';
                        // Get user's selected blood group from the dropdown
                        const userBloodGroup = document.getElementById('bloodGroupSelect')?.value;

                        dummyHospitals.forEach(h => {
                            let requestsHTML = '';
                            let urgentBadge = '';
                            let isUserTypeNeeded = false;
                            
                            if (typeof activeRequestsFeed !== 'undefined') {
                                // Filter active requests for this specific hospital
                                const hospitalRequests = activeRequestsFeed.filter(req => req.hospital === h.name);
                                
                                if (hospitalRequests.length > 0) {
                                    requestsHTML = `<div class="w-full mt-2 space-y-2 border-t border-gray-100 pt-2">`;
                                    hospitalRequests.forEach(req => {
                                        const urgencyColor = req.urgency === 'Critical' ? 'text-red-700 bg-red-100' : (req.urgency === 'High' ? 'text-orange-700 bg-orange-100' : 'text-blue-700 bg-blue-100');
                                        const isMatch = userBloodGroup && req.type === userBloodGroup;
                                        if (isMatch) isUserTypeNeeded = true;
                                        
                                        requestsHTML += `
                                            <div class="${isMatch ? 'bg-red-50 border-red-200 shadow-sm' : 'bg-gray-50 border-gray-200'} p-2 rounded border flex flex-col gap-1 transition-all">
                                                <div class="flex justify-between items-center">
                                                    <span class="text-xs font-semibold text-gray-800">${req.name} <span class="${isMatch ? 'text-red-600 font-bold' : 'text-gray-500'}">(${req.type})</span></span>
                                                    <span class="text-[10px] font-bold px-1.5 py-0.5 rounded ${urgencyColor} uppercase">${req.urgency}</span>
                                                </div>
                                                <div class="flex justify-between items-center text-[10px] text-gray-500">
                                                    <span>${req.units} Units Needed</span>
                                                    <span>${req.time}</span>
                                                </div>
                                            </div>
                                        `;
                                    });
                                    requestsHTML += `</div>`;
                                }
                            }

                            if (isUserTypeNeeded) {
                                urgentBadge = `<span class="ml-2 bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse border border-red-200">Needs ${userBloodGroup}!</span>`;
                            }

                            hospitalList.innerHTML += `
                                <li class="p-3 hover:bg-gray-50 cursor-pointer flex flex-col items-start transition-colors border-l-4 border-transparent hover:border-primary-500">
                                    <div class="flex justify-between items-center w-full">
                                        <div class="flex items-center flex-wrap gap-1">
                                            <span class="font-bold text-gray-800">${h.name}</span>
                                            ${urgentBadge}
                                        </div>
                                        <span class="text-xs text-primary-700 bg-primary-100 px-2 py-1 rounded font-bold whitespace-nowrap ml-2">${h.dist}</span>
                                    </div>
                                    ${requestsHTML}
                                </li>
                            `;
                        });
                    }
                },
                (error) => {
                    findHospitalBtn.textContent = "Find a Hospital Near Me";
                    hospitalListContainer.classList.add('hidden');
                    alert("Error getting location: " + error.message);
                }
            );
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    });
}

// 2. Web Notifications API
const enableAlertsBtn = document.getElementById('enableAlertsBtn');

function updateAlertsButtonUI() {
    if (enableAlertsBtn && "Notification" in window && Notification.permission === "granted") {
        enableAlertsBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            Alerts Enabled
        `;
        enableAlertsBtn.classList.remove('bg-secondary-50', 'text-secondary-500', 'border-secondary-200', 'hover:bg-secondary-100');
        enableAlertsBtn.classList.add('bg-green-50', 'text-green-600', 'border-green-200');
    }
}

updateAlertsButtonUI();

if (enableAlertsBtn) {
    enableAlertsBtn.addEventListener('click', async () => {
        if (!("Notification" in window)) {
            alert("This browser does not support desktop notification");
            return;
        }

        if (Notification.permission === "granted") {
            showToast("You are already subscribed to alerts!");
        } else if (Notification.permission !== "denied") {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
                new Notification("LifeLink Alerts Enabled", {
                    body: "URGENT: Test Alert - O+ Blood needed at City General Hospital!"
                });
                updateAlertsButtonUI();
                showToast("Alerts Enabled!");
            }
        }
    });
}

// 3. Local Storage API
const bloodGroupSelect = document.getElementById('bloodGroupSelect');

if (bloodGroupSelect) {
    // Load saved preference
    const savedBloodGroup = localStorage.getItem('userBloodGroup');
    if (savedBloodGroup) {
        bloodGroupSelect.value = savedBloodGroup;
    }

    // Save preference on change
    bloodGroupSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val) {
            localStorage.setItem('userBloodGroup', val);
            showToast(`Blood group ${val} saved!`);
        } else {
            localStorage.removeItem('userBloodGroup');
        }
        // Re-render feed instantly to sort matches to the top
        if (typeof renderActiveRequests === 'function') {
            renderActiveRequests();
        }
    });
}

// 4. Clipboard API
function copyToClipboard(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const text = el.textContent;
    navigator.clipboard.writeText(text).then(() => {
        showToast("Copied to clipboard!");
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

// Helper for Toast (UI feedback)
function showToast(msg) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    if (!toast || !toastMessage) return;
    toastMessage.textContent = msg;
    toast.classList.remove('opacity-0');
    setTimeout(() => {
        toast.classList.add('opacity-0');
    }, 3000);
}

// 5. Drag and Drop API & File API
const registerBtn = document.getElementById('registerBtn');
const registerModal = document.getElementById('registerModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const completeRegistrationBtn = document.getElementById('completeRegistrationBtn');
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const imagePreview = document.getElementById('imagePreview');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');
const dropZoneContent = document.getElementById('dropZoneContent');

function resetModalState() {
    if (!imagePreview || !imagePreviewContainer || !dropZoneContent || !fileInput) return;
    imagePreview.src = '';
    imagePreviewContainer.classList.add('hidden');
    dropZoneContent.classList.remove('hidden');
    fileInput.value = '';
}

function closeRegisterModal() {
    if (!registerModal) return;
    registerModal.classList.add('hidden');
    registerModal.classList.remove('flex');
    resetModalState();
}

function openRegisterModal() {
    if (!registerModal) return;
    registerModal.classList.remove('hidden');
    registerModal.classList.add('flex');
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeRegisterModal);
}

// Close modal when clicking outside
if (registerModal) {
    registerModal.addEventListener('click', (e) => {
        if (e.target === registerModal) {
            closeRegisterModal();
        }
    });
}

if (completeRegistrationBtn) {
    completeRegistrationBtn.addEventListener('click', () => {
        closeRegisterModal();
        showToast("Registration Complete!");
    });
}

// Drag and Drop Events
if (dropZone) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        dropZone.classList.add('bg-primary-100', 'border-primary-400');
    }

    function unhighlight(e) {
        dropZone.classList.remove('bg-primary-100', 'border-primary-400');
    }

    dropZone.addEventListener('drop', handleDrop, false);
    
    // Click to upload
    dropZone.addEventListener('click', () => {
        if (fileInput) fileInput.click();
    });

    function handleDrop(e) {
        let dt = e.dataTransfer;
        let files = dt.files;
        handleFiles(files);
    }
}

if (fileInput) {
    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });
}

function handleFiles(files) {
    if (files.length > 0 && imagePreview && imagePreviewContainer && dropZoneContent) {
        const file = files[0];
        
        // Only process image files.
        if (!file.type.match('image.*')) {
            alert("Please upload an image file.");
            return;
        }

        // File API: FileReader to preview the image
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreviewContainer.classList.remove('hidden');
            dropZoneContent.classList.add('hidden');
        };
        reader.readAsDataURL(file);
    }
}

// 6. Zero-Data Eligibility Screener (Client-side logic)
const eligibilityModal = document.getElementById('eligibilityModal');
const closeEligibilityBtn = document.getElementById('closeEligibilityBtn');
const eligibilityForm = document.getElementById('eligibilityForm');
const screenerFormContainer = document.getElementById('screenerFormContainer');
const screenerResultContainer = document.getElementById('screenerResultContainer');

function closeEligibilityModal() {
    if (!eligibilityModal || !eligibilityForm || !screenerFormContainer || !screenerResultContainer) return;
    eligibilityModal.classList.add('hidden');
    eligibilityModal.classList.remove('flex');
    // Reset form for next time after a short delay for animation smoothness
    setTimeout(() => {
        eligibilityForm.reset();
        screenerFormContainer.classList.remove('hidden');
        screenerResultContainer.classList.add('hidden');
        screenerResultContainer.innerHTML = '';
    }, 300);
}

// Register button opens Eligibility Screener first
if (registerBtn && eligibilityModal) {
    registerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        eligibilityModal.classList.remove('hidden');
        eligibilityModal.classList.add('flex');
    });
}

if (closeEligibilityBtn) {
    closeEligibilityBtn.addEventListener('click', closeEligibilityModal);
}

if (eligibilityModal) {
    eligibilityModal.addEventListener('click', (e) => {
        if (e.target === eligibilityModal) {
            closeEligibilityModal();
        }
    });
}

if (eligibilityForm && screenerFormContainer && screenerResultContainer) {
    eligibilityForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevents sending data to a server

        const formData = new FormData(eligibilityForm);
        const age = formData.get('age');
        const weight = formData.get('weight');
        const health = formData.get('health');
        const tattoo = formData.get('tattoo');
        const hiv = formData.get('hiv');
        const surgery = formData.get('surgery');

        let isEligible = true;
        let reason = "";

        if (age === 'no') { isEligible = false; reason = "You must be between 18 and 65 years old to donate."; }
        else if (weight === 'no') { isEligible = false; reason = "You must weigh at least 50kg (110 lbs) to donate safely."; }
        else if (health === 'no') { isEligible = false; reason = "You must be feeling completely well and healthy today to donate."; }
        else if (tattoo === 'yes') { isEligible = false; reason = "You must wait 6 months after getting a new tattoo or piercing to donate blood."; }
        else if (hiv === 'yes') { isEligible = false; reason = "Individuals who have tested positive for HIV/AIDS or Hepatitis cannot donate blood."; }
        else if (surgery === 'yes') { isEligible = false; reason = "You must wait 12 months after major surgery or a blood transfusion before donating."; }

        screenerFormContainer.classList.add('hidden');
        screenerResultContainer.classList.remove('hidden');

        if (isEligible) {
            screenerResultContainer.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h4 class="text-2xl font-bold text-gray-800 mb-2">Cleared to Donate!</h4>
                <p class="text-gray-600 mb-8">Based on your answers, you are eligible to donate blood today. Your privacy has been maintained as no data left your device.</p>
                <button onclick="document.getElementById('closeEligibilityBtn').click(); openRegisterModal();" class="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-md transition-colors shadow-md">
                    Proceed to Registration
                </button>
            `;
        } else {
            screenerResultContainer.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20 text-secondary-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h4 class="text-2xl font-bold text-gray-800 mb-2">Not Eligible at This Time</h4>
                <p class="text-gray-700 font-medium mb-4">${reason}</p>
                <p class="text-sm text-gray-500 mb-8">Thank you for your willingness to help. Please try again when these conditions change.</p>
                <button onclick="document.getElementById('closeEligibilityBtn').click();" class="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-md transition-colors">
                    Close
                </button>
            `;
        }
    });
}

// 7. Request Blood Modal Logic
const requestBloodBtn = document.getElementById('requestBloodBtn');
const requestModal = document.getElementById('requestModal');
const closeRequestBtn = document.getElementById('closeRequestBtn');
const requestBloodForm = document.getElementById('requestBloodForm');

function closeRequestModal() {
    if (!requestModal || !requestBloodForm) return;
    requestModal.classList.add('hidden');
    requestModal.classList.remove('flex');
    setTimeout(() => {
        requestBloodForm.reset();
    }, 300);
}

if (requestBloodBtn && requestModal) {
    requestBloodBtn.addEventListener('click', (e) => {
        e.preventDefault();
        requestModal.classList.remove('hidden');
        requestModal.classList.add('flex');
    });
}

if (closeRequestBtn) {
    closeRequestBtn.addEventListener('click', closeRequestModal);
}

if (requestModal) {
    requestModal.addEventListener('click', (e) => {
        if (e.target === requestModal) {
            closeRequestModal();
        }
    });
}

// Dummy Feed Data
let activeRequestsFeed = [
    { id: 1, name: "Baby Aria", type: "O-", hospital: "City General Hospital", units: 2, urgency: "Critical", time: "10 mins ago" },
    { id: 2, name: "Rajesh Kumar", type: "AB+", hospital: "Metro Blood Bank", units: 1, urgency: "High", time: "25 mins ago" },
    { id: 3, name: "Sarah Jenkins", type: "A+", hospital: "Community Health Clinic", units: 3, urgency: "Medium", time: "1 hour ago" }
];

const requestsFeedContainer = document.getElementById('requestsFeed');

function renderActiveRequests() {
    if(!requestsFeedContainer) return;
    requestsFeedContainer.innerHTML = '';
    
    const userBloodGroup = document.getElementById('bloodGroupSelect')?.value;
    
    // Create a sorted copy of the feed based on match
    const sortedFeed = [...activeRequestsFeed].sort((a, b) => {
        const aMatch = userBloodGroup && a.type === userBloodGroup ? 1 : 0;
        const bMatch = userBloodGroup && b.type === userBloodGroup ? 1 : 0;
        return bMatch - aMatch; // descending order, matches first
    });

    sortedFeed.forEach(req => {
        const urgencyColor = req.urgency === 'Critical' ? 'text-red-600 bg-red-50' : (req.urgency === 'High' ? 'text-orange-600 bg-orange-50' : 'text-blue-600 bg-blue-50');
        const isMatch = userBloodGroup && req.type === userBloodGroup;
        const isAccepted = req.accepted;
        
        let buttonHTML = '';
        if (isAccepted) {
            const pending = 3 - (req.completedSteps || 0);
            buttonHTML = `<button class="text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 px-3 py-1.5 rounded transition-colors" onclick="openChecklist(${req.id})">Checklist (${pending} pending)</button>`;
        } else {
            buttonHTML = `<button class="text-sm font-medium ${isMatch ? 'text-white bg-red-600 hover:bg-red-700' : 'text-primary-600 bg-primary-50 hover:bg-primary-100'} px-3 py-1.5 rounded transition-colors" onclick="acceptRequest(${req.id})">Accept Request</button>`;
        }

        let cardStyles = isMatch ? 'bg-red-50 border-red-200 shadow-md transform scale-[1.02]' : 'bg-white border-gray-100 shadow-sm hover:shadow-md';
        if (isAccepted) {
            cardStyles = 'bg-yellow-50 border-yellow-300 shadow-md transform scale-[1.02]';
        }

        let statusBadge = isMatch && !isAccepted ? '• Match Found!' : '';
        if (isAccepted) statusBadge = '• IN PROGRESS';

        requestsFeedContainer.innerHTML += `
            <div class="${cardStyles} border rounded-xl p-5 transition-all relative overflow-hidden group">
                <div class="absolute top-0 left-0 w-1 h-full ${req.urgency === 'Critical' && !isAccepted ? 'bg-red-500' : (isAccepted ? 'bg-yellow-400' : 'bg-primary-500')}"></div>
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <h4 class="font-bold text-gray-900">${req.name}</h4>
                        <p class="text-xs ${isMatch || isAccepted ? 'text-red-500 font-bold' : 'text-gray-500'} mt-1">${req.time} ${statusBadge}</p>
                    </div>
                    <span class="px-3 py-1 rounded-full text-sm font-bold ${isMatch || isAccepted ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-800'} border ${isMatch || isAccepted ? 'border-red-200' : 'border-gray-200'}">${req.type}</span>
                </div>
                <div class="text-sm ${isMatch || isAccepted ? 'text-red-800' : 'text-gray-600'} flex items-center gap-2 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ${isMatch || isAccepted ? 'text-red-400' : 'text-gray-400'}" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    ${req.hospital}
                </div>
                <div class="text-sm ${isMatch || isAccepted ? 'text-red-800' : 'text-gray-600'} flex items-center gap-2 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ${isMatch || isAccepted ? 'text-red-400' : 'text-gray-400'}" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                    ${req.units} Units Needed
                </div>
                <div class="flex items-center justify-between mt-4">
                    <span class="text-xs font-semibold px-2 py-1 rounded ${urgencyColor}">${req.urgency}</span>
                    ${buttonHTML}
                </div>
            </div>
        `;
    });
}

// Handle Accepting a Request
const checklistModal = document.getElementById('checklistModal');
const checklistModalContent = document.getElementById('checklistModalContent');
const closeChecklistBtn = document.getElementById('closeChecklistBtn');
const finishDonationBtn = document.getElementById('finishDonationBtn');
let currentChecklistReqId = null;

function acceptRequest(id) {
    const req = activeRequestsFeed.find(r => r.id === id);
    if (req) {
        req.accepted = true;
        req.completedSteps = 0;
    }
    renderActiveRequests();
    openChecklist(id);
}

function openChecklist(id) {
    currentChecklistReqId = id;
    const req = activeRequestsFeed.find(r => r.id === id);
    if (!req || !checklistModal || !checklistModalContent) return;

    // Reset checkboxes
    const steps = req.completedSteps || 0;
    const checkboxes = document.querySelectorAll('.checklist-step');
    checkboxes.forEach((cb, index) => {
        cb.checked = index < steps;
    });
    updateFinishButtonState();

    // Show Checklist Modal
    checklistModal.classList.remove('hidden');
    checklistModal.classList.add('flex');
    setTimeout(() => {
        checklistModalContent.classList.remove('scale-95', 'opacity-0');
        checklistModalContent.classList.add('scale-100', 'opacity-100');
    }, 10);
}

// Add event listeners to checkboxes
const checkboxes = document.querySelectorAll('.checklist-step');
checkboxes.forEach((cb) => {
    cb.addEventListener('change', () => {
        if (currentChecklistReqId) {
            const req = activeRequestsFeed.find(r => r.id === currentChecklistReqId);
            if (req) {
                let count = 0;
                checkboxes.forEach(c => { if(c.checked) count++; });
                req.completedSteps = count;
                updateFinishButtonState();
                renderActiveRequests();
            }
        }
    });
});

function updateFinishButtonState() {
    if (!finishDonationBtn) return;
    let count = 0;
    checkboxes.forEach(c => { if(c.checked) count++; });
    if (count === 3) {
        finishDonationBtn.disabled = false;
        finishDonationBtn.className = "w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-md mt-6 transition-colors shadow-sm flex justify-center items-center gap-2";
        finishDonationBtn.textContent = "Mark as Completed";
    } else {
        finishDonationBtn.disabled = true;
        finishDonationBtn.className = "w-full bg-gray-300 text-gray-500 cursor-not-allowed font-bold py-3 px-4 rounded-md mt-6 transition-colors shadow-sm flex justify-center items-center gap-2";
        finishDonationBtn.textContent = `Complete All Steps First (${3 - count} left)`;
    }
}

function closeChecklist() {
    if (!checklistModalContent || !checklistModal) return;
    checklistModalContent.classList.remove('scale-100', 'opacity-100');
    checklistModalContent.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        checklistModal.classList.add('hidden');
        checklistModal.classList.remove('flex');
    }, 300);
    currentChecklistReqId = null;
}

if (closeChecklistBtn) {
    closeChecklistBtn.addEventListener('click', closeChecklist);
}

if (finishDonationBtn) {
    finishDonationBtn.addEventListener('click', () => {
        if (currentChecklistReqId) {
            // Now we remove it from the list completely
            activeRequestsFeed = activeRequestsFeed.filter(req => req.id !== currentChecklistReqId);
            renderActiveRequests();
            
            // Refresh hospital list if open
            const findHospitalBtn = document.getElementById('findHospitalBtn');
            const hospitalListContainer = document.getElementById('hospitalListContainer');
            if (findHospitalBtn && hospitalListContainer && !hospitalListContainer.classList.contains('hidden')) {
                findHospitalBtn.click();
                setTimeout(() => findHospitalBtn.click(), 50);
            }
        }
        closeChecklist();
        showToast("Awesome! Thank you for your life-saving donation!");
    });
}

if (checklistModal) {
    // Close on outside click
    checklistModal.addEventListener('click', (e) => {
        if (e.target === checklistModal) {
            closeChecklist();
        }
    });
}

// Initial render
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderActiveRequests);
} else {
    renderActiveRequests();
}

if (requestBloodForm) {
    requestBloodForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevents page reload
        
        // Extract values
        const name = document.getElementById('reqPatientName').value;
        const bloodType = document.getElementById('reqBloodType').value;
        const hospital = document.getElementById('reqHospital').value;
        const units = document.getElementById('reqUnits').value;
        
        // Add new request to beginning of array
        activeRequestsFeed.unshift({
            id: Date.now(),
            name: name,
            type: bloodType,
            hospital: hospital,
            units: units,
            urgency: "Critical",
            time: "Just now"
        });
        
        // Re-render feed
        renderActiveRequests();
        
        closeRequestModal();
        showToast("URGENT: Blood request has been broadcasted to local donors!");
        
        // Optionally trigger notification API here if permitted
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification("LifeLink Request Sent", {
                body: "Your request has been successfully broadcasted nearby."
            });
        }
        
        // Scroll to feed so user sees their new request
        const activeReqSection = document.getElementById('active-requests');
        if (activeReqSection) {
            activeReqSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// ==========================================
// ADDED FOR EXERCISE 3: JAVASCRIPT EVENTS
// ==========================================

// 1. Load Event
window.addEventListener('load', () => {
    // Welcome user when page loads after a short delay for better UX
    setTimeout(() => {
        showToast("Welcome to LifeLink! Ready to save lives.");
    }, 1000);
});

// 2. Mouseover & Mouseout Events
const featureCards = document.querySelectorAll('.feature-card');
featureCards.forEach(card => {
    card.addEventListener('mouseover', () => {
        // Highlight feature cards
        card.classList.remove('shadow-sm', 'border-gray-100');
        card.classList.add('shadow-lg', 'border-primary-300', 'scale-105', '-translate-y-1');
    });
    card.addEventListener('mouseout', () => {
        // Restore original card appearance
        card.classList.remove('shadow-lg', 'border-primary-300', 'scale-105', '-translate-y-1');
        card.classList.add('shadow-sm', 'border-gray-100');
    });
});

// 3. Input, Focus, and Blur Events
const fullNameInput = document.getElementById('fullNameInput');
const nameDisplay = document.getElementById('nameDisplay');
const charCount = document.getElementById('charCount');

if (fullNameInput && nameDisplay && charCount) {
    // Input Event - Display typed text dynamically and live character count
    fullNameInput.addEventListener('input', (e) => {
        const text = e.target.value;
        nameDisplay.textContent = text ? `Welcome, ${text}!` : '';
        charCount.textContent = `${text.length}/50 characters`;
        
        if (text.length > 40) {
            charCount.classList.add('text-secondary-500');
        } else {
            charCount.classList.remove('text-secondary-500');
        }
    });

    // Focus Event - Highlight form fields when selected
    fullNameInput.addEventListener('focus', (e) => {
        e.target.classList.add('bg-blue-50', 'ring-2', 'ring-blue-200', 'border-blue-400');
    });

    // Blur Event - Remove highlight when focus is lost
    fullNameInput.addEventListener('blur', (e) => {
        e.target.classList.remove('bg-blue-50', 'ring-2', 'ring-blue-200', 'border-blue-400');
    });
}
