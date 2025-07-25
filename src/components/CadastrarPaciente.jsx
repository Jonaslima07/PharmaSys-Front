import React, { useState, useEffect, useRef } from "react";
import { Button, Modal, Form, Alert } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import PesquisaPaciente from "./PesquisaPaciente";
import { ToastContainer, toast } from "react-toastify";
import { Edit2, Trash2, User, CreditCard, FileText, Phone, MapPin } from "lucide-react";

const CadastrarPaciente = () => {
  const [pacientes, setPacientes] = useState([]);
  const [filteredPacientes, setFilteredPacientes] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    nome: "",
    cartao_sus: "",
    rg: "",
    cpf: "",
    telefone: "",
    endereco: "",
  });
  const [formErrors, setFormErrors] = useState({
    nome: false,
    cartao_sus: false,
    rg: false,
    cpf: false,
    telefone: false,
    endereco: false,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const pacienteRefs = useRef({});
  const navigate = useNavigate();
  const { id } = useParams();
  const [originalPaciente, setOriginalPaciente] = useState(null);


  const getToken = () => {
    const userDataString = localStorage.getItem("userData");
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        if (userData.token) return userData.token;
      } catch { /* empty */ }
    }
    return localStorage.getItem("token") || null;
  };

  useEffect(() => {
    (async () => {
      try {
        await loadPacientes();
        if (id) {
          await loadPaciente(id);
        }
      } catch (error) {
        console.error("Erro ao carregar pacientes:", error);
      }
    })();
  }, [id]);

  const loadPacientes = async () => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    const response = await fetch("http://localhost:5000/pacientes", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 401 && errorText.includes("expired")) {
        localStorage.removeItem("userData");
        alert("Sua sessão expirou. Faça login novamente.");
        navigate("/login");
        return;
      }
      throw new Error(`Erro ao buscar pacientes: ${errorText}`);
    }

    const data = await response.json();
    setPacientes(data);
    setFilteredPacientes(data);
  };

  const loadPaciente = async (id) => {
  const token = getToken();
  if (!token) {
    alert("Token JWT não encontrado");
    return;
  }

  const response = await fetch(`http://localhost:5000/pacientes/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    alert("Erro ao carregar o paciente");
    return;
  }

  const data = await response.json();
  setFormData(data);
  setEditMode(true);  // ✅ aqui também precisa garantir que editMode está true
  setOriginalPaciente(data);
  setModalVisible(true);
};


  const savePaciente = async (paciente) => {
    const token = getToken();
    if (!token) {
      alert("Token JWT não encontrado");
      return;
    }

    const pacienteData = extractPacienteData(paciente);

    const response = await fetch("http://localhost:5000/pacientes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(pacienteData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      toast.error(errorData.erro || "Erro ao cadastrar paciente");
      throw new Error(errorData.erro || "Erro ao cadastrar paciente");
    }

    toast.success("Paciente cadastrado com sucesso!");
    await loadPacientes();
    resetForm();
  };

 const editPaciente = async (paciente) => {
  const token = getToken();
  if (!token) {
    alert("Token JWT não encontrado");
    return;
  }

  const pacienteData = getChangedFields();  // Só campos alterados

  if (Object.keys(pacienteData).length === 0) {
    toast.info("Nenhuma alteração detectada.");
    return;
  }

  const response = await fetch(`http://localhost:5000/pacientes/${paciente.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(pacienteData),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error("Erro:", result);
    toast.error(result.erro || "Erro ao editar paciente");
    throw new Error(result.erro || "Erro ao editar paciente");
  }

  toast.success("Paciente editado com sucesso!");
  await loadPacientes();
  resetForm();
};

  const getChangedFields = () => {
  if (!originalPaciente) return formData; // sem original, envia tudo (novo cadastro)

  const changed = {};
  for (const key in formData) {
    if (formData[key] !== originalPaciente[key]) {
      changed[key] = formData[key];
    }
  }
  return changed;
};


  const extractPacienteData = (paciente) => ({
    nome: paciente.nome,
    cartao_sus: paciente.cartao_sus,
    rg: paciente.rg,
    cpf: paciente.cpf,
    telefone: paciente.telefone,
    endereco: paciente.endereco,
  });

  const deletePaciente = async (id) => {
    if (!id || id <= 0 || !window.confirm("Tem certeza?")) return;
    const token = getToken();
    if (!token) {
      alert("Token JWT não encontrado");
      return;
    }

    const response = await fetch(`http://localhost:5000/pacientes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      alert("Erro ao deletar o paciente");
      return;
    }

    toast.success("Paciente excluído com sucesso!");
    await loadPacientes();
    resetForm();
  };

  const handleInputChange = (name, value) => {
    let processedValue = value;
    if (name === "cpf") processedValue = value.replace(/\D/g, "").slice(0, 11);
    setFormData({ ...formData, [name]: processedValue });
  };

  const handleAddPaciente = async () => {
  const errors = {
    nome: !formData.nome,
    cartao_sus: !/^\d{15}$/.test(formData.cartao_sus),
    rg: !/^\d{10}$/.test(formData.rg),
    cpf: !/^\d{11}$/.test(formData.cpf),
    telefone: !/^\d{10,11}$/.test(formData.telefone),
    endereco: !formData.endereco,
  };

  setFormErrors(errors);

  if (Object.values(errors).includes(true)) {
    alert("Por favor, preencha todos os campos corretamente!");
    return;
  }

  try {
    // Decisão segura: se tem ID -> editar (PUT), se não tem -> criar (POST)
    if (formData.id) {
      await editPaciente(formData);  // PUT
    } else {
      await savePaciente(formData);  // POST
    }
  } catch (error) {
    console.error(error.message);
    toast.error(error.message);
    alert(error.message);
  }
};


  const resetForm = () => {
    setFormData({ id: null, nome: "", cartao_sus: "", rg: "", cpf: "", telefone: "", endereco: "" });
    setModalVisible(false);
    setEditMode(false);
    setFormErrors({ nome: false, cartao_sus: false, rg: false, cpf: false, telefone: false, endereco: false });
  };

  const openModal = (paciente) => {
  if (paciente) {
    setFormData(paciente);
    setEditMode(true);
  } else {
    resetForm();  // Isso já garante editMode false e limpa os dados
  }
  setModalVisible(true);
};

  const handleSelectPaciente = (paciente) => {
    setFormData(paciente);
    if (pacienteRefs.current[paciente.id]) {
      pacienteRefs.current[paciente.id].scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSearch = (searchTerm) => {
    const filtered = pacientes.filter(
      (paciente) => paciente.cpf.includes(searchTerm) || paciente.rg.includes(searchTerm)
    );
    setFilteredPacientes(filtered);
  };

  const PatientCard = ({ patient, onEdit, onDelete }) => {
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
          width: "570px",
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
            </h3>
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
                    {patient.cartao_sus || "Não informado"}
                  </div>
                </div>
              </div>

              <div style={styles.infoItem}>
                <FileText style={styles.icon} size={16} />
                <div style={styles.infoContent}>
                  <div style={styles.label}>Identidade (RG):</div>
                  <div style={styles.value}>{patient.rg || "Não informado"}</div>
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
                <MapPin style={styles.icon} size={16} />
                <div style={styles.infoContent}>
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
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Lista de Pacientes</h2>
      <PesquisaPaciente
        pacientes={filteredPacientes}
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

      {filteredPacientes.length === 0 ? (
        <Alert variant="info" style={styles.emptyText}>
          Nenhum paciente cadastrado.
        </Alert>
      ) : (
        <div style={styles.patientsGrid}>
          {filteredPacientes.map((paciente) => (
            <PatientCard
              key={paciente.id}
              patient={paciente}
              onEdit={openModal}
              onDelete={deletePaciente}
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
                name="cartao_sus"
                value={formData.cartao_sus}
                onChange={(e) =>
                  handleInputChange(e.target.name, e.target.value)
                }
                isInvalid={formErrors.cartao_sus}
              />
              {formErrors.cartao_sus && (
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
                name="rg"
                value={formData.rg}
                onChange={(e) =>
                  handleInputChange(e.target.name, e.target.value)
                }
                isInvalid={formErrors.rg}
              />
              {formErrors.rg && (
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

            {/* <Form.Group className="mb-3" controlId="medicamento">
              <Form.Label style={{ color: "#000000" }}>Medicamento</Form.Label>
              <Form.Control
                type="text"
                placeholder="Medicamento"
                value={formData.medicamento}
                onChange={(e) =>
                  handleInputChange("medicamento", e.target.value)
                }
                isInvalid={formErrors.medicamento}
              />
              {formErrors.medicamento && (
                <Form.Control.Feedback
                  type="invalid"
                  style={{
                    marginTop: "-16px",
                    fontSize: "14px",
                    color: "#dc3545",
                  }}
                >
                  O medicamento é obrigatório.
                </Form.Control.Feedback>
              )}
            </Form.Group> */}

            {/* <Form.Group className="mb-3" controlId="quantidade">
              <Form.Label style={{ color: "#000000" }}>Quantidade</Form.Label>
              <Form.Control
                type="number"
                min={1}
                placeholder="Quantidade"
                value={formData.quantidade}
                onChange={(e) =>
                  handleInputChange("quantidade", e.target.value)
                }
                isInvalid={formErrors.quantidade}
              />
              {formErrors.quantidade && (
                <Form.Control.Feedback
                  type="invalid"
                  style={{
                    marginTop: "-16px",
                    fontSize: "14px",
                    color: "#dc3545",
                  }}
                >
                  A quantidade deve ser maior que zero.
                </Form.Control.Feedback>
              )}
            </Form.Group> */}

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
  position: 'relative',
  left: '-270px' // Isso empurra o conteúdo para fora da visualização
},
  icon: {
    color: "#4b5563",
    marginTop: "2px",
  },
  icontext: {
    color: "#4b5563",
    marginTop: "2px",
    position: "relative",
    left: "-270px",
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
    WebkitLineClamp: 5, // Limita a 2 linhas para endereço
    WebkitBoxOrient: "vertical",
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
