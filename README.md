

# ChainLinkPriceFeed

This project deploys a Solidity smart contract, `PriceFeedConsumer.sol`, to the Polygon network using Foundry. The contract fetches real-time token prices in USDT for top cryptocurrencies (e.g., ETH, WBTC, XAUT, POL, USDC, LINK, AAVE, UNI, DAI) using Chainlink Price Feeds, mimicking a CoinMarketCap-like token price list. It supports adding new tokens and is designed for DApp integration to display token prices.

## Prerequisites

- **Foundry**: Install Foundry to compile, test, and deploy the contract.
- **Node.js**: Optional, for managing dependencies.
- **Git**: Required for Foundry’s dependency management.
- **Polygon Wallet**: A wallet (e.g., MetaMask) with MATIC for gas fees.
- **RPC Provider**: Access to Polygon Mainnet and Amoy testnet RPCs (e.g., Alchemy, Infura, QuickNode).
- **Polygonscan API Key**: For contract verification.
- **Code Editor**: VSCode or similar for editing files.

## Project Structure

- `src/PriceFeedConsumer.sol`: The main contract, fetching token prices in USDT using Chainlink Price Feeds.
- `script/PriceFeedConsumer.s.sol`: Deployment script for Polygon.
- `foundry.toml`: Foundry configuration with remappings and network settings.
- `.env`: Environment variables for RPC URLs, private key, and owner address.
- `lib/`: Dependencies (Chainlink and OpenZeppelin contracts).

## Installation

1. **Install Foundry**:
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   source ~/.bashrc
   foundryup
   ```
   Verify installation:
   ```bash
   forge --version
   cast --version
   ```

2. **Clone the Repository**:
   If you haven’t already set up the project:
   ```bash
   git clone <your-repository-url>
   cd ChainLinkPriceFeed
   ```

3. **Install Dependencies**:
   Install Chainlink and OpenZeppelin contracts:
   ```bash
   forge install smartcontractkit/chainlink@v2.2.0 --no-commit
   forge install OpenZeppelin/openzeppelin-contracts@v5.0.2 --no-commit
   ```

4. **Configure `foundry.toml`**:
   Ensure `foundry.toml` includes remappings and network settings:
   ```toml
   [profile.default]
   src = "src"
   out = "out"
   libs = ["lib"]
   remappings = [
     "@chainlink/contracts=lib/chainlink/contracts/src/v0.8",
     "@openzeppelin/contracts=lib/openzeppelin-contracts/contracts"
   ]

   [rpc_endpoints]
   polygon_mainnet = "${POLYGON_MAINNET_RPC_URL}"
   polygon_amoy = "${POLYGON_AMOY_RPC_URL}"

   [etherscan]
   polygon_mainnet = { key = "${POLYGONSCAN_API_KEY}", chain = 137 }
   polygon_amoy = { key = "${POLYGONSCAN_API_KEY}", chain = 80002 }
   ```

## Environment Setup

1. **Create `.env` File**:
   In the project root, create `.env`:
   ```bash
   touch .env
   ```
   Add the following:
   ```env
   POLYGON_MAINNET_RPC_URL=https://polygon-mainnet.infura.io
   POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
   PRIVATE_KEY=YOUR_WALLET_PRIVATE_KEY
   POLYGONSCAN_API_KEY=YOUR_POLYGONSCAN_API_KEY
   CURRENT_WALLET_ADDRESS=YOUR_WALLET_ADDRESS
   ```
   - **RPC URLs**: Get a Mainnet RPC from Alchemy (https://www.alchemy.com), Infura, or QuickNode. Amoy RPC is public.
   - **Private Key**: Export from MetaMask (Settings > Security & Privacy > Reveal Private Key). **Never share this key**.
   - **Polygonscan API Key**: Get from https://polygonscan.com.
   - **Current Wallet Address**: Your wallet address, used as the contract owner.

2. **Load Environment Variables**:
   ```bash
   source .env
   ```

3. **Fund Your Wallet**:
   - Ensure your wallet (`CURRENT_WALLET_ADDRESS`) has 1–2 MATIC for Mainnet gas fees.
   - Check balance:
     ```bash
     cast balance $CURRENT_WALLET_ADDRESS --rpc-url $POLYGON_MAINNET_RPC_URL
     ```
   - For Amoy testnet, get testnet MATIC from https://faucet.polygon.technology.

## Contract Overview

The `PriceFeedConsumer.sol` contract:
- Fetches prices in USDT for tokens like ETH, WBTC, XAUT, POL, USDC, LINK, AAVE, UNI, and DAI using Chainlink Price Feeds.
- Supports WBTC/USDT by combining WBTC/BTC and BTC/USDT feeds.
- Provides `getTokenPriceList()` to return a CoinMarketCap-like list of token addresses, symbols, and prices.
- Allows the owner to add new price feeds for other top 50 tokens (e.g., BNB, SOL, XRP) when Chainlink supports them.

## Testing on Polygon Amoy Testnet

1. **Update Contract for Testnet**:
   - Modify `src/PriceFeedConsumer.sol` constructor with Amoy testnet feed addresses (from https://docs.chain.link/data-feeds/price-feeds/addresses?network=polygon&page=1):
     ```solidity
     // In constructor
     priceFeeds[ETH] = AggregatorV3Interface(0xF0d50568e3A7e8259E16663933977117F4296D78); // ETH/USDT
     priceFeeds[WBTC] = AggregatorV3Interface(0x5c0A3F55AAC52AA320Ff5F280E77517cbAF85524); // WBTC/BTC
     priceFeeds[XAUT] = AggregatorV3Interface(address(0)); // XAUT not available
     priceFeeds[POL] = AggregatorV3Interface(0x6C0F75f3cC3c6f8D6C375Ac0DB834E2D7aC1BF58); // MATIC/USDT
     priceFeeds[USDC] = AggregatorV3Interface(0x10B255282283C7DbFaD2D71751b0f2D696E4A9c7); // USDC/USDT
     priceFeeds[LINK] = AggregatorV3Interface(0xB9eF93C551F3AcbB37A4cA6bE6d9A4346A868769); // LINK/USDT
     priceFeeds[AAVE] = AggregatorV3Interface(address(0)); // AAVE not available
     priceFeeds[UNI] = AggregatorV3Interface(address(0)); // UNI not available
     priceFeeds[DAI] = AggregatorV3Interface(0xE4e1f6C0C92aD03fA4a3606451eD4Aa6B9dA8246); // DAI/USDT
     priceFeeds[BTC] = AggregatorV3Interface(0x8f7fE4E7719f6F4DB7390bAc3C6D9dB3F5f6CAd7); // BTC/USDT
     ```
   - Recompile:
     ```bash
     forge build
     ```

2. **Deploy to Amoy**:
   - Deploy using the script:
     ```bash
     forge script script/PriceFeedConsumer.s.sol:DeployPriceFeedConsumer --rpc-url $POLYGON_AMOY_RPC_URL --private-key $PRIVATE_KEY --broadcast
     ```
   - Note the contract address from the output.

3. **Test the Contract**:
   - Call `getTokenPriceList`:
     ```bash
     cast call <CONTRACT_ADDRESS> "getTokenPriceList()(tuple(address,string,int256,uint8)[])" --rpc-url $POLYGON_AMOY_RPC_URL
     ```
   - This returns a list of tokens with addresses, symbols, prices, and decimals. Tokens with `address(0)` feeds (e.g., XAUT) return 0.

4. **Verify on Polygonscan (Amoy)**:
   - Verify the contract:
     ```bash
     forge verify-contract <CONTRACT_ADDRESS> PriceFeedConsumer --chain-id 80002 --verifier-url https://api-amoy.polygonscan.com/api --etherscan-api-key $POLYGONSCAN_API_KEY
     ```

## Deploying to Polygon Mainnet

1. **Restore Mainnet Feed Addresses**:
   - Update `src/PriceFeedConsumer.sol` constructor with Mainnet feed addresses:
     ```solidity
     priceFeeds[ETH] = AggregatorV3Interface(0xF9680D99D6C9589e2a93a78A04A279e509205945); // ETH/USDT
     priceFeeds[WBTC] = AggregatorV3Interface(0xA6dCb24f0f0Ce3A3e8EbA1462D1CfA3eB3f6B5Ef); // WBTC/BTC
     priceFeeds[XAUT] = AggregatorV3Interface(0x3f3cc79f7B8D7E8e2A0e79fA4dB4f2A03fA56369); // XAUT/USDT
     priceFeeds[POL] = AggregatorV3Interface(0xAB594600376Ec9fD91F8e885dADF0CE036862dE0); // POL/USDT
     priceFeeds[USDC] = AggregatorV3Interface(0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7); // USDC/USDT
     priceFeeds[LINK] = AggregatorV3Interface(0xd9FFdb71EbE7496cC440152d43986Aae0AB76665); // LINK/USDT
     priceFeeds[AAVE] = AggregatorV3Interface(0x72484B12719E23115761D5DA1646945632979bB6); // AAVE/USDT
     priceFeeds[UNI] = AggregatorV3Interface(0x3e7eF8f50246f725885102E8238CBba33F276747); // UNI/USDT
     priceFeeds[DAI] = AggregatorV3Interface(0x4746DeC9e833A82EC7C2C1356372CcF2cfcD2F3D); // DAI/USDT
     priceFeeds[BTC] = AggregatorV3Interface(0xc907E116054Ad103354f2D350FD2514433D57F6f); // BTC/USDT
     ```
   - Recompile:
     ```bash
     forge build
     ```

2. **Deploy to Mainnet**:
   - Deploy the contract:
     ```bash
     forge script script/PriceFeedConsumer.s.sol:DeployPriceFeedConsumer --rpc-url $POLYGON_MAINNET_RPC_URL --private-key $PRIVATE_KEY --broadcast
     ```
   - Note the contract address.

3. **Verify on Polygonscan (Mainnet)**:
   - Verify the contract:
     ```bash
     forge verify-contract <CONTRACT_ADDRESS> PriceFeedConsumer --chain-id 137 --verifier-url https://api.polygonscan.com/api --etherscan-api-key $POLYGONSCAN_API_KEY
     ```

## Interacting with the Contract

1. **Fetch Token Price List**:
   - Use `cast` to call `getTokenPriceList`:
     ```bash
     cast call <CONTRACT_ADDRESS> "getTokenPriceList()(tuple(address,string,int256,uint8)[])" --rpc-url $POLYGON_MAINNET_RPC_URL
     ```
   - This returns a list of supported tokens (ETH, WBTC, XAUT, POL, USDC, LINK, AAVE, UNI, DAI) with addresses, symbols, prices in USDT, and decimals.

2. **DApp Integration**:
   - Integrate with a frontend using Ethers.js:
     ```javascript
     const ethers = require('ethers');
     const provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_MAINNET_RPC_URL);
     const contractAddress = 'YOUR_CONTRACT_ADDRESS';
     const abi = require('./out/PriceFeedConsumer.sol/PriceFeedConsumer.json').abi;
     const contract = new ethers.Contract(contractAddress, abi, provider);

     async function displayTokenPriceList() {
       const tokenPrices = await contract.getTokenPriceList();
       for (const { token, symbol, price, decimals } of tokenPrices) {
         console.log(`${symbol} (${token}): ${ethers.utils.formatUnits(price, decimals)} USDT`);
       }
     }
     displayTokenPriceList();
     ```

3. **Add New Tokens**:
   - When Chainlink adds USDT feeds for other top 50 tokens (e.g., BNB, SOL, XRP), use `addPriceFeed`:
     ```bash
     cast send <CONTRACT_ADDRESS> "addPriceFeed(address,address,string,uint8,uint8)" <TOKEN_ADDRESS> <FEED_ADDRESS> "SYMBOL/USDT" 8 18 --private-key $PRIVATE_KEY --rpc-url $POLYGON_MAINNET_RPC_URL
     ```

## Supported Tokens

The contract supports the following tokens with Chainlink Price Feeds on Polygon Mainnet:
- **ETH/USDT**: 0xF9680D99D6C9589e2a93a78A04A279e509205945
- **WBTC/USDT**: Derived from WBTC/BTC (0xA6dCb24f0f0Ce3A3e8EbA1462D1CfA3eB3f6B5Ef) and BTC/USDT (0xc907E116054Ad103354f2D350FD2514433D57F6f)
- **XAUT/USDT**: 0x3f3cc79f7B8D7E8e2A0e79fA4dB4f2A03fA56369
- **POL/USDT**: 0xAB594600376Ec9fD91F8e885dADF0CE036862dE0
- **USDC/USDT**: 0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7
- **LINK/USDT**: 0xd9FFdb71EbE7496cC440152d43986Aae0AB76665
- **AAVE/USDT**: 0x72484B12719E23115761D5DA1646945632979bB6
- **UNI/USDT**: 0x3e7eF8f50246f725885102E8238CBba33F276747
- **DAI/USDT**: 0x4746DeC9e833A82EC7C2C1356372CcF2cfcD2F3D

Other top 50 CoinMarketCap tokens (e.g., BNB, SOL, XRP) can be added when Chainlink provides USDT feeds (check https://data.chain.link).

## Troubleshooting

- **Dependency Installation Fails**:
  - Verify the Chainlink tag (`v2.2.0`) at https://github.com/smartcontractkit/chainlink/tags.
  - Clear `lib` directory (`rm -rf lib/*`) and retry installation.
- **Deployment Fails**:
  - Check MATIC balance (`cast balance $CURRENT_WALLET_ADDRESS --rpc-url $POLYGON_MAINNET_RPC_URL`).
  - Verify RPC URL and increase gas limit if needed:
    ```bash
    forge script script/PriceFeedConsumer.s.sol:DeployPriceFeedConsumer --rpc-url $POLYGON_MAINNET_RPC_URL --private-key $PRIVATE_KEY --broadcast --gas-limit 5000000
    ```
- **Verification Issues**:
  - Ensure correct chain ID (137 for Mainnet, 80002 for Amoy) and valid Polygonscan API key.
- **Price Feed Errors**:
  - If `getTokenPriceList` returns 0 for some tokens, confirm feed addresses at https://data.chain.link.

## Maintenance

- **Monitor Chainlink Feeds**: Check https://data.chain.link for new USDT feeds for top 50 tokens.
- **Update Tokens**: Use `addPriceFeed` to include new tokens as feeds become available.
- **Security**: Keep `PRIVATE_KEY` secure in `.env`. Only the owner (`CURRENT_WALLET_ADDRESS`) can add price feeds.

## License

MIT License. See `LICENSE` file for details.

<!-- 0x950938071B3F36D49Ef146F3b93a9F26226a5C6D -->