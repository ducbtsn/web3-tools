import { DeepBookClient } from "@mysten/deepbook-v3";
import {
  DryRunTransactionBlockResponse,
  getFullnodeUrl,
  SuiClient,
  SuiTransactionBlockResponse,
} from "sui-v30/client";
import { Transaction } from "sui-v30/transactions";
import { decodeSuiPrivateKey } from "sui-v30/cryptography";
import { Ed25519Keypair } from "sui-v30/keypairs/ed25519";

export class DeepBookMarketMaker {
  dbClient: DeepBookClient; // For building transactions
  suiClient: SuiClient; // For executing transactions
  keypair: Ed25519Keypair; // For signing transactions

  constructor(privateKey: string, env: "testnet" | "mainnet") {
    this.keypair = this.getSignerFromPK(privateKey);
    this.suiClient = new SuiClient({
      url: getFullnodeUrl(env),
    });
    this.dbClient = new DeepBookClient({
      address: this.getActiveAddress(),
      env: env,
      client: this.suiClient,
    });
  }

  getSignerFromPK = (privateKey: string): Ed25519Keypair => {
    const { schema, secretKey } = decodeSuiPrivateKey(privateKey);
    if (schema === "ED25519") return Ed25519Keypair.fromSecretKey(secretKey);

    throw new Error(`Unsupported schema: ${schema}`);
  };

  getActiveAddress() {
    return this.keypair.toSuiAddress();
  }

  signAndExecuteTransaction = async (
    transaction: Transaction
  ): Promise<SuiTransactionBlockResponse> => {
    const signedTx = await this.suiClient.signAndExecuteTransaction({
      transaction,
      signer: this.keypair,
      options: {
        showEffects: true,
        showEvents: true,
        showObjectChanges: true,
      },
    });
    return signedTx;
  };

  simulateTransaction = async (
    transaction: Transaction
  ): Promise<DryRunTransactionBlockResponse> => {
    const simulation = await this.suiClient.dryRunTransactionBlock({
      transactionBlock: await transaction.build({ client: this.suiClient }),
    });
    return simulation;
  };
}
