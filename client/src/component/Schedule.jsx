import { useEffect, useState } from "react";
// import * as ReactDOM from "react-dom";

import Paper from '@mui/material/Paper';
import { ViewState } from '@devexpress/dx-react-scheduler';
import {
  Scheduler,
  DayView,
  WeekView,
  Appointments,
  Toolbar,
  DateNavigator,
  TodayButton,
  ViewSwitcher,
} from '@devexpress/dx-react-scheduler-material-ui';

import "../index.css";
import { useGroupsStore } from "../store/groups";

export default function Schedule() {
  const currentGroup = useGroupsStore(s => s.currentGroup)

  const [data, setData] = useState(currentGroup?.schedule.events.inner || [])

  useEffect(() => {
    console.log("Группа поменялась", currentGroup)

    setData(currentGroup?.schedule.events.inner || [])
  }, [currentGroup])

  const defaultCurrentDate = (new Date()).toISOString()

  const [currentDate, setCurrentDate] = useState((new Date()).toISOString());


  const startDayHour = currentGroup?.schedule.events.startDayHour || 8;
  const endDayHour = 19;

  return (
    <Paper>
      <Scheduler
        data={data}
        locale="ru"
      >
        <ViewState
          currentDate={currentDate}
          defaultCurrentDate={defaultCurrentDate}
          onCurrentDateChange={setCurrentDate}
          defaultCurrentViewName="Week"
        />
        <DayView
          startDayHour={startDayHour}
          endDayHour={endDayHour}
        />
        <WeekView
          startDayHour={startDayHour}
          endDayHour={endDayHour}
        />

        <Toolbar />
        <DateNavigator />
        <TodayButton messages={{ today: "Сегодня" }} />
        <ViewSwitcher />

        <Appointments />

      </Scheduler>
    </Paper>
  );
}
