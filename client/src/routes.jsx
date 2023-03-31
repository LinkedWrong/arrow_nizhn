import { MAIN_ROUTE, REGISTRATION_ROUTE, LOGIN_ROUTE, EDIT_ROUTE } from './utils/constans'
import MainPage from './page/MainPage'
import LoginPage from './page/LoginPage'
import RegistrationPage from './page/RegistrationPage'
import EditPage from './page/EditPage'

export const publicRoutes = [
    {
        path: LOGIN_ROUTE,
        Component: LoginPage,
    },
    {
        path: REGISTRATION_ROUTE,
        Component: RegistrationPage,
    },
    {
        path: MAIN_ROUTE,
        Component: MainPage,
    }, 
    {
        path: EDIT_ROUTE,
        Component: EditPage
    }
]