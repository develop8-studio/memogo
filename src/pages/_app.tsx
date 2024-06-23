import "@/styles/globals.css"
import type { AppProps } from "next/app"
import React from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import Head from "next/head"
import Navbar from "@/components/Navbar"
import Image from "next/image"
import SideBar from "@/components/SideBar"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <Head>
        <title>MemoGo</title>
        <link rel="icon" href="/memogo.png" />
        <link rel="apple-touch-icon" href="/memogo.png" />
      </Head>
      {/* <Navbar /> */}
      <div className="flex w-full">
        <SideBar />
        <Component {...pageProps} />
      </div>
    </ChakraProvider>
  )
}