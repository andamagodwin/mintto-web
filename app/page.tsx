"use client";

import { useState } from "react";
import Dashboard from "./components/Dashboard";
import ConnectScreen from "./components/ConnectScreen";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  if (!walletAddress) {
    return <ConnectScreen onConnect={setWalletAddress} />;
  }

  return <Dashboard walletAddress={walletAddress} />;
}
