import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './templates/Layout.jsx';
// import Header from './components/Header';  // O Header já está sendo importado no Layout
import Home from './views/Home.jsx';
// import CadastrarProduto from './views/CadastrarProduto';  // Comentei temporariamente
// import CadastrarLoja from './views/CadastrarLoja.jsx';  // Comentei temporariamente
// import CadastroCliente from './views/CadastroCliente.jsx';  // Comentei temporariamente
// import LojaCategoria from './components/LojaCategoria.jsx';  // Comentei temporariamente
// import Login from './views/Login.jsx';  // Comentei temporariamente
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
          path: 'cadastroproduto',
          // element: <CadastrarProduto />,  // Comentei temporariamente
        },
        {
          path: 'cadastrocliente',
          // element: <CadastroCliente />,  // Comentei temporariamente
        },
        {
          path: 'cadastrarLoja',
          // element: <CadastrarLoja />,  // Comentei temporariamente
        },
        {
          path: 'login',
          // element: <Login />,  // Comentei temporariamente
        },
        {
          path: 'lojacategoria/:nomeCategoria',
          // element: <LojaCategoria />,  // Comentei temporariamente
        },
        {
          path: 'lojacategoria',
          // element: <LojaCategoria />,  // Comentei temporariamente
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
