import { create } from 'zustand';

type RewardState = {
  visible: boolean;
  bytesFreed: number;
  totalBytesFreed: number;
};

type RewardActions = {
  show: (bytesFreed: number, totalBytesFreed: number) => void;
  hide: () => void;
};

export const useRewardStore = create<RewardState & RewardActions>((set) => ({
  visible: false,
  bytesFreed: 0,
  totalBytesFreed: 0,
  show: (bytesFreed, totalBytesFreed) =>
    set({ visible: true, bytesFreed, totalBytesFreed }),
  hide: () => set({ visible: false }),
}));
