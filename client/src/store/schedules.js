import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import dayjs from 'dayjs';


const empty = {
  id: -777,
  name: "",
  start: dayjs(),
  end: dayjs(),
  events: [],
  newEvents: []
}


export const useSchedulesStore = create(immer(set => ({
  currentSchedule: undefined,
  schedules: undefined,
  changing: empty,
  setChanging: (changing) => set({ changing }),
  setSchedules: (schedules) => set({ schedules }),
  setCurrentSchedule: (currentSchedule) => set({ currentGroup: currentSchedule }),
  addSchedule: (schedule) => set(state => ({ schedules: [...state.schedules, schedule] })),
  updateSchedule: (schedule) => set(state => {
    let schedules = state.schedules
    const objIndex = schedules.findIndex((s => s.id === schedule.id));
    state.schedules[objIndex] = schedule
    // return { schedules }
  }),
  deleteSchedule: (id) => set(state => {
    state.schedules = state.schedules.filter(s => s.id !== id)
    // return { schedules }
  }),
  updateEvent: (id, event) => set(state => {
    let changing = state.changing;
    const eventIndex = changing.events.inner.findIndex((e => e.id === event.id))
    changing.events.inner[eventIndex] = event
  }),
  addNewEvent: (event) => set(state => {
    state.changing.newEvents.push(event)
  }),
  setEvents: (events) => set(state => {
    state.changing.events.inner = events
  }),
  clearNewEvents: () => set(state => {
    state.changing.newEvents = []
  }),
  updateNewEvent: (index, event) => set(state => {
    state.changing.newEvents[index] = event
  })
})))