import * as React from 'react'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import CssBaseline from '@mui/material/CssBaseline'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import IconButton from '@mui/material/IconButton'
import { useLogin } from '../hooks'
import JWT from 'jwt-client'
import { useUserStore } from '../store/user'

export default function SignIn() {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const setUser = useUserStore((state) => state.setUser)

  const [loginFunc, data, error] = useLogin({ login, password }, () => {
    localStorage.setItem('token', data.auth.login.token)
    try {
      var session = JWT.read(data.auth.login.token)
      console.log(session)
      setUser(session.claim)
    } catch { }
    console.log(data.auth.login)

    navigate('/')
  })

  useEffect(() => {
    console.log(error)
  }, [error])

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexGrow: 0,
        }}
      >
        <IconButton
          onClick={() => {
            navigate('/')
          }}
          sx={{ p: 0 }}
        >
          <Avatar sx={{ bgcolor: '#004dff' }}>
            <ArrowBackIcon />
          </Avatar>
        </IconButton>
      </Box>
      <Box
        sx={{
          marginBottom: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: '#004dff' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Вход
        </Typography>
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <TextField
            onChange={(e) => setLogin(e.target.value)}
            margin="normal"
            required
            fullWidth
            id="login"
            label="Your login"
            value={login}
            name="email"
            autoComplete="login"
            autoFocus
          />
          <TextField
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            value={password}
            type="password"
            id="password"
            autoComplete="current-password"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={async (e) => {
              e.preventDefault()
              loginFunc()
            }}
          >
            Вход
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Button
                variant="text"
                onClick={() => navigate('/registration')}
              >
                Нет аккаунта? Регистрация
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  )
}
