import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <Navbar style={navbarStyle} variant="dark" expand="lg">
      <Navbar.Brand href="/" style={{ color: '#fff' }}>PharmaSys</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto">
          <Nav.Link as={Link} to="/" style={linkStyle}>Home</Nav.Link>
          <Nav.Link as={Link} to="/cadastroproduto" style={linkStyle}>Cadastro de Produto</Nav.Link>
          <Nav.Link as={Link} to="/cadastrocliente" style={linkStyle}>Cadastro de Cliente</Nav.Link>
          <Nav.Link as={Link} to="/cadastrarLoja" style={linkStyle}>Cadastro de Loja</Nav.Link>
          <Nav.Link as={Link} to="/login" style={linkStyle}>Login</Nav.Link>
          <Nav.Link as={Link} to="/lojacategoria" style={linkStyle}>Categoria de Loja</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;

// Constantes de CSS
const navbarStyle = {
  backgroundColor: '#000', // Cor do fundo preto
};

const linkStyle = {
  color: '#fff',           // Cor do texto branco
  fontWeight: '600',       // Peso da fonte
  fontSize: '16px',        // Tamanho da fonte
  marginRight: '30px',     // Maior espaçamento entre os links
};
