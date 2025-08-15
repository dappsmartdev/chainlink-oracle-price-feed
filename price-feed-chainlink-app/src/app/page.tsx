"use client";

import * as React from "react";
import { useReadContracts, useAccount, useChainId } from "wagmi";
import { polygon } from "wagmi/chains";
import { formatUnits } from "viem";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import Image from "next/image";
import { chainLinkPriceFeedAbi } from "@/abis/contractAbi";

const CONTRACT_ADDRESS = "0x846829c8e1180408f6a927F680B251cf63ab8fe6" as `0x${string}`;

// Token icon base URL (Trust Wallet assets)
const TOKEN_ICON_BASE_URL = "/images/";

const getTokenIconUrl = (tokenAddress: string) => {
  try {
    const normalizedAddress = tokenAddress.toLowerCase();
    return `${TOKEN_ICON_BASE_URL}${normalizedAddress}/logo.png`;
  } catch (e) {
    console.error(`Invalid address for icon: ${tokenAddress}`, e);
    return "https://via.placeholder.com/24?text=?";
  }
};

interface TokenInfo {
  token: `0x${string}`;
  symbol: string;
}

interface TokenPrice {
  price: bigint;
  decimals: number;
}

export default function Home() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const isPolygon = chainId === polygon.id;

  // Fetch the token list
  const {
    data: tokenList,
    isLoading: isTokenListLoading,
    isError: isTokenListError,
    refetch: refetchTokenList,
    error: tokenListError,
  } = useReadContracts({
    contracts: [
      {
        address: CONTRACT_ADDRESS,
        abi: chainLinkPriceFeedAbi,
        functionName: "getTokenList",
        chainId: polygon.id,
      },
    ],
    query: {
      enabled: isConnected && isPolygon,
      refetchInterval: false,
    },
  });

  // State to hold individual token prices
  const [tokenPrices, setTokenPrices] = React.useState<Record<string, TokenPrice>>({});

  // Prepare contract calls for token prices
  const tokenListData = tokenList?.[0]?.result as TokenInfo[] | undefined;
  const priceContracts = React.useMemo(() => {
    if (!tokenListData || tokenListData.length === 0) return [];
    return tokenListData.map((tokenInfo) => ({
      address: CONTRACT_ADDRESS,
      abi: chainLinkPriceFeedAbi,
      functionName:
        tokenInfo.token.toLowerCase() === "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6"
          ? "getWBTCPriceInUSDT"
          : "getLatestPrice",
      args: tokenInfo.token.toLowerCase() === "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6" ? [] : [tokenInfo.token],
      chainId: polygon.id,
    }));
  }, [tokenListData]);

  // Fetch prices for all tokens
  const {
    data: priceData,
    isLoading: isPriceLoading,
    isError: isPriceError,
    refetch: refetchPrices,
  } = useReadContracts({
    contracts: priceContracts,
    query: {
      enabled: isConnected && isPolygon && priceContracts.length > 0,
      refetchInterval: false,
    },
  });

  // Process price data
  React.useEffect(() => {
    if (!tokenListData || !priceData) {
      setTokenPrices({});
      return;
    }

    const prices: Record<string, TokenPrice> = {};
    tokenListData.forEach((tokenInfo, index) => {
      const result = priceData[index];
      if (result.status === "success" && result.result) {
        prices[tokenInfo.token] = {
          price: result.result[0] as bigint,
          decimals: Number(result.result[1]),
        };
      } else {
        console.error(`Error fetching price for ${tokenInfo.symbol} (${tokenInfo.token}):`, result.error);
        prices[tokenInfo.token] = { price: BigInt(0), decimals: 8 };
      }
    });

    setTokenPrices(prices);
  }, [tokenListData, priceData]);

  // Handle refetching a single token price
  const handleRefetchPrice = async (tokenAddress: `0x${string}`) => {
    try {
      const contract = {
        address: CONTRACT_ADDRESS,
        abi: chainLinkPriceFeedAbi,
        functionName:
          tokenAddress.toLowerCase() === "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6"
            ? "getWBTCPriceInUSDT"
            : "getLatestPrice",
        args: tokenAddress.toLowerCase() === "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6" ? [] : [tokenAddress],
        chainId: polygon.id,
      };

      const { data } = await refetchPrices({
        contracts: [contract],
      });

      if (data?.[0]?.status === "success" && data[0].result) {
        setTokenPrices((prev) => ({
          ...prev,
          [tokenAddress]: {
            price: data[0].result[0] as bigint,
            decimals: Number(data[0].result[1]),
          },
        }));
      } else {
        throw new Error(`No data returned for token ${tokenAddress}`);
      }
    } catch (err) {
      console.error(`Error refetching price for ${tokenAddress}:`, err);
      setTokenPrices((prev) => ({
        ...prev,
        [tokenAddress]: { price: BigInt(0), decimals: 8 },
      }));
    }
  };

  // Handle refetching the entire token list
  const handleRefetchTokenList = async () => {
    await refetchTokenList();
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", p: 4 }}>
      <Box sx={{ maxWidth: "1200px", mx: "auto" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4, alignItems: "center" }}>
          <Typography variant="h4" color="text.primary">
            Token Price Dashboard
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {!isConnected && (
              <w3m-button
                label="connect wallet"
                balance="hide"
                loadingLabel="connecting"
              />
            )}
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={handleRefetchTokenList}
              disabled={isTokenListLoading}
            >
              Refresh List
            </Button>
          </Box>
        </Box>

        {!isConnected ? (
          <Typography color="text.secondary" align="center">
            Please connect your wallet to view token prices.
          </Typography>
        ) : !isPolygon ? (
          <Typography color="text.secondary" align="center">
            Please switch to the Polygon mainnet to fetch token prices.
          </Typography>
        ) : isTokenListLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : isTokenListError || !tokenListData || tokenListData.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography color="text.secondary">
              {isTokenListError
                ? `Error fetching token list: ${tokenListError?.message || "Unknown error"}`
                : "No tokens available."}
            </Typography>
            <Button variant="outlined" sx={{ mt: 2 }} onClick={handleRefetchTokenList}>
              Try Again
            </Button>
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ bgcolor: "background.paper" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Token</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Price (USDT)</TableCell>
                  <TableCell>Update</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tokenListData.map((tokenInfo) => (
                  <TokenPriceRow
                    key={tokenInfo.token}
                    tokenInfo={tokenInfo}
                    isPriceLoading={isPriceLoading}
                    tokenPrice={tokenPrices[tokenInfo.token]}
                    onRefetchPrice={() => handleRefetchPrice(tokenInfo.token)}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
}

interface TokenPriceRowProps {
  tokenInfo: TokenInfo;
  tokenPrice: TokenPrice | undefined;
  onRefetchPrice: () => void;
  isPriceLoading: boolean;
}

function TokenPriceRow({ tokenInfo, tokenPrice, onRefetchPrice, isPriceLoading }: TokenPriceRowProps) {
  const { token, symbol } = tokenInfo;
  const baseSymbol = symbol.split("/")[0];

  return (
    <TableRow>
      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Image
            src={getTokenIconUrl(token)}
            alt={`${baseSymbol} icon`}
            width={24}
            height={24}
            style={{ marginRight: 8 }}
            onError={(e) => {
              if (e.currentTarget instanceof HTMLImageElement) {
                e.currentTarget.src = "https://via.placeholder.com/24?text=?";
              }
            }}
          />
          {baseSymbol}
        </Box>
      </TableCell>
      <TableCell sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
        {token.slice(0, 6)}...{token.slice(-4)}
      </TableCell>
      <TableCell>
        {tokenPrice ? (
          tokenPrice.price > 0 ? (
            `$${parseFloat(formatUnits(tokenPrice.price, tokenPrice.decimals)).toFixed(4)}`
          ) : (
            "Price unavailable"
          )
        ) : (
          <CircularProgress size={20} />
        )}
      </TableCell>
      <TableCell>
        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshIcon />}
          onClick={onRefetchPrice}
          disabled={isPriceLoading || !tokenPrice}
        >
          Update
        </Button>
      </TableCell>
    </TableRow>
  );
}