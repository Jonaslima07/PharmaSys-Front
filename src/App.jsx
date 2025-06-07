import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Layout from './templates/Layout.jsx';
import Home from './views/Home.jsx';
import CriarConta from './views/CriarConta.jsx';
import Dispensacao from './views/Dispensacao.jsx';
import CadastroPaciente from './views/CadastroPaciente.jsx';
import Login from './views/Login.jsx';
import NoPage from './views/NoPage.jsx';
import CadastroDlotes from './views/CadastroDlotes.jsx';
import MedHistorico from './views/MedHistorico.jsx'; 
import Homelogar from './components/Homelogar.jsx';
import LotesEntregues from './views/LotesEntregues.jsx'; //  o componente Dashboard esta em desenvolvimento
import Profile from './views/Profile.jsx'; 

function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Layout />, 
      errorElement: <NoPage />,
      children: [
        {
          index: true,
          element: <Home />,
        },
        {
          path: 'homelogar', 
          element: <Homelogar />,  
        },
        {
          path: 'cadastropaciente',
          element: <CadastroPaciente />,  
        },
        {
          path: 'criarconta',
          element: <CriarConta />,  
        },
        {
          path: 'login',
          element: <Login />,  
        },
        {
          path: 'dispensacao',
          element: <Dispensacao />,  
        },
        {
          path: 'cadastrarlotes',
          element: <CadastroDlotes />,  
        },
        {
          path: 'historicomedicamentos', 
          element: <MedHistorico />, 
        },
        {
          path: 'lotes', // em desenvolvimento
          element: <LotesEntregues />,
        },
        {
          path: 'profile', 
          element: <Profile />,
        },
      ],
    },
  ]);

  return (
     <GoogleOAuthProvider clientId="1034318345825-lldn929hoddci5v10u3fof6o89mlul4f.apps.googleusercontent.com"> {/* Substitua com seu clientId */}
      <RouterProvider router={router} />
    </GoogleOAuthProvider>
  );
}

export default App;
