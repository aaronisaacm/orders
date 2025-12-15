import { create } from "zustand";
import type { Order } from "../../models/Order";

type Store = {
    orders: Order[];
    setOrders: (orders: Order[]) => void;
}

export const useOrderStore = create<Store>()((set) => ({
    orders: [],
    setOrders: (orders: Order[]) => set(() => ({ orders })),
}))