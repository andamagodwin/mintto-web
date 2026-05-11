import { create } from "zustand";

const API_BASE = "https://mintto-api-c493341a60c4.herokuapp.com";

interface Member {
  display_name: string;
  wallet_address: string;
  total_deposited: string;
  status: string;
}

interface GroupStatus {
  id: string;
  name: string;
  weekly_amount: string;
  total_weeks: number;
  current_week: number;
  total_deposited: string;
  vault_pda: string | null;
  members: Member[];
  goal: number;
  progress: number;
}

interface GroupInfo {
  id: string;
  name: string;
  weekly_amount: string;
  total_weeks: number;
  current_week: number;
  total_deposited: string;
  status: string;
  vault_pda: string | null;
  group_pda: string | null;
  token_mint: string;
  created_at: string;
  member_status: string;
  my_deposits: string;
}

interface Transaction {
  id: string;
  wallet_address: string;
  tx_signature: string;
  amount: string;
  tx_type: string;
  week_number: number;
  created_at: string;
  group_name?: string;
}

interface UserSummary {
  groupCount: number;
  totalSaved: number;
  weeksPaid: number;
}

interface AppState {
  walletAddress: string | null;
  groupStatus: GroupStatus | null;
  groups: GroupInfo[];
  transactions: Transaction[];
  userSummary: UserSummary | null;
  solBalance: number | null;
  sidebarCollapsed: boolean;
  loading: boolean;
  dataFetched: boolean;

  setWallet: (address: string | null) => void;
  toggleSidebar: () => void;
  fetchAll: (wallet: string) => Promise<void>;
  refreshGroup: (wallet: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  walletAddress: null,
  groupStatus: null,
  groups: [],
  transactions: [],
  userSummary: null,
  solBalance: null,
  sidebarCollapsed: false,
  loading: false,
  dataFetched: false,

  setWallet: (address) => set({ walletAddress: address, dataFetched: false }),

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  fetchAll: async (wallet) => {
    if (get().dataFetched && get().walletAddress === wallet) return;
    set({ loading: true });

    try {
      const [groupsRes, txRes, summaryRes] = await Promise.all([
        fetch(`${API_BASE}/api/groups/${wallet}`),
        fetch(`${API_BASE}/api/transactions/user/${wallet}`),
        fetch(`${API_BASE}/api/users/${wallet}/summary`),
      ]);

      const groups: GroupInfo[] = groupsRes.ok ? await groupsRes.json() : [];
      const transactions: Transaction[] = txRes.ok ? await txRes.json() : [];
      const userSummary: UserSummary | null = summaryRes.ok ? await summaryRes.json() : null;

      let groupStatus: GroupStatus | null = null;
      if (groups.length > 0) {
        const statusRes = await fetch(`${API_BASE}/api/groups/${groups[0].id}/status`);
        if (statusRes.ok) groupStatus = await statusRes.json();
      }

      // SOL balance
      let solBalance: number | null = null;
      try {
        const rpc = await fetch("https://api.devnet.solana.com", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getBalance", params: [wallet] }),
        });
        const data = await rpc.json();
        solBalance = data.result?.value / 1_000_000_000;
      } catch {}

      set({ groups, transactions, userSummary, groupStatus, solBalance, loading: false, dataFetched: true });
    } catch {
      set({ loading: false });
    }
  },

  refreshGroup: async (wallet) => {
    try {
      const groupsRes = await fetch(`${API_BASE}/api/groups/${wallet}`);
      const groups: GroupInfo[] = groupsRes.ok ? await groupsRes.json() : [];

      let groupStatus: GroupStatus | null = null;
      if (groups.length > 0) {
        const statusRes = await fetch(`${API_BASE}/api/groups/${groups[0].id}/status`);
        if (statusRes.ok) groupStatus = await statusRes.json();
      }

      const txRes = await fetch(`${API_BASE}/api/transactions/user/${wallet}`);
      const transactions: Transaction[] = txRes.ok ? await txRes.json() : [];

      set({ groups, groupStatus, transactions });
    } catch {}
  },
}));
