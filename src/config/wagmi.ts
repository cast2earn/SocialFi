import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { farcasterFrame } from '@farcaster/frame-wagmi-connector';
import { QueryClient } from '@tanstack/react-query';

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}

const queryClient = new QueryClient();

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  connectors: [
    farcasterFrame()
  ],
  multiInjectedProviderDiscovery: false
});

export { queryClient }; 