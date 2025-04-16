import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Card, ListGroup, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';

const CadastrarPaciente = () => {
  const [pacientes, setPacientes] = useState([]);
  const [formData, setFormData] = useState({
    id: null, 
    nome: '',
    numeroCartaoSUS: '',
    identidade: '',
    medicamento: '',
    quantidade: 0,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [location, setLocation] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    loadPacientes();
    if (id) {
      loadPaciente(id);
    }
    getLocation();
  }, [id]);

  const loadPacientes = async () => {
    try {
      const response = await fetch('http://localhost:5000/pacientes');
      const data = await response.json();
      setPacientes(data);
    } catch (error) {
      console.error('Erro ao carregar os pacientes', error);
      alert('Erro', 'Não foi possível carregar os pacientes.');
    }
  };

  const loadPaciente = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/pacientes/${id}`);
      if (!response.ok) {
        throw new Error(`Erro HTTP! status: ${response.status}`);
      }
      const data = await response.json();
      setFormData(data);
      setEditMode(true);
      setModalVisible(true);
    } catch (error) {
      console.error('Erro ao carregar o paciente', error);
      alert('Erro', 'Não foi possível carregar o paciente.');
    }
  };

  const savePaciente = async (paciente) => {
    try {
      let response;
      const url = editMode 
        ? `http://localhost:5000/pacientes/${paciente.id}`
        : 'http://localhost:5000/pacientes';

      const method = editMode ? 'PUT' : 'POST';

      response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paciente),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP! status: ${response.status}`);
      }

      const data = await response.json();
      loadPacientes();
      resetForm();
      return data;
    } catch (error) {
      console.error('Erro ao salvar o paciente:', error);
      alert('Erro ao salvar o paciente: ' + error.message);
    }
  };

  const deletePaciente = async (id) => {
    if (!id || id <= 0) {
      alert("ID inválido. Não é possível excluir este paciente.");
      return;
    }

    if (!window.confirm('Tem certeza que deseja excluir este paciente?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/pacientes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP! status: ${response.status}`);
      }

      loadPacientes();
      resetForm();
      alert('Paciente excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar o paciente:', error);
      alert('Erro ao deletar o paciente: ' + error.message);
    }
  };

  const getLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`Lat: ${latitude}, Lng: ${longitude}`);
        },
        () => {
          alert('Erro', 'Não foi possível obter sua localização.');
        }
      );
    }
  };

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleAddPaciente = () => {
    if (!formData.nome || !formData.numeroCartaoSUS || !formData.identidade || !formData.medicamento || !formData.quantidade) {
      alert('Erro', 'Por favor, preencha todos os campos!');
      return;
    }

    // Gerar um ID único se não existir
    if (!formData.id) {
      formData.id = Date.now().toString(); // Gerando ID único baseado no timestamp
    }

    savePaciente(formData);
  };

  const resetForm = () => {
    setFormData({
      id: null,
      nome: '',
      numeroCartaoSUS: '',
      identidade: '',
      medicamento: '',
      quantidade: 0
    });
    setModalVisible(false);
    setEditMode(false);
  };

  const openModal = (paciente) => {
    if (paciente) {
      setFormData(paciente);
      setEditMode(true);
    } else {
      setFormData({
        id: null,
        nome: '',
        numeroCartaoSUS: '',
        identidade: '',
        medicamento: '',
        quantidade: 0
      });
      setEditMode(false);
    }
    setModalVisible(true);
  };

  const renderPaciente = (paciente) => (
    <Card className="mb-3" style={styles.pacienteCard} key={paciente.id} onClick={() => openModal(paciente)}>
      <Card.Body>
        <Card.Title>Nome: {paciente.nome}</Card.Title>
        <Card.Text>Medicamento: {paciente.medicamento}</Card.Text>
        <Card.Text>Quantidade: {paciente.quantidade}</Card.Text>
        <Card.Text>Número do Cartão SUS: {paciente.numeroCartaoSUS}</Card.Text>
        <Card.Text>Identidade: {paciente.identidade}</Card.Text>
      </Card.Body>
    </Card>
  );

  return (
    <div className="container" style={styles.container}>
      <h2 style={styles.title}>Lista de Pacientes</h2>
      <div className="mb-3">
        <span style={styles.locationText}>Localização: {location || 'Obtendo localização...'}</span>
      </div>
      <div className="button-container">
        <Button variant="primary" onClick={() => openModal()} style={styles.addButton}>
          + Adicionar Paciente
        </Button>
      </div>

      {pacientes.length === 0 ? (
        <Alert variant="info" style={styles.emptyText}>Nenhum paciente cadastrado.</Alert>
      ) : (
        <ListGroup>
          {pacientes.map(renderPaciente)}
        </ListGroup>
      )}

      {/* Modal for Adding/Editing Pacientes */}
      <Modal show={modalVisible} onHide={resetForm}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Editar Paciente' : 'Adicionar Paciente'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="nome">
              <Form.Label>Nome</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nome"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="numeroCartaoSUS">
              <Form.Label>Número do Cartão do SUS</Form.Label>
              <Form.Control
                type="text"
                placeholder="Número do Cartão SUS"
                value={formData.numeroCartaoSUS}
                onChange={(e) => handleInputChange('numeroCartaoSUS', e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="identidade">
              <Form.Label>Identidade</Form.Label>
              <Form.Control
                type="text"
                placeholder="Identidade"
                value={formData.identidade}
                onChange={(e) => handleInputChange('identidade', e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="medicamento">
              <Form.Label>Medicamento</Form.Label>
              <Form.Control
                type="text"
                placeholder="Medicamento"
                value={formData.medicamento}
                onChange={(e) => handleInputChange('medicamento', e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="quantidade">
              <Form.Label>Quantidade</Form.Label>
              <Form.Control
                type="number"
                placeholder="Quantidade"
                value={formData.quantidade}
                onChange={(e) => handleInputChange('quantidade', e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={resetForm}>Cancelar</Button>
          <Button variant="success" onClick={handleAddPaciente}>
            {editMode ? 'Editar' : 'Salvar'}
          </Button>
          {editMode && (
            <Button variant="danger" onClick={() => deletePaciente(formData.id)}>Deletar</Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CadastrarPaciente;

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: '22px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  buttonContainer: {
    display: 'flex',  
    justifyContent: 'center',  
    alignItems: 'center',  
    marginBottom: '20px',
  },
  addButton: {
    backgroundColor: '#007BFF',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '20px',
  },
  locationText: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px',
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
    padding: '10px',
    borderRadius: '5px',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '16px',
    color: '#888',
  },
  pacienteCard: {
    backgroundColor: '#fff',
    padding: '15px',
    borderRadius: '5px',
    marginBottom: '10px',
    boxShadow: '0 2px 3px rgba(0, 0, 0, 0.2)',
  },
  pacienteTitulo: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  pacienteItem: {
    color: 'blue',
    fontSize: '16px',
    fontWeight: '500',
  },
};
