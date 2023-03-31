import React, { useEffect, useState } from 'react'

import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

import Box from "@mui/material/Box"
import TextField from "@mui/material/TextField"
import { Button, FormGroup, IconButton, ListItem, ListItemIcon,} from '@mui/material';
import Stack from "@mui/material/Stack"
import { DateField } from '@mui/x-date-pickers/DateField';
import ListItemButton from "@mui/material/ListItemButton"
import ListItemText from "@mui/material/ListItemText"
import SaveIcon from '@mui/icons-material/Save';
import dayjs from 'dayjs';
import AddIcon from '@mui/icons-material/Add';
import { useSchedulesStore } from '../store/schedules';
import { gql, useMutation, useQuery } from '@apollo/client';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import DeleteIcon from '@mui/icons-material/Delete';
import { DateTimeField } from '@mui/x-date-pickers';
// import Events from '../component/Events';

const empty = {
  id: -777,
  name: "",
  start: dayjs(),
  end: dayjs(),
  events: [],
  newEvents: []
}


const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});


const drawerWidth = 260;

const EditPage = () => {
  const [open, setOpen] = useState(false)
  // const [changing, setChanging] = useState(empty)

  const schedules = useSchedulesStore(s => s.schedules);
  const setSchedules = useSchedulesStore(s => s.setSchedules);

  const changing = useSchedulesStore(s => s.changing);
  const setChanging = useSchedulesStore(s => s.setChanging);
  const addSchedule = useSchedulesStore(s => s.addSchedule);
  const updateSchedule = useSchedulesStore(s => s.updateSchedule);
  const deleteSchedule = useSchedulesStore(s => s.deleteSchedule);
  const addNewEvent = useSchedulesStore(s => s.addNewEvent)
  const clearNewEvents = useSchedulesStore(s => s.clearNewEvents)
  const setEvents = useSchedulesStore(s => s.setEvents)


  useQuery(gql`query GetSchedules {
    schedules {
      filter {
        id
        static
        name
        start
        end
        events {
          inner {
            id
            name
            start
            end
          }
        }
      }
    }
  }`, { onCompleted: (data) => setSchedules(data.schedules.filter) })

  const [doCreateSchedule] = useMutation(gql`
    mutation CreateSchedule($name: String!, $start: DateTime!, $end: DateTime!) {
    schedule {
      create(inp:{static: true, name: $name, start:$start, end: $end}) {
        schedule {
          id
          static
          name
          start
          end 
        }
      }
    }
  }
  `, {
    onCompleted: (data) => {
      const schedule = data.schedule.create.schedule;
      addSchedule({
        id: schedule.id,
        name: schedule.name,
        start: schedule.start,
        end: schedule.end
      })
    },
    onError: console.log
  })

  const [doUpdateSchedule] = useMutation(gql`
  mutation UpdateSchedule($id: Int!, $name: String!, $start: DateTime!, $end: DateTime!) {
    schedule(id: $id) {
      update(schedule: {name: $name, start: $start, end: $end}) {
        __typename
        ... on UpdateScheduleResult {
          schedule {
            id
            static
            name
            start
            end
          }
        }
        ...on UpdateScheduleError {
          message
          code
        }
      }
    }
  }`, {
    onCompleted: (data) => {
      if (data.schedule.__typename === "UpdateScheduleResult") {
        const schedule = data.schedule.update.schedule;
        updateSchedule({
          id: schedule.id,
          name: schedule.name,
          start: schedule.start,
          end: schedule.end
        })
      }
    },
    onError: console.log
  })

  const [doDeleteSchedule] = useMutation(gql`
  mutation DeleteSchedule($id: Int!) {
    schedule(id: $id) {
      delete {
        id
      }
    }
  }`, {
    onCompleted: (data) => {
      deleteSchedule(data.schedule.delete.id)
    }, onError: console.log
  })

  const [doUpdateEvent] = useMutation(gql`mutation UpdateEvent($id: Int!, $event: UpdateEventInput!) {
    schedule(id: $id) {
      updateEvent(event: $event) {
        __typename
        ...on Error {
          message
        }
        ...on UpdateEventResult {
          event {
            id
            name
            start
            end
          }
        }
      }
    }
  }`, {
    onCompleted: (data) => {
      if (data.schedule.updateEvent.__typename === "UpdateEventResult") {
        updateEvent(1, { ...data.schedule.updateEvent.event, edited: false })
      }
    }
  })

  const [doAddEvents] = useMutation(gql`mutation AddEvents($id: Int!, $inp: AddEventsInput!) {
    schedule(id: $id) {
      addEvents(inp: $inp) {
        __typename
        ... on AddEventsResult {
          schedule {
            events {
              inner {
                id
                name
                start
                end
              }
            }
          }
        }
      }
    }
  }`, {
    onCompleted: (data) => {
      if (data.schedule.addEvents.__typename === "AddEventsResult") {
        clearNewEvents()
        setEvents(data.schedule.addEvents.schedule.events.inner)
      }
    },
  })

  const onSaveClick = () => {
    if (!changing.name) {
      setOpen(true)
      return
    }
    if (changing.id === -777) {
      doCreateSchedule({
        variables: {
          name: changing.name,
          start: changing.start.toDate().toISOString().substring(0, 10),
          end: changing.end.toDate().toISOString().substring(0, 10)
        }
      })
      setChanging(empty)
    } else {
      doUpdateSchedule({
        variables: {
          id: changing.id,
          name: changing.name,
          start: changing.start.toISOString().substring(0, 10),
          end: changing.end.toISOString().substring(0, 10)
        }
      })
    }
  }

  const onDeleteClick = (id) => () => {
    doDeleteSchedule({ variables: { id } })
    console.log(`deleted ${id}`)
  }


  useEffect(() => console.log(changing), [changing])

  const updateEvent = useSchedulesStore(s => s.updateEvent)
  const updateNewEvent = useSchedulesStore(s => s.updateNewEvent)

  const grouped = changing.events.inner?.reduce((groups, event) => {
    const date = event.start.split("T")[0]
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {});

  useEffect(() => console.log(grouped), [grouped])

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Админ панель
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', p: 0 }}>
          <List sx={{ gap: 1 }}>

            {schedules ? (
              schedules.map(s => (
                <ListItem disablePadding secondaryAction={
                  <IconButton color="error" onClick={onDeleteClick(s.id)} >
                    <DeleteIcon />
                  </IconButton>
                }>
                  <ListItemButton
                    selected={changing.id === s.id}

                    onClick={() => {
                      setChanging({
                        id: s.id,
                        name: s.name,
                        start: dayjs(s.start),
                        end: s.end ? dayjs(s.end) : dayjs(),
                        events: s.events,
                        newEvents: []
                      })
                    }}>
                    <ListItemText id={s.id} primary={s.name} secondary={s.start} sx={{ flexGrow: 0 }} />

                  </ListItemButton>
                </ListItem>

              ))

            ) : (<p>Ничего нет пока</p>)
            }

            <Divider sx={{ my: 1 }} />

            <ListItem disablePadding >
              <ListItemButton selected={changing.id === -777} onClick={() => {
                setChanging(empty)
              }}>
                <ListItemIcon>
                  <AddIcon />
                </ListItemIcon>
                <ListItemText id="-12" primary="Создать" />
              </ListItemButton>
            </ListItem>

          </List>
          <Divider />
          <FormGroup sx={{ gap: 1, px: 1 }}>

            {/* <FormControlLabel control={<Radio defaultChecked />} label="Статичное расписание" /> */}
            <TextField
              onChange={(e) => setChanging({ ...changing, name: e.target.value })}
              margin="normal"
              required
              fullWidth
              name="password"
              label="Название"
              value={changing.name}
              type="text"
              id="name"

            />
            <DateField label="Начало" value={changing.start} />
            <DateField label="Конец" value={changing.end} />

            <Stack direction="row">

              <Button
                variant="contained"
                color="primary"
                onClick={onSaveClick}
                startIcon={<SaveIcon />}
                sx={{
                  width: "100%",
                  p: 1.5,
                  mb: 2
                }}
              >
                Сохранить

              </Button>
            </Stack>

          </FormGroup>

        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />

        {/* <Events schedule={changing} /> */}

        {changing.id === -777 ? (
          <Stack sx={{
            alignItems: "center",
            justifyContent: "center",
            height: "80vh"
          }}>
            <Typography variant="h4">
              Сначала создайте расписание
            </Typography>
          </Stack>
        ) : (
          <Stack sx={{ gap: 2 }}>
            {Object.keys(grouped).map(date => (
              <Box>
                <Typography variant="h4">
                  {dayjs(date).locale("ru").format().substring(0, 10)}
                </Typography>
                <List disablePadding>
                  {grouped[date].map(e => (
                    <ListItem key={"event" + e.id} sx={{ width: "auto" }} disablePadding secondaryAction={
                      <IconButton disabled={!e.edited} color="primary" onClick={() => {
                        doUpdateEvent({
                          variables: {
                            id: changing.id,
                            event: {
                              id: e.id,
                              name: e.name,
                              start: e.start,
                              end: e.end
                            }
                          }
                        })
                      }} >
                        <SaveIcon />
                      </IconButton>
                    }>
                      <Stack direction={"row"} sx={{ gap: 1 }}>
                        <TextField label="Название" margin="dense" value={e.name} onChange={(re) => {
                          updateEvent(changing.id, { ...e, name: re.target.value, edited: true })
                        }} />
                        <DateTimeField format="L HH:mm"
                          label="Начало" margin="dense" value={dayjs(e.start)} onChange={(n) => {
                            updateEvent(changing.id, { ...e, start: n.format("YYYY-MM-DDTHH:mm"), edited: true })
                          }} />
                        <DateTimeField format="L HH:mm"
                          label="Конец" margin="dense" value={dayjs(e.end)} onChange={(n) => {
                            updateEvent(changing.id, { ...e, end: n.format("YYYY-MM-DDTHH:mm"), edited: true })
                          }} />
                      </Stack>
                    </ListItem>
                  ))}
                  <Divider sx={{ my: 2 }} />
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => {
                      addNewEvent({
                        name: "",
                        start: dayjs(),
                        end: dayjs()
                      })
                    }}>
                      <ListItemIcon>
                        <AddIcon />
                      </ListItemIcon>
                      <ListItemText id="-12" primary="Добавить" />
                    </ListItemButton>
                  </ListItem>
                </List>

              </Box>
            ))}
          </Stack>
        )}
        <List sx={{ gap: 1 }}>
          {changing.newEvents.map((e, i) => (<ListItem sx={{ width: "auto" }} disablePadding>
            <Stack direction={"row"} sx={{ gap: 1 }}>
              <TextField label="Название" margin="dense" value={e.name} onChange={(re) => {
                updateNewEvent(i, { ...e, name: re.target.value })
              }} />
              <DateTimeField format="L HH:mm"
                label="Начало" margin="dense" value={dayjs(e.start)} onChange={(n) => {
                  updateNewEvent(i, { ...e, start: n.format("YYYY-MM-DDTHH:mm") })
                }} />
              <DateTimeField format="L HH:mm"
                label="Конец" margin="dense" value={dayjs(e.end)} onChange={(n) => {
                  updateNewEvent(i, { ...e, end: n.format("YYYY-MM-DDTHH:mm") })
                }} />
            </Stack>
          </ListItem>))}
        </List>
        {(changing.newEvents.length !== 0) && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              doAddEvents({
                variables: {
                  id: changing.id,
                  inp: {
                    events: changing.newEvents.map(e => ({
                      ...e,
                      start: dayjs(e.start).format("YYYY-MM-DDTHH:mm"),
                      end: dayjs(e.end).format("YYYY-MM-DDTHH:mm")
                    }))
                  }
                }
              })
            }}
            startIcon={<SaveIcon />}
            sx={{
              width: "100%",
              p: 1.5,
              mb: 2
            }}
          >
            Сохранить

          </Button>)}

        <Snackbar open={open} autoHideDuration={6000}>
          <Alert severity="error" sx={{ width: '100%' }}>
            Заполните поля правильно
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  )
}

export default EditPage