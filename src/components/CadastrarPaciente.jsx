import React, { useState, useEffect, useRef } from 'react';
import { Button, Modal, Form, Card, ListGroup, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import PesquisaPaciente from './PesquisaPaciente';

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
  const [formErrors, setFormErrors] = useState({
    nome: false,
    numeroCartaoSUS: false,
    identidade: false,
    medicamento: false,
    quantidade: false,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const pacienteRefs = useRef({}); // Referência para rolar até a área do paciente selecionado
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    loadPacientes();
    if (id) {
      loadPaciente(id);
    }
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
    const errors = {
      nome: !formData.nome,
      numeroCartaoSUS: !/^\d{15}$/.test(formData.numeroCartaoSUS), // Valida 15 números
      identidade: !/^\d{10}$/.test(formData.identidade), // Valida 10 números
      medicamento: !formData.medicamento,
      quantidade: !formData.quantidade,
    };
    
    setFormErrors(errors);

    if (Object.values(errors).includes(true)) {
      alert('Por favor, preencha todos os campos!');
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
    setFormErrors({
      nome: false,
      numeroCartaoSUS: false,
      identidade: false,
      medicamento: false,
      quantidade: false,
    });
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
 
  const handleSelectPaciente = (paciente) => {
    setFormData(paciente);
    // Rola até o nome do paciente clicado
    if (pacienteRefs.current[paciente.id]) {
      pacienteRefs.current[paciente.id].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="container" style={styles.container}>
      <h2 style={styles.title}>Lista de Pacientes</h2>
      {/* Componente PesquisaPaciente passando a lista de pacientes */}
      <PesquisaPaciente pacientes={pacientes} onSelectPaciente={handleSelectPaciente} />

      <div className="button-container">
        <Button variant="primary" onClick={() => openModal()} style={styles.addButton}>
           Cadastrar Paciente
        </Button>

        <p style={styles.paragrobaixo}>Faça seu cadastro aqui clicando no botão de cadastrar para poder dispensar seu medicamento!</p>

        <img src="images/medico.jpg" alt="Imagem do Carrossel" style={styles.addImg} />
      </div>

      {pacientes.length === 0 ? (
        <Alert variant="info" style={styles.emptyText}>Nenhum paciente cadastrado.</Alert>
      ) : (
      
        <ListGroup>
          {pacientes.map((paciente) => (
            <ListGroup.Item
              key={paciente.id}
              style={styles.listGroupItem} // Aplica o estilo azul entre os cards e remove a linha branca
              onClick={() => handleSelectPaciente(paciente)} // Passa o paciente selecionado
              ref={(el) => pacienteRefs.current[paciente.id] = el} // Cria uma referência dinâmica para cada paciente
            >
              {/* Aqui você pode adicionar o conteúdo que deseja exibir dentro do ListGroup.Item, por exemplo: */}
               <Card className="mb-3" style={styles.pacienteCard} key={paciente.id} onClick={() => openModal(paciente)}>
                <Card.Body>
                  <Card.Title>Nome: <span style={{ color: '#0066cc' }}>{paciente.nome}</span></Card.Title>
                  <Card.Text>Medicamento: <span style={{ color: '#0066cc' }}>{paciente.medicamento}</span></Card.Text>
                  <Card.Text>Quantidade: <span style={{ color: '#0066cc' }}>{paciente.quantidade}</span></Card.Text>
                  <Card.Text>Número do Cartão SUS: <span style={{ color: '#0066cc' }}>{paciente.numeroCartaoSUS}</span></Card.Text>
                  <Card.Text>Identidade: <span style={{ color: '#0066cc' }}>{paciente.identidade}</span></Card.Text>
                </Card.Body>
              </Card>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      <Modal show={modalVisible} onHide={resetForm} >
        <Modal.Header style={{ backgroundColor: '#CCCCCC', padding: '20px', borderRadius: '8px' }} closeButton>
          <Modal.Title style={{ backgroundColor: '#CCCCCC' }}>{editMode ? 'Editar Paciente' : 'Adicionar Paciente'}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#CCCCCC' }}>
          <Form style={{ backgroundColor: '#CCCCCC', padding: '20px', borderRadius: '8px' }}>
            <Form.Group className="mb-3" controlId="nome">
              <Form.Label style={{ color: '#000000' }}>Nome</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nome"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                isInvalid={formErrors.nome}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="numeroCartaoSUS">
              <Form.Label style={{ color: '#000000' }}>Número do Cartão do SUS</Form.Label>
              <Form.Control
                type="text"
                placeholder="Número do Cartão SUS"
                value={formData.numeroCartaoSUS}
                onChange={(e) => handleInputChange('numeroCartaoSUS', e.target.value)}
                isInvalid={formErrors.numeroCartaoSUS}
              />
              {formErrors.numeroCartaoSUS && (
                <Form.Control.Feedback type="invalid" style={{ marginTop: '-16px', fontSize: '14px', color: '#dc3545' }}>
                  O número do Cartão SUS deve ter 15 dígitos numéricos.
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="identidade">
              <Form.Label style={{ color: '#000000' }}>Identidade</Form.Label>
              <Form.Control
                type="text"
                placeholder="Identidade"
                value={formData.identidade}
                onChange={(e) => handleInputChange('identidade', e.target.value)}
                isInvalid={formErrors.identidade}
              />
              {formErrors.identidade && (
                <Form.Control.Feedback type="invalid" style={{ marginTop: '-16px', fontSize: '14px', color: '#dc3545' }}>
                  A identidade deve ter 10 dígitos numéricos.
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="medicamento">
              <Form.Label style={{ color: '#000000' }}>Medicamento</Form.Label>
              <Form.Control
                type="text"
                placeholder="Medicamento"
                value={formData.medicamento}
                onChange={(e) => handleInputChange('medicamento', e.target.value)}
                isInvalid={formErrors.medicamento}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="quantidade">
              <Form.Label style={{ color: '#000000' }}>Quantidade</Form.Label>
              <Form.Control
                type="number"
                placeholder="Quantidade"
                value={formData.quantidade}
                onChange={(e) => handleInputChange('quantidade', e.target.value)}
                isInvalid={formErrors.quantidade}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: '#CCCCCC' }}>
          <Button variant="secondary" onClick={resetForm}>Cancelar</Button>
          <Button variant="primary" onClick={handleAddPaciente}>
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
    // backgroundColor: '#78C2FF',
    backgroundColor: '#fff'
    //'#f5f5f5'
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
    position: 'relative',
    left: '510px',
    top: '5px'
  },
  addImg: {
    position: 'relative',
    left: '470px',
    height: '420px', 
    width: '387px', 
    
  },
  paragrobaixo: {
    fontSize: '16px',
    color: '#333',
    marginBottom: '10px',
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
    padding: '10px',
    borderRadius: '5px',
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
    border: '1px solid #78C2FF', // Borda azul suave
    Color: 'transparent', // Fundo transparente (se necessário)
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
  listGroupItem: {
    backgroundColor: '#78C2FF', // Azul entre os cards
    marginBottom: '0px', // Ajuste de margem entre os cards
    padding: '0px', // Remove o preenchimento extra
    border: 'none', // Remove a borda extra
    borderRadius: '8px', // Borda arredondada entre os cards
  },
};
