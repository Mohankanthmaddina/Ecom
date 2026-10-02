import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! 👋 I'm your MegaMart assistant. Ask me anything about products, orders, or navigation!", type: 'sys' }
    ]);
    const [inputText, setInputText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [assistantMode, setAssistantMode] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voiceResponseEnabled, setVoiceResponseEnabled] = useState(() => {
        return localStorage.getItem('voiceResponseEnabled') === 'true';
    });
    
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);
    const isSpeakingRef = useRef(false);
    const voiceEnabledRef = useRef(false);
    
    const navigate = useNavigate();
    const { user } = useAuth();
    
    // Ref to hold the latest user state to avoid stale closure in speech recognition callbacks
    const userRef = useRef(user);
    useEffect(() => {
        userRef.current = user;
    }, [user]);

    // Setup speech recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onstart = () => {
                setIsListening(true);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
                // Auto-restart if Assistant Mode is active and not currently speaking
                if (localStorage.getItem('assistantMode') === 'true' && !isSpeakingRef.current) {
                    setTimeout(() => {
                        if (recognitionRef.current) {
                            try { recognitionRef.current.start(); } catch (e) { }
                        }
                    }, 200);
                }
            };

            recognitionRef.current.onresult = (event) => {
                const results = event.results;
                const lastResultIndex = results.length - 1;
                const result = results[lastResultIndex];
                const transcript = result[0].transcript;

                if (result.isFinal) {
                    setInputText(transcript);
                    voiceEnabledRef.current = true;
                    handleSendMessage(transcript);
                } else {
                    setInputText(transcript);
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
                let errorMsg = "Voice input error: " + event.error;
                if (event.error === 'not-allowed') {
                    errorMsg = "Voice Input blocked: Please allow microphone access in your browser address bar.";
                } else if (event.error === 'no-speech') {
                    errorMsg = "Voice Input: No speech was detected. Please try again.";
                }
                setMessages(prev => [...prev, { text: errorMsg, type: 'sys' }]);
            };
        }

        // Custom event listeners for global toggles
        const handleOpenAssistant = () => {
            setIsOpen(true);
            setAssistantMode(true);
            localStorage.setItem('assistantMode', 'true');
            sessionStorage.removeItem('assistantGreeted');
            
            setTimeout(() => {
                voiceEnabledRef.current = true;
                startListening();
            }, 500);
            
            if (!sessionStorage.getItem('assistantGreeted')) {
                setTimeout(() => {
                    setMessages(prev => [...prev, { text: "Personal Assistant Active. I'm listening...", type: 'sys' }]);
                    speakText("I am ready.");
                    sessionStorage.setItem('assistantGreeted', 'true');
                }, 500);
            }
        };

        window.addEventListener('open-assistant', handleOpenAssistant);

        return () => {
            window.removeEventListener('open-assistant', handleOpenAssistant);
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch (e) { }
            }
        };
    }, []);

    // Check localStorage on mount
    useEffect(() => {
        const mode = localStorage.getItem('assistantMode') === 'true';
        if (mode) {
            setAssistantMode(true);
            setIsOpen(true);
            if (sessionStorage.getItem('assistantGreeted')) {
                setTimeout(() => {
                    if (!isListening && !isSpeakingRef.current) startListening();
                }, 800);
            }
        }
    }, []);

    // Stop speaking when widget is closed
    useEffect(() => {
        if (!isOpen) {
            stopSpeaking();
        }
    }, [isOpen]);

    // Handle welcome message variation based on user state
    useEffect(() => {
        setMessages(prev => {
            if (prev.length <= 1) {
                const text = user 
                    ? `Hello ${user.name}! 👋 I'm your MegaMart assistant. Ask me anything about products, orders, or navigation!`
                    : "Hello! 👋 I'm your MegaMart assistant. Ask me anything about products, orders, or navigation! (You are chatting as a Guest. Log in for personalized help.)";
                return [{ text, type: 'sys' }];
            }
            return prev;
        });
    }, [user]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const startListening = () => {
        if (!recognitionRef.current) {
            alert('Voice input is not supported in this browser.');
            return;
        }
        try {
            recognitionRef.current.start();
        } catch (e) {
            if (e.name !== 'InvalidStateError') console.error(e);
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (e) { }
        }
    };

    const toggleVoiceInput = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    const speakText = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            isSpeakingRef.current = true;
            setIsSpeaking(true);
            if (isListening) stopListening();

            const utterance = new SpeechSynthesisUtterance(text);

            utterance.onend = () => {
                isSpeakingRef.current = false;
                setIsSpeaking(false);
                if (localStorage.getItem('assistantMode') === 'true') {
                    setTimeout(() => startListening(), 100);
                }
            };

            utterance.onerror = () => {
                isSpeakingRef.current = false;
                setIsSpeaking(false);
            };

            window.speechSynthesis.speak(utterance);
        }
    };

    const stopSpeaking = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            isSpeakingRef.current = false;
            setIsSpeaking(false);
        }
    };

    const toggleVoiceResponse = () => {
        const nextState = !voiceResponseEnabled;
        setVoiceResponseEnabled(nextState);
        localStorage.setItem('voiceResponseEnabled', String(nextState));
        if (!nextState) {
            stopSpeaking();
        }
    };

    const handleSendMessage = async (textOverride = null) => {
        const message = (textOverride || inputText).trim();
        if (!message) return;

        setMessages(prev => [...prev, { text: message, type: 'user' }]);
        setInputText('');
        setIsTyping(true);

        try {
            const response = await axios.post('/api/chat', { message });
            let botText = response.data.response;

            const navMatch = botText.match(/\[\[NAVIGATE: (.*?)\]\]/);
            if (navMatch) {
                let url = navMatch[1].trim();
                botText = botText.replace(navMatch[0], '').trim();

                const secureRoutes = ['/cart', '/checkout', '/orders', '/profile'];
                const requiresAuth = secureRoutes.some(route => url.toLowerCase().includes(route));

                if (requiresAuth) {
                    if (!userRef.current) {
                        url = '/login';
                        botText = "You need to log in to access this page.";
                    }
                }

                if (botText) {
                    setMessages(prev => [...prev, { text: botText, type: 'sys' }]);
                    if (voiceResponseEnabled || voiceEnabledRef.current) speakText(botText);
                }

                setTimeout(() => navigate(url), 1000);
            } else {
                setMessages(prev => [...prev, { text: botText, type: 'sys' }]);
                if (voiceResponseEnabled || voiceEnabledRef.current) speakText(botText);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting to the server.", type: 'sys' }]);
        } finally {
            setIsTyping(false);
            voiceEnabledRef.current = false; // Reset unless voice triggered again
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            voiceEnabledRef.current = false;
            handleSendMessage();
        }
    };

    const disableAssistantMode = () => {
        setAssistantMode(false);
        localStorage.setItem('assistantMode', 'false');
        setIsOpen(false);
        stopListening();
        stopSpeaking();
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] font-sans">
            {/* Chat Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_4px_15px_rgba(102,126,234,0.5)] flex items-center justify-center cursor-pointer transition-transform hover:scale-110 hover:shadow-[0_8px_25px_rgba(102,126,234,0.7)] text-white text-2xl border-none"
            >
                <i className={`fas ${isOpen ? 'fa-times' : 'fa-robot'}`}></i>
            </button>

            {/* Chat Window */}
            <div className={`absolute bottom-20 right-0 w-80 sm:w-96 h-[550px] bg-white/95 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden origin-bottom-right transition-all duration-300 ${isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'}`}>
                
                {/* Header */}
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 flex items-center justify-between text-white">
                    <h3 className="m-0 text-lg font-semibold flex items-center gap-2">
                        <i className="fas fa-sparkles"></i> AI Assistant
                        {assistantMode && <span className="text-xs opacity-80">(Active)</span>}
                    </h3>
                    <div className="flex gap-2">
                        <button 
                            onClick={disableAssistantMode} 
                            className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1.5 rounded-lg border-none cursor-pointer transition-colors flex items-center gap-1 text-xs font-semibold" 
                            title="Turn off Assistant"
                        >
                            <i className="fas fa-power-off"></i> Turn Off
                        </button>
                        <button 
                            onClick={() => setIsOpen(false)} 
                            className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1.5 rounded-lg border-none cursor-pointer transition-colors flex items-center gap-1 text-xs font-semibold" 
                            title="Close Chat Window"
                        >
                            <i className="fas fa-times"></i> Close
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-gray-50">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`max-w-[80%] p-3 rounded-xl text-sm leading-relaxed break-words ${msg.type === 'user' ? 'self-end bg-blue-500 text-white rounded-br-sm' : 'self-start bg-white text-gray-800 shadow-sm rounded-bl-sm'}`}>
                            {msg.text}
                        </div>
                    ))}
                    {isTyping && (
                        <div className="text-xs text-gray-500 ml-2 animate-pulse">
                            MegaMart AI is thinking...
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Speaking Banner with Stop Button */}
                {isSpeaking && (
                    <div className="bg-blue-50/90 backdrop-blur-sm border-t border-b border-blue-100/60 px-4 py-2.5 flex items-center justify-between transition-all duration-300 animate-pulse">
                        <span className="text-xs text-blue-700 font-semibold flex items-center gap-2">
                            <i className="fas fa-volume-up text-blue-500 animate-bounce"></i> Speaking...
                        </span>
                        <button 
                            onClick={stopSpeaking}
                            className="text-xs bg-red-500 hover:bg-red-600 active:scale-95 text-white px-3.5 py-1 rounded-full border-none cursor-pointer flex items-center gap-1.5 transition-all shadow-sm"
                            title="Stop assistant speech output"
                            aria-label="Stop Speaking"
                        >
                            <i className="fas fa-stop text-[10px]"></i> Stop Speech
                        </button>
                    </div>
                )}

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-100 flex flex-col gap-3">
                    <div className="flex gap-2 items-center">
                        <input 
                            type="text" 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={isListening ? "Listening..." : "Type or speak..."}
                            className="flex-1 border border-gray-200 rounded-full px-4 py-2 outline-none transition-colors focus:border-blue-500 text-sm"
                            aria-label="Message Input"
                        />
                        
                        <button 
                            onClick={() => handleSendMessage()}
                            className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center transition-colors hover:bg-blue-600 shadow-sm cursor-pointer border-none"
                            title="Send Message"
                            aria-label="Send Message"
                        >
                            <i className="fas fa-paper-plane"></i>
                        </button>
                    </div>

                    {/* Bottom Status / Buttons Row */}
                    <div className="flex justify-between items-center px-1 text-xs text-gray-500">
                        {/* Guest/User Status */}
                        {!user ? (
                            <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-amber-100">
                                <i className="fas fa-user-circle"></i> Guest
                            </span>
                        ) : (
                            <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-green-100">
                                <i className="fas fa-check-circle"></i> Logged In
                            </span>
                        )}

                        {/* Controls */}
                        <div className="flex gap-2 ml-auto">
                            {/* Voice Input Button */}
                            <button 
                                onClick={toggleVoiceInput}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-all ${isListening ? 'bg-red-500 text-white border-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                                title={isListening ? "Stop Voice Input" : "Start Voice Input (Speech to Text)"}
                                aria-label="Voice Input"
                            >
                                <i className={`fas fa-microphone ${isListening ? 'text-white' : 'text-gray-500'}`}></i>
                                <span>{isListening ? "Listening" : "Voice Input"}</span>
                            </button>

                            {/* Audio Output (TTS) Toggle */}
                            <button 
                                onClick={toggleVoiceResponse}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-all ${voiceResponseEnabled ? 'bg-indigo-600 text-white border-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.3)]' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                                title={voiceResponseEnabled ? "Mute Voice Response (Disable TTS)" : "Enable Voice Response (Audio On)"}
                                aria-label="Toggle Voice Response"
                            >
                                <i className={`fas ${voiceResponseEnabled ? 'fa-volume-up text-white' : 'fa-volume-mute text-gray-400'}`}></i>
                                <span>{voiceResponseEnabled ? "Audio On" : "Audio Off"}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatWidget;
