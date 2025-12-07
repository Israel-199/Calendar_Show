# Calendar App with Mock Call Feature

**Developer Challenge** – Completed with Next.js, Supabase, Gemini-2.5-flash, and ElevenLabs integration.

## Overview

This is a **Next.js calendar application** that allows users to view, confirm, and update appointments. The app includes a **mock call feature** where clicking a call button simulates a phone call and leverages AI (ElevenLabs + Gemini-2.5-flash) to confirm or update the appointment.


## Features

### Frontend

* **Next.js** SPA (Single Page Application)
* **Calendar Component**: Displays appointments using a customizable calendar UI
* **Appointment View**: Users can see patient name, phone number, and appointment time
* **Mock Call Button**: Simulates a call interaction with AI

### Backend

* **Supabase**: Stores and manages appointment data
* **Appointment Status Management**: Confirm, cancel, or reschedule appointments
* **Real-time Updates**: Changes in appointments reflect immediately in the UI

### Mock Call Interaction

* **AI Integration**:

  * **Gemini-2.5-flash**: Natural language understanding for conversation
  * **ElevenLabs**: Simulated voice interaction for a realistic call experience
* **Workflow**:

  1. User clicks the call button
  2. AI asks for appointment confirmation or update
  3. Supabase database is updated based on AI response
  4. Calendar view refreshes automatically

---

## Tech Stack

| Layer          |                 Technology / Library                             |
| -------------- | ---------------------------------------------------------------- |
| Frontend       | Next.js,Typescript, Tailwind CSS,Tanstack Query(state management)|
| Backend        | Supabase (Database & API)                                        |
| AI Integration | Gemini-2.5-flash, ElevenLabs (Voice)                             |
| Utilities      | date-fns, lucide-react                                           |

---

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Israel-199/Calendar_Show.git
   cd calendar_show
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env.local` file in the root:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=<YOUR_SUPABASE_URL>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_KEY>
   ELEVENLABS_API_KEY=<YOUR_ELEVENLABS_API_KEY>
   GEMINI_API_KEY=<YOUR_GEMINI_API_KEY>
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## Usage

1. **View Appointments**

   * Calendar displays all scheduled appointments.
   * Each day shows color-coded dots for pending and confirmed appointments.

2. **Simulate Call**

   * Click the **Call** button next to an appointment.
   * Interact with the AI to confirm, cancel, or reschedule.
   * AI updates the appointment status in Supabase automatically.

3. **Update Calendar**

   * Changes are reflected in real-time without page refresh.


## License

This project is open-source and available under the [MIT License](LICENSE).

---

**Author:** Israel Assefa
**GitHub:** [https://github.com/Israel-199](https://github.com/Israel-199)
