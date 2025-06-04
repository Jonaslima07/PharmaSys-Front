import React, { useState, useEffect, useRef } from "react";
import { Button, Modal, Form, Alert } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import PesquisaPaciente from "./PesquisaPaciente";
import { ToastContainer, toast } from 'react-toastify';
import {
  Edit2,Trash2,User,CreditCard,FileText,Phone,MapPin, } from "lucide-react"; //Pill,Hash,Eye

const CadastrarPaciente = () => {
  const [pacientes, setPacientes] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    nome: "",
    numeroCartaoSUS: "",
    identidade: "",
    medicamento: "",
    quantidade: 0,
    cpf: "",
    telefone: "",
    endereco: "",
  });
  const [formErrors, setFormErrors] = useState({
    nome: false,
    numeroCartaoSUS: false,
    identidade: false,
    medicamento: false,
    quantidade: false,
    cpf: false,
    telefone: false,
    endereco: false,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const pacienteRefs = useRef({});
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
      const response = await fetch("http://localhost:5000/pacientes");
      const data = await response.json();
      setPacientes(data);
    } catch (error) {
      console.error("Erro ao carregar os pacientes", error);
      alert("Erro", "Não foi possível carregar os pacientes.");
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
      console.error("Erro ao carregar o paciente", error);
      alert("Erro", "Não foi possível carregar o paciente.");
    }
  };

  const savePaciente = async (paciente) => {
    try {
      let response;
      const url = editMode
        ? `http://localhost:5000/pacientes/${paciente.id}`
        : "http://localhost:5000/pacientes";

      const method = editMode ? "PUT" : "POST";

      response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paciente),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP! status: ${response.status}`);
      }

      const data = await response.json();
      loadPacientes();
      resetForm();

      // Adicione esta linha para mostrar o toast
      toast.success(editMode ? "Paciente atualizado com sucesso!" : "Paciente cadastrado com sucesso!");

      return data;
    } catch (error) {
      console.error("Erro ao salvar o paciente:", error);
      alert("Erro ao salvar o paciente: " + error.message);
    }
  };

  const deletePaciente = async (id) => {
    if (!id || id <= 0) {
      alert("ID inválido. Não é possível excluir este paciente.");
      return;
    }

    if (!window.confirm("Tem certeza que deseja excluir este paciente?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/pacientes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP! status: ${response.status}`);
      }

      loadPacientes();
      resetForm();
      alert("Paciente excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar o paciente:", error);
      alert("Erro ao deletar o paciente: " + error.message);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleAddPaciente = () => {
    const errors = {
      nome: !formData.nome,
      numeroCartaoSUS: !/^\d{15}$/.test(formData.numeroCartaoSUS),
      identidade: !/^\d{10}$/.test(formData.identidade),
      cpf: !/^\d{11}$/.test(formData.cpf),
      telefone: !/^\d{10,11}$/.test(formData.telefone),
      endereco: !formData.endereco,
    };

    setFormErrors(errors);

    if (Object.values(errors).includes(true)) {
      alert("Por favor, preencha todos os campos!");
      return;
    }

    if (!formData.id) {
      formData.id = Date.now().toString();
    }

    savePaciente(formData);
  };

  const resetForm = () => {
    setFormData({
      id: null,
      nome: "",
      numeroCartaoSUS: "",
      identidade: "",
      cpf: "",
      telefone: "",
      endereco: "",
    });
    setModalVisible(false);
    setEditMode(false);
    setFormErrors({
      nome: false,
      numeroCartaoSUS: false,
      identidade: false,
      cpf: false,
      telefone: false,
      endereco: false,
    });
  };

  const openModal = (paciente) => {
    if (paciente) {
      setFormData(paciente);
      setEditMode(true);
    } else {
      setFormData({
        id: null,
        nome: "",
        numeroCartaoSUS: "",
        identidade: "",
        cpf: "",
        telefone: "",
        endereco: "",
      });
      setEditMode(false);
    }
    setModalVisible(true);
  };

  const handleSelectPaciente = (paciente) => {
    setFormData(paciente);
    if (pacienteRefs.current[paciente.id]) {
      pacienteRefs.current[paciente.id].scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleSearch = (searchTerm) => {
    const filteredPacientes = pacientes.filter(
      (paciente) =>
        paciente.cpf.includes(searchTerm) ||
        paciente.identidade.includes(searchTerm)
    );
    setPacientes(filteredPacientes);
  };

  const maskCartaoSUS = (cartao) => {
    if (!cartao) return "";
    return cartao.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
  };

  const PatientCard = ({ patient, onEdit, onDelete, onView }) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleEdit = (e) => {
      e.stopPropagation();
      if (onEdit) {
        onEdit(patient);
      }
    };

    const handleDelete = (e) => {
      e.stopPropagation();
      if (onDelete) {
        onDelete(patient.id);
      }
    };
    return (
      <div
        style={{
          ...styles.patientCard,
          ...(isHovered ? styles.patientCardHover : {}),
          width: "570px", // Antes era 380
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        ref={(el) => (pacienteRefs.current[patient.id] = el)}
      >
        {/* Header com nome do paciente */}
        <div style={styles.cardHeader}>
          <div style={styles.iconContainer}>
            <User color="#0066cc" size={20} />
            <h3 style={{ ...styles.patientName, width: "280px" }}>
              {patient.nome}
            </h3>{" "}
            {/* Limitando largura do nome */}
          </div>
        </div>

        {/* Scrollable Content */}
        <div style={styles.scrollableContent}>
          {/* Informações do paciente em duas colunas */}
          <div style={styles.infoGrid}>
            {/* Coluna 1 */}
            <div>
              <div style={styles.infoItem}>
                <CreditCard style={styles.icon} size={16} />
                <div style={styles.infoContent}>
                  <div style={styles.label}>Cartão SUS:</div>
                  <div style={styles.monoValue}>
                    {patient.numeroCartaoSUS} {/* Mostrando número completo */}
                  </div>
                </div>
              </div>

              <div style={styles.infoItem}>
                <FileText style={styles.icon} size={16} />
                <div style={styles.infoContent}>
                  <div style={styles.label}>Identidade:</div>
                  <div style={styles.value}>{patient.identidade}</div>
                </div>
              </div>
            </div>

            {/* Coluna 2 */}
            <div>
              <div style={styles.infoItem}>
                <FileText style={styles.icon} size={16} />
                <div style={styles.infoContent}>
                  <div style={styles.label}>CPF:</div>
                  <div style={styles.monoValue}>{patient.cpf}</div>
                </div>
              </div>

              <div style={styles.infoItem}>
                <Phone style={styles.icon} size={16} />
                <div style={styles.infoContent}>
                  <div style={styles.label}>Telefone:</div>
                  <div style={styles.value}>{patient.telefone}</div>
                </div>
              </div>

              <div style={styles.infoItem}>
                <MapPin style={styles.icontext} size={16} />
                <div style={styles.infoContent2}>
                  <div style={styles.label}>Endereço:</div>
                  <div style={{ ...styles.value, ...styles.addressValue }}>
                    {patient.endereco}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ações (somente editar e excluir) */}
        <div
          style={{
            ...styles.actionButtons,
            ...(isHovered ? styles.actionButtonsVisible : {}),
          }}
        >
          <button
            onClick={handleEdit}
            style={styles.actionButton}
            title="Editar paciente"
          >
            <Edit2 size={16} color="#0066cc" />
          </button>

          <button
            onClick={handleDelete}
            style={{ ...styles.actionButton, ...styles.deleteButton }}
            title="Excluir paciente"
          >
            <Trash2 size={16} color="#dc2626" />
          </button>
        </div>

        {/* Indicador de interatividade */}
        {isHovered && <div style={styles.hoverOverlay} />}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Lista de Pacientes</h2>
      <PesquisaPaciente
        pacientes={pacientes}
        onSelectPaciente={handleSelectPaciente}
        onSearch={handleSearch}
      />
      <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />

      <div style={styles.buttonContainer}>
        <Button
          variant="primary"
          onClick={() => openModal()}
          style={styles.addButton}
        >
          Cadastrar Paciente
        </Button>

        <p style={styles.paragraph}>
          Faça seu cadastro aqui clicando no botão de cadastrar para poder
          dispensar seu medicamento!
        </p>

        <img
          src="images/medico.jpg"
          alt="Imagem do Carrossel"
          style={styles.addImg}
        />
      </div>

      {pacientes.length === 0 ? (
        <Alert variant="info" style={styles.emptyText}>
          Nenhum paciente cadastrado.
        </Alert>
      ) : (
        <div style={styles.patientsGrid}>
          {pacientes.map((paciente) => (
            <PatientCard
              key={paciente.id}
              patient={paciente}
              onEdit={openModal}
              onDelete={deletePaciente}
              onView={openModal}
            />
          ))}
        </div>
      )}

      <Modal show={modalVisible} onHide={resetForm} style={styles.modal}>
        <Modal.Header style={styles.modalHeader} closeButton>
          <Modal.Title style={styles.modalTitle}>
            {editMode ? "Editar Paciente" : "Adicionar Paciente"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={styles.modalBody}>
          <Form
            style={{
              backgroundColor: "#CCCCCC",
              padding: "20px",
              borderRadius: "8px",
            }}
          >
            <Form.Group className="mb-3" controlId="nome">
              <Form.Label style={{ color: "#000000" }}>Nome</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nome"
                value={formData.nome}
                onChange={(e) => handleInputChange("nome", e.target.value)}
                isInvalid={formErrors.nome}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="numeroCartaoSUS">
              <Form.Label style={{ color: "#000000" }}>
                Número do Cartão do SUS
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Número do Cartão SUS"
                value={formData.numeroCartaoSUS}
                onChange={(e) =>
                  handleInputChange("numeroCartaoSUS", e.target.value)
                }
                isInvalid={formErrors.numeroCartaoSUS}
              />
              {formErrors.numeroCartaoSUS && (
                <Form.Control.Feedback
                  type="invalid"
                  style={{
                    marginTop: "-16px",
                    fontSize: "14px",
                    color: "#dc3545",
                  }}
                >
                  O número do Cartão SUS deve ter 15 dígitos numéricos.
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="identidade">
              <Form.Label style={{ color: "#000000" }}>Identidade</Form.Label>
              <Form.Control
                type="text"
                placeholder="Identidade"
                value={formData.identidade}
                onChange={(e) =>
                  handleInputChange("identidade", e.target.value)
                }
                isInvalid={formErrors.identidade}
              />
              {formErrors.identidade && (
                <Form.Control.Feedback
                  type="invalid"
                  style={{
                    marginTop: "-16px",
                    fontSize: "14px",
                    color: "#dc3545",
                  }}
                >
                  A identidade deve ter 10 dígitos numéricos.
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="cpf">
              <Form.Label style={{ color: "#000000" }}>CPF</Form.Label>
              <Form.Control
                type="text"
                placeholder="CPF"
                value={formData.cpf}
                onChange={(e) => handleInputChange("cpf", e.target.value)}
                isInvalid={formErrors.cpf}
              />
              {formErrors.cpf && (
                <Form.Control.Feedback
                  type="invalid"
                  style={{
                    marginTop: "-16px",
                    fontSize: "14px",
                    color: "#dc3545",
                  }}
                >
                  O CPF deve ter 11 dígitos numéricos.
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="telefone">
              <Form.Label style={{ color: "#000000" }}>Telefone</Form.Label>
              <Form.Control
                type="text"
                placeholder="Telefone"
                value={formData.telefone}
                onChange={(e) => handleInputChange("telefone", e.target.value)}
                isInvalid={formErrors.telefone}
              />
              {formErrors.telefone && (
                <Form.Control.Feedback
                  type="invalid"
                  style={{
                    marginTop: "-16px",
                    fontSize: "14px",
                    color: "#dc3545",
                  }}
                >
                  O telefone deve ser válido.
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="endereco">
              <Form.Label style={{ color: "#000000" }}>Endereço</Form.Label>
              <Form.Control
                type="text"
                placeholder="Endereço"
                value={formData.endereco}
                onChange={(e) => handleInputChange("endereco", e.target.value)}
                isInvalid={formErrors.endereco}
              />
              {formErrors.endereco && (
                <Form.Control.Feedback
                  type="invalid"
                  style={{
                    marginTop: "-16px",
                    fontSize: "14px",
                    color: "#dc3545",
                  }}
                >
                  O endereço é obrigatório.
                </Form.Control.Feedback>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={styles.modalFooter}>
          <Button
            variant="secondary"
            onClick={resetForm}
            style={styles.cancelButton}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleAddPaciente}
            style={styles.saveButton}
          >
            {editMode ? "Editar" : "Salvar"}
          </Button>
          {editMode && (
            <Button
              variant="danger"
              onClick={() => deletePaciente(formData.id)}
              style={{
                backgroundColor: "#d32f2f",
                borderColor: "#d32f2f",
                "&:hover": {
                  backgroundColor: "#b71c1c",
                  borderColor: "#b71c1c",
                },
              }}
            >
              Deletar
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

// Constantes de estilo no final do arquivo
const styles = {
  container: {
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
    backgroundColor: "#fff",
  },

  scrollableContent: {
    maxHeight: "250px", // Definindo altura máxima para a área rolável
    overflowY: "auto", // Permitindo rolagem vertical
    paddingRight: "16px", // Espaçamento à direita, para não cobrir a rolagem
  },

  title: {
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "20px",
  },
  buttonContainer: {
    textAlign: "center",
    marginBottom: "20px",
  },
  addButton: {
    backgroundColor: "#007BFF",
    padding: "10px 20px",
    borderRadius: "5px",
    border: "none",
    marginBottom: "20px",
  },
  paragraph: {
    fontSize: "16px",
    color: "#333",
    marginBottom: "20px",
    backgroundColor: "#f9f9f9",
    padding: "10px",
    borderRadius: "5px",
  },

  emptyText: {
    textAlign: "center",
    marginTop: "20px",
    fontSize: "16px",
    color: "#666",
  },
  patientsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(450px, 1fr))",
    gap: "16px",
    marginTop: "20px",
  },
  patientCard: {
    position: "relative",
    backgroundColor: "white",
    borderRadius: "8px",
    border: "1px solid #bfdbfe",
    padding: "16px",
    cursor: "pointer",
    transition: "all 0.3s ease-in-out",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    marginBottom: "16px",
    width: "380px", // Largura fixa para todos os cards
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100%",
    overflow: "hidden", // Adicionado para garantir que nada ultrapasse o card
  },
  patientCardHover: {
    boxShadow:
      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    transform: "scale(1.02)",
    borderColor: "#93c5fd",
  },
  cardHeader: {
    marginBottom: "16px",
    borderBottom: "1px solid #f3f4f6",
    paddingBottom: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },

  iconContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flex: 1,
  },
  patientName: {
    fontSize: "1.25rem",
    fontWeight: "bold",
    color: "#0066cc",
    lineHeight: "1.25",
    whiteSpace: "nowrap", // Impede quebra de linha
    overflow: "hidden", // Esconde o texto que ultrapassa
    textOverflow: "ellipsis", // Adiciona "..." ao texto que ultrapassa o espaço
    width: "100%", // Garante que o nome ocupe toda a largura disponível
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "16px",
  },
  infoItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    marginBottom: "12px",
  },
  infoContent: {
    flex: 1,
    minWidth: 0,
  },
   infoContent2: {
    flex: 1,
    minWidth: 0,
    position: 'relative',
    left: '-270px'
  },
  icon: {
    color: "#4b5563",
    marginTop: "2px",
  },
  icontext: {
    color: "#4b5563",
    marginTop: "2px",
    position:"relative",
    left:'-270px'
  },
  label: {
    fontSize: "0.875rem",
    color: "#4b5563",
    fontWeight: "500",
  },
  value: {
    fontSize: "0.875rem",
    color: "#0066cc",
    fontWeight: "600",
    //whiteSpace: "nowrap",
    overflow: "hidden", // Esconde o texto que ultrapassa. remover aqui caso queira tirar os 3 pontinhos
    textOverflow: "ellipsis", // Adiciona "..." ao texto que ultrapassa o espaço,remover aqui caso queira tirar os 3 pontinhos
    width: "100%",
    whiteSpace: "normal", // Permite quebra de linha para quantidade e medicamento
    WebkitLineClamp: 1, // Limita a 1 linha para quantidade e medicamento
    WebkitBoxOrient: "vertical",
    display: "-webkit-box", // Para que o WebkitLineClamp funcione corretamente
  },

  monoValue: {
    display: "-webkit-box",
    fontSize: "0.875rem",
    color: "#0066cc",
    fontWeight: "600",
    overflow: "hidden",
    textOverflow: "ellipsis",
    width: "100%",
    whiteSpace: "normal", // Permite quebra de linha para endereço
    WebkitLineClamp: 2, // Limita a 2 linhas para endereço
    WebkitBoxOrient: "vertical",
  },

  addressValue: {
    lineHeight: "1.5",
    display: "-webkit-box",
    WebkitLineClamp: 2, // Limita a 2 linhas para endereço
    WebkitBoxOrient: "vertical",
    overflow: "hidden", //remover aqui caso queira tirar os 3 pontinhos
    textOverflow: "ellipsis",  //remover aqui caso queira tirar os 3 pontinhos
    whiteSpace: "normal", // Permite quebra de linha para endereço
  },

  actionButtons: {
    position: "absolute",
    top: "12px",
    right: "12px",
    display: "flex",
    gap: "8px",
    transition: "opacity 0.3s",
    opacity: "0",
  },
  actionButtonsVisible: {
    opacity: "1",
  },
  actionButton: {
    padding: "6px",
    backgroundColor: "#dbeafe",
    borderRadius: "9999px",
    transition: "background-color 0.2s",
    border: "none",
    cursor: "pointer",
  },
  deleteButton: {
    backgroundColor: "#fee2e2",
  },
  hoverOverlay: {
    position: "absolute",
    inset: "0",
    backgroundColor: "rgba(219, 234, 254, 0.3)",
    borderRadius: "8px",
    pointerEvents: "none",
  },
  // Estilos do Modal
  modal: {
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalHeader: {
    backgroundColor: "#CCCCCC",
    padding: "20px",
    borderRadius: "8px 8px 0 0",
  },
  modalTitle: {
    backgroundColor: "#CCCCCC",
    color: "#000",
  },
  modalBody: {
    backgroundColor: "#CCCCCC",
    padding: "20px",
  },
  modalFooter: {
    backgroundColor: "#CCCCCC",
    borderRadius: "0 0 8px 8px",
  },
  form: {
    backgroundColor: "#CCCCCC",
    padding: "20px",
    borderRadius: "8px",
  },
  cancelButton: {
    backgroundColor: "#6c757d",
    border: "none",
  },
  saveButton: {
    backgroundColor: "#007bff",
    border: "none",
  },
  addImg: {
    position: "relative",
    left: "30px",
    height: "420px",
    width: "387px",
  },
};

export default CadastrarPaciente;
