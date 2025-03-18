import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.1] bg-slate-950/50 backdrop-blur-xl transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-gradient-to-r from-violet-600 to-blue-600 p-2 rounded-xl shadow-[0_0_20px_2px_rgba(139,92,246,0.3)] transition-all duration-300 group-hover:shadow-[0_0_30px_4px_rgba(139,92,246,0.4)]">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-200 to-blue-200">
                Solbot
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/documentation" className="text-blue-100/70 hover:text-blue-100 transition-colors duration-200">
              Documentation
            </Link>
            <Link href="/community" className="text-blue-100/70 hover:text-blue-100 transition-colors duration-200">
              Community
            </Link>
            <Button className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all duration-300 rounded-xl">
              <a href="/chat" target="_blank" rel="noreferrer" className="px-2">
                Launch App
              </a>
            </Button>
          </div>

          <div className="md:hidden">
            <Button
              className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500"
              size="sm"
            >
              <a href="/chat" target="_blank" rel="noreferrer">
                Launch
              </a>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

