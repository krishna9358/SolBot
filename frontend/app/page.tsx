import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { SparklesCore } from "@/components/ui/aceternity/sparkles"
import { Spotlight } from "@/components/ui/aceternity/spotlight"
import Image from "next/image"
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card"
import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950/20 to-slate-950 ">
      <Navbar />

      {/* Hero Section */}
      <div className="container mx-auto px-4 mt-28" >
        <div className="flex flex-col items-center justify-center min-h-screen text-center relative">
          {/* Sparkles effect */}
          <div className="w-full absolute inset-0">
            <SparklesCore
              id="tsparticlesfullpage"
              background="transparent"
              minSize={0.6}
              maxSize={1.4}
              particleDensity={100}
              className="w-full h-full"
              particleColor="#60A5FA"
            />
          </div>

          {/* Hero content */}
          <Spotlight className="relative z-10 max-w-4xl mx-auto" color="blue">
            <div className="text-center">
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
              <p className="mt-6 text-xl text-blue-100/80 max-w-3xl mx-auto leading-relaxed">
                Chat with Solbot to discover insights, analyze data, and manage your workflow - all in one intuitive
                interface.
              </p>

              {/* Enhanced CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-12 justify-center items-center">
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
          </Spotlight>

          {/* Hero Image */}
          <CardContainer className="inter-var w-full h-[650px] max-w-6xl mx-auto shadow-[0_0_40px_8px_rgba(139,92,246,0.15)] mb-28 mt-28">
      <CardBody className="relative group/card dark:hover:shadow-2xl dark:hover:shadow-blue-500/[0.1] w-full h-[650px] rounded-xl p-0 border-0 overflow-hidden">
        <CardItem translateZ="100" className="w-full">
          <Link href="/chat" target="_blank" className="block w-full">
            <div className="relative w-full  aspect-[16/9] overflow-hidden rounded-xl">
              <Image
                src="/home.jpeg"
                height="880"
                width="1520"
                className="w-full h-full   transition-transform duration-500 group-hover/card:scale-105"
                alt="Chat interface preview"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-80 "></div>
              <div className="absolute bottom-8 left-8 right-8">
                <div className="bg-gradient-button text-white font-semibold py-3 px-6 rounded-lg text-center ">
                <Button className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white px-8 py-6 text-lg font-medium rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_8px_rgba(139,92,246,0.25)]">
                    <a href="/chat" target="_blank" rel="noreferrer">
                      Launch App
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </Link>
        </CardItem>
      </CardBody>
    </CardContainer>

        </div>



        {/* Feature cards
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto pb-32 px-4">
          <div className="group relative overflow-hidden rounded-2xl border border-white/[0.1] bg-slate-950/50 backdrop-blur-sm p-8 transition-all duration-300 hover:shadow-[0_0_40px_8px_rgba(139,92,246,0.15)]">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-4">Advanced AI Technology</h3>
              <p className="text-blue-100/80">
                Experience state-of-the-art natural language processing and real-time responses powered by cutting-edge
                machine learning.
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-white/[0.1] bg-slate-950/50 backdrop-blur-sm p-8 transition-all duration-300 hover:shadow-[0_0_40px_8px_rgba(139,92,246,0.15)]">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-4">Seamless Integration</h3>
              <p className="text-blue-100/80">
                Easily integrate with your favorite apps and workflows for maximum productivity and efficiency.
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div> */}
      </div>
      <Footer />
    </main>
  )
}

