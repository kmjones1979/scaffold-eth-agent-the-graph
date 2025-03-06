import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { getServerSession } from "next-auth";
import { foundry } from "viem/chains";
import deployedContracts from "~~/contracts/deployedContracts";
import { SUBGRAPH_ENDPOINTS, createAgentKit, getTools } from "~~/utils/chat/tools";
import { siweAuthOptions } from "~~/utils/scaffold-eth/auth";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const session = (await getServerSession(siweAuthOptions({ chain: foundry }))) as any;
  const userAddress = session?.user?.address;

  if (!userAddress) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages } = await req.json();
  const { agentKit, address } = await createAgentKit();

  const uniswapEndpoint =
    typeof SUBGRAPH_ENDPOINTS.UNISWAP_V3 === "function"
      ? SUBGRAPH_ENDPOINTS.UNISWAP_V3()
      : SUBGRAPH_ENDPOINTS.UNISWAP_V3;

  const aaveEndpoint =
    typeof SUBGRAPH_ENDPOINTS.AAVE_V3 === "function" ? SUBGRAPH_ENDPOINTS.AAVE_V3() : SUBGRAPH_ENDPOINTS.AAVE_V3;

  const prompt = `
  You are a helpful assistant, who can answer questions and make certain onchain interactions based on the user's request.
  The connected user's address is: ${userAddress}
  Your address is: ${address}
  
  Here are the contracts that you can help with:
  ${JSON.stringify(deployedContracts, null, 2)}
  
  You have access to several tools:
  1. The chat app has a built-in block explorer so you can link to (for example) /blockexplorer/transaction/<transaction-hash>
  2. You can query The Graph protocol subgraphs using the querySubgraph action.

  For Uniswap V3, use this exact endpoint:
  "${uniswapEndpoint}"

  Example GraphQL query for Uniswap V3:
  {
    endpoint: "${uniswapEndpoint}",
    query: \`query {
      pools(first: 100, orderBy: createdAtTimestamp, orderDirection: desc) {
        id
        token0 { symbol }
        token1 { symbol }
        volumeUSD
        createdAtTimestamp
      }
    }\`
  }

  For Aave V3, use this exact endpoint:
  "${aaveEndpoint}"

  Example GraphQL query for Aave V3:
  {
    endpoint: "${aaveEndpoint}",
    query: \`query {
      borrows(first: 100, orderBy: timestamp, orderDirection: desc) {
        amount
        amountUSD
        asset {
          name
          symbol
        }
      }
    }\`
}

  Other available subgraph endpoints:
  ${Object.entries(SUBGRAPH_ENDPOINTS)
    .filter(([key]) => key !== "UNISWAP_V3")
    .map(([key, value]) => `${key}: ${typeof value === "function" ? "(function)" : value}`)
    .join("\n")}
  `;

  const result = streamText({
    model: openai("gpt-4o"),
    messages,
    system: prompt,
    tools: getTools(agentKit),
  });

  return result.toDataStreamResponse();
}
