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
  2. You can query The Graph protocol subgraphs using the querySubgraph action
  3. You can check balances using the contract interactor:
     - For native token balance: Use the "getBalance" action with the user's address
     - For ERC20 token balances: Use the "getBalance" action with the token contract address and user's address

  Example balance queries:
  - Check native token balance: getBalance({ address: "${userAddress}" })
  - Check ERC20 token balance: getBalance({ address: "${userAddress}", tokenAddress: "0x..." })

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

  try {
    console.log("[api/chat] Calling streamText with AI SDK..."); // Log 6: Before calling AI
    const result = await streamText({
      model: openai("gpt-4-turbo-preview"),
      system: prompt,
      messages,
      tools: getTools(agentKit),
    });
    console.log("[api/chat] streamText initial call completed."); // Log 7a: After initial AI call returns stream object

    // --- DEBUG: Log stream parts using async iterator ---
    let loggedToolCalls = 0;
    let loggedText = "";
    console.log("[api/chat] Reading stream parts...");
    for await (const part of result.fullStream) {
      // Use fullStream or potentially another iterator if available
      switch (part.type) {
        case "text-delta":
          // console.log("[api/chat] Stream part: text-delta:", part.textDelta);
          loggedText += part.textDelta;
          break;
        case "tool-call":
          console.log(
            "[api/chat] Stream part: tool-call: ID:",
            part.toolCallId,
            "Name:",
            part.toolName,
            "Args:",
            JSON.stringify(part.args),
          );
          loggedToolCalls++;
          break;
        case "tool-result":
          console.log("[api/chat] Stream part: tool-result:", JSON.stringify(part.result));
          break;
        case "error":
          console.error("[api/chat] Stream part: error:", part.error);
          break;
        // Handle other part types if necessary (e.g., 'finish')
        case "finish":
          console.log("[api/chat] Stream part: finish. Reason:", part.finishReason, "Usage:", part.usage);
          break;
        default:
          // console.log("[api/chat] Stream part: other type:", part.type);
          break;
      }
    }
    console.log(
      `[api/chat] Finished reading stream. Logged ${loggedToolCalls} tool calls. Logged text length: ${loggedText.length}`,
    );
    // --- END DEBUG ---

    // Re-execute to get a fresh stream for the actual response
    console.log("[api/chat] Re-executing streamText to return response...");
    const finalResult = await streamText({
      model: openai("gpt-4-turbo-preview"),
      system: prompt,
      messages,
      tools: getTools(agentKit),
    });

    // Use toDataStreamResponse as indicated by the linter error
    return finalResult.toDataStreamResponse();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[api/chat] Error in POST handler: ${errorMessage}`, error); // Log 8: Catching errors
    return new Response(`Error processing request: ${errorMessage}`, { status: 500 });
  }
}
