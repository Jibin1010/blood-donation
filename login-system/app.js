/**
 * app.js — Client-Side JavaScript Logic
 * ============================================================
 * CHRIST University — FSD Lab Assignment
 * Login System: Express.js + HTML + JavaScript + Tailwind CSS
 *
 * Full 6-Block Execution Flow (as per lab documentation):
 *
 *  Block 1 – LISTEN   → Wait for the Login button click (submit event)
 *  Block 2 – READ     → Get username & password values from the DOM
 *  Block 3 – SEND     → Send credentials via fetch() POST to /login
 *  Block 4 – WAIT     → await pauses execution until server responds
 *  Block 5 – DISPLAY  → Show green (success) or red (failure) message
 *  Block 6 – UPDATE   → Re-enable button, restore UI state
 * ============================================================
 */

// =============================================================
// BLOCK 1 — LISTEN
// Active listener: waits for the "submit" event on #loginForm
//
// document.getElementById("loginForm").addEventListener("submit", ...)
//   Step 1: User clicks the Login button
//   Step 2: Browser fires the "submit" event on the form
//   Step 3: JavaScript starts running the callback below
// =============================================================
document.getElementById("loginForm").addEventListener("submit", async function (e) {
  // Prevent browser from reloading the page on form submit
  e.preventDefault();

  // =============================================================
  // BLOCK 2 — READ
  // JavaScript reads input element values from the DOM
  //
  //   Student types in Textbox (HTML)
  //   → JavaScript reads input element's .value property
  //   → Stores value in a local variable
  // =============================================================
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  // Basic client-side guard: don't send empty fields
  if (!username || !password) {
    showStatus("⚠️ Please enter both username and password.", "warn");
    return;
  }

  // Update UI: show spinner, disable button while waiting
  setLoading(true);
  clearStatus();

  // =============================================================
  // BLOCK 3 — SEND
  // await fetch("/login") sends the data to Express backend
  //
  //   Browser (Student) → HTTP POST → Server running Express
  //   Data is sent in the request body as JSON
  // =============================================================

  // =============================================================
  // BLOCK 4 — WAIT
  // "await" pauses JavaScript execution at this line.
  // Real-world analogy: order food → wait (chef prepares) → eat
  //   Step 1: Send Request
  //   Step 2: Wait (execution pauses here)
  //   Step 3: Receive Response — then continue
  // =============================================================
  try {
    const response = await fetch("/login", {
      method: "POST",                         // HTTP method
      headers: { "Content-Type": "application/json" }, // tell server it's JSON
      body: JSON.stringify({ username, password }),     // send credentials
    });

    // Parse the JSON response packet from Express server
    const data = await response.json();

    // =============================================================
    // BLOCK 5 — DISPLAY
    // Check response and update the HTML UI accordingly
    //
    //   if (data.success) { showGreenMessage(); }
    //   else              { showRedMessage();   }
    //
    //   Case 1: ✓ Successful Login  → green success banner
    //   Case 2: ✗ Invalid Credentials → red error banner
    // =============================================================
    if (data.success) {
      // ✓ Case 1: Successful Login
      showStatus(`✅ ${data.message}`, "success");

      // Redirect to dashboard after short delay (simulate real-world flow)
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1800);
    } else {
      // ✗ Case 2: Invalid Credentials
      showStatus(`❌ ${data.message}`, "error");
    }
  } catch (err) {
    // Network error or server unreachable
    showStatus("⚠️ Could not connect to server. Is Express running?", "warn");
    console.error("[app.js] Fetch error:", err);
  }

  // =============================================================
  // BLOCK 6 — UPDATE
  // Re-enable button and restore UI to original state
  // =============================================================
  setLoading(false);
});

// =============================================================
// HELPER FUNCTIONS
// These update the webpage (HTML) after receiving the response.
// =============================================================

/**
 * showStatus — Renders the status message box with the correct style
 * @param {string} message   - Text to display
 * @param {"success"|"error"|"warn"} type - Visual style variant
 */
function showStatus(message, type) {
  const box = document.getElementById("statusMsg");
  box.textContent = message;
  box.classList.remove(
    "hidden",
    "bg-green-500/20", "border-green-500/40", "text-green-300",
    "bg-red-500/20",   "border-red-500/40",   "text-red-300",
    "bg-yellow-500/20","border-yellow-500/40","text-yellow-300"
  );

  if (type === "success") {
    box.classList.add("bg-green-500/20", "border", "border-green-500/40", "text-green-300");
  } else if (type === "error") {
    box.classList.add("bg-red-500/20", "border", "border-red-500/40", "text-red-300");
  } else {
    box.classList.add("bg-yellow-500/20", "border", "border-yellow-500/40", "text-yellow-300");
  }
}

/** clearStatus — Hides and resets the status message box */
function clearStatus() {
  const box = document.getElementById("statusMsg");
  box.className = "hidden mb-5 px-4 py-3 rounded-xl text-sm font-semibold text-center transition-all duration-300";
  box.textContent = "";
}

/**
 * setLoading — Toggles the loading state of the submit button
 * @param {boolean} loading - true = disable & show spinner
 */
function setLoading(loading) {
  const btn     = document.getElementById("loginBtn");
  const text    = document.getElementById("btnText");
  const spinner = document.getElementById("btnSpinner");

  btn.disabled = loading;
  if (loading) {
    text.textContent = "Authenticating...";
    spinner.classList.remove("hidden");
    btn.classList.add("opacity-70", "cursor-not-allowed");
  } else {
    text.textContent = "Login to Dashboard";
    spinner.classList.add("hidden");
    btn.classList.remove("opacity-70", "cursor-not-allowed");
  }
}
