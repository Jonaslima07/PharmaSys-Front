import React, { useState, useEffect } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Dispensacaocomp = () => {
  const [medicamentos, setMedicamentos] = useState([]);
  const [selectedMed, setSelectedMed] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [nomePaciente, setNomePaciente] = useState("");
  const [cpfPaciente, setCpfPaciente] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pacientes, setPacientes] = useState([]);
  const [noPatients, setNoPatients] = useState(false);

  const getUserData = () => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    return userData || { id: null, name: "Desconhecido", token: null };
  };

  const getImageSource = (imageData) => {
    if (!imageData) return "/default-image.png";
    if (typeof imageData === "string" && imageData.startsWith("data:image"))
      return imageData;
    if (imageData.type === "Buffer" && Array.isArray(imageData.data)) {
      const base64String = Buffer.from(imageData.data).toString("base64");
      return `data:image/jpeg;base64,${base64String}`;
    }
    if (typeof imageData === "string" && imageData.length > 1000) {
      return `data:image/jpeg;base64,${imageData}`;
    }
    return imageData || "/default-image.png";
  };

  useEffect(() => {
    const userData = getUserData();

    if (!userData.token) {
      toast.error("Token de autenticação ausente. Faça login novamente.");
      return;
    }

    const fetchMedicamentos = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:5000/lotes", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userData.token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const medicamentosFormatados = data
            .filter((med) => med.quantity > 0)
            .map((med) => ({
              ...med,
              lote_id: med.id,
              imageUrl: getImageSource(med.medicationImage || med.imageUrl),
            }));
          setMedicamentos(medicamentosFormatados);
        } else {
          toast.error("Erro ao carregar medicamentos.");
        }
      } catch (error) {
        toast.error("Erro ao carregar medicamentos.");
        console.error("Detalhes do erro:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchPacientes = async () => {
      try {
        const response = await fetch("http://localhost:5000/pacientes", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userData.token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPacientes(data);
          setNoPatients(data.length === 0);
        } else {
          toast.error("Erro ao carregar pacientes.");
        }
      } catch (error) {
        toast.error("Erro ao carregar pacientes.");
        console.error("Detalhes do erro:", error);
      }
    };

    fetchMedicamentos();
    fetchPacientes();
  }, []);

  const handlePacienteChange = (e) => {
    const cpf = e.target.value;
    setCpfPaciente(cpf);
    const paciente = pacientes.find((p) => p.cpf === cpf);
    if (paciente) {
      setNomePaciente(paciente.nome);
    } else {
      setNomePaciente("");
    }
  };

  const handleDispensarClick = (med) => {
    setSelectedMed(med);
    setQuantidade(1);
    setCpfPaciente("");
    setNomePaciente("");
    setShowModal(true);
  };

  const confirmarDispensacao = async () => {
    if (!selectedMed) return;

    if (!nomePaciente.trim()) {
      toast.error("Selecione um paciente válido.");
      return;
    }

    if (quantidade <= 0) {
      toast.error("Quantidade deve ser maior que zero.");
      return;
    }

    if (quantidade > selectedMed.quantity) {
      toast.error(`Quantidade indisponível. Estoque atual: ${selectedMed.quantity}`);
      return;
    }

    const userData = getUserData();
    if (!userData.id || !userData.token) {
      toast.error("Usuário não identificado. Faça login novamente.");
      return;
    }

    try {
      const dispensacaoResponse = await fetch("http://localhost:5000/dispensacao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData.token}`,
        },
        body: JSON.stringify({
          paciente_cpf: cpfPaciente,
          medicamento_id: selectedMed.medicamentoId || selectedMed.id,
          lote_id: selectedMed.lote_id,
          quantidade_dispensada: quantidade,
          data_hora: new Date().toISOString(),
        }),
      });

      if (!dispensacaoResponse.ok) {
        throw new Error("Falha ao registrar dispensação");
      }

      const novaQuantidade = selectedMed.quantity - quantidade;
      const updateResponse = await fetch(
        `http://localhost:5000/lotes/${selectedMed.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userData.token}`,
          },
          body: JSON.stringify({
            ...selectedMed,
            quantity: novaQuantidade,
          }),
        }
      );

      if (updateResponse.ok) {
        setMedicamentos((prev) =>
          prev.map((item) =>
            item.id === selectedMed.id
              ? { ...item, quantity: novaQuantidade }
              : item
          )
        );

        toast.success(
          `${quantidade} unidade(s) de ${selectedMed.medicationName} dispensada(s) para ${nomePaciente} por ${userData.name}.`,
          { autoClose: 10000 }
        );

        setShowModal(false);
        setNomePaciente("");
        setCpfPaciente("");
      } else {
        throw new Error("Falha ao atualizar estoque");
      }
    } catch (error) {
      console.error("Erro na dispensação:", error);
      toast.error("Erro ao completar a dispensação. Tente novamente.");
    }
  };

  const ImagemMedicamento = ({ src, alt }) => {
    const [imageSrc, setImageSrc] = useState(src);

    return (
      <div style={styles.medImageContainer}>
        <img
          src={imageSrc}
          alt={alt}
          style={styles.medImage}
          onError={() => setImageSrc("/default-image.png")}
        />
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Dispensação de Medicamentos</h1>

      {noPatients && (
        <div style={styles.noPatientsAlert}>
          <h4>Nenhum paciente cadastrado no sistema</h4>
          <p>Por favor, cadastre pacientes antes de realizar dispensações.</p>
        </div>
      )}

      {isLoading ? (
        <p>Carregando medicamentos...</p>
      ) : (
        <div style={styles.medicamentosList}>
          {medicamentos.map((med) => (
            <div key={med.id} style={styles.medCard}>
              <h3 style={styles.medTitle}>{med.medicationName}</h3>

              <ImagemMedicamento src={med.imageUrl} alt={med.medicationName} />

              <div style={styles.medInfo}>
                <p><strong>Lote de Farmácia:</strong> {med.number}</p>
                <p><strong>Fabricante:</strong> {med.manufacturer}</p>
                <p><strong>Validade:</strong> {med.expirationDate}</p>
                <p><strong>Estoque:</strong> {med.quantity} unidade(s)</p>
                <p><strong>Gramas:</strong> {med.grams || "N/A"}</p>
              </div>

              <div style={styles.medFooter}>
                <Button
                  variant="primary"
                  onClick={() => handleDispensarClick(med)}
                  disabled={med.quantity <= 0 || noPatients}
                  style={styles.dispensarBtn}
                >
                  Dispensar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton style={styles.modalHeader}>
          <div style={styles.modalTitleContainer}>
            <img src="/images/pill.png" alt="Pílula" style={styles.pillIcon} />
          </div>
          <Modal.Title style={styles.modaltitle}>Dispensar Medicamento</Modal.Title>
        </Modal.Header>
        <Modal.Body style={styles.modalBody}>
          {selectedMed && (
            <>
              <p><strong>Medicamento:</strong> {selectedMed.medicationName}</p>
              <p><strong>Lote de Farmácia:</strong> {selectedMed.number}</p>
              <p><strong>Estoque disponível:</strong> {selectedMed.quantity} unidades</p>

              <Form.Group controlId="quantidade" style={styles.formGroup}>
                <Form.Label style={styles.formLabel}>Quantidade a dispensar</Form.Label>
                <Form.Control
                  type="number"
                  value={quantidade}
                  onChange={(e) => {
                    const value = Math.max(1, Number(e.target.value));
                    setQuantidade(Math.min(value, selectedMed.quantity));
                  }}
                  min={1}
                  max={selectedMed.quantity}
                  style={styles.formControl}
                />
              </Form.Group>

              <Form.Group controlId="cpfPaciente" style={styles.formGroup}>
                <Form.Label style={styles.formLabel}>CPF do Paciente</Form.Label>
                <Form.Control
                  type="text"
                  value={cpfPaciente}
                  onChange={handlePacienteChange}
                  placeholder="Digite o CPF do paciente"
                  style={styles.formControl}
                  required
                />
              </Form.Group>

              <Form.Group controlId="nomePaciente" style={styles.formGroup}>
                <Form.Label style={styles.formLabel}>Paciente</Form.Label>
                <Form.Control
                  type="text"
                  value={nomePaciente}
                  readOnly
                  style={styles.formControl}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer style={styles.modalFooter}>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={confirmarDispensacao}>Confirmar</Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
    </div>
  );
};

export default Dispensacaocomp;

const styles = {
  pillIcon: {
    width: "30px",
    marginRight: "10px",
    alignSelf: "center",
  },
  container: {
    maxWidth: "1200px",
    margin: "30px auto",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    padding: "20px",
  },
  title: {
    textAlign: "center",
    fontSize: "1.8rem",
    color: "#007bff",
    fontWeight: "bold",
    marginBottom: "30px",
  },
  medicamentosList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    justifyContent: "space-between",
  },
  medCard: {
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    padding: "20px",
    borderRadius: "8px",
    width: "30%",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column",
  },
  medTitle: {
    fontSize: "1.4rem",
    marginBottom: "15px",
    color: "#333",
    textAlign: "center",
  },
  medImageContainer: {
    width: "100%",
    height: "auto",
    marginBottom: "15px",
  },
  medImage: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
  },
  medInfo: {
    flexGrow: 1,
    marginBottom: "15px",
  },
  medFooter: {
    textAlign: "center",
    marginTop: "auto",
  },
  dispensarBtn: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
    padding: "8px 20px",
    fontSize: "0.95rem",
    width: "100%",
  },
  modalHeader: {
    backgroundColor: "#007bff",
    color: "white",
    fontWeight: "bold",
  },
  modalBody: {
    backgroundColor: "#f8f9fa",
    padding: "20px",
  },
  modalFooter: {
    backgroundColor: "#f8f9fa",
    borderTop: "1px solid #ddd",
    padding: "15px 20px",
  },
  formGroup: {
    marginBottom: "15px",
  },
  formLabel: {
    fontWeight: 600,
    marginBottom: "5px",
    display: "block",
  },
  formControl: {
    borderRadius: "4px",
    padding: "8px 12px",
    width: "100%",
  },
  modaltitle: {
    position: "relative",
    left: "20px",
    height: "40px",
  },
};
