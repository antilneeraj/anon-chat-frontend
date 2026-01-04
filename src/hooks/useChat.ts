import { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export const useChat = (roomId: string, username: string) => {
    const [messages, setMessages] = useState<any[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        if (!roomId || !username) return;
        
        // Establish WebSocket Connection
        const socket = new SockJS(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            debug: (str: any) => console.log(str),
            reconnectDelay: 5000,
            onConnect: () => {
                setIsConnected(true);
                
                // 2. Subscribe to Room
                client.subscribe(`/topic/${roomId}`, (message: { body: string; }) => {
                    const receivedMsg = JSON.parse(message.body);
                    setMessages((prev: any) => [...prev, receivedMsg]);
                });

                // 3. Send Join Message
                client.publish({
                    destination: `/app/chat/${roomId}/addUser`,
                    body: JSON.stringify({ sender: username, type: 'JOIN' }),
                });
            },
            onDisconnect: () => setIsConnected(false),
        });

        client.activate();
        clientRef.current = client;

        // Cleanup on Unmount
        return () => {
            client.deactivate();
        };
    }, [roomId, username]);

    // Function to send messages
    const sendMessage = (content: string) => {
        if (clientRef.current && isConnected) {
            clientRef.current.publish({
                destination: `/app/chat/${roomId}/sendMessage`,
                body: JSON.stringify({ sender: username, content, type: 'CHAT' }),
            });
        }
    };

    return { messages, sendMessage, isConnected };
};