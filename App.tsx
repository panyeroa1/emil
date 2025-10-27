
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Dialer } from './components/Dialer';
import { CallState } from './types';
import { BLAND_AI_TASK_PROMPT } from './constants';

const App: React.FC = () => {
  const [apiKey] = useState<string>('org_4f08019a0df2dd84214b869c95a7db847d78684028210c95f7458a96be0f963937bb39a73fe7aab4799b69');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callState, setCallState] = useState<CallState>(CallState.IDLE);
  const [statusText, setStatusText] = useState('Ready to call');
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const stopRingtone = useCallback(() => {
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().then(() => {
        audioContextRef.current = null;
      });
    }
  }, []);
  
  useEffect(() => {
    return () => {
      stopRingtone();
    };
  }, [stopRingtone]);

  const playRingtone = useCallback((rings: number = 2) => {
    stopRingtone();
    if (typeof window === 'undefined' || (!window.AudioContext && !(window as any).webkitAudioContext)) {
      return;
    }
    
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioContext = audioContextRef.current;
    
    const playSingleRing = (startTime: number) => {
      const ringDuration = 1.5;
      const osc1 = audioContext.createOscillator();
      const osc2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(440, startTime);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(480, startTime);
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioContext.destination);
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + ringDuration);
      osc1.start(startTime);
      osc2.start(startTime);
      osc1.stop(startTime + ringDuration);
      osc2.stop(startTime + ringDuration);
    };

    const now = audioContext.currentTime;
    const ringCycleDuration = 3.5;
    for (let i = 0; i < rings; i++) {
        playSingleRing(now + i * ringCycleDuration);
    }
  }, [stopRingtone]);

  const handleCall = useCallback(async () => {
    if (!phoneNumber || !apiKey) return;

    setCallState(CallState.RINGING);
    setStatusText('Ringing...');
    playRingtone(2);

    const callData = {
      phone_number: phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`,
      voice: "Brh Callcenter",
      wait_for_greeting: true,
      record: true,
      answered_by_enabled: true,
      noise_cancellation: true,
      interruption_threshold: 500,
      block_interruptions: false,
      max_duration: 12,
      model: "base",
      memory_id: "1bae20f6-b7fc-4ddb-8ddb-ef42519bc3f6",
      language: "babel",
      background_track: "office",
      endpoint: "https://api.bland.ai",
      voicemail_action: "hangup",
      task: BLAND_AI_TASK_PROMPT,
      first_sentence: "Thank you for flying with Turkish Airlines. My name is Ayla. How may I assist you today?",
      from: "+15855153327",
      timezone: "Europe/London",
      tools: ["KB-1e0ac3a0-a542-4c6f-b415-c2c5d50ee6da"]
    };

    try {
      const response = await fetch('https://api.bland.ai/v1/calls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiKey,
        },
        body: JSON.stringify(callData),
      });

      stopRingtone();
      
      const result = await response.json();

      if (response.ok && result.success) {
        setCallState(CallState.ACTIVE);
        setStatusText('Connected');
      } else {
        throw new Error(result.message || `API Error: ${response.status}`);
      }
    } catch (error) {
      stopRingtone();
      setCallState(CallState.FAILED);
      
      let errorMessage = 'Call failed';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setStatusText(errorMessage);

      setTimeout(() => {
        setCallState(CallState.IDLE);
        setStatusText('Ready to call');
      }, 3000);
    }
  }, [phoneNumber, apiKey, playRingtone, stopRingtone]);
  
  const handleHangup = useCallback(() => {
    stopRingtone();
    setCallState(CallState.ENDED);
    setStatusText('Call Ended');
    setTimeout(() => {
      setPhoneNumber('');
      setCallState(CallState.IDLE);
      setStatusText('Ready to call');
    }, 2000);
  }, [stopRingtone]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <main className="w-full max-w-sm mx-auto">
        <Dialer
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
          callState={callState}
          statusText={statusText}
          onCall={handleCall}
          onHangup={handleHangup}
        />
      </main>
    </div>
  );
};

export default App;
