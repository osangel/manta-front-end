// @ts-nocheck
import extrinsicWasSentByUser from "./ExtrinsicWasSendByUser";
const getExtrinsicGivenBlockHash = async (
    blockHash, externalAccount, api
) => {
  const signedBlock = await api.rpc.chain.getBlock(blockHash);
  const extrinsics = signedBlock.block.extrinsics;
  const extrinsic = extrinsics.find((extrinsic) =>
    extrinsicWasSentByUser(extrinsic, externalAccount, api)
  );
  return extrinsic;
};

export default getExtrinsicGivenBlockHash;
