import React, { useState, useRef, useEffect } from 'react';
import { Form, Grid, Header, Input } from 'semantic-ui-react';
import { TxButton } from './substrate-lib/components';
import { base64Encode } from '@polkadot/util-crypto';
import BN from 'bn.js';

export default function Main ({ accountPair }) {
  const [status, setStatus] = useState(null);
  const [wasm, setWasm] = useState(null);
  const [formState, setFormState] = useState({ assetID: null, mintAmount: 0 });
  const onChange = (_, data) => {
    setFormState(prev => ({ ...prev, [data.state]: data.value }));
  };
  const [mintInfo, setMintInfo] = useState(null);
  const { assetID, mintAmount } = formState;

  useEffect(() => {
    if (assetID && mintAmount) {
      try {
        const mintPayload = wasm.generate_mint_payload_for_browser(
          new Uint8Array(32).fill(0), assetID, mintAmount);
        console.log(mintPayload);
        setMintInfo(mintPayload);
      } catch (error) {
        console.log(error);
      }
    }
  }, [assetID, mintAmount, wasm]);

  useEffect(() => {
    async function loadWasm () {
      const wasm = await import('manta-api');
      setWasm(wasm);
      wasm.init_panic_hook();
    }
    loadWasm();
  }, []);

  return (
    <>
      <Grid.Column width={2}/>
      <Grid.Column width={10}>
        <Header textAlign='center'>Mint Private Asset</Header>
        <Form>
          <Form.Field style={{ width: '500px', marginLeft: '2em' }}>
            <Input
              fluid
              label='Asset ID'
              type='number'
              state='assetID'
              onChange={onChange}
            />
          </Form.Field>
          <Form.Field style={{ width: '500px', marginLeft: '2em' }}>
            <Input
              fluid
              label='Amount'
              type='number'
              state='mintAmount'
              onChange={onChange}
            />
          </Form.Field>
            <Form.Field style={{ textAlign: 'center' }}>
              <TxButton
                accountPair={accountPair}
                label='Submit'
                type='SIGNED-TX'
                setStatus={setStatus}
                attrs={{
                  palletRpc: 'mantaPay',
                  callable: 'mintPrivateAsset',
                  inputParams: [mintInfo],
                  paramFields: [true]
                }}
              />
          </Form.Field>
          <div style={{ overflowWrap: 'break-word' }}>{status}</div>
        </Form>
      </Grid.Column>
      <Grid.Column width={2}/>
    </>
  );
}
