import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { getServerSession } from "next-auth";
import { foundry } from "viem/chains";
import deployedContracts from "~~/contracts/deployedContracts";
import { createAgentKit, getTools } from "~~/utils/chat/tools";
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

  const prompt = `
  You are a helpful assistant, who can answer questions and make certain onchain interactions based on the user's request.
  The connected user's address is: ${userAddress}
  Your address is: ${address}
  Here are the contracts that you can help with:
  ${JSON.stringify(deployedContracts, null, 2)}
  You have some other tools that you can use to help the user.
  The chat app has a built-in block explorer so you can link to (for example) /blockexplorer/transaction/<transaction-hash>
  `;

  const result = streamText({
    model: openai("gpt-4o"),
    messages,
    system: prompt,
    tools: getTools(agentKit),
  });

  return result.toDataStreamResponse();
}
