"use client"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { SparklesCore } from "@/components/ui/aceternity/sparkles"
import { Spotlight } from "@/components/ui/aceternity/spotlight"
import Image from "next/image"
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card"
import Link from "next/link"
import { useWallet } from "@solana/wallet-adapter-react"
import { useRouter } from "next/navigation"
import { VideoBackground } from "@/components/ui/video-background"

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
        <Navbar />

        {/* Hero Section */}
        <div className="container mx-auto px-4 ">
          <div className="flex flex-col justify-center min-h-screen relative ml-10">
            {/* Sparkles effect */}
            {/* <div className="w-full absolute inset-0">
              <SparklesCore
                id="tsparticlesfullpage"
                background="transparent"
                minSize={0.6}
                maxSize={1.4}
                particleDensity={100}
                className="w-full h-full"
                particleColor="#60A5FA"
              />
            </div> */}

            {/* Hero content */}
            {/* <Spotlight className="relative z-10 " color="blue"> */}
              <div className="text-left">
                <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-8">
                  Your{" "}
                  <span className="inline-flex animate-background-shine bg-[linear-gradient(110deg,#6366f1,45%,#a5b4fc,55%,#6366f1)] bg-[length:250%_100%] bg-clip-text text-transparent">
                    AI Assistant
                  </span>{" "}
                  for
                  <br />
                  <span className="relative">
                    <span className="absolute inset-0 bg-gradient-to-r from-violet-600 to-blue-600 blur-2xl opacity-20"></span>
                    <span className="relative text-white">Powerful Insights</span>
                  </span>
                </h1>
                <p className="mt-6 text-xl text-blue-100/80 max-w-3xl leading-relaxed">
                  Chat with Solbot to discover insights, analyze data, and manage your workflow - all in one intuitive
                  interface.
                </p>

                {/* Enhanced CTA buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-12 items-start">
                  <Button
                    size="lg"
                    className="relative bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0 px-8 py-6 text-lg font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_8px_rgba(139,92,246,0.25)] rounded-xl group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600/80 to-blue-600/80 rounded-xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity"></div>
                    <a href="/chat" target="_blank" rel="noreferrer" className="relative z-10">
                      Try Beta →
                    </a>
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-blue-500/20 hover:border-blue-500/40 bg-slate-950/50 backdrop-blur-sm text-blue-300 hover:text-blue-200 px-8 py-6 text-lg font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_8px_rgba(59,130,246,0.15)] rounded-xl"
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            {/* </Spotlight> */}
          </div>
        </div>
        {/* <Footer /> */}
      </main>
    </div>
  )
}

