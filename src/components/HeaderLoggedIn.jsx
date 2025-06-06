import React, { useState } from 'react';
import { Navbar, Nav, Button, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const HeaderLoggedIn = ({ onLogout }) => {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleMouseEnter = () => setHovered(true);
  const handleMouseLeave = () => setHovered(false);
  const handleMouseClick = () => setClicked(true);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleConfirmLogout = () => {
    onLogout();
    handleCloseModal();
  };

  return (
    <>
      <Navbar style={navbarStyle} variant="dark" expand="lg">
        <Navbar.Brand href="/homelogar" style={{ color: '#fff' }}>
          PharmaSys
          <img src="images/pill.png" alt="Logo" style={logoStyle.logo} />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            <Nav.Link
              as={Link}
              to="/dashboard"
              style={{ ...linkStyle, ...(hovered || clicked ? { color: '#78C2FF' } : {}) }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={handleMouseClick}
            >
              Dashboard
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/historicomedicamentos"
              style={{ ...linkStyle, ...(hovered || clicked ? { color: '#78C2FF' } : {}) }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={handleMouseClick}
            >
              Histórico de Medicamentos
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
              Cadastrar Medicamentos
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/profile"
              style={{ ...linkStyle, ...(hovered || clicked ? { color: '#78C2FF' } : {}) }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={handleMouseClick}
            >
              Perfil
            </Nav.Link>

            <Button variant="link" onClick={handleShowModal} style={linkStyle}>
              Sair
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Deseja realmente sair?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Tem certeza que deseja sair da sua conta?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Não
          </Button>
          <Button variant="primary" onClick={handleConfirmLogout}>
            Sim
          </Button>
        </Modal.Footer>
      </Modal>

      <div style={footerStyles.divBelowFooter}></div>
    </>
  );
};

export default HeaderLoggedIn;

// Constantes de CSS
const navbarStyle = {
  backgroundColor: '#000', // Cor de fundo preta
};

const linkStyle = {
  color: '#fff',
  fontWeight: '600',
  fontSize: '16px',
  position: 'relative',
  left:'100px',
  marginRight: '30px', // Reduziu o espaço à direita
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
