"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import {
  MessageCircle,
  Home,
  PlusCircle,
  Send,
  Mic,
  Sparkles,
  BookOpen,
  History,
  BarChart3,
  Settings,
} from "lucide-react"
import ChatMessage from "@/components/chat-message"
import { useChat } from "@/hooks/use-chat"
import { useRouter } from "next/navigation"
import PromptSuggestions from "@/components/prompt-suggestions"
import { AnimatedTooltip } from "@/components/ui/aceternity/animated-tooltip"
import { motion, AnimatePresence } from "framer-motion"
import { WavyBackground } from "@/components/ui/aceternity/wavy-background"
import { cn } from "@/lib/utils"
import axios from 'axios'

interface ChatMessageType {
  id: number;
  role: string;
  content: string;
  actionAnalysis?: string; // Optional field for action analysis
}

export default function ChatPage() {
  const router = useRouter()
  const { isLoading, clearChat } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [input, setInputState] = useState('') 
  const [isLoading2, setIsLoading] = useState(false) 

  const [chatMessages, setChatMessages] = useState<ChatMessageType[]>([]) // New state for chat messages

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  const handleNewChat = () => {
    clearChat()
    setChatId(generateUniqueId())
    setChatMessages([]) // Clear chat messages for a new chat
  }

  const handleHomeClick = () => {
    router.push("/")
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputState(suggestion)
    // Focus the input after setting the suggestion
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  const navigationItems = [
    { id: 1, name: "Home", icon: <Home className="h-6 w-6 text-indigo-200" />, action: handleHomeClick },
    // { id: 2, name: "History", icon: <History className="h-6 w-6 text-indigo-200" /> },
    // { id: 3, name: "Analytics", icon: <BarChart3 className="h-6 w-6 text-indigo-200" /> },
    // { id: 4, name: "Explore", icon: <BookOpen className="h-6 w-6 text-indigo-200" /> },
    // { id: 5, name: "Settings", icon: <Settings className="h-6 w-6 text-indigo-200" /> },
  ]

  // Function to generate a unique ID
  const generateUniqueId = () => {
    return 'chat_' + Date.now(); // Simple unique ID based on timestamp
  }
  const [chatId, setChatId] = useState(generateUniqueId())
  const handleSubmitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Prevent sending empty messages
    if (input.trim() === '') return;

    // Add user message to chat
    const userMessage: ChatMessageType = { id: Date.now(), role: 'user', content: input };
    setChatMessages((prev) => [...prev, userMessage]); // Update chat messages state
    setInputState(''); // Clear input immediately after submission
    setIsLoading(true); // Set loading state to true

    try {
      const response = await axios.post('http://127.0.0.1:5002/chat', {
        chat_id: chatId,
        user_message: input,
      });

      // Add robot response to chat
      const robotMessage: ChatMessageType = { 
        id: Date.now() + 1, 
        role: 'assistant', 
        content: response.data.response,
        actionAnalysis: response.data.action_analysis // Store action analysis
      };
      setChatMessages((prev) => [...prev, robotMessage]); // Update chat messages state
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  return (
    <div className="relative flex flex-col h-screen overflow-hidden bg-gradient-to-br from-purple-950 via-indigo-950 to-blue-950">
      {/* Animated background */}
      <WavyBackground className="absolute inset-0 z-0 opacity-30" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-violet-600 to-blue-500 p-2 rounded-full shadow-glow-sm">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-blue-300">
              SolBot
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNewChat}
            className="bg-black/30 hover:bg-black/40 text-white font-medium py-2 px-4 rounded-full border border-white/10 backdrop-blur-md transition-all duration-300 flex items-center gap-2 shadow-glow-sm"
          >
            <PlusCircle className="h-4 w-4 text-indigo-300" />
            <span className="text-indigo-100">New Chat</span>
          </motion.button>
        </div>
      </header>

      {/* Main content */}
      <div className="relative z-10 flex-1 overflow-auto p-4 scrollbar-thin scrollbar-thumb-indigo-600/30 scrollbar-track-transparent">
        <div className="flex-1 overflow-y-auto space-y-6 mb-4 px-2 max-w-4xl mx-auto">
          {chatMessages.length === 0 ? (
            <div className="space-y-10 py-10">
              <div className="text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                  className="relative w-32 h-32 mx-auto"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-gradient-to-r from-violet-600 to-blue-600 p-5 rounded-full shadow-glow-lg animate-pulse-slow">
                      <Sparkles className="h-14 w-14 text-white" />
                    </div>
                  </div>
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-4xl font-bold mt-6 text-transparent bg-clip-text bg-gradient-to-r from-violet-200 via-indigo-200 to-blue-200"
                >
                  How can I assist you today?
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="text-indigo-200/80 mt-3 max-w-md mx-auto"
                >
                  Ask me anything or select a suggestion below
                </motion.p>
              </div>
              <PromptSuggestions onSuggestionClick={handleSuggestionClick} />
            </div>
          ) : (
            <>
              <AnimatePresence initial={false}>
                {chatMessages.map((message, index) => (
                  <div key={message.id}>
                    <ChatMessage
                      role={message.role as "user" | "assistant"}
                      content={message.content}
                      isLast={index === chatMessages.length - 1}
                    />
                    {message.actionAnalysis && (
                      <div className="mt-2">
                        <button
                          className="text-blue-500"
                          onClick={() => {
                            // Toggle action analysis display
                            const actionAnalysisElement = document.getElementById(`action-analysis-${message.id}`);
                            if (actionAnalysisElement) {
                              actionAnalysisElement.classList.toggle('hidden');
                            }
                          }}
                        >
                          {message.actionAnalysis ? 'Show Action Analysis' : 'Hide Action Analysis'}
                        </button>
                        <div id={`action-analysis-${message.id}`} className="hidden">
                          <p className="text-gray-400">
                            {message.actionAnalysis.split('\n').map((line, idx) => (
                              <span key={idx}>
                                 {line}
                                <br />
                              </span>
                            ))}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </>
          )}

          {isLoading2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start ml-12"
            >
              <div className="bg-black/20 backdrop-blur-md p-3 rounded-full border border-indigo-500/20 shadow-glow-sm">
                <div className="flex space-x-2">
                  <div className="h-2.5 w-2.5 bg-indigo-400 rounded-full animate-pulse"></div>
                  <div className="h-2.5 w-2.5 bg-indigo-400 rounded-full animate-pulse delay-150"></div>
                  <div className="h-2.5 w-2.5 bg-indigo-400 rounded-full animate-pulse delay-300"></div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Input area - Glassmorphic style */}
      <div className="relative z-10 px-4 pb-24 mt-2 w-full max-w-4xl mx-auto">
        <form onSubmit={handleSubmitForm}>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={cn("relative transition-all duration-500", isFocused ? "scale-[1.02]" : "")}
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/20 to-blue-500/20 blur-md"></div>
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl shadow-glow-sm">
              <div
                className={cn(
                  "absolute inset-0 opacity-0 transition-opacity duration-500",
                  isFocused ? "opacity-100" : "",
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-blue-500/10 animate-gradient-x"></div>
              </div>
              <div className="relative flex items-center">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInputState(e.target.value)} // Update local input state
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Type your message..."
                  className="w-full bg-transparent border-none focus-visible:ring-0 rounded-2xl py-6 px-6 text-lg font-medium text-white placeholder:text-indigo-200/50 h-auto"
                />
                <div className="absolute right-4 flex items-center gap-2">

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-full h-10 w-10 flex items-center justify-center shadow-glow-sm transition-all duration-300"
                  >
                    <Send className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </form>
      </div>

      {/* Bottom navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 w-full max-w-lg z-20">
        <motion.div
          initial={{ y: 50, x:50, opacity: 0 }}
          animate={{ y: 0,x:0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-full p-2 shadow-glow-sm"
        >
          <AnimatedTooltip items={navigationItems} className="flex flex-row justify-center items-center"/>
        </motion.div>
      </div>
    </div>
  )
}

