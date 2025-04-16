import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './templates/Layout.jsx';
// import Header from './components/Header';  // O Header já está sendo importado no Layout
import Home from './views/Home.jsx';
import CriarConta from './views/CriarConta.jsx';  // Comentei temporariamente
// import CadastrarLoja from './views/CadastrarLoja.jsx';  // Comentei temporariamente
 import CadastroPaciente from './views/CadastroPaciente.jsx';  // Comentei temporariamente
// import LojaCategoria from './components/LojaCategoria.jsx';  // Comentei temporariamente
import Login from './views/Login.jsx';  // Comentei temporariamente
import NoPage from './views/NoPage.jsx';  // Este ainda vai ser usado para a rota de erro

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
          path: 'cadastropaciente',
           element: <CadastroPaciente />,  // Comentei temporariamente
        },
        {
          path: 'criarconta',
           element: <CriarConta />,  // Comentei temporariamente
        },
        {
          path: 'login',
           element: <Login />,  // Comentei temporariamente
        },
        {
          path: 'dispensacao',
          // element: <Dispensacao />,  // Comentei temporariamente
        },
        {
          path: 'cadastrarlotes',
          // element: <CadastroDlotes />,  // Comentei temporariamente
        },
      ],
    },
  ]);

  return (
    <div>
      {/* <Header />  // O Header já está sendo importado no Layout */}
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
