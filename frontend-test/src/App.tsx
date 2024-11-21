import { Routes, Route } from 'react-router-dom'
import Login from './screens/Login'
import Dashboard from './screens/Dashboard'
import ProtectedRoutes from './components/ProtecteRoutes'

function App() {

  return (
    <Routes>
        <Route element={ <ProtectedRoutes />}>
            <Route path='/' element={ <Dashboard /> }/>
        </Route>
        
        <Route path='/login' element={ <Login /> }/>
    </Routes>
  )
}

export default App
