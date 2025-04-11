import { Container } from 'react-bootstrap';
import Header from '../components/Header';
//import Footer from '../components/Footer';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <>
      <Header></Header>
      <Container>
        <main>
          <Outlet></Outlet>
        </main>
      </Container>
      {/*<Footer></Footer>*/}
    </>
  );
};

export default Layout;