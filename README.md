# 🏗 Scaffold-ETH 2 with AI Agent Integration

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

# Agent Private Key (generate with: openssl rand -hex 32)
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

### Available Subgraphs

The integration includes several pre-configured subgraph endpoints:

```typescript
{
  UNISWAP_V3: "https://gateway.thegraph.com/api/{api-key}/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV",
  AAVE_V3: "https://gateway.thegraph.com/api/{api-key}/subgraphs/id/JCNWRypm7FYwV8fx5HhzZPSFaMxgkPuw4TnR3Gpi81zk"
}
```

## Detailed Setup Guide

### Environment Variables

1. **GRAPH_API_KEY**

    - Visit [The Graph Studio](https://thegraph.com/studio/)
    - Create an account
    - Go to "My API Keys"
    - Create a new API key

2. **OPENAI_API_KEY**

    - Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
    - Create an account or sign in
    - Create a new API key

3. **NEXTAUTH_SECRET**

    - Generate a random string:

    ```bash
    openssl rand -base64 32
    ```

4. **AGENT_PRIVATE_KEY**
    - Generate a new private key or add your own (this can be done on command line for testing but it's recommended to do this inside a wallet or on a air-gapped device):
    ```bash
    openssl rand -hex 32
    ```
    - Must be prefixed with "0x"

### Security Best Practices

-   Never commit `.env.local` to version control
-   Keep private keys secure
-   Use a dedicated development key and not your mainnet keys for testing
-   Rotate keys regularly and don't store large amounts on the key

_THIS CODE IS NOT AUDITED AND IS NOT RECOMMENDED FOR PRODUCTION!_

_USE AT YOUR OWN RISK!_

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
