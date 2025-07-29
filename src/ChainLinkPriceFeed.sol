// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title ChainLinkPriceFeed - A contract to fetch token prices in USDT using Chainlink Price Feeds on Polygon
/// @notice This contract retrieves prices for top 50 CoinMarketCap tokens in USDT, with predefined feeds for ETH, WBTC, XAUT, POL
contract ChainLinkPriceFeed is Ownable {

    struct TokenInfo {
        address token;
        string symbol;
    }

    // Struct to return token price details
    struct TokenPrice {
        address token;
        string symbol;
        int256 price;
        uint8 decimals;
    }

    // Mapping to store price feed contracts for token/USDT pairs
    mapping(address => AggregatorV3Interface) public priceFeeds;
    // Mapping to store decimals for each price feed
    mapping(address => uint8) public feedDecimals;
    // Mapping to store token symbols for reference
    mapping(address => string) public tokenSymbols;
    // Mapping to store token decimals (e.g., 18 for ETH, 6 for USDT)
    mapping(address => uint8) public tokenDecimals;
    // Array to store all supported token addresses
    address[] public supportedTokens;

    // Predefined token addresses on Polygon Mainnet
    address public constant ETH = 0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619; // WETH
    address public constant XAUT = 0x68749665FF8D2d112Fa859AA293F07A622782F38; // XAUT (Tether Gold)
    address public constant POL = 0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270; // WMATIC (POL)
    address public constant USDT = 0xc2132D05D31c914a87C6611C10748AEb04B58e8F; // USDT
    address public constant USDC = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174; // USDC
    address public constant LINK = 0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39; // LINK
    address public constant AAVE = 0xD6DF932A45C0f255f85145f286eA0b292B21C90B; // AAVE
    address public constant DAI = 0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063; // DAI
    address public constant BTC = address(0); // Placeholder for BTC/USDT feed

    // Event emitted when a new price feed is added or updated
    event PriceFeedUpdated(address indexed token, address priceFeed, string symbol);

    /// @notice Constructor initializes the contract with predefined price feeds
    /// @param initialOwner The address of the contract owner
    constructor(address initialOwner) Ownable(initialOwner) {
        // Initialize token decimals
        tokenDecimals[BTC] = 8; // For BTC/USDT feed
        tokenDecimals[ETH] = 18;
        tokenDecimals[POL] = 18;
        tokenDecimals[USDT] = 6;
        tokenDecimals[USDC] = 6;
        tokenDecimals[XAUT] = 6;
        tokenDecimals[LINK] = 18;
        tokenDecimals[AAVE] = 18;
        tokenDecimals[DAI] = 18;
        


        priceFeeds[BTC] = AggregatorV3Interface(0xc907E116054Ad103354f2D350FD2514433D57F6f); // BTC/USDT
        feedDecimals[BTC] = 8;
        tokenSymbols[BTC] = "BTC/USDT";
        supportedTokens.push(BTC);

        
        // Initialize price feeds (Polygon Mainnet Chainlink addresses)
        priceFeeds[ETH] = AggregatorV3Interface(0xF9680D99D6C9589e2a93a78A04A279e509205945); // ETH/USDT
        feedDecimals[ETH] = 8;
        tokenSymbols[ETH] = "ETH/USDT";
        supportedTokens.push(ETH);

        // XAUT/USDT: 0x3f3cc79f7B8D7E8e2A0e79fA4dB4f2A03fA56369
        priceFeeds[XAUT] = AggregatorV3Interface(0x0C466540B2ee1a31b441671eac0ca886e051E410);
        feedDecimals[XAUT] = 8;
        tokenSymbols[XAUT] = "XAUT/USDT";
        supportedTokens.push(XAUT);

        priceFeeds[POL] = AggregatorV3Interface(0xAB594600376Ec9fD91F8e885dADF0CE036862dE0); // POL/USDT
        feedDecimals[POL] = 8;
        tokenSymbols[POL] = "POL/USDT";
        supportedTokens.push(POL);

        priceFeeds[USDC] = AggregatorV3Interface(0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7); // USDC/USDT
        feedDecimals[USDC] = 8;
        tokenSymbols[USDC] = "USDC/USDT";
        supportedTokens.push(USDC);

        priceFeeds[LINK] = AggregatorV3Interface(0xd9FFdb71EbE7496cC440152d43986Aae0AB76665); // LINK/USDT
        feedDecimals[LINK] = 8;
        tokenSymbols[LINK] = "LINK/USDT";
        supportedTokens.push(LINK);

        priceFeeds[AAVE] = AggregatorV3Interface(0x72484B12719E23115761D5DA1646945632979bB6); // AAVE/USDT
        feedDecimals[AAVE] = 8;
        tokenSymbols[AAVE] = "AAVE/USDT";
        supportedTokens.push(AAVE);

        priceFeeds[DAI] = AggregatorV3Interface(0x4746DeC9e833A82EC7C2C1356372CcF2cfcD2F3D); // DAI/USDT
        feedDecimals[DAI] = 8;
        tokenSymbols[DAI] = "DAI/USDT";
        supportedTokens.push(DAI);

     
    }

    /// @notice Fetches the latest price for a given token in USDT
    /// @param token The token address (e.g., ETH, WBTC, XAUT, POL)
    /// @return price The latest price in USDT (or BTC for WBTC/BTC)
    /// @return decimals The number of decimals for the price
    function getLatestPrice(address token) public view returns (int256 price, uint8 decimals) {
        require(address(priceFeeds[token]) != address(0), "Price feed not set for token");

        (
            uint80 roundID,
            int256 answer,
            /* uint256 startedAt */,
            uint256 updatedAt,
            /* uint80 answeredInRound */
        ) = priceFeeds[token].latestRoundData();

        // Ensure data is not stale (updated within the last hour)
        require(updatedAt >= block.timestamp - 1 hours, "Price data is stale");
        require(answer > 0, "Invalid price data");

        return (answer, feedDecimals[token]);
    }


    /// @notice Fetches prices for multiple tokens in USDT
    /// @param tokens Array of token addresses
    /// @return prices Array of prices in USDT (0 if feed unavailable)
    /// @return decimals Array of decimals for each price
    function getPricesInUSDT(address[] calldata tokens) external view returns (int256[] memory prices, uint8[] memory decimals) {
        prices = new int256[](tokens.length);
        decimals = new uint8[](tokens.length);

        for (uint256 i = 0; i < tokens.length; i++) {
            address token = tokens[i];
            if (address(priceFeeds[token]) == address(0)) {
                prices[i] = 0;
                decimals[i] = 0;
                continue;
            }

            (prices[i], decimals[i]) = getLatestPrice(token);
        }

        return (prices, decimals);
    }

   /// @notice Returns a list of all supported tokens with their symbols
    /// @return tokenList Array of TokenInfo structs containing token address and symbol
    function getTokenList() external view returns (TokenInfo[] memory tokenList) {
        tokenList = new TokenInfo[](supportedTokens.length);

        for (uint256 i = 0; i < supportedTokens.length; i++) {
            address token = supportedTokens[i];
            tokenList[i] = TokenInfo({
                token: token,
                symbol: tokenSymbols[token]
            });
        }

        return tokenList;
    }


    /// @notice Adds or updates a price feed for a token/USDT pair
    /// @param token The token address
    /// @param priceFeed The Chainlink price feed contract address
    /// @param symbol The token symbol (e.g., "LINK/USDT")
    /// @param decimals The decimals of the price feed
    /// @param tokenDec The decimals of the token
    function addPriceFeed(address token, address priceFeed, string memory symbol, uint8 decimals, uint8 tokenDec) external onlyOwner {
        require(token != address(0), "Invalid token address");
        require(priceFeed != address(0), "Invalid price feed address");
        require(decimals > 0, "Invalid decimals");
        require(tokenDec > 0, "Invalid token decimals");

        // Add to supportedTokens if not already present
        bool exists = false;
        for (uint256 i = 0; i < supportedTokens.length; i++) {
            if (supportedTokens[i] == token) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            supportedTokens.push(token);
        }

        priceFeeds[token] = AggregatorV3Interface(priceFeed);
        feedDecimals[token] = decimals;
        tokenSymbols[token] = symbol;
        tokenDecimals[token] = tokenDec;

        emit PriceFeedUpdated(token, priceFeed, symbol);
    }

    /// @notice Gets the price feed address, symbol, and decimals for a token
    /// @param token The token address
    /// @return priceFeed The Chainlink price feed contract address
    /// @return symbol The token symbol
    /// @return tokenDec The token decimals
    function getPriceFeedInfo(address token) external view returns (address priceFeed, string memory symbol, uint8 tokenDec) {
        return (address(priceFeeds[token]), tokenSymbols[token], tokenDecimals[token]);
    }

    /// @notice Returns the list of supported token addresses
    /// @return The array of supported token addresses
    function getSupportedTokens() external view returns (address[] memory) {
        return supportedTokens;
    }
}