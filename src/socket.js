import { io } from 'socket.io-client';
const socket = io('http://localhost:5050'); // Update if backend is on a different host/port
export default socket; 