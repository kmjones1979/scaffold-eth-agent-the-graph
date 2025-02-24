import { contractInteractor } from "./agentkit/action-providers/contract-interactor";
import { agentKitToTools } from "./agentkit/framework-extensions/ai-sdk";
import { AgentKit, ViemWalletProvider, walletActionProvider } from "@coinbase/agentkit";
import { tool } from "ai";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { foundry } from "viem/chains";
import { z } from "zod";

export async function createAgentKit() {
  const walletClient = createWalletClient({
    account: privateKeyToAccount(process.env.AGENT_PRIVATE_KEY as `0x${string}`),
    chain: foundry,
    transport: http(),
  });
  const viemWalletProvider = new ViemWalletProvider(walletClient as any);

  const agentKit = await AgentKit.from({
    walletProvider: viemWalletProvider,
    actionProviders: [walletActionProvider(), contractInteractor(foundry.id)],
  });

  return { agentKit, address: walletClient.account.address };
}

export function getTools(agentKit: AgentKit) {
  const tools = agentKitToTools(agentKit);

  return {
    ...tools,
    showTransaction: tool({
      description: "Show the transaction hash",
      parameters: z.object({
        transactionHash: z.string().describe("The transaction hash to show"),
      }),
      execute: async ({ transactionHash }) => {
        return {
          transactionHash,
        };
      },
    }),
  };
}
