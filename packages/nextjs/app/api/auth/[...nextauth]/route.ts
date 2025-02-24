import { mainnet } from "viem/chains";
import { NextAuthHandler } from "~~/components/scaffold-eth/NextAuthHandler";

const handler = NextAuthHandler({
  chain: mainnet,
  onSuccess: async (address: string) => {
    return {
      customGreeting: `Welcome ${address.slice(0, 6)}...${address.slice(-4)}! 👋`,
      signedInAt: new Date().toISOString(),
    };
  },
});

export { handler as GET, handler as POST };
