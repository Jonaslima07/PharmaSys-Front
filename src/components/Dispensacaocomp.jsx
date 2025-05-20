import React, { useState, useEffect } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Dispensacaocomp = () => {
  const [medicamentos, setMedicamentos] = useState([]);
  const [selectedMed, setSelectedMed] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [dispensadoPor, setDispensadoPor] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [historico, setHistorico] = useState([]);

  const getImageSource = (imageData) => {
    if (!imageData) return "/default-image.png";
    if (typeof imageData === 'string' && imageData.startsWith('data:image')) return imageData;
    if (imageData.type === 'Buffer' && Array.isArray(imageData.data)) {
      const base64String = Buffer.from(imageData.data).toString('base64');
      return `data:image/jpeg;base64,${base64String}`;
    }
    if (typeof imageData === 'string' && imageData.length > 1000) {
      return `data:image/jpeg;base64,${imageData}`;
    }
    return imageData || "/default-image.png";
  };

  useEffect(() => {
  const fetchMedicamentos = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/lotes");
      if (response.ok) {
        const data = await response.json();
        const medicamentosFormatados = data
          .filter(med => med.quantity > 0) // Filtra apenas medicamentos com estoque
          .map(med => ({
            ...med,
            imageUrl: getImageSource(med.medicationImage || med.imageUrl)
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

  fetchMedicamentos();
}, []);

  const handleDispensarClick = (med) => {
    setSelectedMed(med);
    setQuantidade(1); // Resetar quantidade ao abrir modal
    setShowModal(true);
  };

      const confirmarDispensacao = async () => {
    if (!selectedMed) return;

    if (!dispensadoPor.trim()) {
      toast.error("Informe quem está retirando o medicamento.");
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

    const novaQuantidade = selectedMed.quantity - quantidade;

    try {
      // 1. Atualizar no banco de dados - agora mantemos todos os campos do medicamento
      const response = await fetch(`http://localhost:5000/lotes/${selectedMed.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...selectedMed, // Mantemos todas as propriedades do medicamento
          quantity: novaQuantidade, // Apenas atualizamos a quantidade
        }),
      });

      if (response.ok) {
        // 2. Adicionar ao histórico
        const novoRegistro = {
          id: Date.now(),
          medicamento: selectedMed.medicationName,
          lote: selectedMed.number,
          quantidade: quantidade,
          paciente: dispensadoPor,
          data: new Date().toISOString(),
          medicamentoId: selectedMed.id
        };
        
        setHistorico(prev => [...prev, novoRegistro]);

        // 3. Atualizar estado local - agora mantemos todos os campos
        if (novaQuantidade <= 0) {
          // Remover medicamento se estoque zerou
          setMedicamentos(prev => prev.filter(item => item.id !== selectedMed.id));
        } else {
          // Atualizar quantidade mantendo todos os outros campos
          setMedicamentos(prev =>
            prev.map(item =>
              item.id === selectedMed.id ? { 
                ...item, // Mantemos todas as propriedades
                quantity: novaQuantidade // Apenas atualizamos a quantidade
              } : item
            )
          );
        }

        setSuccessMsg(`${quantidade} unidade(s) de ${selectedMed.medicationName} dispensada(s) para ${dispensadoPor}.`);
        setShowModal(false);
        setDispensadoPor("");
      } else {
        toast.error("Erro ao dispensar medicamento.");
      }
    } catch (error) {
      toast.error("Erro ao dispensar medicamento.");
      console.error("Detalhes do erro:", error);
    }
  };


  const ImagemMedicamento = ({ src, alt }) => {
    const [imageSrc, setImageSrc] = useState(src);
    
    // Se a quantidade for zero, não mostra a imagem
    if (quantidade <= 0) {
      return null;
    }


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

      {isLoading ? (
        <p>Carregando medicamentos...</p>
      ) : (
        <div style={styles.medicamentosList}>
          {medicamentos.map((med) => (
            <div key={med.id} style={styles.medCard}>
              <h3 style={styles.medTitle}>{med.medicationName}</h3>
              
              <ImagemMedicamento 
                src={med.imageUrl}
                alt={med.medicationName}
                 quantidade={med.quantity} // Adicione esta linha
              /> 
             
              
              <div style={styles.medInfo}>
                <p><strong>Lote:</strong> {med.number}</p>
                <p><strong>Fabricante:</strong> {med.manufacturer}</p>
                <p><strong>Validade:</strong> {med.expirationDate}</p>
                <p><strong>Estoque:</strong> {med.quantity} unidade(s)</p>
              </div>
              
              <div style={styles.medFooter}>
                <Button
                  variant="primary"
                  onClick={() => handleDispensarClick(med)}
                  disabled={med.quantity <= 0}
                  style={styles.dispensarBtn}
                >
                  Dispensar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <hr style={styles.hr} />
      
      {successMsg && (
        <div style={styles.successMessage}>
          <h4>Sucesso</h4>
          <p>{successMsg}</p>
        </div>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton style={styles.modalHeader}>
          <Modal.Title style={styles.modaltitle}>Dispensar Medicamento
            <img src="images/pill.png" alt="Logo" style={styles.logo} />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={styles.modalBody}>
          {selectedMed && (
            <>
              <p><strong>Medicamento:</strong> {selectedMed.medicationName}</p>
              <p><strong>Lote:</strong> {selectedMed.number}</p>
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

              <Form.Group controlId="dispensadoPor" style={styles.formGroup}>
                <Form.Label style={styles.formLabel}>Paciente/Responsável</Form.Label>
                <Form.Control
                  type="text"
                  value={dispensadoPor}
                  onChange={(e) => setDispensadoPor(e.target.value)}
                  placeholder="Nome completo do paciente"
                  style={styles.formControl}
                  required
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer style={styles.modalFooter}>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={confirmarDispensacao}>
            Confirmar
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
    </div>
  );
};

export default Dispensacaocomp;


const styles = {
  body: {
    fontFamily: "'Arial', sans-serif",
    backgroundColor: "#f4f5f7",
    color: "#333",
    margin: 0,
    padding: 0
  },
  container: {
    maxWidth: "1200px",
    margin: "30px auto",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    padding: "20px"
  },
  title: {
    textAlign: "center",
    fontSize: "1.8rem",
    color: "#007bff",
    fontWeight: "bold",
    marginBottom: "30px"
  },
  medicamentosList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    justifyContent: "space-between"
  },
  medCard: {
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    padding: "20px",
    borderRadius: "8px",
    width: "30%",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column"
  },
  medTitle: {
    fontSize: "1.4rem",
    marginBottom: "15px",
    color: "#333",
    textAlign: "center"
  },
  medImageContainer: {
    width: "100%",
    height: "auto",
    marginBottom: "15px"
  },
  medImage: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain"
  },
  medInfo: {
    flexGrow: 1,
    marginBottom: "15px"
  },
  medFooter: {
    textAlign: "center",
    marginTop: "auto"
  },
  dispensarBtn: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
    padding: "8px 20px",
    fontSize: "0.95rem",
    width: "100%"
  },
  successMessage: {
    backgroundColor: "#d4edda",
    color: "#155724",
    padding: "15px",
    borderRadius: "8px",
    marginTop: "20px"
  },
  hr: {
    margin: "25px 0",
    border: 0,
    borderTop: "1px solid #eee"
  },
  modalHeader: {
    backgroundColor: "#007bff",
    color: "white",
    fontWeight: "bold"
  },
  modalBody: {
    backgroundColor: "#f8f9fa",
    padding: "20px"
  },
  modalFooter: {
    backgroundColor: "#f8f9fa",
    borderTop: "1px solid #ddd",
    padding: "15px 20px"
  },
  formGroup: {
    marginBottom: "15px"
  },
  formLabel: {
    fontWeight: 600,
    marginBottom: "5px",
    display: "block"
  },
  formControl: {
    borderRadius: "4px",
    padding: "8px 12px",
    width: "100%"
  },
  logo: {
    width: '25px',
    position:'relative',
    left: '-30px',
    top:'-30px'
  },
  modaltitle: {
    position:'relative',
    left: '20px',
    height: '40px'
    

  },
  
};
