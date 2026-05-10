import {
  Connection,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from "@solana/spl-token";

const RPC_URL = "https://api.devnet.solana.com";
const USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");

export async function depositUsdc({
  walletAddress,
  recipientAddress,
  amount,
}: {
  walletAddress: string;
  recipientAddress: string;
  amount: number; // in USDC micro-units (6 decimals)
}): Promise<string> {
  const connection = new Connection(RPC_URL, "confirmed");
  const sender = new PublicKey(walletAddress);
  const recipient = new PublicKey(recipientAddress);

  // Get sender's USDC token account
  const senderAta = await getAssociatedTokenAddress(USDC_MINT, sender);
  // Get recipient's USDC token account
  const recipientAta = await getAssociatedTokenAddress(USDC_MINT, recipient);

  const transaction = new Transaction();

  // Check if recipient ATA exists, if not create it
  try {
    await getAccount(connection, recipientAta);
  } catch {
    transaction.add(
      createAssociatedTokenAccountInstruction(
        sender,
        recipientAta,
        recipient,
        USDC_MINT
      )
    );
  }

  // Add transfer instruction
  transaction.add(
    createTransferInstruction(
      senderAta,
      recipientAta,
      sender,
      amount
    )
  );

  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = sender;

  // Sign with Phantom
  const provider = (window as any).solana;
  if (!provider) throw new Error("Phantom wallet not found");

  const signed = await provider.signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signed.serialize());
  await connection.confirmTransaction(signature, "confirmed");

  return signature;
}
