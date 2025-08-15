import { http, cookieStorage, createConfig, createStorage } from 'wagmi';
import { polygon } from 'wagmi/chains';
import { coinbaseWallet, injected, walletConnect } from '@wagmi/connectors';
import { createWeb3Modal } from '@web3modal/wagmi';

// Declare w3m-button web component for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'w3m-button': {
        label?: string;
        balance?: 'show' | 'hide';
        loadingLabel?: string;
        style?: React.CSSProperties;
        class?: string;
      };
    }
  }
}

export const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || '';

if (!projectId) {
  throw new Error('NEXT_PUBLIC_WC_PROJECT_ID is not set in .env');
}

export const config = createConfig({
  chains: [polygon],
  connectors: [
    injected({ target: 'metaMask' }),
    coinbaseWallet({ appName: 'Token Price Dashboard' }),
    walletConnect({ projectId }),
  ],
  ssr: true,
  transports: {
    [polygon.id]: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://polygon-rpc.com'),
  },
});

export const web3Modal = createWeb3Modal({
  wagmiConfig: config,
  projectId,
  chains: [polygon],
  enableAnalytics: true,
  enableOnramp: true,
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}