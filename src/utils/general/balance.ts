// @ts-nocheck

export const getAssetBaseTypeFromBalance = (balance) => {
  return balance.assetType.baseTicker;
};
export const getAmountFromBalance = (balance) => {
  return balance.valueAtomicUnits / 10 ** balance.assetType.numberOfDecimals;
};
