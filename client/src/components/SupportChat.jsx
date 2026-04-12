import React, { useState } from 'react';
import { MessageCircle, X, Send, User, Bot } from 'lucide-react';
import api from '../api';

const SupportChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([{ role: 'bot', text: 'Hello! I am your Zomato Assistant. How can I help you today?' }]);
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!message) return;
        const userMsg = { role: 'user', text: message };
        setChat([...chat, userMsg]);
        setMessage('');
        setLoading(true);

        try {
            const res = await api.post('/api/ai/chat', { message, history: chat });
            setChat(prev => [...prev, { role: 'bot', text: res.data.reply, image: res.data.imageUrl }]);
        } catch (err) {
            setChat(prev => [...prev, { role: 'bot', text: "Sorry, I'm having trouble connecting to the kitchen right now!" }]);
        }
        setLoading(false);
    };

    return (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000 }}>
            {!isOpen ? (
                <button 
                  onClick={() => setIsOpen(true)}
                  style={{ background: 'var(--zomato-red)', color: 'white', border: 'none', borderRadius: '50%', width: '60px', height: '60px', cursor: 'pointer', boxShadow: '0 8px 30px rgba(239, 79, 95, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <MessageCircle size={24} />
                </button>
            ) : (
                <div style={{ width: '350px', height: '500px', background: 'white', borderRadius: '1.2rem', boxShadow: '0 10px 50px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* Header */}
                    <div className="flex justify-between items-center" style={{ background: 'var(--zomato-red)', padding: '1rem', color: 'white' }}>
                        <div className="flex items-center gap-2">
                            <Bot />
                            <span style={{ fontWeight: '700' }}>AI Support Agent</span>
                        </div>
                        <X onClick={() => setIsOpen(false)} style={{ cursor: 'pointer' }} />
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', scrollbarWidth: 'none' }}>
                        {chat.map((msg, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                <div 
                                    style={{ 
                                        padding: '0.8rem 1.2rem', 
                                        borderRadius: msg.role === 'user' ? '1.2rem 1.2rem 0 1.2rem' : '1.2rem 1.2rem 1.2rem 0',
                                        maxWidth: '85%',
                                        background: msg.role === 'user' ? 'var(--zomato-red)' : '#F3F4F6',
                                        color: msg.role === 'user' ? 'white' : '#1F2937',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                        fontSize: '0.95rem',
                                        lineHeight: '1.5'
                                    }}
                                >
                                    <p style={{ margin: 0 }}>{msg.text}</p>
                                    {msg.image && (
                                        <div style={{ marginTop: '0.8rem', borderRadius: '0.6rem', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)' }}>
                                            <img src={msg.image} alt="AI Food Suggestion" style={{ width: '100%', maxHeight: '180px', objectFit: 'cover' }} />
                                            <div style={{ padding: '0.4rem', background: 'rgba(0,0,0,0.03)', fontSize: '0.7rem', textAlign: 'center', color: '#666' }}>
                                                Zomato AI Suggestion ✨
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && <div style={{ fontSize: '0.8rem', color: '#9CA3AF', paddingLeft: '0.5rem', fontStyle: 'italic' }}>Zomato Chef is typing...</div>}
                    </div>

                    {/* Input Area */}
                    <div className="flex items-center gap-2" style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
                        <input 
                           type="text" 
                           value={message}
                           onChange={(e) => setMessage(e.target.value)}
                           onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                           placeholder="Type a message..."
                           style={{ flex: 1, border: 'none', outline: 'none', background: 'var(--bg-gray)', padding: '0.6rem 1rem', borderRadius: '0.6rem' }}
                        />
                        <button onClick={handleSend} style={{ background: 'var(--zomato-red)', color: 'white', border: 'none', padding: '0.6rem', borderRadius: '0.6rem', cursor: 'pointer' }}>
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupportChat;
