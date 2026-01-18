import {useState, useRef, useEffect} from 'react';
import './App.css';
import {ArrowCircleUp, Robot, UserIcon} from "@phosphor-icons/react";

function App() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

  // Use environment variable for API URL, fallback to localhost for development
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = {role: 'user', content: input};
        setMessages(prev => [...prev, userMessage]);
        const promptText = input;
        setInput('');
        setLoading(true);

        try {
            console.log('🚀 Sending request to backend');
            console.log('📝 Prompt:', promptText);

            const response = await fetch(`${API_URL}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({prompt: promptText}),
            });

            console.log('📡 Response status:', response.status);
            console.log('📡 Response ok:', response.ok);

            const data = await response.json();
            console.log('📦 Response data:', data);

            if (response.ok) {
                const aiMessage = {
                    role: 'assistant',
                    content: data.generated_text || data.choices?.[0]?.message?.content || JSON.stringify(data)
                };
                console.log('✅ AI message:', aiMessage.content);
                setMessages(prev => [...prev, aiMessage]);
            } else {
                const errorMessage = {
                    role: 'error',
                    content: data.error || 'Failed to get response'
                };
                console.log('❌ Error message:', errorMessage.content);
                setMessages(prev => [...prev, errorMessage]);
            }
        } catch (error) {
            console.log('❌ Fetch error:', error);
            const errorMessage = {
                role: 'error',
                content: `Error: ${error.message}`
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="chat-container" style={{height: messages.length > 0 ? '85vh':'45vh'}}>
                <div className="messages-container">
                    {messages.length === 0 && (
                        <div className="welcome-message">
                            <h2>Welcome! 👋</h2>
                            <p>Start a conversation with the AI assistant</p>
                        </div>
                    )}

                    {messages.map((message, index) => (
                        <div key={index} className={`message ${message.role}`}>
                            <div className="message-avatar">
                                {message.role === 'user' ?
                                    <UserIcon size={32} color="#fff"/> : message.role === 'error' ? '⚠️' :
                                        <Robot size={32} color="#fff"/>}
                            </div>
                            <div className="message-content">
                                {message.content}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="message assistant">
                            <div className="message-avatar">🤖</div>
                            <div className="message-content typing">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef}/>
                </div>

                <form className="input-container" onSubmit={sendMessage}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        disabled={loading}
                    />
                    <button type="submit" disabled={loading || !input.trim()}>
                        {loading ? '⏳' : <ArrowCircleUp size={32} color="#fff"/>}
                    </button>
                </form>
                <p>AI Chat Assistant | Powered by Hugging Face</p>
            </div>
        </>
    );
}

export default App;
