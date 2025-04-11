import React from 'react';
import { Container, Button, ListGroup, Card, Row, Col, Carousel } from 'react-bootstrap';
import './home.css';

const PaginaInicial = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section text-center py-5">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h1 className="display-4">Bem-vindo ao PharmaSys</h1>
              <p className="lead">Sistema de Gerenciamento de Medicamentos e Pacientes</p>
              <Button variant="outline-primary" className="mt-3">Saiba mais</Button>
            </Col>
            <Col md={6}>
              <img src="" alt="" className="img-fluid" />
            </Col>
          </Row>
        </Container>
      </section>

      <hr className="my-5" />

      {/* Gerenciamento de Medicamentos e Carrossel */}
      <section className="medicamentos-section py-5">
        <Container>
          <h2 className="text-center mb-5">Gerenciamento de Medicamentos</h2>
          
          <Row className="align-items-center">
            {/* Carrossel Moved to the Left */}
            <Col md={4}>
              <Carousel  controls={false} indicators={false}>
                <Carousel.Item>
                  <img
                    className="d-block w-100"
                    src="images/carrosselimg.jpeg"
                    alt="Imagem do Carrossel"  style={{ height: '407px', width: '407', objectFit: 'cover' }} 
                  />
                  {/* <Carousel.Caption>
                    <h3>Imagem do Carrossel</h3>
                    <p>Descrição da imagem no carrossel.</p>
                  </Carousel.Caption> */}
                </Carousel.Item>
              </Carousel>
            </Col>
            
            {/* Gerenciamento de Medicamentos (Columns) */}
            <Col md={8}>
              <Row>
                <Col md={4}>
                  <Card className="h-100">
                    <div className="card-lista-funcionalidades">
                      <div className="func-item">
                        <h5>Controle de Lotes</h5>
                        <p>Gerencie os lotes de medicamentos e receba alertas sobre validade.</p>
                      </div>
                      <div className="func-item">
                        <h5>Promoções Inteligentes</h5>
                        <p>Aproveite medicamentos próximos ao vencimento para promoções e venda.</p>
                      </div>
                      <div className="func-item">
                        <h5>Disposição de Medicamentos</h5>
                        <p>Controle a quantidade de medicamentos dispensados para cada paciente.</p>
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </section>

      <hr className="my-5" />
    

          {/* Contatos */}
      <section className="contact-section py-5">
        <Container>
          <h2 className="text-center mb-5">Contatos</h2>

          <Row>
            <Col md={6}>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <div className="icon-square bg-primary text-white me-3">
                    <i className="fas fa-envelope"></i>
                  </div>
                  Email: contato@pharmasys.com.br
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="icon-square bg-primary text-white me-3">
                    <i className="fas fa-phone-alt"></i>
                  </div>
                  Tel: +55 (11) 98765-4321
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="icon-square bg-primary text-white me-3">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  Endereço: Rua dos Medicamentos, 123, São Paulo, SP
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="icon-square bg-primary text-white me-3">
                    <i className="fab fa-facebook-f"></i>
                  </div>
                  Facebook: /pharmasys
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="icon-square bg-primary text-white me-3">
                    <i className="fab fa-instagram"></i>
                  </div>
                  Instagram: @pharmasys.official
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="icon-square bg-primary text-white me-3">
                    <i className="fab fa-linkedin-in"></i>
                  </div>
                  LinkedIn: /company/pharmasys
                </ListGroup.Item>
              </ListGroup>
            </Col>

            <Col md={6}>
              <div className="map">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14624.019389302695!2d-46.67223816085882!3d-23.532681703229055!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce591b555a04f5%3A0x49614f62b4e5f9a9!2sRua%20dos%20Medicamentos%2C%20123%20-%20Vila%20Matilde%2C%20S%C3%A3o%20Paulo%20-%20SP%2C%2003001-020%2C%20Brasil!5e0!3m2!1spt-BR!2sus!4v1641189625728!5m2!1spt-BR!2sus"
                  width="100%"
                  height="200px"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  title="Localização PharmaSys"
                ></iframe>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default PaginaInicial;
