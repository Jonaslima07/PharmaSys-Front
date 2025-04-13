import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, InputGroup } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [id]: '',
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório.';
    }

    if (!formData.senha.trim()) {
      newErrors.senha = 'Senha é obrigatória.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    alert('Login realizado com sucesso!');
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh', backgroundColor: '#78C2FF' }}>
      <Row className="w-100">
        <Col md={4} sm={12} className="p-5 rounded" style={cardStyle}>
          <h2 className="text-center" style={{ color: '#fff', marginBottom: '140px' }}>PharmaSys</h2>
          <h4 className="text-center" style={{ marginTop: '-45px', fontSize: '35px' }}>Login</h4>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="email" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Digite seu email"
                value={formData.email}
                onChange={handleInputChange}
                isInvalid={!!errors.email}
              />
              {errors.email && <div className="error-text email-error">{errors.email}</div>}
            </Form.Group>

            <Form.Group controlId="senha" className="mb-4">
              <Form.Label>Senha</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite sua senha"
                  value={formData.senha}
                  onChange={handleInputChange}
                  isInvalid={!!errors.senha}
                  style={{ paddingRight: '40px' }}
                />
                <div
                  onClick={toggleShowPassword}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer',
                    zIndex: 2,
                  }}
                >
                  {showPassword ? (
                    <FaEyeSlash style={{ color: '#000' }} />
                  ) : (
                    <FaEye style={{ color: '#000' }} />
                  )}
                </div>
              </InputGroup>
              {errors.senha && <div className="error-text senha-error">{errors.senha}</div>}
            </Form.Group>

            <Button variant="success" type="submit" style={buttonStyle}>
              Entrar
            </Button>
          </Form>

          <div className="text-center mt-3" style={createAccountStyle}>
            <p>
              Não tem uma conta ainda?{' '}
              <a href="/criar-conta" style={{ color: '#0066cc' }}>
                Criar conta
              </a>
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginForm;


// Estilos personalizados
const cardStyle = {
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.7), rgba(120, 194, 255, 0.9))',
  boxShadow: '0 8px 30px rgba(255, 255, 255, 0.3)',
  borderRadius: '15px',
  transition: 'box-shadow 0.3s ease, transform 0.3s ease',
  maxWidth: '500px',
  width: '100%',
  position: 'relative',
  left: '340px',
  padding: '30px',
};

const buttonStyle = {
  backgroundColor: '#0066cc',
  border: 'none',
  color: 'white',
  fontSize: '16px',
  padding: '8px',
  borderRadius: '10px',
  transition: 'background-color 0.3s, transform 0.3s',
  top: '18px',
  width: '211px',
  position: 'relative',
  left: '90px',
};

const createAccountStyle = {
  marginTop: '30px',
  fontSize: '14px',
  position: 'relative',
  top: '39px',
};

