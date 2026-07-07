/**
 * server.js — Express.js Backend
 * ============================================================
 * CHRIST University — FSD Lab Assignment
 * Login System: Express.js + HTML + JavaScript + Tailwind CSS
 *
 * Responsibilities (as per lab documentation):
 *   1. Receive the authentication request from the browser
 *   2. Validate credentials securely
 *   3. Send JSON response packet back to the client (app.js)
 *
 * Full-Stack Workflow position:
 *   USER → HTML → JS (app.js) → EXPRESS (server.js) → JSON → JS → HTML
 * ============================================================
 */

// -------------------------------------------------------------
// Load required Node.js modules
// -------------------------------------------------------------
const express = require("express"); // Web framework for Node.js
const path    = require("path");    // Built-in Node module for file paths

// -------------------------------------------------------------
// Initialize the Express application
// -------------------------------------------------------------
const app  = express();
const PORT = 3000; // Server will listen on http://localhost:3000

// -------------------------------------------------------------
// Middleware — Parse incoming JSON bodies
// This allows Express to read req.body from the fetch() POST
// -------------------------------------------------------------
app.use(express.json());

// -------------------------------------------------------------
// Middleware — Serve static files (index.html, app.js, styles)
// When browser requests "/" it automatically serves index.html
// -------------------------------------------------------------
app.use(express.static(path.join(__dirname)));

// =============================================================
// HARDCODED CREDENTIAL STORE
//
// In a production system, these would come from a database
// (e.g., PostgreSQL, MongoDB) with hashed passwords (bcrypt).
// For this lab assignment, we use an in-memory object.
//
// Valid demo credentials:
//   Username: admin      Password: password123
//   Username: student    Password: christ123
//   Username: vijay      Password: fsdlab2025
// =============================================================
const VALID_USERS = {
  admin:   "password123",
  student: "christ123",
  vijay:   "fsdlab2025",
};

// =============================================================
// ROUTE — POST /login
//
// Step 1: Receives authentication request from browser (app.js)
// Step 2: Validates credentials securely
// Step 3: Sends JSON response packet back
//
// Response packet structure:
//   { success: true,  message: "Login successful! ..." }  → Case 1: ✓
//   { success: false, message: "Invalid credentials ..." } → Case 2: ✗
// =============================================================
app.post("/login", (req, res) => {
  // --- Step 1: Receive the credentials from the request body ---
  const { username, password } = req.body;

  // Guard: reject if fields are missing or empty
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required.",
    });
  }

  // --- Step 2: Validate credentials securely ---
  const storedPassword = VALID_USERS[username.toLowerCase()];

  const isValid = storedPassword !== undefined && storedPassword === password;

  // Log authentication attempt to server console (for debugging)
  const timestamp = new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" });
  console.log(`[${timestamp}] Login attempt — Username: "${username}" → ${isValid ? "✓ SUCCESS" : "✗ FAILED"}`);

  // --- Step 3: Send JSON response packet ---
  if (isValid) {
    // ✓ Case 1: Successful Login
    return res.status(200).json({
      success: true,
      message: `Login successful! Welcome, ${username}. Redirecting to dashboard...`,
    });
  } else {
    // ✗ Case 2: Invalid Credentials
    return res.status(401).json({
      success: false,
      message: "Invalid username or password. Please try again.",
    });
  }
});

// =============================================================
// ROUTE — GET /dashboard
// Simple success page shown after a successful login
// =============================================================
app.get("/dashboard", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Dashboard | CHRIST University FSD Lab</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900
                 flex items-center justify-center text-white font-sans">
      <div class="text-center space-y-6 p-10">
        <div class="w-20 h-20 mx-auto flex items-center justify-center rounded-full
                    bg-gradient-to-br from-green-500 to-emerald-600 shadow-xl">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-white"
               fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 class="text-4xl font-extrabold">Welcome to the Dashboard!</h1>
        <p class="text-indigo-300 text-lg">Login authentication was successful. ✓</p>
        <p class="text-sm text-white/40">
          CHRIST (Deemed to be University) · Dept. of Computer Science · FSD Lab
        </p>
        <a href="/"
           class="inline-block mt-4 px-8 py-3 bg-indigo-600 hover:bg-indigo-700
                  rounded-xl text-white font-bold transition-all shadow-md">
          ← Back to Login
        </a>
      </div>
    </body>
    </html>
  `);
});

// =============================================================
// START THE SERVER
// Express listens for incoming HTTP requests on PORT 3000
// =============================================================
app.listen(PORT, () => {
  console.log("=".repeat(55));
  console.log("  CHRIST University — FSD Lab: Login System");
  console.log("=".repeat(55));
  console.log(`  ✅ Server started at:  http://localhost:${PORT}`);
  console.log(`  📄 Open in browser:    http://localhost:${PORT}/`);
  console.log("=".repeat(55));
  console.log("  Demo credentials:");
  console.log("    Username: admin      Password: password123");
  console.log("    Username: student    Password: christ123");
  console.log("    Username: vijay      Password: fsdlab2025");
  console.log("=".repeat(55));
});
