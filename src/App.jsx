import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './templates/Layout.jsx';
import Home from './views/Home.jsx';
import CriarConta from './views/CriarConta.jsx';
import Dispensacao from './views/Dispensacao.jsx';
import CadastroPaciente from './views/CadastroPaciente.jsx';
import Login from './views/Login.jsx';
import NoPage from './views/NoPage.jsx';
import CadastroDlotes from './views/CadastroDlotes.jsx';
import Dashboard from './views/Dashboard.jsx'; // Importe o Dashboard

function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Layout />, // Usa o Layout que contém o Header condicional
      errorElement: <NoPage />,
      children: [
        {
          index: true,
          element: <Home />,
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
          path: 'dashboard', // Adiciona a rota do Dashboard
          element: <Dashboard />, 
        },
      ],
    },
  ]);

  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
