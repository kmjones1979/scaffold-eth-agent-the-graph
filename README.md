# 🏗 Scaffold-ETH with AI Agent and The Graph Integration

<h4 align="center">
  <a href="https://docs.scaffoldeth.io">Documentation</a> |
  <a href="https://scaffoldeth.io">Website</a>
</h4>

🧪 An open-source toolkit for building decentralized applications (dapps) on the Ethereum blockchain, enhanced with AI-powered chat capabilities. Built using NextJS, RainbowKit, Foundry/Hardhat, Wagmi, Viem, TypeScript, and OpenAI.

## Features

-   ✅ **Contract Hot Reload**: Your frontend auto-adapts to your smart contract as you edit it
-   🤖 **AI-Powered Chat Interface**: Natural language interaction with blockchain data and smart contracts
-   📊 **GraphQL Integration**: Query blockchain data through The Graph protocol
-   🪝 **[Custom hooks](https://docs.scaffoldeth.io/hooks/)**: Collection of React hooks wrapper around [wagmi](https://wagmi.sh/)
-   🧱 [**Components**](https://docs.scaffoldeth.io/components/): Collection of common web3 components
-   🔥 **Burner Wallet & Local Faucet**: Quickly test your application
-   🔐 **Integration with Wallet Providers**: Connect to different wallet providers

This is a fork of a build [Scaffold-ETH 2 Chat Agent Extension](https://github.com/azf20/chat-agent-extension) by [Adam Fuller](https://github.com/azf20) that showcases a basic static implementation of The Graph using AgentKit Action providers.

## Requirements

Before you begin, you need to install the following tools:

-   [Node (>= v20.18.3)](https://nodejs.org/en/download/)
-   Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
-   [Git](https://git-scm.com/downloads)

## Quickstart

1. Clone the repository:

```bash
git clone https://github.com/kmjones1979/scaffold-eth-agent-the-graph.git
cd scaffold-eth-agent-the-graph
```

2. Install dependencies:

```bash
yarn install
```

3. Set up environment variables in `.env.local`:

```bash
# The Graph Protocol API Key
GRAPH_API_KEY=your-graph-api-key-here

# OpenAI API Key
OPENAI_API_KEY=your-openai-api-key-here

# NextAuth Secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your-nextauth-secret-here

# Agent Private Key
AGENT_PRIVATE_KEY=your-agent-private-key-here
```

4. Start a local network:

```bash
yarn chain
```

5. Deploy test contracts:

```bash
yarn deploy
```

6. Start the NextJS app:

```bash
yarn start
```

Visit `http://localhost:3000` to interact with your application.

## Architecture

### Core Components

1. **Chat Interface**

    - Natural language processing with OpenAI
    - Real-time streaming responses
    - Transaction hash linking
    - Error handling and recovery

2. **AgentKit Integration**

    - Blockchain interactions through predefined actions
    - Smart contract interactions
    - Wallet operations
    - GraphQL queries

3. **GraphQL Integration**
    - Query blockchain data through The Graph
    - Support for multiple subgraphs
    - Real-time data access
    - Error handling

### Key Files

1. **GraphQL Query Handler** (`utils/chat/agentkit/action-providers/graph-querier.ts`)

    ```typescript
    // Core functionality for querying The Graph protocol
    export class GraphQuerierProvider
        implements ActionProvider<WalletProvider>
    {
        // Pre-configured subgraph endpoints with API key management
        SUBGRAPH_ENDPOINTS = {
            UNISWAP_V3: () =>
                `https://gateway.thegraph.com/api/${apiKey}/subgraphs/id/${UNISWAP_V3_SUBGRAPH_ID}`,
            AAVE_V3: () =>
                `https://gateway.thegraph.com/api/${apiKey}/subgraphs/id/${AAVE_V3_SUBGRAPH_ID}`,
        };

        // Type-safe schema for GraphQL queries
        graphQuerySchema = z.object({
            endpoint: z.string().or(z.function().returns(z.string())),
            query: z.string(),
            variables: z.record(z.any()).optional(),
        });

        // Main action for executing GraphQL queries
        getActions(walletProvider: WalletProvider) {
            return [
                {
                    name: "querySubgraph",
                    description: "Query a subgraph using GraphQL",
                    schema: graphQuerySchema,
                    invoke: async ({ endpoint, query, variables }) => {
                        // Handles query execution and error management
                    },
                },
            ];
        }
    }
    ```

    **Key Features:**

    - Implements AgentKit's `ActionProvider` interface for seamless integration
    - Manages subgraph endpoints with dynamic API key injection
    - Provides type-safe GraphQL query execution using Zod schemas
    - Handles both static and dynamic endpoint URLs
    - Includes comprehensive error handling and response formatting
    - Supports query variables for dynamic data fetching

2. **Chat API Route** (`app/api/chat/route.ts`)

    ```typescript
    export async function POST(req: Request) {
        // Authentication check using SIWE
        const session = await getServerSession(
            siweAuthOptions({ chain: foundry })
        );

        // Initialize AgentKit with all required providers
        const { agentKit, address } = await createAgentKit();

        // Configure system prompt with available tools and endpoints
        const prompt = `
        You are a helpful assistant...
        Available endpoints: ${SUBGRAPH_ENDPOINTS}
        Example queries...
      `;

        // Stream responses using OpenAI with AgentKit tools
        const result = streamText({
            model: openai("gpt-4"),
            messages,
            system: prompt,
            tools: getTools(agentKit),
        });
    }
    ```

    **Key Features:**

    - Handles chat requests with SIWE authentication
    - Initializes AgentKit with GraphQL and contract providers
    - Configures system prompts with available tools and endpoints
    - Streams responses using OpenAI's streaming API
    - Integrates with Next.js API routes for serverless deployment
    - Manages chat context and conversation history
    - Provides real-time response streaming

3. **Chat Interface** (`app/chat/page.tsx`)

    ```typescript
    export default function Chat() {
        // Chat state management with max steps limit
        const { messages, input, handleInputChange, handleSubmit, status } =
            useChat({
                maxSteps: 10,
            });

        // Message rendering with markdown and tool call support
        const renderMessage = (m: any) => {
            const textParts = m.parts.filter((p) => p.type === "text");
            const toolParts = m.parts.filter(
                (p) => p.type === "tool-invocation"
            );

            return (
                <>
                    {textParts.map((part) => (
                        <ReactMarkdown>{part.text}</ReactMarkdown>
                    ))}
                    <MessageToolCalls toolParts={toolParts} />
                </>
            );
        };

        // Responsive chat interface with auto-scroll
        return (
            <div className="flex flex-col w-full max-w-md mx-auto h-[600px]">
                <div className="messages-container">
                    {messages.map((m) => (
                        <div className="message">{renderMessage(m)}</div>
                    ))}
                </div>
                <ChatInput onSubmit={handleSubmit} />
            </div>
        );
    }
    ```

    **Key Features:**

    - Client-side chat interface with real-time updates
    - Message streaming with markdown rendering
    - Tool call visualization for GraphQL queries
    - Auto-scrolling message container
    - Status indicators for query progress
    - Responsive design with mobile support
    - Input handling with submission controls
    - Error state management and display

### Component Interaction

1. **Data Flow Between Components**

    ```
    Chat Interface (page.tsx)
    ↓ Sends user message
    API Route (route.ts)
    ↓ Processes with OpenAI
    ↓ Initializes AgentKit
    GraphQL Handler (graph-querier.ts)
    ↓ Executes queries
    ↓ Returns results
    API Route
    ↓ Streams response
    Chat Interface
    ↓ Renders result
    ```

2. **State Management**

    - Chat state managed by `useChat` hook
    - AgentKit state handled in API route
    - GraphQL query state managed by provider
    - Real-time updates through streaming

3. **Error Handling Chain**
    - UI errors caught in chat interface
    - API errors handled in route handler
    - GraphQL errors managed in query provider
    - Comprehensive error propagation

### Data Flow

1. **User Interaction**

    - User types message in chat interface
    - Message is sent to API route
    - SIWE authentication is verified

2. **Query Processing**

    - OpenAI processes natural language
    - AgentKit determines required actions
    - GraphQL queries are constructed
    - Subgraph endpoints are called

3. **Response Generation**
    - Data is formatted and processed
    - Markdown is rendered
    - Tool calls are displayed
    - UI updates in real-time

### Key Features

1. **Type Safety**

    - Zod schemas for query validation
    - TypeScript interfaces for responses
    - Runtime type checking

2. **Error Handling**

    - Graceful error recovery
    - User-friendly error messages
    - Request retry logic

3. **Performance**

    - Streaming responses
    - Efficient message rendering
    - Optimized re-renders

4. **Security**
    - SIWE authentication
    - API key management
    - Input sanitization

### Available Subgraphs

The integration includes several pre-configured subgraph endpoints:

```typescript
{
  UNISWAP_V3: "https://gateway.thegraph.com/api/{api-key}/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV",
  AAVE_V3: "https://gateway.thegraph.com/api/{api-key}/subgraphs/id/JCNWRypm7FYwV8fx5HhzZPSFaMxgkPuw4TnR3Gpi81zk"
}
```

### Adding New Subgraph Endpoints

Here's a step-by-step guide to add a new subgraph endpoint (e.g., Compound Finance):

1. **Add Subgraph ID Constant**

    ```typescript
    // In utils/chat/agentkit/action-providers/graph-querier.ts
    const COMPOUND_V3_SUBGRAPH_ID =
        "AwoxEZbiWLvv6e3QdvdMZw4WDURdGbvPfHmZRc8Dpfz9";
    ```

2. **Add Endpoint to SUBGRAPH_ENDPOINTS**

    ```typescript
    export const SUBGRAPH_ENDPOINTS: Record<string, string | EndpointGetter> = {
        // ... existing endpoints ...
        COMPOUND_V3: () => {
            const apiKey = process.env.GRAPH_API_KEY;
            if (!apiKey)
                throw new Error(
                    "GRAPH_API_KEY not found in environment variables"
                );
            return `https://gateway.thegraph.com/api/${apiKey}/subgraphs/id/${COMPOUND_V3_SUBGRAPH_ID}`;
        },
    };
    ```

3. **Update System Prompt**

    ```typescript
    // In app/api/chat/route.ts
    const compoundEndpoint =
        typeof SUBGRAPH_ENDPOINTS.COMPOUND_V3 === "function"
            ? SUBGRAPH_ENDPOINTS.COMPOUND_V3()
            : SUBGRAPH_ENDPOINTS.COMPOUND_V3;

    const prompt = `
      // ... existing prompt content ...
    
      For Compound V3, use this exact endpoint:
      "${compoundEndpoint}"
    
      Example GraphQL query for Compound V3:
      {
        endpoint: "${compoundEndpoint}",
        query: \`query {
          tokens(first: 5, orderBy: lastPriceBlockNumber, orderDirection: desc) {
            id
            name
            symbol
            decimals
          }
          rewardTokens(
            first: 5
            orderBy: token__lastPriceBlockNumber
            orderDirection: desc
          ) {
            id
            token {
              id
            }
            type
          }
        }\`
      }
    `;
    ```

4. **Add Example Queries**

    ```typescript
    // In utils/chat/tools.ts
    export const querySubgraph = {
        // ... existing configuration ...
        examples: [
            // ... existing examples ...
            {
                name: "Compound V3 Tokens",
                description: "Query Compound V3 token information",
                query: `query {
            tokens(first: 5, orderBy: lastPriceBlockNumber, orderDirection: desc) {
              id
              name
              symbol
              decimals
            }
            rewardTokens(
              first: 5
              orderBy: token__lastPriceBlockNumber
              orderDirection: desc
            ) {
              id
              token {
                id
              }
              type
            }
          }`,
                endpoint: "COMPOUND_V3",
            },
        ],
    };
    ```

5. **Test the Integration**

    ```typescript
    // Test query in chat interface
    User: "Show me the top 5 Compound V3 tokens"
    AI: [Executes GraphQL query and formats response]
    ```

6. **Error Handling**

    ```typescript
    // In graph-querier.ts
    invoke: async ({ endpoint, query, variables = {} }) => {
        try {
            const resolvedEndpoint =
                typeof endpoint === "function" ? endpoint() : endpoint;

            // Add specific error handling for Compound V3
            if (resolvedEndpoint.includes(COMPOUND_V3_SUBGRAPH_ID)) {
                // Add any Compound-specific error handling
            }

            const response = await fetch(resolvedEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query, variables }),
            });

            if (!response.ok)
                throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            return JSON.stringify(data);
        } catch (error) {
            return JSON.stringify({
                error:
                    error instanceof Error
                        ? error.message
                        : "An unknown error occurred",
            });
        }
    };
    ```

7. **Documentation**

    - Update README with new endpoint information
    - Add example queries
    - Document any specific error cases
    - Include rate limiting considerations

8. **Best Practices**

    - Use pagination for large result sets
    - Implement proper error handling
    - Cache responses when appropriate
    - Monitor API usage
    - Test with various query parameters
    - Validate response data

9. **Testing Checklist**
    - [ ] Verify API key access
    - [ ] Test basic queries
    - [ ] Check error handling
    - [ ] Validate response format
    - [ ] Test pagination
    - [ ] Verify rate limiting
    - [ ] Check caching behavior
    - [ ] Test with different parameters

## Detailed Setup Guide

### Environment Variables

1. **GRAPH_API_KEY**

    - Visit [The Graph Studio](https://thegraph.com/studio/)
    - Create an account
    - Go to "My API Keys"
    - Create a new API key
    - ⚠️ Use a development key with limited permissions

2. **OPENAI_API_KEY**

    - Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
    - Create an account or sign in
    - Create a new API key
    - ⚠️ Set up usage limits to prevent unexpected charges

3. **NEXTAUTH_SECRET**

    - Generate a random string:

    ```bash
    openssl rand -base64 32
    ```

    - ⚠️ Keep this secret secure and unique per environment

4. **AGENT_PRIVATE_KEY**
    - ⚠️ **IMPORTANT**: This is for development only. Never use mainnet keys!
    - For testing, generate a new private key:
    ```bash
    openssl rand -hex 32
    ```
    - Must be prefixed with "0x"
    - ⚠️ Store minimal funds for testing
    - ⚠️ Never commit this key to version control

### Security Best Practices

-   Never commit `.env.local` to version control
-   Keep private keys secure
-   Use dedicated development keys only
-   Rotate keys regularly
-   Store minimal funds in development keys
-   Use air-gapped devices for key generation in production
-   Implement rate limiting for API endpoints
-   Monitor API usage and set up alerts
-   Regular security audits recommended

⚠️ **IMPORTANT SECURITY NOTICE**:
This code is not audited and is intended for development and learning purposes only.

-   Do not use in production without a security audit
-   Do not store significant funds in development keys
-   Do not expose API keys or private keys
-   Use at your own risk!

## Usage Examples

### Chat Interface

1. **Querying Uniswap Pools**

```
User: "Show me the top 5 Uniswap pools by volume"
AI: [Executes GraphQL query and formats response]
```

2. **Contract Interactions**

```
User: "What was the last amount borrowed on Aave?"
AI: [Queries for the borrows and responds]
```

### GraphQL Queries

Example query for Uniswap V3 pools:

```graphql
query {
    pools(first: 100, orderBy: createdAtTimestamp, orderDirection: desc) {
        id
        token0 {
            symbol
        }
        token1 {
            symbol
        }
        volumeUSD
        createdAtTimestamp
    }
}
```

Example query for Aave V3 borrows:

```graphql
query {
    borrows(first: 100, orderBy: timestamp, orderDirection: desc) {
        amount
        amountUSD
        asset {
            name
            symbol
        }
    }
}
```

Example error response:

```json
{
    "errors": [
        {
            "message": "Invalid API key",
            "locations": [],
            "path": [],
            "extensions": {
                "code": "UNAUTHORIZED"
            }
        }
    ]
}
```

### Rate Limiting and Best Practices

1. **Query Optimization**

    - Use pagination for large result sets
    - Limit the number of fields requested
    - Cache responses when appropriate
    - Use variables for dynamic values

2. **Error Handling**

    - Always check for error responses
    - Implement retry logic with backoff
    - Log errors for debugging
    - Provide user-friendly error messages

3. **Performance**
    - Monitor query execution time
    - Use appropriate indexes
    - Implement request batching
    - Cache frequently accessed data

## Development Guidelines

### Adding New Actions

1. Implement ActionProvider interface
2. Add to AgentKit configuration
3. Update system prompts
4. Include error handling

### Customizing Responses

1. Format data appropriately
2. Include relevant links
3. Handle edge cases
4. Provide helpful context

### Testing

1. Unit test actions
2. Integration test flows
3. End-to-end chat testing
4. Error scenario testing

## Troubleshooting

### Common Issues

1. **API Key Errors**

    - Verify environment variables are set
    - Check API key validity
    - Ensure sufficient credits

2. **Authentication Errors**

    - Verify SIWE sign-in
    - Check session validity
    - Review NextAuth configuration

3. **Query Errors**
    - Validate GraphQL syntax
    - Check subgraph schema
    - Verify variable formatting

## Contributing

We welcome contributions! Please see [CONTRIBUTING.MD](https://github.com/scaffold-eth/scaffold-eth-2/blob/main/CONTRIBUTING.md) for guidelines.

## Documentation

For more detailed information, visit our [documentation](https://docs.scaffoldeth.io).
