// src/components/ChatInterface.jsx
import React, { useState } from 'react';

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'user', text: 'Hello, I need help with plumbing.', time: '10:30 AM' },
    { id: 2, sender: 'laborer', text: 'Sure, I can come at 12 PM.', time: '10:31 AM' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if (newMessage.trim() === '') return;

    const newMsg = {
      id: messages.length + 1,
      sender: 'user',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMsg]);
    setNewMessage('');
  };

  return (
    <div className="container py-4">
      <h4 className="mb-3">Chat with Laborer</h4>
      <div className="border rounded p-3 mb-3" style={{ height: '400px', overflowY: 'auto', backgroundColor: '#f9f9f9' }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`d-flex mb-2 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
          >
            <div
              className={`p-2 rounded ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-light text-dark'}`}
              style={{ maxWidth: '70%' }}
            >
              <div className="small fw-bold text-capitalize">{msg.sender}</div>
              <div>{msg.text}</div>
              <div className="text-end small fst-italic">{msg.time}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="btn btn-primary" onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default ChatInterface;
