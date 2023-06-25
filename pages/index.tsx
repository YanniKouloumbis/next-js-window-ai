import React, { useState, useEffect, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import InstallationToast from '@/components/toast';
import {ChatMessage, getWindowAI } from "window.ai"

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const aiRef = useRef<any>(null);

  useEffect(() => {
    const init = async () => {
      aiRef.current = await getWindowAI();
      if(aiRef.current){
        toast.success('window.ai detected!', {
          id: 'window-ai-detected',
        });
      } else{
        toast.custom(
          <InstallationToast/>, {
            id: 'window-ai-not-detected',
          }
        );
      }
    };
    init();
  }, []);

  const handleSendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!inputValue) return;
    if(!aiRef.current){
      toast.custom(
        <InstallationToast/>, {
          id: 'window-ai-not-detected',
        }
      );
      return;
    }

    const newMessage: ChatMessage = { role: 'user', content: inputValue };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputValue('');

    setLoading(true);

    let updatedMessages = [...messages, newMessage];

    const streamingOptions = {
      temperature: 1,
      maxTokens: 1000,
      onStreamResult: (result?: { message: ChatMessage }, error?: Error) => {
        if (error) {
          toast.error('window.ai streaming completion failed.');
          setLoading(false);
        } else if (result) {
          setLoading(false);

          const lastMessage = updatedMessages[updatedMessages.length - 1];
          if (lastMessage.role === 'user') {
            setLoading(false);
            updatedMessages = [
              ...updatedMessages,
              {
                role: 'assistant',
                content: result.message.content,
              },
            ];
          } else {
            updatedMessages = updatedMessages.map((message, index) => {
              if (index === updatedMessages.length - 1) {
                return {
                  ...message,
                  content: message.content + result.message.content,
                };
              }
              return message;
            });
          }

          setMessages(updatedMessages);
        }
      },
    };
    try {
      await aiRef.current.getCompletion(
        { messages: [{ role: 'system', content: 'You are a helpful assistant.' }, ...messages, newMessage] },
        streamingOptions
      );
    } catch (e) {
      toast.error('window.ai streaming completion failed.');
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full sm:w-3/4 lg:w-1/2 xl:w-1/2 bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-4">Next JS x window.ai</h1>
        <div className="overflow-y-auto h-96 mb-4">
          {messages.map((message, index) => (
            <div key={index} className={`mb-2 ${message.role === 'user' ? 'text-right' : ''}`}>
              <span className={`inline-block p-2 rounded-lg text-left ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}>
                {message.content}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef}></div>
        </div>
        <form onSubmit={handleSendMessage} className="flex">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-grow border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className={`ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold ${loading ? 'opacity-50' : ''}`}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
      <Toaster />
    </div>
  );
};

export default App;