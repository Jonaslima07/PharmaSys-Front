import React, { useState } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
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
      <Navbar.Brand href="/" style={{ color: '#fff' }}>PharmaSys
        <img src="images/pill.png" alt="Logo" style={logoStyle.logo} />
      </Navbar.Brand> 
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
        </Nav>
      </Navbar.Collapse>
    </Navbar>

   <div style={footerStyles.divBelowFooter}></div>
  </>
  );
};

export default Header;

// Constantes de CSS
const navbarStyle = {
  backgroundColor: '#000',
};

const linkStyle = {
  color: '#fff',
  fontWeight: '600',
  fontSize: '16px',
  position: 'relative',
  marginRight: '90px',
  left: '230px',
  display: 'inline-block',
};

const logoStyle = {
  logo: {
    width: '20px',
    position: 'relative',
    marginBottom: '1px',
  }

  
};

const footerStyles = {
  divBelowFooter: {
    backgroundColor: '#0066cc',
    width: '100%',
    height: '3px',
  }
};