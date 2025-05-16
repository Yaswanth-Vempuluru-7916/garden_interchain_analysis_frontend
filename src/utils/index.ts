export const formatDecimal = (value: number | null): string => {
  if (value === null) return 'N/A';
  if (value > 3600) {
    const hours = value / 3600;
    return `${hours.toFixed(2)}hr`;
  } else if (value > 60) {
    const minutes = value / 60;
    return `${minutes.toFixed(2)}min`;
  }
  return `${value.toFixed(2)}s`;
};

export const isBitcoinChainPair = (chainPair: string) => chainPair.toLowerCase().includes('bitcoin');

export const getBitcoinChainPairs = (data: Record<string, any> | null) =>
  data ? Object.keys(data).filter(isBitcoinChainPair) : [];

export const getNonBitcoinChainPairs = (data: Record<string, any> | null) =>
  data ? Object.keys(data).filter((chainPair) => !isBitcoinChainPair(chainPair)) : [];