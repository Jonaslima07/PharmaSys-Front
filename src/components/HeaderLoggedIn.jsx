import React, { useState } from 'react';
import { Navbar, Nav, Button, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const HeaderLoggedIn = ({ onLogout }) => {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const userDataString = localStorage.getItem('userData');
  const userData = userDataString ? JSON.parse(userDataString) : null;
  const role = userData?.user?.role;
  const name = userData?.user?.name;

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
              to="/lotes"
              style={{ ...linkStyle, ...(hovered || clicked ? { color: '#78C2FF' } : {}) }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={handleMouseClick}
            >
              Lotes Recebidos
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

            {/* ✅ Só aparece para ADMINISTRADOR */}
            {role === 'administrador' && (
              <Nav.Link
                as={Link}
                to="/cadastrarusuario"
                style={{ ...linkStyle, ...(hovered || clicked ? { color: '#78C2FF' } : {}) }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleMouseClick}
              >
                Cadastrar Usuários
              </Nav.Link>
            )}

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

            {/* <span style={{ color: '#fff', fontWeight: '600', position: 'relative', left: '150px', marginRight: '20px' }}>
              {name && `👤 ${name}`}
            </span> */}

            <Button variant="link" onClick={handleShowModal} style={{ ...linkStyle, marginLeft: '10px' }}>
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

// 🔒 Estilos exatamente como você pediu:
const navbarStyle = {
  backgroundColor: '#000', 
};

const linkStyle = {
  color: '#fff',
  fontWeight: '600',
  fontSize: '16px',
  position: 'relative',
  left: '150px',
  marginRight: '20px',
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
