export enum CallState {
  IDLE,        // Ready to dial
  RINGING,     // Call initiated, waiting for connection
  ACTIVE,      // Call is connected
  ENDED,       // Call has ended successfully
  FAILED,      // Call failed to connect
}