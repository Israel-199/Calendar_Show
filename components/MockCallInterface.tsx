"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Appointment, AppointmentStatus, CallMessage } from '@/types/appointment';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Hook to handle ElevenLabs TTS with graceful fallback
function useTextToSpeech() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const { toast } = useToast();

  const speak = useCallback(async (text: string): Promise<boolean> => {
    try {
      setIsSpeaking(true);
      setTtsError(null);
      
      const response = await supabase.functions.invoke('elevenlabs-tts', {
        body: { text, voiceId: 'EXAVITQu4vr4xnSDxMaL' }, // Sarah voice
      });

      if (response.error) {
        console.error('TTS error:', response.error);
        const errorMessage = response.error.message || 'Voice synthesis unavailable';
        
        // Check for specific ElevenLabs errors
        if (errorMessage.includes('401') || errorMessage.includes('unusual_activity') || errorMessage.includes('Free Tier')) {
          setTtsError('Voice synthesis is unavailable - ElevenLabs API limit reached');
          toast({
            title: 'Voice Unavailable',
            description: 'Text-to-speech is disabled. The conversation will continue in text mode.',
            variant: 'destructive',
          });
        }
        
        setIsSpeaking(false);
        return false;
      }

      // Check if response data has error
      if (response.data?.error) {
        console.error('TTS API error:', response.data.error);
        setTtsError('Voice synthesis unavailable');
        toast({
          title: 'Voice Unavailable',
          description: 'Text-to-speech is disabled. The conversation will continue in text mode.',
          variant: 'destructive',
        });
        setIsSpeaking(false);
        return false;
      }

      const audioContent = response.data?.audioContent;
      if (!audioContent) {
        setIsSpeaking(false);
        return false;
      }

      const audioBlob = new Blob(
        [Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))],
        { type: 'audio/mpeg' }
      );
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
      return true;
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
      return false;
    }
  }, [toast]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
    }
  }, []);

  return { speak, stop, isSpeaking, ttsError };
}

interface MockCallInterfaceProps {
  appointment: Appointment;
  onClose: () => void;
  onStatusUpdate: (status: AppointmentStatus) => void;
  onRescheduleRequest?: (appointment: Appointment) => void;
}

export function MockCallInterface({ appointment, onClose, onStatusUpdate, onRescheduleRequest }: MockCallInterfaceProps) {
  const [callState, setCallState] = useState<'connecting' | 'active' | 'ended'>('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<CallMessage[]>([]);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [userResponse, setUserResponse] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { speak, stop: stopSpeaking, isSpeaking } = useTextToSpeech();

  // Sync speaking state
  useEffect(() => {
    setIsAISpeaking(isSpeaking);
  }, [isSpeaking]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Start call simulation
  useEffect(() => {
    const connectTimeout = setTimeout(() => {
      setCallState('active');
      initiateAIConversation();
    }, 2000);

    return () => clearTimeout(connectTimeout);
  }, []);

  // Call duration timer
  useEffect(() => {
    if (callState !== 'active') return;
    
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [callState]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const initiateAIConversation = async () => {
    const appointmentDate = new Date(appointment.appointment_time);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    let aiMessage = '';

    try {
      const response = await supabase.functions.invoke('ai-call-assistant', {
        body: {
          patientName: appointment.patient_name,
          appointmentDate: formattedDate,
          appointmentTime: formattedTime,
          notes: appointment.notes,
          action: 'greet',
        },
      });

      if (response.error) throw response.error;
      aiMessage = response.data.message;
    } catch (error) {
      console.error('AI call error:', error);
      aiMessage = `Hello! This is a confirmation call for ${appointment.patient_name}. You have an appointment scheduled for ${formattedDate} at ${formattedTime}. Would you like to confirm this appointment, reschedule it, or cancel it?`;
    }

    setMessages(prev => [...prev, { role: 'assistant', content: aiMessage }]);

    // Speak the message using ElevenLabs
    if (voiceEnabled) {
      await speak(aiMessage);
    }
  };

  const handleUserResponse = async (response: 'confirm' | 'reschedule' | 'cancel') => {
    setUserResponse(response);
    
    const userMessages: Record<string, string> = {
      confirm: "Yes, I'd like to confirm the appointment.",
      reschedule: "I need to reschedule this appointment.",
      cancel: "Please cancel this appointment.",
    };

    setMessages(prev => [...prev, { role: 'user', content: userMessages[response] }]);

    // If reschedule, open the reschedule dialog
    if (response === 'reschedule' && onRescheduleRequest) {
      const aiMessage = `I understand you'd like to reschedule. Let me open the calendar for you to select a new date and time.`;
      setMessages(prev => [...prev, { role: 'assistant', content: aiMessage }]);
      
      if (voiceEnabled) {
        await speak(aiMessage);
      }

      setTimeout(() => {
        onRescheduleRequest(appointment);
      }, 2000);
      return;
    }

    let aiMessage = '';
    try {
      const aiResponse = await supabase.functions.invoke('ai-call-assistant', {
        body: {
          patientName: appointment.patient_name,
          action: response,
        },
      });

      if (aiResponse.error) throw aiResponse.error;
      aiMessage = aiResponse.data.message;
    } catch (error) {
      console.error('AI response error:', error);
      const fallbackResponses: Record<string, string> = {
        confirm: `Perfect! Your appointment has been confirmed. We'll see you then, ${appointment.patient_name}. Thank you and have a great day!`,
        reschedule: `I understand. Your appointment has been marked for rescheduling. Our team will contact you shortly to arrange a new time. Thank you, ${appointment.patient_name}!`,
        cancel: `I've cancelled your appointment as requested. If you need to schedule a new appointment in the future, please don't hesitate to call us. Take care, ${appointment.patient_name}!`,
      };
      aiMessage = fallbackResponses[response];
    }

    setMessages(prev => [...prev, { role: 'assistant', content: aiMessage }]);

    // Speak the response using ElevenLabs
    if (voiceEnabled) {
      await speak(aiMessage);
    }

    // Update appointment status
    const statusMap: Record<string, AppointmentStatus> = {
      confirm: 'confirmed',
      reschedule: 'rescheduled',
      cancel: 'cancelled',
    };

    setTimeout(() => {
      onStatusUpdate(statusMap[response]);
      toast({
        title: 'Appointment Updated',
        description: `Appointment has been ${response}ed successfully.`,
      });
      endCall();
    }, 2000);
  };

  const endCall = () => {
    stopSpeaking();
    setCallState('ended');
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const toggleVoice = () => {
    if (voiceEnabled) {
      stopSpeaking();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-md shadow-xl border-border/50 animate-scale-in">
        <CardContent className="p-6">
          {/* Call Header */}
          <div className="text-center mb-6">
            <div className="relative inline-flex items-center justify-center mb-4">
              <div
                className={cn(
                  'w-20 h-20 rounded-full flex items-center justify-center',
                  callState === 'connecting' && 'bg-muted',
                  callState === 'active' && 'gradient-primary',
                  callState === 'ended' && 'bg-destructive/20'
                )}
              >
                {callState === 'connecting' && (
                  <>
                    <div className="absolute inset-0 rounded-full border-2 border-primary animate-pulse-ring" />
                    <div className="absolute inset-0 rounded-full border-2 border-primary animate-pulse-ring" style={{ animationDelay: '0.5s' }} />
                    <Phone className="w-8 h-8 text-primary" />
                  </>
                )}
                {callState === 'active' && (
                  <>
                    {isAISpeaking && (
                      <div className="absolute inset-0 rounded-full border-2 border-primary-foreground/50 animate-pulse-ring" />
                    )}
                    <Phone className="w-8 h-8 text-primary-foreground" />
                  </>
                )}
                {callState === 'ended' && (
                  <PhoneOff className="w-8 h-8 text-destructive" />
                )}
              </div>
            </div>

            <h3 className="font-semibold text-lg text-foreground">
              {appointment.patient_name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {appointment.phone_number}
            </p>

            {callState === 'connecting' && (
              <p className="text-sm text-primary mt-2 animate-pulse">Connecting...</p>
            )}
            {callState === 'active' && (
              <p className="text-sm text-status-confirmed mt-2">{formatDuration(callDuration)}</p>
            )}
            {callState === 'ended' && (
              <p className="text-sm text-muted-foreground mt-2">Call Ended</p>
            )}
          </div>

          {/* Audio Wave Indicator */}
          {callState === 'active' && isAISpeaking && (
            <div className="flex items-center justify-center gap-1 mb-4 h-8">
              <div className="w-1 h-4 bg-primary rounded-full animate-wave" />
              <div className="w-1 h-6 bg-primary rounded-full animate-wave-delay-1" />
              <div className="w-1 h-8 bg-primary rounded-full animate-wave-delay-2" />
              <div className="w-1 h-6 bg-primary rounded-full animate-wave-delay-3" />
              <div className="w-1 h-4 bg-primary rounded-full animate-wave-delay-4" />
            </div>
          )}

          {/* Conversation Messages */}
          {messages.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-4 mb-4 max-h-48 overflow-y-auto">
              <div className="space-y-3">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={cn(
                      'text-sm p-2 rounded-lg',
                      msg.role === 'assistant' 
                        ? 'bg-primary/10 text-foreground' 
                        : 'bg-accent/20 text-foreground ml-4'
                    )}
                  >
                    <span className="text-xs font-medium text-muted-foreground block mb-1">
                      {msg.role === 'assistant' ? 'AI Assistant' : 'Patient'}
                    </span>
                    {msg.content}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          {/* Response Buttons */}
          {callState === 'active' && !userResponse && messages.length > 0 && !isAISpeaking && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUserResponse('confirm')}
                className="border-status-confirmed text-status-confirmed hover:bg-status-confirmed-bg"
              >
                Confirm
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUserResponse('reschedule')}
                className="border-status-rescheduled text-status-rescheduled hover:bg-status-rescheduled-bg"
              >
                Reschedule
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUserResponse('cancel')}
                className="border-status-cancelled text-status-cancelled hover:bg-status-cancelled-bg"
              >
                Cancel
              </Button>
            </div>
          )}

          {/* Call Controls */}
          <div className="flex items-center justify-center gap-4">
            {callState === 'active' && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
                className={cn(
                  'rounded-full w-12 h-12',
                  isMuted && 'bg-destructive/10 border-destructive text-destructive'
                )}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
            )}

            <Button
              variant={callState === 'ended' ? 'outline' : 'destructive'}
              size="icon"
              onClick={callState === 'ended' ? onClose : endCall}
              className="rounded-full w-14 h-14"
            >
              <PhoneOff className="w-6 h-6" />
            </Button>

            {callState === 'active' && (
              <Button
                variant="outline"
                size="icon"
                onClick={toggleVoice}
                className={cn(
                  'rounded-full w-12 h-12',
                  !voiceEnabled && 'bg-muted text-muted-foreground'
                )}
              >
                {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
