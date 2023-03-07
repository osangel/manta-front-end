export class ApiConfig {
    constructor(maxReceiversPullSize: any, maxSendersPullSize: any, pullCallback?: any, errorCallback?: any, loggingEnabled?: boolean);
    loggingEnabled: boolean;
    maxReceiversPullSize: any;
    maxSendersPullSize: any;
    pullCallback: any;
    errorCallback: any;
}
export default class Api {
    constructor(api: any, config: any);
    loggingEnabled: any;
    config: any;
    api: any;
    externalAccountSigner: any;
    maxReceiversPullSize: any;
    maxSendersPullSize: any;
    txResHandler: any;
    pullCallback: any;
    errorCallback: any;
    _log(message: any): void;
    setTxResHandler: (txResHandler: any) => void;
    setExternalAccountSigner: (signer: any) => void;
    _outgoing_note_to_json(note: any): {
        ephemeral_public_key: number[];
        ciphertext: any[][];
    };
    _light_incoming_note_to_json(note: any): {
        ephemeral_public_key: number[];
        ciphertext: any[][];
    };
    _incoming_note_to_json(note: any): {
        ephemeral_public_key: number[];
        tag: number[];
        ciphertext: any[][];
    };
    _full_incoming_note_to_jons(note: any): {
        address_partition: any;
        incoming_note: {
            ephemeral_public_key: number[];
            tag: number[];
            ciphertext: any[][];
        };
        light_incoming_note: {
            ephemeral_public_key: number[];
            ciphertext: any[][];
        };
    };
    _utxo_to_json(utxo: any): {
        is_transparent: any;
        public_asset: {
            id: number[];
            value: number[];
        };
        commitment: number[];
    };
    pull(checkpoint: any): Promise<{
        should_continue: any;
        receivers: ({
            address_partition: any;
            incoming_note: {
                ephemeral_public_key: number[];
                tag: number[];
                ciphertext: any[][];
            };
            light_incoming_note: {
                ephemeral_public_key: number[];
                ciphertext: any[][];
            };
        } | {
            is_transparent: any;
            public_asset: {
                id: number[];
                value: number[];
            };
            commitment: number[];
        })[][];
        senders: (number[] | {
            ephemeral_public_key: number[];
            ciphertext: any[][];
        })[][];
    }>;
    _map_post_to_transaction(post: any): Promise<any>;
    push(posts: any): Promise<{
        Ok: string;
    }>;
}
export const SUCCESS: "success";
export const FAILURE: "failure";
export const $Receivers: $.Codec<[{
    is_transparent: boolean;
    public_asset: {
        id: Uint8Array;
        value: Uint8Array;
    };
    commitment: Uint8Array;
}, {
    address_partition: number;
    incoming_note: {
        ephemeral_public_key: Uint8Array;
        tag: Uint8Array;
        ciphertext: [Uint8Array, Uint8Array, Uint8Array];
    };
    light_incoming_note: {
        ephemeral_public_key: Uint8Array;
        ciphertext: [Uint8Array, Uint8Array, Uint8Array];
    };
}][]>;
export const $Senders: $.Codec<[Uint8Array, {
    ephemeral_public_key: Uint8Array;
    ciphertext: [Uint8Array, Uint8Array];
}][]>;
import * as $ from "scale-codec";
