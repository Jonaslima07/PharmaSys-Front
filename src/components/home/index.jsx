import React from 'react';
import { Container, Row, Col, Button, Form, Card } from 'react-bootstrap';
import './home.css'; // Incluindo o CSS

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h1>Bem-vindo ao PharmaSys</h1>
              <p>Sistema de Gerenciamento de Medicamentos e Pacientes</p>
              <Button variant="primary" href="/login-farmaceutico">Entrar</Button>
            </Col>
            <Col md={6}>
              <img src="https://via.placeholder.com/600x400?text=PharmaSys+Banner" alt="PharmaSys" className="hero-image" />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <Container>
          <Row>
            <Col md={4}>
              <Card className="feature-card">
                <Card.Body>
                  <h5>Controle de Lotes</h5>
                  <p>Gerencie os lotes de medicamentos e receba alertas sobre validade.</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="feature-card">
                <Card.Body>
                  <h5>Promoções Inteligentes</h5>
                  <p>Aproveite medicamentos próximos ao vencimento para promoções e venda.</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="feature-card">
                <Card.Body>
                  <h5>Disposição de Medicamentos</h5>
                  <p>Controle a quantidade de medicamentos dispensados para cada paciente.</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <Container>
          <Row>
            <Col md={6}>
              <h2>Contate-nos</h2>
              <ul>
                <li>Email: <a href="mailto:contato@pharmasys.com.br">contato@pharmasys.com.br</a></li>
                <li>Telefone: <a href="tel:+5511987654321">+55 (11) 98765-4321</a></li>
                <li>Endereço: Rua dos Medicamentos, 123, São Paulo, SP</li>
                <li>
                  <a href="https://www.facebook.com/PharmaSys" target="_blank" rel="noopener noreferrer">Facebook</a>
                </li>
                <li>
                  <a href="https://www.instagram.com/pharmasys_official" target="_blank" rel="noopener noreferrer">Instagram</a>
                </li>
                <li>
                  <a href="https://www.linkedin.com/company/pharmasys" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                </li>
              </ul>
            </Col>
            <Col md={6}>
              <iframe
                src="https://www.google.com/maps/embed/v1/place?q=Rua%20dos%20Medicamentos,%20123,%20São%20Paulo,%20SP&key=YOUR_GOOGLE_MAPS_API_KEY"
                width="100%"
                height="300"
                frameBorder="0"
                style={{ border: 0 }}
                allowFullScreen=""
                aria-hidden="false"
                tabIndex="0"
              ></iframe>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Home;
