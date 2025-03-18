"use client"

import { useEffect, useState } from "react"
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card"
import Image from "next/image"
import Link from "next/link"

export default function HeroCard() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <CardContainer className="inter-var w-full">
      <CardBody className="relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] w-full h-auto rounded-xl p-0 border-0 overflow-hidden">
        <CardItem translateZ="100" className="w-full">
          <Link href="/chat" target="_blank" className="block w-full">
            <div className="relative w-full aspect-[16/9] overflow-hidden rounded-xl">
              <Image
                src="/placeholder.svg?height=1080&width=1920"
                height="1080"
                width="1920"
                className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                alt="Chat interface preview"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-90"></div>
              <div className="absolute bottom-8 left-8 right-8">
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg text-center transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/25">
                  Launch App
                </div>
              </div>
            </div>
          </Link>
        </CardItem>
      </CardBody>
    </CardContainer>
  )
}

