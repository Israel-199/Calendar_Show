### Developer Challenge: Calendar App with Mock Call Feature

**The deadline for the task is tomorrow (Sunday) at 6 PM.”**

**Objective:**
Build a simple Next.js calendar application that displays appointments from a mock database (using Supabase). The app should allow users to view, confirm, and update appointments. Additionally, implement a mock call feature where clicking the call button will simulate a phone call and use AI to confirm or update the appointment.

**Requirements:**

1. **Frontend**:

   - **Next.js**: Build a single-page application that displays a calendar with appointments.
   - **Calendar Component**: Use a calendar library to show appointments.
   - **Mock Data**: Prepopulate the calendar with sample appointment data (e.g., patient name, phone number, and appointment time).

2. **Backend**:

   - **Supabase**: Use Supabase as the database to store and manage appointments.
   - **Mock Call Logic**: Instead of real calls, simulate the call feature. When the user clicks the call button, display a mock call interface.

3. **Mock Call Interaction**:

   - **AI Integration**: Use an AI service (e.g., ElevenLabs or similar) to simulate conversation. The AI will ask the user to confirm or update the appointment.
   - **Confirmation**: If the user confirms the appointment, update the status in Supabase and reflect the changes on the calendar.

4. **Workflow**:

   - **View Appointments**: The user can see a list of appointments on the calendar.
   - **Mock Call**: On clicking the call button, show a mock call interface with AI interaction.
   - **Update Appointment**: Based on the AI conversation, if the appointment is confirmed or updated, save the changes in Supabase and refresh the calendar view.

**Evaluation Criteria:**

- **Code Quality**: Clean, maintainable, and well-documented code.
- **UI/UX**: Intuitive and user-friendly interface.
- **Functionality**: Proper handling of appointment confirmation and updates.
- **Mock Call Simulation**: Realistic AI interaction and seamless workflow.

**Additional Notes:**

- You can choose any AI service for the mock call interaction.
- The focus is on demonstrating the ability to integrate frontend and backend and handle mock interactions effectively.

- **Evaluation Process**: The assessment will not be based solely on the final implementation. Candidates must also be prepared to explain their approach, the decisions they made, and the steps they took during a live interview. It’s essential that they demonstrate a clear understanding of the entire process and execute each step carefully.
