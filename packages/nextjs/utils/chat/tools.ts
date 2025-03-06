import { contractInteractor } from "./agentkit/action-providers/contract-interactor";
import { SUBGRAPH_ENDPOINTS, graphQuerierProvider } from "./agentkit/action-providers/graph-querier";
import { agentKitToTools } from "./agentkit/framework-extensions/ai-sdk";
import { AgentKit, ViemWalletProvider, walletActionProvider } from "@coinbase/agentkit";
import { tool } from "ai";
import fetch from "node-fetch";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { foundry } from "viem/chains";
import { z } from "zod";

export { SUBGRAPH_ENDPOINTS };

export async function createAgentKit() {
  const walletClient = createWalletClient({
    account: privateKeyToAccount(process.env.AGENT_PRIVATE_KEY as `0x${string}`),
    chain: foundry,
    transport: http(),
  });
  const viemWalletProvider = new ViemWalletProvider(walletClient as any);

  const agentKit = await AgentKit.from({
    walletProvider: viemWalletProvider,
    actionProviders: [walletActionProvider(), contractInteractor(foundry.id), graphQuerierProvider()],
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
    getBalance: tool({
      description: "Get the balance of an Ethereum address",
      parameters: z.object({
        address: z.string().describe("The Ethereum address to query"),
        tokenAddress: z.string().optional().describe("Optional token address to query specific token balance"),
      }),
      execute: async ({ address, tokenAddress }) => {
        try {
          const actions = agentKit.getActions();

          if (tokenAddress) {
            // ERC20 balance check
            const readContractAction = actions.find(action => action.name === "ContractInteractor_read-contract");
            if (!readContractAction) {
              throw new Error("Read contract action not found");
            }

            const result = await readContractAction.invoke({
              address: tokenAddress,
              abi: ["function balanceOf(address) view returns (uint256)"],
              functionName: "balanceOf",
              args: [address],
            });
            return {
              address,
              tokenAddress,
              balance: result.toString(),
              type: "ERC20",
            };
          } else {
            // Native token balance check
            const walletDetailsAction = actions.find(
              action => action.name === "WalletActionProvider_get_wallet_details",
            );
            if (!walletDetailsAction) {
              throw new Error("Wallet details action not found");
            }

            const result = await walletDetailsAction.invoke({ address });
            // Parse the native balance from the response
            const balanceMatch = result.match(/Native Balance: (\d+) WEI/);
            if (!balanceMatch) {
              throw new Error("Could not parse native balance from response");
            }
            const balance = balanceMatch[1];

            return {
              address,
              balance,
              type: "NATIVE",
            };
          }
        } catch (error) {
          return {
            error: error instanceof Error ? error.message : "An unknown error occurred",
          };
        }
      },
    }),
  };
}

export const querySubgraph = {
  name: "querySubgraph",
  description: "Query a subgraph using GraphQL",
  parameters: {
    type: "object",
    properties: {
      endpoint: {
        type: "string",
        description: "The subgraph endpoint URL",
      },
      query: {
        type: "string",
        description: "The GraphQL query string",
      },
      variables: {
        type: "object",
        description: "Optional variables for the GraphQL query",
      },
    },
    required: ["endpoint", "query"],
  },
  async handler({
    endpoint,
    query,
    variables = {},
  }: {
    endpoint: string;
    query: string;
    variables?: Record<string, any>;
  }) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        return { error: error.message };
      }
      return { error: "An unknown error occurred" };
    }
  },
};
