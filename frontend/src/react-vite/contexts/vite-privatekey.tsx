import React, { FC, ReactNode, useMemo } from 'react';
import {vite} from '@vitex';

import { useViteProvider, ViteWalletContext } from './vite';

const PRIVATE_KEY1 = import.meta.env.VITE_PRIVATE_KEY as string;
const PRIVATE_KEY2 = import.meta.env.VITE_PRIVATE_KEY2 as string;
const PRIVATE_KEY = ~window.location.search.search('priv2')
  ? PRIVATE_KEY2
  : PRIVATE_KEY1;

export const VitePrivatekeyProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { provider } = useViteProvider();

  const wallet = useMemo(
    () =>
      !PRIVATE_KEY ? null : vite.wallet.createAddressByPrivateKey(PRIVATE_KEY),
    []
  );

  const connect = async () => {};

  const createAccountBlock = async (typ: string, params: any) => {
    if (!wallet) return;

    const block = vite.accountBlock.createAccountBlock(typ, params);

    block.setProvider(provider).setPrivateKey(wallet.privateKey);
    await block.autoSetPreviousAccountBlock();

    // get difficulty
    const { difficulty } = await provider.request('ledger_getPoWDifficulty', {
      address: block.address,
      previousHash: block.previousHash,
      blockType: block.blockType,
      toAddress: block.toAddress,
      data: block.data,
    });

    // if difficulty is null,
    // it indicates the account has enough quota to send the transaction
    // there is no need to do PoW
    if (difficulty) {
      const getNonceHashBuffer = Buffer.from(
        block.originalAddress + block.previousHash,
        'hex'
      );
      const getNonceHash = vite.utils.blake2bHex(getNonceHashBuffer, null, 32);
      const nonce = await provider.request(
        'util_getPoWNonce',
        difficulty,
        getNonceHash
      );
      block.setDifficulty(difficulty);
      block.setNonce(nonce);
    }

    console.log(await block.sign().send());
  };

  return (
    <ViteWalletContext.Provider
      value={{
        walletAddress: wallet?.address ?? null,
        connect,
        createAccountBlock,
      }}
    >
      {children}
    </ViteWalletContext.Provider>
  );
};
