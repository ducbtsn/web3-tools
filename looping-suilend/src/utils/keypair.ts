import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";

export const getSignerFromPK = (privateKey: string): Ed25519Keypair => {
  const { schema, secretKey } = decodeSuiPrivateKey(privateKey);
  if (schema === "ED25519") return Ed25519Keypair.fromSecretKey(secretKey);

  throw new Error(`Unsupported schema: ${schema}`);
};
