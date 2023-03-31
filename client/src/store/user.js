import { create } from 'zustand'
import { shallow } from 'zustand/shallow'

export const useUserStore = create((set) => ({
    user: undefined,
    setUser: (user) => set({ user }),

}), shallow)
