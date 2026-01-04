'use client';

import { useState, useEffect } from 'react';
import { useChat } from '~/hooks/useChat';

export default function Home() {
  const [step, setStep] = useState<'JOIN' | 'CHAT'>('JOIN');
  const [mode, setMode] = useState<'CREATE' | 'JOIN'>('CREATE');
  
  const [roomName, setRoomName] = useState(''); // Human readable name ("Friday Party")
  const [roomId, setRoomId] = useState('');     // Unique ID ("Xy79aZ")
  const [username, setUsername] = useState('');
  const [input, setInput] = useState('');

  // On Load: Check URL for invite codes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    
    if (roomParam) {
      setMode('JOIN');
      setRoomId(roomParam);
      
      // Optional: Fetch room info to show the name
      fetch(`http://localhost:8080/api/room/${roomParam}/info`)
        .then(res => res.json())
        .then(data => {
            if(data.roomName) setRoomName(data.roomName);
        })
        .catch(err => console.log("Could not fetch room details", err));
    }
  }, []);

  // Chat Hook (Active only when step === 'CHAT')
  const { messages, sendMessage, isConnected } = useChat(
    step === 'CHAT' ? roomId : '', 
    step === 'CHAT' ? username : ''
  );

  // Handle Creating a Room
  const handleCreate = async () => {
    if (!roomName || !username) return alert("Please enter a Room Name and Username");

    try {
      const res = await fetch('http://localhost:8080/api/room/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName, username })
      });
      
      const data = await res.json();
      setRoomId(data.roomId); // The backend generated ID
      setStep('CHAT');
    } catch (error) {
      alert("Failed to create room. Is the backend running?");
      console.error("Error creating room:", error);
    }
  };

  // Handle Joining a Room
  const handleJoin = () => {
    if (roomId && username) {
        setStep('CHAT');
    } else {
        alert("Please enter Room ID and Username");
    }
  };

  // Share Link Logic
  const copyInviteLink = () => {
    const link = `${window.location.origin}/?room=${roomId}`;
    navigator.clipboard.writeText(link);
    alert("📋 Link copied to clipboard!\n" + link);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0f1115] text-white font-sans">
      
      {/* === JOIN / CREATE CARD === */}
      {step === 'JOIN' && (
        <div className="p-8 bg-[#181b21] rounded-xl border border-gray-800 shadow-2xl w-full max-w-md relative overflow-hidden">
            {/* Background Glow Effect */}
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[#f4d738] to-[#9d46ff]"></div>

            <h1 className="text-3xl font-bold mb-6 text-center tracking-tight">
                <span className="text-[#f4d738]">ANON</span> Chat_
            </h1>

            {/* Toggle Tabs */}
            <div className="flex p-1 bg-black/40 rounded-lg mb-6">
                <button 
                    onClick={() => setMode('CREATE')}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${mode === 'CREATE' ? 'bg-[#2a2e35] text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Create New
                </button>
                <button 
                    onClick={() => setMode('JOIN')}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${mode === 'JOIN' ? 'bg-[#2a2e35] text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Join via ID
                </button>
            </div>

            {/* CREATE FORM */}
            {mode === 'CREATE' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div>
                        <label className="text-xs uppercase text-gray-500 font-bold tracking-wider ml-1">Room Name</label>
                        <input
                            className="w-full p-3 mt-1 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-[#f4d738] focus:outline-none transition"
                            placeholder="e.g. Friday Night Hangout"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-xs uppercase text-gray-500 font-bold tracking-wider ml-1">Your Alias</label>
                        <input
                            className="w-full p-3 mt-1 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-[#f4d738] focus:outline-none transition"
                            placeholder="e.g. Ghost_01"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleCreate}
                        className="w-full bg-[#f4d738] text-black font-bold p-3 rounded-lg hover:bg-[#ffe04f] transform hover:scale-[1.02] transition-all shadow-[0_0_15px_rgba(244,215,56,0.2)]"
                    >
                        ✨ Create & Join
                    </button>
                </div>
            )}

            {/* JOIN FORM */}
            {mode === 'JOIN' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {roomName && (
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                            <p className="text-green-400 text-sm">Target: <strong>{roomName}</strong></p>
                        </div>
                    )}
                    <div>
                        <label className="text-xs uppercase text-gray-500 font-bold tracking-wider ml-1">Room ID</label>
                        <input
                            className="w-full p-3 mt-1 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-[#f4d738] focus:outline-none transition"
                            placeholder="e.g. Xy79aZ"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-xs uppercase text-gray-500 font-bold tracking-wider ml-1">Your Alias</label>
                        <input
                            className="w-full p-3 mt-1 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-[#f4d738] focus:outline-none transition"
                            placeholder="e.g. Guest"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleJoin}
                        className="w-full bg-[#2a2e35] border border-gray-600 text-white font-bold p-3 rounded-lg hover:bg-[#32363e] hover:border-gray-500 transform hover:scale-[1.02] transition-all"
                    >
                        🚀 Enter Room
                    </button>
                </div>
            )}
        </div>
      )}

      {/* === CHAT INTERFACE === */}
      {step === 'CHAT' && (
        <div className="w-full max-w-5xl h-[90vh] flex flex-col bg-[#181b21] rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
          
          {/* HEADER */}
          <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-black/40 backdrop-blur-md">
            <div>
                <h2 className="font-bold text-lg text-white">
                    {roomName || 'Anonymous Room'} 
                    <span className="ml-2 text-sm font-mono text-gray-500 bg-gray-900 px-2 py-1 rounded">#{roomId}</span>
                </h2>
                <div className={`flex items-center gap-2 text-xs mt-1 ${isConnected ? 'text-green-400' : 'text-red-500'}`}>
                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`}></span>
                    {isConnected ? 'Encrypted connection established' : 'Connecting to socket...'}
                </div>
            </div>
            
            <button 
                onClick={copyInviteLink}
                className="flex items-center gap-2 px-4 py-2 bg-[#2a2e35] hover:bg-[#32363e] rounded-lg text-xs font-bold transition border border-gray-700"
            >
                <span>🔗</span> Invite Friends
            </button>
          </div>

          {/* MESSAGES AREA */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {messages.length === 0 && (
                <div className="text-center text-gray-600 mt-10">
                    <p className="text-4xl mb-2">👻</p>
                    <p>No messages yet. Say hello!</p>
                </div>
            )}
            
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.sender === username ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                {/* System Messages */}
                {msg.type === 'JOIN' || msg.type === 'LEAVE' ? (
                   <span className="text-[10px] uppercase tracking-widest text-gray-600 py-2 mx-auto border-b border-gray-800/50">
                     {msg.sender} {msg.content}
                   </span>
                ) : (
                  /* Chat Bubbles */
                  <div className={`max-w-[75%] p-3 shadow-md ${
                    msg.sender === username 
                      ? 'bg-linear-to-br from-[#f4d738] to-[#eeb902] text-black rounded-2xl rounded-tr-sm' 
                      : 'bg-[#2a2e35] border border-gray-700 text-gray-100 rounded-2xl rounded-tl-sm'
                  }`}>
                    <span className={`text-[10px] block mb-1 font-bold tracking-wide ${msg.sender === username ? 'text-black/60' : 'text-[#f4d738]'}`}>
                        {msg.sender}
                    </span>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* INPUT AREA */}
          <div className="p-5 bg-[#0f1115] border-t border-gray-800 flex gap-3 items-center">
            <input
              className="flex-1 bg-[#181b21] border border-gray-700 rounded-xl px-5 py-3 text-white placeholder-gray-500 focus:border-[#f4d738] focus:ring-1 focus:ring-[#f4d738] outline-none transition-all"
              placeholder="Type a secure message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (sendMessage(input), setInput(''))}
            />
            <button 
              onClick={() => { sendMessage(input); setInput(''); }}
              disabled={!input.trim()}
              className="bg-[#f4d738] disabled:opacity-50 disabled:cursor-not-allowed text-black w-12 h-12 rounded-xl font-bold flex items-center justify-center hover:bg-[#ffe04f] active:scale-95 transition-all shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}