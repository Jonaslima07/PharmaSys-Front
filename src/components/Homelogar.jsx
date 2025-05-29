import React from 'react';
import { Container, Button, ListGroup, Card, Row, Col, Carousel } from 'react-bootstrap';
import './home.css';
import DuvidasComp from './DuvidasComp';

const Homelogar = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section text-center py-5">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h1 className="display-4">Bem-vindo ao PharmaSys</h1>
              <p className="lead">Sistema de Gerenciamento de Medicamentos e Pacientes</p>
            </Col>
            <Col md={6}>
              {/*<img src="" alt="" className="img-fluid" />*/}  {/* caso mude de ideia para as imagens */}
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
          
            
             {/* Cards de Gerenciamento de Medicamentos (estilo da imagem) */}
             <Col md={8}>
              <Row>
                <Col md={4}>
                  <Card style={cardStyles.cardone}>
                    <Card.Body>
                      <h5 style={cardStyles.titleone}>Controle de Lotes</h5>
                      <p style={cardStyles.paragraphone}>Gerencia os medicamentos que serão armazenados em lotes e será registrado a validade do lote no sistema.</p>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4}>
                  <Card style={cardStyles.cardtwo}>
                    <Card.Body>
                      <h5 style={cardStyles.titletwo}>Dispensação de Medicamentos</h5>
                      <p style={cardStyles.paragraphtwo}>Irá registrar cada medicamento e a quantidade retirada mensalmente de cada paciente.</p>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4}>
                  <Card style={cardStyles.cardthree}>
                    <Card.Body>
                      <h5 style={cardStyles.titlethree}>Cadastro de Pacientes</h5>
                      <p style={cardStyles.paragraphthree}>Será cadastrado os novos pacientes no município, para a retirada de seus medicamentos.</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </section>
      
      <DuvidasComp/>

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
                  Tel: +55 (83) 99314-3978
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="icon-square bg-primary text-white me-3">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  Endereço: Rua Humberto Pinto Aranha, 275, Guarabira, PB
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
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.3174524256706!2d-35.485936425243615!3d-6.852498993145819!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7adb6aa1f558467%3A0x71cf6fbed1bbfa24!2sR.%20Humberto%20P.%20Aranha%2C%20275%20-%20Nordeste%20I%2C%20Guarabira%20-%20PB%2C%2058200-000!5e0!3m2!1spt-BR!2sbr!4v1745810054547!5m2!1spt-BR!2sbr"
                    width="100%"
                    height="250"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Localização Rua Humberto P. Aranha"
                  ></iframe>
            
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Homelogar;


const cardStyles = {
  cardone: {
    backgroundColor: '#ffffff',
    height:'190px',
    width:'400px',
    borderRadius: '16px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    textAlign: 'center',
    color: '#12141a',
    border: '3px solid #78C2FF',
    transition: 'box-shadow 0.3s ease, transform 0.3s ease',
    position: 'relative', // Para permitir ajustes no layout
    left: '0px',
    top: '-80px'
  },
  cardtwo: {
    backgroundColor: '#ffffff',
    height:'192px',
    width:'400px',
    borderRadius: '16px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    textAlign: 'center',
    color: '#12141a',
    border: '3px solid #78C2FF',
    transition: 'box-shadow 0.3s ease, transform 0.3s ease',
    position: 'relative', // Para permitir ajustes no layout
    left: '140px',
    top: '-82px'
  },
  cardthree: {
    backgroundColor: '#ffffff',
    height:'192px',
    width:'400px',
    borderRadius: '16px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    textAlign: 'center',
    color: '#12141a',
    border: '3px solid #78C2FF',
    transition: 'box-shadow 0.3s ease, transform 0.3s ease',
    position: 'relative', // Para permitir ajustes no layout
    left: '-340px',
    top: '130px'
  },
  hover: {
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
    transform: 'translateY(-5px)',
  },
  titletwo: {
    height:'27px',
    position: 'relative',
    top:'-25px',
    fontWeight: 700,
    fontSize: '1.2rem',
    color: '#000',
    marginBottom: '15px',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  titlethree: {
    height:'21px',
    position: 'relative',
    top:'-22px',
    fontWeight: 700,
    fontSize: '1.2rem',
    color: '#000',
    marginBottom: '15px',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  titleone: {
    height:'21px',
    position: 'relative',
    top:'-22px',
    fontWeight: 700,
    fontSize: '1.2rem',
    color: '#000',
    marginBottom: '15px',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  
  paragraphone: {
    margin: 0,
    color: '#78C2FF',
    fontSize: '1.3rem',
    lineHeight: '1.6',
    textAlign: 'center',
    position: 'relative', // Para permitir ajustes no layout
    left: '-14px',
    top: '-22px'
  },
  paragraphtwo: {
    margin: 0,
    color: '#78C2FF',
    fontSize: '1.3rem',
    lineHeight: '1.6',
    textAlign: 'center',
    position: 'relative', // Para permitir ajustes no layout
    left: '-14px',
    top: '-10px',
  },
  paragraphthree: {
    margin: 0,
    color: '#78C2FF',
    fontSize: '1.3rem',
    lineHeight: '1.6',
    textAlign: 'center',
    position: 'relative', // Para permitir ajustes no layout
    left: '-14px',
    top: '-10px',
  },
};