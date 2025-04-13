"use client"

import { FC, ReactNode } from 'react'
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { clusterApiUrl, Connection, Commitment } from '@solana/web3.js'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import { useMemo } from 'react'

require('@solana/wallet-adapter-react-ui/styles.css')

export const ClientWalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // Use Alchemy's reliable RPC endpoint for mainnet-beta
  const endpoint = useMemo(() => 'https://solana-mainnet.g.alchemy.com/v2/5ETFAi8S-JJT8YebLcaXZk1eLx8TDvRK', [])
  
  // Configure connection with better reliability settings
  const connectionConfig = useMemo(() => ({
    commitment: 'confirmed' as Commitment,
    confirmTransactionInitialTimeout: 60000, // 60 seconds
    disableRetryOnRateLimit: false,
  }), [])
  
  const wallets = useMemo(() => [new PhantomWalletAdapter()], [])

  return (
    <ConnectionProvider endpoint={endpoint} config={connectionConfig}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}