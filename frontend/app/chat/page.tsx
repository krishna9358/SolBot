"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import {
  MessageCircle,
  Home,
  PlusCircle,
  // Send,
  // Mic,
  Sparkles,
  Send,
  ExternalLink,
  BookOpen,
  // BookOpen,
  // History,
  // BarChart3,
  // Settings,
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
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { Connection, LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction , TransactionSignature } from "@solana/web3.js"
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { pull } from "langchain/hub";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatGroq } from "@langchain/groq";
import { ChatOpenAI } from "@langchain/openai";
import { DynamicTool, tool } from "@langchain/core/tools";
import { OpenAI } from "@langchain/openai";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea"
import { clear } from "console"
import ReactMarkdown from 'react-markdown'
import { VideoBackground } from "@/components/ui/video-background"
import { RiTwitterXFill } from "react-icons/ri"


interface ChatMessageType {
  id: number;
  role: string;
  content: string;
  actionAnalysis?: string; // Optional field for action analysis
}



const LoadingText = () => {
  const keywords = [
   "Processing your request with AI-powered automation...",
   "Communicating with  blockchain for real-time data...",
    "Retrieving and analyzing the required information...",
   "Ensuring accuracy and security while handling your request...",
   "Optimizing data retrieval for a seamless experience...",
   "Executing necessary operations on the blockchain...",
   "Fetching relevant details while maintaining efficiency...",
   "Applying smart algorithms to streamline your request...",
   "Verifying and structuring the response for clarity...",
"Finalizing the results—almost there!"
  ];
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % keywords.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="text-indigo-400 text-sm animate-fade-in-out">
      {keywords[currentIndex]}
    </span>
  );
};

export default function ChatPage() {
  const router = useRouter()
  const { isLoading, clearChat } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [input, setInputState] = useState('') 
  const [isLoading2, setIsLoading] = useState(false) 
  const [chatMessages, setChatMessages] = useState<ChatMessageType[]>([]) // New state for chat messages
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null); // State to hold the balance

  // Check wallet connection on page load
  useEffect(() => {
    if (!publicKey) {
      console.error("No wallet connected");
      router.push("/");
    }
  }, [publicKey, router]);

  // tools for ai agent
  const tools = [
    new DynamicTool({
      name: "getBalance",
      description: "Gets the SOL balance of a wallet. It doesn't require any input.",
      func: async (input:string) => {
        try {
          if(!publicKey){
            return "No wallet connected";
          }
          const balance = await connection.getBalance(publicKey);
          return `Balance: ${balance / LAMPORTS_PER_SOL} SOL`;
        } catch (error: any) {
          return `Error: ${error.message}`;
        }
      },
    }),
    new DynamicTool({
      name: "transferSOL",
      description: "Transfers SOL to reciever's wallets. Input format: receiverPublicKey,amount",
      func: async (input: string) => {
        try {
          if (!publicKey) return "No wallet connected";
          const [receiver, amount] = input.split(',');
          const receiverPubKey = new PublicKey(receiver);
          const amountLamports = parseFloat(amount) * LAMPORTS_PER_SOL;

          const transaction = new Transaction().add(
            SystemProgram.transfer({
              fromPubkey: publicKey,
              toPubkey: receiverPubKey,
              lamports: amountLamports,
            })
          );
          const signature = await sendTransaction(transaction, connection);
          await connection.confirmTransaction(signature, "processed");
          return `Transfer successful: ${signature}`;
        } catch (error: any) {
          return `Error: ${error.message}`;
        }
      },
    }),
    new DynamicTool({
      name: "getTransactionCost",
      description: "Estimates the transaction cost for a SOL transfer. This tool doesn't require any input.",
      func: async (input: string) => {
        try {
          if (!publicKey) return "No wallet connected";
          const amount = parseFloat(input);
          const transaction = new Transaction().add(
            SystemProgram.transfer({
              fromPubkey: publicKey,
              toPubkey: publicKey,
              lamports: amount * LAMPORTS_PER_SOL,
            })
          );
          const { blockhash } = await connection.getLatestBlockhash();
          transaction.recentBlockhash = blockhash;
          transaction.feePayer = publicKey;
          const estimatedFee = await transaction.getEstimatedFee(connection);
          return `Estimated transaction cost: ${estimatedFee ? estimatedFee / LAMPORTS_PER_SOL : 0} SOL`;
        } catch (error: any) {
          return `Error: ${error.message}`;
        }
      },
    }),
    new DynamicTool({
      name: "getAccountInfo",
      description: "Gets detailed account information for a wallet. This function does not require any input.",
      func: async (input:string) => {
        try {
          if (!publicKey) return "No wallet connected";
          const accountInfo = await connection.getAccountInfo(publicKey);
          if (accountInfo) {
            return JSON.stringify({
              publicKey: publicKey.toBase58(),
              amount: accountInfo.lamports/LAMPORTS_PER_SOL,
              executable: accountInfo.executable,
              dataLength: accountInfo.data.length
            }, null, 2);
          }
          return "Account not found";
        } catch (error: any) {
          return `Error: ${error.message}`;
        }
      },
    }),
    new DynamicTool({
      name: "getFinancialAdvice",
      description: "Provides financial advice about a crypto coin based on the user's query. The query should be about only one coin at a time. For example: 'Should I buy solana today', 'Give me information and advice about BTC'.  Input format: query.",
      func: async (input: string) => {
        const response = await axios.post('http://localhost:5002/analyze', {
          user_query: input
        });
        return JSON.stringify(response.data);
      },
    }),
  ];

  // ai agent
  // "getBalance", "getTransactionCost"
function print(input: any) {
  console.log(input)
}

// const llm = new ChatGroq({
//   temperature: 0,
//   // model: "qwen-2.5-32b",
//   model: "llama-3.3-70b-versatile",
//   apiKey: "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",
// });

const llm = new ChatOpenAI({
  temperature: 0,
  model: "gpt-4o",
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

// Need to use NEXT_PUBLIC_ prefix to access env variables on client side
// console.log(process.env.NEXT_PUBLIC_OPENAI_API_KEY)

// ai agent
async function aiAgent(input: string) {
  try {
    let temp = await pull<PromptTemplate>("hwchase17/react");

    const customPrompt = `
You are an intelligent Solana blockchain assistant that helps users perform operations and provide relevant information about Solana blockchain. You have access to the following tools:

{tools}

Important Instructions:
- If you find yourself repeating the same actions without progress, inform the user that their query cannot be processed in its current form
- If any required information is missing from the user's query, politely explain what's missing and ask them to provide the necessary details
- Always verify wallet connection status before attempting operations
- Present blockchain data in a clear, readable format
- For transfers, confirm amount and recipient before proceeding

## Important Instructions for "getFinancialAdvice" tool:
!!! This tool can have query about a single coin at a time. For example: 'Should I buy solana today', 'Give me information and advice about BTC'. 
!!! If user asks for financial advice about multiple coins, First call this tool querying about first coin then second coin and so on.
!!! Dont call this tool multiple times. If output is already available about a coin then don't call this tool again for that coin.


## Most important:
!!! Dont call any tool multiple times. or keep calling it continuosly. If a tool is called once learn its output or move to the next step. 
!!! Please dont call any tool if it does not exist. you have only these tools: {tool_names}
!!! Calculating transaction cost is not necessary for transferring. So if you want to trasnfer directly use transferSol function.
!!! You dont need to confirm anything from user. Keep the execution going. 
!!! Dont use any tool if you dont need it. 
!!! Keep the input format same as user's query. Don't include any thing extra. There should be only input parameters of function separated by comma and nothing extra.
!!! This one is most important of all. Do not break the following format. Whatever happens, dont break output format even if the error occurs or something went wrong or something is incomplete.



Use the following format:

Task: The user's query or request to resolve
Thought: Your reasoning about what needs to be done to fulfill the request
Action: The tool to use (must be one of [{tool_names}])
Action Input: The specific input to provide to the tool
Observation: The result returned by the tool
... (this Thought/Action/Action Input/Observation can repeat up to 5 times as needed)
Thought: I now know the final answer
Final Answer: Provide a clear, concise response to the user's original query with relevant information and results

Begin!

Task: {input}
{agent_scratchpad}
`

  // const llm = new ChatOpenAI({
  //   temperature: 0,
  //   model: "gpt-4o-mini",
  //   apiKey: process.env.OPENAI_API_KEY,
  // });



  const prompt = PromptTemplate.fromTemplate(customPrompt);

    // Create the React agent
    const agent = await createReactAgent({
        llm,
        tools,
        prompt,
    });

    // Create agent executor with logging
    const agentExecutor = new AgentExecutor({
        agent,
        tools,
        maxIterations: 5,
        earlyStoppingMethod: "force",
        returnIntermediateSteps: true,
        verbose: true,
    });

  // Function to invoke the agent with logging

  let logs = "";

  const result = await agentExecutor.invoke(
      { input },
      {
          callbacks: [
              {
                  handleAgentAction(action) {
                      const actionLog = `Action: ${action.tool}\nAction Input: ${action.toolInput}\n`;
                      logs += actionLog;
                      // console.log(actionLog);
                      // onLog(actionLog);
                  },
                  handleToolEnd(output) {
                      const observationLog = `Observation: ${output.output}\n`;
                      logs += observationLog;
                      // console.log(observationLog);
                      // onLog(observationLog);
                  },
                  handleAgentEnd(action) {
                      const finalAnswerLog = `Final Answer: ${action.returnValues.output}\n`;
                      logs += finalAnswerLog;
                      // console.log(finalAnswerLog);
                      // onLog(finalAnswerLog);
                  }
              }
          ]
      }
  );

    // Add final result to logs
    logs += `Final Result: ${JSON.stringify(result)}\n`;


  // console.log("Final Result:", result);
  // logs += `Final Result: ${result}\n`;


  const structure = z.object({
      final_result: z.string().describe("A string which is The final conclusion or response that should be given to user based on his message and all that process that has been done."),
      action_analysis: z.array(z.string()).describe("A list of strings where each string is an action taken or step performed. It should contain brief description of each important step."),
  });

  const outputParser = StructuredOutputParser.fromNamesAndDescriptions({
      final_result: "The final conclusion or result derived from analyzing the logs.",
      action_analysis: "A list of actions or steps identified from the logs, indicating what happened.",
  },);
  console.clear();
  console.log("logs: ", logs)
  // return
  let pr2 = `
You are an intelligent Solana blockchain assistant, responsible for analyzing executed actions and providing users with a comprehensive yet concise final response. You will be given the user's query and all the logs of process done to resolve that query. assess the sequence of actions, their dependencies, and the overall results to generate a user-friendly summary. Please understand the context of conversation properly. 
## Give proper action analysis and steps taken to resolve the query like if getbalance function is called then in actionanalysis getbalance
## In the final result make sure you are answering user's query and it should have proper response.


The following tools could have been used in the logs.
1.	getBalance
•	Gets the SOL balance of a wallet. It doesn't require any input.
2.	transferSOL
•	Transfers SOL to reciever's wallets.
3.	getTransactionCost
• Estimates the transaction cost for a SOL transfer.
4. getAccountInfo
• Gets detailed account information for a wallet.
5. getFinancialAdvice
• Provides financial advice about a crypto coin based on the user's query.

📌 User Query:
"${input}"

Actions taken to resolve user's query:
${logs}



Key Instructions :
1.	Understand the User's Intent:
•	Read User Query carefully to understand what the user wanted.
2.	Analyze the Actions Taken:
•	Examine Actions executed to determine how the request was fulfilled.
3.	Generate a Final Summary:
•	Explain in a few bullet points what was accomplished in a structured way.
4.	Construct a Final Response:
•	Provide a natural, conversational response to the user confirming what was done.

  !!! Most Importantly
### Strictly follow the output structure at any cost
### In action analysis you dont need to return the name of the tools you have to return list of actions summary that are done.
### If you see financial advice is being asked and financial advice tool is called , it gives structure output having the following parameters:
    action: Literal["BUY", "HODL", "SELL"] = Field(
        description="Action to take with the chosen cryptocurrency"
    )
    score: int = Field(
        description="Bullishness market score between 0 (extremely bearish) and 100 (extremely bullish)"
    )
    trend: Literal["UP", "NEUTRAL", "DOWN"] = Field(
        description="Price trend for the chosen cryptocurrency",
    )
    sentiment: Literal["GREED", "NEUTRAL", "FEAR"] = Field(
        description="Sentiment from the news for the chosen cryptocurrency"
    )
    price_predictions: List[float] = Field(
        description="Price predictions for 1, 2, 3 and 4 weeks ahead"
    )
    summary: str = Field(
        description="Summary of the current market conditions (1-3 sentences)"
    ) 
  If logs have these values try to answer user's query giving these values in structured presentable formate which looks clean and analytical. If comparision between multiple coin  is asked display the numerical value relevant to user's query for each coin.   

Example of action analysis:
1. Balance of wallet was retrieved and found to be 1.2.
2. account info of users' account was fetched.

      `

  // print(pr2)
  // return
  const structuredLlm = llm.withStructuredOutput(structure);

    let response = await structuredLlm.invoke(pr2);
    print(response)
    return response
  } catch (error) {
    console.error("Error in AI agent:", error);
    // Return a fallback response in case of any error
    return {
      final_result: "I apologize, but I encountered an error while processing your request. Please try again or rephrase your question.",
      action_analysis: ["An error occurred during processing"]
    };
  }
}



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

  // Function to fetch balance
  // const fetchBalance = async () => {

  //   if (!publicKey) {
  //     console.log("No wallet connected");
  //     return;
  //   }

  //   try {
  //     const response = await axios.post('http://localhost:3002/get-balance', {
  //       publicKey: publicKey.toBase58(), // Only send the public key as a string
  //     });
  //     setBalance(response.data.balance);
  //     console.log(`Balance: ${response.data.balance} SOL`);
  //   } catch (error) {
  //     console.error('Error fetching balance:', error);
  //   }
  // };

  // Transfer SOL
  // const transfer = async (receiverPublicKey: string, amount: number) => {
  //   if (!publicKey) {
  //     console.error("Wallet not connected");
  //     return;
  //   }

  //   try {
  //     const response = await axios.post('http://localhost:3002/transfer', {
  //       senderPublicKey: publicKey.toBase58(),
  //       receiverPublicKey,
  //       amount,
  //     });
  //     console.log("Transfer response:", response.data);
  //   } catch (error) {
  //     console.error('Error transferring SOL:', error);
  //   }
  // };

  // Get transaction cost
  // const getTransactionCost = async () => {
  //   if (!publicKey) {
  //     console.error("No wallet connected");
  //     return;
  //   }

  //   try {
  //     const response = await axios.post('http://localhost:3002/get-transaction-cost', {
  //       publicKey: publicKey.toBase58(),
  //     });
  //     console.log("Estimated transaction cost:", response.data.fee);
  //   } catch (error) {
  //     console.error('Error getting transaction cost:', error);
  //   }
  // };

  // Get account info
  // const getAccountInfo = async () => {
  //   if (!publicKey) {
  //     console.error("No wallet connected");
  //     return;
  //   }

  //   try {
  //     const response = await axios.post('http://localhost:3002/get-account-info', {
  //       publicKey: publicKey.toBase58(),
  //     });
  //     console.log("Account Information:", response.data);
  //   } catch (error) {
  //     console.error('Error getting account info:', error);
  //   }
  // };

  const handleSubmitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Prevent sending empty messages
    if (input.trim() === '') return;
    if (!publicKey) {
      console.error("No wallet connected");
      router.push("/")
      return; // Exit if no wallet is connected
    } 
    setChatMessages([]);
    // Add user message to chat
    const userMessage: ChatMessageType = { id: Date.now(), role: 'user', content: input };
    setChatMessages((prev) => [...prev, userMessage]); // Update chat messages state
    setInputState(''); // Clear input immediately after submission
    setIsLoading(true); // Set loading state to true

     try {
    //   const response = await axios.post('http://localhost:3003/chat', {
    //     chat_id: chatId,
    //     user_message: input,
    //     publicKey: publicKey.toBase58(),
    //   });
      
      const response = await aiAgent(userMessage.content);
      
      // Check if response is valid
      if (!response || !response.final_result || !response.action_analysis) {
        throw new Error("Invalid response from AI agent");
      }
      
      // Add robot response to chat
      const robotMessage: ChatMessageType = { 
        id: Date.now() + 1,
        role: 'assistant',
        content: response.final_result,
        actionAnalysis: response.action_analysis.join('\n') // Parse and join array into string
      };
      setChatMessages((prev) => [...prev, robotMessage]); // Update chat messages state
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message to chat
      const errorMessage: ChatMessageType = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "I apologize, but I encountered an error while processing your request. Please try again or rephrase your question.",
        actionAnalysis: "An error occurred during processing"
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  // Transfer SOL
  // const transfer = async (receiverPublicKey: string, amount: number) => {
  //   if (!publicKey) {
  //     console.error("Wallet not connected");
  //     return;
  //   }

  //   try {
  //     const transaction = new Transaction().add(
  //       SystemProgram.transfer({
  //         fromPubkey: publicKey,
  //         toPubkey: new PublicKey(receiverPublicKey),
  //         lamports: amount * LAMPORTS_PER_SOL,
  //       })
  //     );

  //     const { blockhash } = await connection.getLatestBlockhash();
  //     transaction.recentBlockhash = blockhash;
  //     transaction.feePayer = publicKey;

  //     const signedTransaction = await sendTransaction(transaction, connection);
  //     const confirmation = await connection.confirmTransaction(signedTransaction);

  //     if (confirmation.value.err) {
  //       throw new Error("Transaction failed");
  //     }

  //     console.log("Transfer successful:", signedTransaction);
  //     return signedTransaction;

  //   } catch (error) {
  //     console.error("Error transferring SOL:", error);
  //     throw error;
  //   }
  // };


// Account Info
  // // Get account information for a given public key
  // async function getAccountInfo(connection: Connection, publicKey: PublicKey) {
  //   try {
  //     // Check if public key exists
  //     if (!publicKey) {
  //       console.error("No wallet connected");
  //       return;
  //     }

  //     //Fetch account info from the connection
  //     const accountInfo = await connection.getAccountInfo(publicKey);
      
  //     if (accountInfo) {
  //       console.log("Account Information:");
  //       console.log("- Account Public Key:", publicKey.toBase58());
  //       console.log("- Lamports:", accountInfo.lamports);
  //       console.log("- Executable:", accountInfo.executable);
  //       console.log("- Data length:", accountInfo.data.length, "bytes");
  //     } else {
  //       console.log("Account not found");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching account info:", error);
  //   }
  // }


  return (
    <div className="relative flex flex-col h-screen overflow-hidden">
      {/* Video Background */}
      <VideoBackground />
      
      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/40 backdrop-blur-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-[#2596be]/80 to-[#2596be] p-2 rounded-full shadow-glow-sm">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#2596be]/90 to-[#2596be]">
            GAIA
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
          <WalletMultiButton style={{ background: 'linear-gradient(to right, #2596be, #2596be)' }} />
        </div>
      </header>

      {/* Main content */}
      <div className="relative  flex-1 overflow-auto p-4 scrollbar-thin scrollbar-thumb-indigo-600/30 scrollbar-track-transparent">
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
                    <div className="bg-gradient-to-r from-[#2596be]/80 to-[#2596bf] p-5 rounded-full shadow-glow-lg animate-pulse-slow">
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
                      content={
                        message.role === 'assistant' ? (
                          <ReactMarkdown>
                            {message.content}
                          </ReactMarkdown>
                        ) : message.content
                      }
                      isLast={index === chatMessages.length - 1}
                    />
                    {message.actionAnalysis && (
                      <div className="mt-2">
                        <button
                          className="text-blue-500"
                          onClick={() => {
                            const actionAnalysisElement = document.getElementById(`action-analysis-${message.id}`);
                            if (actionAnalysisElement) {
                              actionAnalysisElement.classList.toggle('hidden');
                            }
                          }}
                        >
                          {message.actionAnalysis ? 'Show Action Analysis' : 'Hide Action Analysis'}
                        </button>
                        <div id={`action-analysis-${message.id}`} className="hidden">
                          <ReactMarkdown>
                            {message.actionAnalysis}
                          </ReactMarkdown>
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
                <div className="flex items-center space-x-2">
                  <LoadingText />
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
          <Textarea
                  ref={inputRef}
            value={input}
                  onChange={(e) => setInputState(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Type your message..."
                  className="w-full bg-transparent border-none focus-visible:ring-0 rounded-2xl py-4 px-6 text-base md:text-lg font-medium text-white placeholder:text-indigo-200/50 min-h-[48px] max-h-[120px] resize-none overflow-y-auto"
                  rows={1}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                  }}
                />
                <div className="absolute right-4 flex items-center gap-2">

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="bg-gradient-to-r from-[#2596be] to-[#1a7a9e] text-white rounded-full h-10 w-10 flex items-center justify-center shadow-glow-sm transition-all duration-300"
                  >
                    <Send className="h-5 w-5 "   />
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
      {/* Social Media Icons */}
      <div className="fixed bottom-6 right-6 flex flex-row gap-4 z-20">
          <a 
            href="https://twitter.com/your_twitter" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 text-[#2596be] hover:text-white transition-all duration-300"
          >
            <RiTwitterXFill className="h-5 w-5" />
          </a>
          <a 
            href="https://dexscreener.com/your_dex" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 text-[#2596be] hover:text-white transition-all duration-300"
          >
            <ExternalLink className="h-5 w-5" />
          </a>
          <a 
            href="https://docs.your_project.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 text-[#2596be] hover:text-white transition-all duration-300"
          >
            <BookOpen className="h-5 w-5" />
          </a>
        </div>

    </div>
  )
}
