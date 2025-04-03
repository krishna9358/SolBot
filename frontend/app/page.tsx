"use client"
// import Navbar from "@/components/navbar"
// import Footer from "@/components/footer"
// import { Button } from "@/components/ui/button"
// import { SparklesCore } from "@/components/ui/aceternity/sparkles"
// import { Spotlight } from "@/components/ui/aceternity/spotlight"
// import Image from "next/image"
// import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card"
// import Link from "next/link"
import { useWallet } from "@solana/wallet-adapter-react"
import { useRouter } from "next/navigation"
import { VideoBackground } from "@/components/ui/video-background"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Twitter, BookOpen, ExternalLink } from "lucide-react"
import { RiTwitterXFill } from "react-icons/ri";

export default function Home() {
  const { connected } = useWallet()
  const router = useRouter()
  if(connected){
    router.push("/chat")
  }
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Video Background */}
      <VideoBackground />
      
      {/* Main Content */}
      <main className="relative z-10">
        {/* <Navbar /> */}

        {/* Hero Section */}
        <div className="container mx-auto px-4">
          <div className="flex flex-col justify-center min-h-screen relative">
            {/* Left container */}
            <div className="w-1/2 ml-0">
              <div className="text-center">
                <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-8 text-[#2596be]">
                  GAIA{" "}
                </h1>
                <p className="mt-6 text-xl text-[#2596be] max-w-2xl mx-auto leading-relaxed">
                  CHAT WITH GAIA, YOUR INTELLIGENT ASSISTANT FOR REAL-TIME INSHIGHTS, STRATEGY, AND AUTOMATION
                </p>

                {/* Enhanced CTA buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-12 justify-center">
                  {/* <Button
                    size="lg"
                    className="relative bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0 px-8 py-6 text-lg font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_8px_rgba(139,92,246,0.25)] rounded-xl group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600/80 to-blue-600/80 rounded-xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity"></div>
                    <a href="/chat" target="_blank" rel="noreferrer" className="relative z-10">
                      Try Beta →
                    </a>
                  </Button> */}

                  {/* <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-blue-500/20 hover:border-blue-500/40 bg-slate-950/50 backdrop-blur-sm text-blue-300 hover:text-blue-200 px-8 py-6 text-lg font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_8px_rgba(59,130,246,0.15)] rounded-xl"
                  >
                    Learn More
                  </Button> */}
                  <div className="bg-transparent border-1xl" style={{ border: '1px solid #2596be', borderRadius: '0.5rem' }} >
                    <WalletMultiButton style={{ backgroundColor: '#0c1434', color: '#2596be', border: '1px solid #2596be', borderRadius: '0.5rem' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
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
      </main>
    </div>
  )
}

