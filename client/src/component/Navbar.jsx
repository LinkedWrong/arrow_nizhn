import React, { useEffect, useState, useRef } from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Menu from '@mui/material/Menu'
import MenuIcon from '@mui/icons-material/Menu'
import Container from '@mui/material/Container'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import MenuItem from '@mui/material/MenuItem'
// import AdbIcon from '@mui/icons-material/Adb'
import Stack from '@mui/material/Stack'
import { useNavigate } from 'react-router-dom'
// import { gql, useQuery } from '@apollo/client'
import { useUserStore } from '../store/user'
import { useGroupsStore } from '../store/groups'


// const pages = ['1a', '1b', '1c', '2a', '2b', '2c', '3a', '4b', '5c', '6a', '6b', '6c'];
// const settings = ['Profile', 'Account', 'Dashboard', 'Logout']

function ResponsiveAppBar() {
  const setCurrentGroup = useGroupsStore(s => s.setCurrentGroup)
  const [anchorElNav, setAnchorElNav] = useState(null)
  const [anchorElUser, setAnchorElUser] = useState(null)
  const [isOpen, setIsOpen] = useState(false)

  const [isUserOpen, setIsUserOpen] = useState(false)

  const ref = useRef()

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget)
    setIsOpen(true)
  }
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(ref.current)
    console.log("clicked")

    setIsUserOpen(true)
  }

  const handleCloseNavMenu = () => {
    setAnchorElNav(null)
    setIsOpen(false)
  }

  const handleCloseUserMenu = () => {
    setAnchorElUser(null)
    setIsUserOpen(false)
  }

  const groups = useGroupsStore(s => s.groups)
  // let currentGroups = groups?.filter(g => g.schedule) ?? [];

  useEffect(() => console.log(groups), [groups])


  const navigate = useNavigate()

  const user = useUserStore((s) => s.user)
  const setUser = useUserStore((state) => state.setUser)

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box sx={{ flexGrow: 0 }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            {groups && (
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={isOpen}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: 'block' },
                }}
              >
                {groups.filter(g => g.schedule).map((group) => (
                  <MenuItem
                    key={group.name}
                    onClick={() => { setCurrentGroup(group); handleCloseNavMenu() }}
                  >
                    <Typography textAlign="center">
                      {group.name}
                    </Typography>
                  </MenuItem>
                ))}
              </Menu>
            )}
          </Box>
          <Typography
            variant="h4"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Расписание
          </Typography>

          <Typography
            variant="h5"
            noWrap
            component="a"
            href=""
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Расписание
          </Typography>
          <Box sx={{ flexGrow: 1 }} />

          {user ? (
            <Stack direction={"row"} spacing={1}>
              {user.role && (
                <Button
                  variant='contained'
                  color='primary'
                  key={'edit'}
                  onClick={() => {
                    navigate("/edit")
                  }}
                >
                  {/* <Typography textAlign="center"> */}
                  Расписания
                  {/* </Typography> */}
                </Button>)
              }
              <Button
                variant='contained'
                color='secondary'
                key={'logout'}
                onClick={() => {
                  localStorage.removeItem('token')
                  console.log(user)
                  setUser(null)
                }}
              >
                {'Выйти'}
              </Button>
            </Stack>
          ) : (
            <Box sx={{ flexGrow: 0 }}>
              <Stack
                spacing={2}
                direction="row"
                sx={{ display: { xs: 'none', sm: 'flex' } }}
              >
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => {
                    navigate('/registration')
                  }}
                >
                  Регистрация
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => {
                    navigate('/login')
                  }}
                >
                  Вход
                </Button>
              </Stack>
              <Stack
                spacing={2}
                direction="row"
                sx={{ display: { xs: 'flex', sm: 'none' } }}
              >
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    navigate('/login')
                  }}
                >
                  Вход
                </Button>
              </Stack>
            </Box>
          )}
        </Toolbar>
      </Container >
    </AppBar >
  )
}
export default ResponsiveAppBar
