import "@/styles/globals.css"
import type { AppProps } from "next/app"
import React from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import Head from "next/head"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <Head>
        <title>MemoGo</title>
        <link rel="icon" href="/memogo-apple-touch-icon.png" />
        <link rel="apple-touch-icon" href="/memogo-apple-touch-icon.png" />
      </Head>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}