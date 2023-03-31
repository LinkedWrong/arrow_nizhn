import { create } from 'zustand'
// import { devtools } from 'zustand/middleware'
// import { shallow } from 'zustand/shallow'

export const useGroupsStore = create((set, get) => ({
  currentGroup: undefined,
  groups: undefined,
  setGroups: (groups) => set({ groups }),
  setCurrentGroup: (currentGroup) => set({ currentGroup }),
}))