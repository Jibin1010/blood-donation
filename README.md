# LifeLink - Hyper-local Emergency Donor Network 🩸

LifeLink is a modern, responsive web application and emergency network designed to replace scattered social media blood requests with real-time, proximity-based donor matching.

## 🚀 Features
- **Hyper-Local Donor Matching**: Instantly locate nearby donors based on blood compatibility and distance.
- **Zero-Data Eligibility Screener**: A client-side privacy-first evaluation tool that checks donor eligibility without sending data to servers.
- **Emergency Broadcast Feed**: Real-time urgent blood requests sorted dynamically by user blood group compatibility.
- **Donation Checklist & Interactive UX**: Guided step-by-step checklist for accepted donation requests.

## 📂 Project Structure
```text
├── index.html                  # Landing & Authentication Page
├── blood_donor_prototype_v2.html # Main Interactive Dashboard
├── css/
│   └── styles.css              # Custom styling, animations, and responsive layouts
├── js/
│   ├── tailwind-config.js      # Shared theme configuration and blood palette tokens
│   ├── supabase-config.js      # Supabase client initialization & API credentials
│   ├── auth.js                 # Authentication logic and session management
│   └── app.js                  # Geolocation, screener, drag-and-drop, and feed logic
└── supabase/
    └── schema.sql              # Supabase PostgreSQL database schema & RLS policies
```

## 🛠️ Supabase Authentication & Database Setup
To set up backend registration and login using Supabase:
1. Create a new project on [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Copy and run the entire SQL script from [`supabase/schema.sql`](./supabase/schema.sql).
4. This will automatically create:
   - Custom `blood_group_enum` and `user_role_enum` types.
   - The `public.profiles` table linked to `auth.users`.
   - An automatic trigger (`handle_new_user`) that creates a user profile on registration.
   - Row Level Security (RLS) policies for secure profile reading and updating.

## 💻 Running Locally
You can run this application using any standard web server or live server extension:
```bash
# Using Python built-in HTTP server
python3 -m http.server 8000
```
Then open `http://localhost:8000/index.html` in your web browser.
