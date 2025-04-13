import React, { useState } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  // Estado para controlar o estilo ao passar o mouse
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  const handleMouseEnter = () => {
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  const handleMouseClick = () => {
    setClicked(true);
  };

  return (
  <>
      <Navbar style={navbarStyle} variant="dark" expand="lg">
        <Navbar.Brand href="/" style={{ color: '#fff' }}>PharmaSys</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            <Nav.Link
              as={Link}
              to="/"
              style={{ ...linkStyle, ...(hovered || clicked ? { color: '#78C2FF' } : {}) }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={handleMouseClick}
            >
              Home
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/cadastropaciente"
              style={{ ...linkStyle, ...(hovered || clicked ? { color: '#78C2FF' } : {}) }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={handleMouseClick}
            >
              Cadastro de Paciente
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/criarconta"
              style={{ ...linkStyle, ...(hovered || clicked ? { color: '#78C2FF' } : {}) }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={handleMouseClick}
            >
              Criar Conta
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/login"
              style={{ ...linkStyle, ...(hovered || clicked ? { color: '#78C2FF' } : {}) }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={handleMouseClick}
            >
              Login
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/dispensacao"
              style={{ ...linkStyle, ...(hovered || clicked ? { color: '#78C2FF' } : {}) }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={handleMouseClick}
            >
              Dispensação
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/cadastrarlotes"
              style={{ ...linkStyle, ...(hovered || clicked ? { color: '#78C2FF' } : {}) }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={handleMouseClick}
            >
              Cadastrar Lotes
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    <div style={footerStyles.divBelowFooter}></div> {/* Linha acima do footer */}
  </>
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
  position: 'relative',
  marginRight: '90px',     // Maior espaçamento entre os links
  left: '230px',
  display: 'inline-block', // Manter os links na mesma linha
};

const footerStyles = {
  divBelowFooter: {
    backgroundColor: '#0066cc', // Cor da linha
    width: '100%', // Largura da div (100% da largura do contêiner pai)
    height: '5px', // Altura da div (ajustada para ser uma linha fina)
  }
};
