import React, { useState, useEffect } from 'react'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import CssBaseline from '@mui/material/CssBaseline'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import IconButton from '@mui/material/IconButton'
import { gql, useMutation } from '@apollo/client'
import JWT from 'jwt-client'
import { useUserStore } from '../store/user'

import { useNavigate } from 'react-router-dom'

const SIGNUP = gql`
    mutation SignUp(
        $name: String!
        $login: String!
        $password: String!
        $code: String!
    ) {
        auth {
            signUp(
                inp: {
                    name: $name
                    login: $login
                    password: $password
                    code: $code
                }
            ) {
                __typename
                ... on Error {
                    message
                    code
                }
                ... on AuthResult {
                    token
                }
            }
        }
    }
`


const RegistrationForm = () => {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const [signUpFunc, { data }] = useMutation(SIGNUP)
  const setUser = useUserStore((state) => state.setUser)

  useEffect(() => {
    if (!data) return
    if (data.auth.signUp.__typename === 'AuthResult') {
      localStorage.setItem('token', data.auth.signUp.token)
      try {
        var session = JWT.read(data.auth.signUp.token)
        console.log(session)
        setUser(session.claim)
      } catch { }
      navigate('/')
    } else {
      console.log(data.auth.signUp.message)
    }
  }, [setUser, navigate, data])

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
          Регистрация
        </Typography>
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <TextField
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            required
            fullWidth
            id="login"
            label="Your name"
            value={name}
            name="login"
            autoComplete="login"
            autoFocus
          />
          <TextField
            onChange={(e) => setLogin(e.target.value)}
            margin="normal"
            required
            fullWidth
            id="password"
            label="Your login"
            value={login}
            name="password"
            autoComplete="password"
            autoFocus
          />
          <TextField
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password "
            value={password}
            type="password"
            id="password"
            autoComplete="password"
          />
          <TextField
            onChange={(e) => setCode(e.target.value)}
            margin="normal"
            required
            fullWidth
            id="code"
            label="Your code"
            value={code}
            name="code"
            autoComplete="login"
            autoFocus
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={(e) => {
              e.preventDefault()
              signUpFunc({
                variables: { name, login, password, code },
              })
            }}
          >
            Регистрация
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Button
                variant="text"
                onClick={() => navigate('/login')}
              >
                Уже есть аккаунт? Вход
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  )
}

export default RegistrationForm
