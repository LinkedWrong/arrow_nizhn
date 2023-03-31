import { useEffect, useState } from 'react'
import { gql, useMutation } from '@apollo/client'

export const useLogin = ({ login, password }, callback) => {
    const LOGIN = gql`
        mutation LoginMutation($login: String!, $password: String!) {
            auth {
                login(inp: { login: $login, password: $password }) {
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

    const [loginFunc, { data }] = useMutation(LOGIN)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!data) return
        if (data.auth.login.__typename === 'AuthResult') {
            callback()
        } else {
            setError(data.auth.login.message)
        }
    }, [callback, data, error])

    return [
        () => {
            loginFunc({
                variables: { login, password },
            })
        },
        data,
    ]
}
