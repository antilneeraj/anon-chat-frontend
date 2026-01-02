'use client';

import { useState } from 'react';
import { useChat } from '~/hooks/useChat';

export default function Home() {
  const [step, setStep] = useState<'JOIN' | 'CHAT'>('JOIN');
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [input, setInput] = useState('');

  // Only initialize chat hook when we reach the CHAT step
  const { messages, sendMessage, isConnected } = useChat(
    step === 'CHAT' ? roomId : '', 
    step === 'CHAT' ? username : ''
  );

  const handleJoin = () => {
    if (roomId && username) setStep('CHAT');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0f1115] text-white">
      
      {/* STEP 1: LOGIN FORM */}
      {step === 'JOIN' && (
        <div className="p-8 bg-[#181b21] rounded-lg border border-gray-800 shadow-xl w-96">
          <h1 className="text-2xl font-bold mb-6 text-[#f4d738]">ANON Chat_</h1>
          <input
            className="w-full p-3 mb-4 bg-black border border-gray-700 rounded text-white"
            placeholder="Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <input
            className="w-full p-3 mb-6 bg-black border border-gray-700 rounded text-white"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button
            onClick={handleJoin}
            className="w-full bg-[#f4d738] text-black font-bold p-3 rounded hover:opacity-90 transition"
          >
            🚀 Enter Room
          </button>
        </div>
      )}

      {/* STEP 2: CHAT INTERFACE */}
      {step === 'CHAT' && (
        <div className="w-full max-w-4xl h-[90vh] flex flex-col bg-[#181b21] rounded-xl overflow-hidden border border-gray-800">
          
          {/* HEADER */}
          <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-black/40 backdrop-blur">
            <h2 className="font-mono text-[#f4d738]">#{roomId}</h2>
            <div className={`flex items-center gap-2 text-sm ${isConnected ? 'text-green-400' : 'text-red-500'}`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-500'}`}></div>
              {isConnected ? 'Connected' : 'Connecting...'}
            </div>
          </div>

          {/* MESSAGES AREA */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.sender === username ? 'items-end' : 'items-start'}`}
              >
                {/* System Messages */}
                {msg.type === 'JOIN' || msg.type === 'LEAVE' ? (
                   <span className="text-xs text-gray-500 italic py-2 mx-auto">
                     {msg.sender} {msg.content}
                   </span>
                ) : (
                  /* Chat Bubbles */
                  <div className={`max-w-[70%] p-3 rounded-xl ${
                    msg.sender === username 
                      ? 'bg-[#f4d738] text-black rounded-tr-none' 
                      : 'bg-[#2a2e35] text-white rounded-tl-none'
                  }`}>
                    <span className="text-xs opacity-50 block mb-1 font-bold">{msg.sender}</span>
                    {msg.content}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* INPUT AREA */}
          <div className="p-4 bg-black/40 border-t border-gray-700 flex gap-2">
            <input
              className="flex-1 bg-[#0f1115] border border-gray-600 rounded-full px-4 py-2 text-white focus:border-[#f4d738] outline-none"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (sendMessage(input), setInput(''))}
            />
            <button 
              onClick={() => { sendMessage(input); setInput(''); }}
              className="bg-[#f4d738] text-black w-10 h-10 rounded-full font-bold flex items-center justify-center hover:scale-105 transition"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </main>
  );
}