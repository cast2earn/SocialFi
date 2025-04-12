import { http, createConfig } from 'wagmi';
import { base, mainnet } from 'wagmi/chains';
import { farcasterFrame } from '@farcaster/frame-wagmi-connector';
import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient();

export const config = createConfig({
  chains: [base, mainnet],
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
  },
  connectors: [
    farcasterFrame()
  ]
});

export { queryClient }; 