# 🏗 Scaffold-ETH 2

<h4 align="center">
  <a href="https://docs.scaffoldeth.io">Documentation</a> |
  <a href="https://scaffoldeth.io">Website</a>
</h4>

🧪 An open-source, up-to-date toolkit for building decentralized applications (dapps) on the Ethereum blockchain. It's designed to make it easier for developers to create and deploy smart contracts and build user interfaces that interact with those contracts.

⚙️ Built using NextJS, RainbowKit, Foundry/Hardhat, Wagmi, Viem, and Typescript.

-   ✅ **Contract Hot Reload**: Your frontend auto-adapts to your smart contract as you edit it.
-   🪝 **[Custom hooks](https://docs.scaffoldeth.io/hooks/)**: Collection of React hooks wrapper around [wagmi](https://wagmi.sh/) to simplify interactions with smart contracts with typescript autocompletion.
-   🧱 [**Components**](https://docs.scaffoldeth.io/components/): Collection of common web3 components to quickly build your frontend.
-   🔥 **Burner Wallet & Local Faucet**: Quickly test your application with a burner wallet and local faucet.
-   🔐 **Integration with Wallet Providers**: Connect to different wallet providers and interact with the Ethereum network.

![Debug Contracts tab](https://github.com/scaffold-eth/scaffold-eth-2/assets/55535804/b237af0c-5027-4849-a5c1-2e31495cccb1)

## Requirements

Before you begin, you need to install the following tools:

-   [Node (>= v20.18.3)](https://nodejs.org/en/download/)
-   Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
-   [Git](https://git-scm.com/downloads)

## Quickstart

To get started with Scaffold-ETH 2, follow the steps below:

1. Install the latest version of Scaffold-ETH 2

```
npx create-eth@latest
```

This command will install all the necessary packages and dependencies, so it might take a while.

> [!NOTE]
> You can also initialize your project with one of our extensions to add specific features or starter-kits. Learn more in our [extensions documentation](https://docs.scaffoldeth.io/extensions/).

2. Run a local network in the first terminal:

```
yarn chain
```

This command starts a local Ethereum network that runs on your local machine and can be used for testing and development. Learn how to [customize your network configuration](https://docs.scaffoldeth.io/quick-start/environment#1-initialize-a-local-blockchain).

3. On a second terminal, deploy the test contract:

```
yarn deploy
```

This command deploys a test smart contract to the local network. You can find more information about how to customize your contract and deployment script in our [documentation](https://docs.scaffoldeth.io/quick-start/environment#2-deploy-your-smart-contract).

4. On a third terminal, start your NextJS app:

```
yarn start
```

Visit your app on: `http://localhost:3000`. You can interact with your smart contract using the `Debug Contracts` page. You can tweak the app config in `packages/nextjs/scaffold.config.ts`.

**What's next**:

Visit the [What's next section of our docs](https://docs.scaffoldeth.io/quick-start/environment#whats-next) to learn how to:

-   Edit your smart contracts
-   Edit your deployment scripts
-   Customize your frontend
-   Edit the app config
-   Writing and running tests
-   [Setting up external services and API keys](https://docs.scaffoldeth.io/deploying/deploy-smart-contracts#configuration-of-third-party-services-for-production-grade-apps)

## Documentation

Visit our [docs](https://docs.scaffoldeth.io) to learn all the technical details and guides of Scaffold-ETH 2.

To know more about its features, check out our [website](https://scaffoldeth.io).

## Contributing to Scaffold-ETH 2

We welcome contributions to Scaffold-ETH 2!

Please see [CONTRIBUTING.MD](https://github.com/scaffold-eth/scaffold-eth-2/blob/main/CONTRIBUTING.md) for more information and guidelines for contributing to Scaffold-ETH 2.

## GraphQL Integration

This project includes a powerful GraphQL integration for querying blockchain data through The Graph protocol. The integration is built using AgentKit and provides a seamless way to query various subgraphs.

### Architecture

The GraphQL integration consists of three main components:

1. **GraphQuerierProvider** (`utils/chat/agentkit/action-providers/graph-querier.ts`)

    - Implements the AgentKit `ActionProvider` interface
    - Handles GraphQL queries to various subgraphs
    - Manages API keys and endpoint configuration
    - Provides error handling and response formatting

2. **Chat Route** (`app/api/chat/route.ts`)

    - Handles chat requests and responses
    - Integrates with OpenAI for natural language processing
    - Provides system prompts with GraphQL query examples
    - Manages user authentication via SIWE (Sign In With Ethereum)

3. **Tools Configuration** (`utils/chat/tools.ts`)
    - Sets up AgentKit with necessary providers
    - Configures wallet connections
    - Exports GraphQL query tools

### Available Subgraphs

The integration includes several pre-configured subgraph endpoints:

```typescript
{
  UNISWAP_V3: "https://gateway.thegraph.com/api/{api-key}/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV",
  AAVE_V3: "https://api.thegraph.com/subgraphs/name/aave/protocol-v3",
  ENS: "https://api.thegraph.com/subgraphs/name/ensdomains/ens",
  COMPOUND_V3: "https://api.thegraph.com/subgraphs/name/graphprotocol/compound-v3",
  LENS: "https://api.thegraph.com/subgraphs/name/lens-protocol/lens"
}
```

### Setup

1. Add your Graph API key to `.env.local`:

    ```
    GRAPH_API_KEY=your-api-key-here
    ```

2. The integration will automatically use the API key for authenticated endpoints like Uniswap V3.

### Required Environment Variables

The project requires several environment variables to be set in `.env.local`:

```bash
# The Graph Protocol API Key (required for Uniswap V3 and other protected subgraphs)
GRAPH_API_KEY=your-graph-api-key-here

# OpenAI API Key (required for chat functionality)
OPENAI_API_KEY=your-openai-api-key-here

# NextAuth Secret (required for SIWE authentication)
# Generate a random string using: openssl rand -base64 32
NEXTAUTH_SECRET=your-nextauth-secret-here

# Agent Private Key (required for blockchain interactions)
# Generate a new private key or use an existing one
AGENT_PRIVATE_KEY=your-agent-private-key-here
```

#### How to Get These Keys

1. **GRAPH_API_KEY**

    - Visit [The Graph Studio](https://thegraph.com/studio/)
    - Create an account
    - Go to "My API Keys"
    - Create a new API key

2. **OPENAI_API_KEY**

    - Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
    - Create an account or sign in
    - Create a new API key
    - Note: Keep this key secure and never commit it to version control

3. **NEXTAUTH_SECRET**

    - Generate a random string using:
        ```bash
        openssl rand -base64 32
        ```
    - Or use any secure random string
    - This is used to encrypt cookies and tokens

4. **AGENT_PRIVATE_KEY**
    - Generate a new private key using:
        ```bash
        openssl rand -hex 32
        ```
    - Or use an existing private key
    - Must be prefixed with "0x"
    - Example: `0x1234...`

#### Security Notes

-   Never commit `.env.local` to version control
-   Keep your private keys secure
-   Rotate keys regularly
-   Use different keys for development and production
-   Consider using a secrets management service in production

### Example Usage

You can query subgraphs through the chat interface. Here's an example query for Uniswap V3 pools:

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

### Features

-   **Authentication**: Secure access to protected subgraphs using API keys
-   **Error Handling**: Comprehensive error handling for failed queries
-   **Type Safety**: Full TypeScript support with Zod schema validation
-   **Flexible Endpoints**: Support for both static and dynamic endpoint URLs
-   **Response Formatting**: Consistent JSON response format

### Security

-   API keys are stored securely in environment variables
-   User authentication is required for all queries
-   Endpoints are validated before use
-   Error messages are sanitized before being returned

### Best Practices

1. Always use the predefined endpoints from `SUBGRAPH_ENDPOINTS`
2. Include proper error handling in your queries
3. Use pagination for large result sets
4. Consider rate limits when making multiple queries
5. Cache responses when appropriate

### Troubleshooting

Common issues and solutions:

1. **API Key Errors**

    - Ensure `GRAPH_API_KEY` is set in `.env.local`
    - Verify the API key is valid and has sufficient credits

2. **Authentication Errors**

    - Check that the user is properly signed in with SIWE
    - Verify the session is valid

3. **Query Errors**
    - Validate GraphQL query syntax
    - Check subgraph schema for correct field names
    - Ensure variables are properly formatted

### Contributing

When adding new subgraph integrations:

1. Add the endpoint to `SUBGRAPH_ENDPOINTS`
2. Update the system prompt with example queries
3. Add appropriate error handling
4. Include TypeScript types for the response data
