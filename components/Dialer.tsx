
import React, { useRef } from 'react';
import { CallState } from '../types';

interface DialerProps {
  phoneNumber: string;
  setPhoneNumber: (number: string) => void;
  callState: CallState;
  statusText: string;
  onCall: () => void;
  onHangup: () => void;
}

const DialpadButton: React.FC<{ digit: string; letters?: string; onClick: (digit: string) => void; onLongPress?: (digit: string) => void }> = ({ digit, letters, onClick, onLongPress }) => {
  const timerRef = useRef<number | null>(null);
  const isLongPress = useRef(false);
  const LONG_PRESS_DURATION = 500; // ms

  const handlePressStart = () => {
    isLongPress.current = false;
    timerRef.current = window.setTimeout(() => {
      if (onLongPress) {
        isLongPress.current = true;
        onLongPress(digit);
      }
    }, LONG_PRESS_DURATION);
  };

  const handlePressEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!isLongPress.current) {
      onClick(digit);
    }
  };
  
  const handleCancel = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <button
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handleCancel}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onTouchCancel={handleCancel}
      onContextMenu={(e) => onLongPress && e.preventDefault()}
      className="relative flex flex-col items-center justify-center w-20 h-20 rounded-full bg-gray-700/60 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors duration-150 ease-in-out"
    >
      <span className="text-3xl font-light text-white">{digit}</span>
      {letters && <span className="absolute bottom-3 text-xs font-medium tracking-widest text-gray-400 uppercase">{letters}</span>}
    </button>
  );
};

const BackspaceIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 002.828 0L21 12M3 12l6.414-6.414a2 2 0 012.828 0L21 12" />
    </svg>
);


export const Dialer: React.FC<DialerProps> = ({ phoneNumber, setPhoneNumber, callState, statusText, onCall, onHangup }) => {
  const dialpadKeys = [
    { digit: '1', letters: '' }, { digit: '2', letters: 'ABC' }, { digit: '3', letters: 'DEF' },
    { digit: '4', letters: 'GHI' }, { digit: '5', letters: 'JKL' }, { digit: '6', letters: 'MNO' },
    { digit: '7', letters: 'PQRS' }, { digit: '8', letters: 'TUV' }, { digit: '9', letters: 'WXYZ' },
    { digit: '*', letters: '' }, { digit: '0', letters: '+' }, { digit: '#', letters: '' },
  ];

  const handleDigitClick = (digit: string) => {
    if (callState === CallState.IDLE || callState === CallState.FAILED || callState === CallState.ENDED) {
      setPhoneNumber(phoneNumber + digit);
    }
  };

  const handleLongPressZero = () => {
    if (callState === CallState.IDLE || callState === CallState.FAILED || callState === CallState.ENDED) {
      setPhoneNumber(phoneNumber + '+');
    }
  };

  const handleBackspace = () => {
    setPhoneNumber(phoneNumber.slice(0, -1));
  };
  
  const getStatusColor = () => {
    switch (callState) {
      case CallState.RINGING:
        return 'text-yellow-400';
      case CallState.ACTIVE:
        return 'text-green-400 animate-pulse';
      case CallState.FAILED:
        return 'text-red-400';
      case CallState.ENDED:
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="flex flex-col items-center justify-between w-full h-[85vh] max-h-[700px] max-w-sm p-6 bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-3xl shadow-2xl">
      <div className="w-full text-center mt-8">
        <div className="relative h-16 flex items-center justify-center">
            <p className={`font-mono text-4xl tracking-wider text-white break-all`}>{phoneNumber || ' '}</p>
        </div>
        <p className={`mt-2 text-sm transition-colors ${getStatusColor()}`}>{statusText}</p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {dialpadKeys.map(key => (
          <DialpadButton 
            key={key.digit} 
            digit={key.digit} 
            letters={key.letters} 
            onClick={handleDigitClick}
            onLongPress={key.digit === '0' ? handleLongPressZero : undefined}
          />
        ))}
      </div>

      <div className="flex items-center justify-between w-full px-4">
        <div className="w-20 h-20"></div>
        {callState === CallState.IDLE || callState === CallState.FAILED || callState === CallState.ENDED ? (
          <button
            onClick={onCall}
            disabled={!phoneNumber}
            className="flex items-center justify-center w-20 h-20 text-white bg-green-500 rounded-full shadow-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500 transition disabled:bg-gray-600 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
        ) : (
           <button
            onClick={onHangup}
            className="flex items-center justify-center w-20 h-20 text-white bg-red-500 rounded-full shadow-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.59 1.322l2.404 2.404c.328.328.328.86 0 1.188l-1.018 1.018c.989 1.953 2.53 3.493 4.483 4.483l1.018-1.018c.328-.328.86-.328 1.188 0l2.404 2.404c.328.328.328.86 0 1.188l-1.579 1.579c-.732.732-1.768 1.04-2.793.844-3.15-.591-5.943-3.383-6.534-6.534-.196-1.025.112-2.06.844-2.793L2.404 1.322c.328-.328.86-.328 1.188 0z" transform="rotate(-135 12 12)" />
                <path d="M3.59 1.322l2.404 2.404c.328.328.328.86 0 1.188l-1.018 1.018c.989 1.953 2.53 3.493 4.483 4.483l1.018-1.018c.328-.328.86-.328 1.188 0l2.404 2.404c.328.328.328.86 0 1.188l-1.579 1.579c-.732.732-1.768 1.04-2.793.844-3.15-.591-5.943-3.383-6.534-6.534-.196-1.025.112-2.06.844-2.793L2.404 1.322c.328-.328.86-.328 1.188 0z" transform="rotate(-135 12 12)"/>
            </svg>
          </button>
        )}
         <div className="w-20 h-20 flex items-center justify-center">
            {phoneNumber && (callState === CallState.IDLE || callState === CallState.FAILED || callState === CallState.ENDED) && (
                <button onClick={handleBackspace} className="p-4 rounded-full text-gray-400 hover:bg-gray-700 transition">
                    <BackspaceIcon className="w-7 h-7" />
                </button>
            )}
        </div>
      </div>
    </div>
  );
};
