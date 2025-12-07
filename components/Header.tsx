import { Calendar, Phone } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg gradient-primary shadow-glow">
            <Calendar className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">AppointmentCall</h1>
            <p className="text-xs text-muted-foreground">AI-Powered Appointment Management</p>
          </div>
        </div>
      </div>
    </header>
  );
}
