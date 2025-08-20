import React, { useState, useEffect } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MedicamentosForm = ({ batch, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: null,
    number: "",
    lotNumber: "",
    expirationDate: "",
    manufacturer: "",
    quantity: 1,
    medicationName: "",
    medicationImage: "",
    manufacturingDate: "",
    grams: 0,
  });

  const [formErrors, setFormErrors] = useState({
    number: false,
    duplicateNumber: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [existingBatches, setExistingBatches] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();

  // Função para buscar dados do lote
  const fetchLoteData = async (numeroLote) => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/lotes?numeroLote=${numeroLote}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erro ao buscar dados do lote");
      }

      const data = await response.json();
      if (data && data.length > 0) {
        const lote = data[0];
        
        setFormData(prev => ({
          ...prev,
          lotNumber: lote.loteCompraMedicamento || "",
          medicationName: lote.nomeMedicamento || "",
          manufacturer: lote.fornecedor || "",
          grams: lote.gramas || 0,
          quantity: lote.quantidadeRecebida || 1,
          manufacturingDate: lote.dataFabricacao ? 
            new Date(lote.dataFabricacao).toISOString().split('T')[0] : "",
          expirationDate: lote.dataValidade ? 
            new Date(lote.dataValidade).toISOString().split('T')[0] : ""
        }));
      } else {
        // Limpa os campos se não encontrar o lote
        setFormData(prev => ({
          ...prev,
          lotNumber: "",
          medicationName: "",
          manufacturer: "",
          grams: 0,
          quantity: 1,
          manufacturingDate: "",
          expirationDate: ""
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar dados do lote:", error);
    }
  };

  const getToken = () => {
    const userDataString = localStorage.getItem("userData");
    if (!userDataString) return null;
    const userData = JSON.parse(userDataString);
    return userData?.token || null;
  };

  useEffect(() => {
    const fetchExistingBatches = async () => {
      const token = getToken();
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/medicamentos", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Erro ao buscar lotes`);
        }

        const data = await response.json();
        setExistingBatches(data);
      } catch (error) {
        console.error("Erro ao buscar lotes existentes:", error);
      }
    };

    fetchExistingBatches();
  }, [navigate]);

  useEffect(() => {
    if (batch) {
      const formatDate = (dateString) => {
        if (!dateString) return "";
        try {
          const date = new Date(dateString);
          return date.toISOString().split("T")[0];
        } catch (e) {
          console.error("Erro ao formatar data:", e);
          return "";
        }
      };

      setFormData({
        ...batch,
        expirationDate: formatDate(batch.expirationDate),
        manufacturingDate: formatDate(batch.manufacturingDate),
      });
    } else {
      const today = new Date().toISOString().split("T")[0];
      setFormData({
        id: null,
        number: "",
        lotNumber: "",
        expirationDate: today,
        manufacturer: "",
        quantity: 0,
        medicationName: "",
        medicationImage: "",
        manufacturingDate: today,
        grams: 0,
      });
    }
  }, [batch]);

  const checkDuplicates = (number) => {
    const batchesToCheck = existingBatches.filter(
      (existingBatch) => !batch || existingBatch.id !== batch.id
    );

    return batchesToCheck.some(
      (batch) => batch.number.toLowerCase() === number.toLowerCase()
    );
  };

  const saveBatch = async (batchData) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const isEdit = !!batchData.id;
      const endpoint = isEdit
        ? `http://localhost:5000/medicamentos/${batchData.id}`
        : "http://localhost:5000/medicamentos";

      const payload = {
        number: batchData.number,
        lotNumber: batchData.lotNumber,
        expirationDate: batchData.expirationDate,
        manufacturer: batchData.manufacturer,
        quantity: Number(batchData.quantity) || 1,
        medicationName: batchData.medicationName,
        medicationImage: batchData.medicationImage || null,
        manufacturingDate: batchData.manufacturingDate,
        grams: batchData.grams,
      };

      const token = getToken();

      if (!token) {
        alert("Token não encontrado. Faça login novamente.");
        navigate("/login");
        return;
      }

      const response = await fetch(endpoint, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar o lote");
      }

      const result = await response.json();
      toast.success(
        isEdit ? "Lote atualizado com sucesso!" : "Lote adicionado com sucesso!"
      );
      return result;
    } catch (error) {
      setErrorMessage(error.message || "Erro ao salvar o lote");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (name, value) => {
    if (name === "number") {
      const normalizedValue = value.replace(/\s+/g, '').toUpperCase();
      setFormData(prev => ({ ...prev, [name]: normalizedValue }));
      
      if (normalizedValue.length >= 3) {
        fetchLoteData(normalizedValue);
      }

      setFormErrors({
        number: !normalizedValue.trim(),
        duplicateNumber: checkDuplicates(normalizedValue)
      });
    } else if (name === "medicationImage") {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleInputChange("medicationImage", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
  // Validação: existem lotes cadastrados?
  if (!existingBatches || existingBatches.length === 0) {
    toast.warning("Nenhum lote cadastrado! Cadastre um lote antes de adicionar o medicamento.");
    return;
  }

  if (!formData.number.trim()) {
    setErrorMessage("O código do lote de farmácia é obrigatório");
    return;
  }

  if (formErrors.duplicateNumber) {
    setErrorMessage("Este código de lote de farmácia já existe");
    return;
  }

  try {
    await saveBatch(formData);
    onSave();
  } catch (error) {
    console.error("Erro ao salvar lote:", error);
  }
};


  return (
    <Modal show={true} onHide={onClose}>
      <Modal.Header
        style={{
          backgroundColor: "#CCCCCC",
          padding: "20px",
          borderRadius: "8px",
        }}
        closeButton
      >
        <Modal.Title style={{ backgroundColor: "#CCCCCC" }}>
          {formData.id ? "Editar Lote" : "Adicionar Lote"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ backgroundColor: "#CCCCCC" }}>
        {errorMessage && (
          <div className="alert alert-danger" role="alert">
            {errorMessage}
          </div>
        )}

        <Form
          style={{
            backgroundColor: "#CCCCCC",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          <Form.Group className="mb-3" controlId="medicationName">
            <Form.Label style={{ color: "#000000" }}>
              Nome do Medicamento
            </Form.Label>
            <Form.Control
              type="text"
              value={formData.medicationName}
              readOnly
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="number">
            <Form.Label style={{ color: "#000000" }}>
              Código Lote de Farmácia *
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Digite o código do lote de farmácia"
              value={formData.number}
              onChange={(e) => {
                if (e.target.value.length <= 12) {
                  handleInputChange("number", e.target.value);
                }
              }}
              isInvalid={formErrors.number || formErrors.duplicateNumber}
            />
            <Form.Control.Feedback
              type="invalid"
              style={{ marginTop: "-16px", fontSize: "14px", color: "#dc3545" }}
            >
              {formErrors.duplicateNumber
                ? "Este código de lote de farmácia já existe"
                : "Informe um código válido"}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="lotNumber">
            <Form.Label style={{ color: "#000000" }}>
              Lote de Compra do Medicamento
            </Form.Label>
            <Form.Control
              type="text"
              value={formData.lotNumber}
              readOnly
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="manufacturer">
            <Form.Label style={{ color: "#000000" }}>Fabricante</Form.Label>
            <Form.Control
              type="text"
              value={formData.manufacturer}
              readOnly
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="quantity">
            <Form.Label style={{ color: "#000000" }}>Quantidade</Form.Label>
            <Form.Control
              type="number"
              value={formData.quantity}
              readOnly
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="grams">
            <Form.Label style={{ color: "#000000" }}>
              Gramas do Medicamento
            </Form.Label>
            <Form.Control
              type="number"
              value={formData.grams}
              readOnly
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="manufacturingDate">
            <Form.Label style={{ color: "#000000" }}>
              Data de Fabricação
            </Form.Label>
            <Form.Control
              type="date"
              value={formData.manufacturingDate}
              readOnly
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="expirationDate">
            <Form.Label style={{ color: "#000000" }}>
              Data de Validade
            </Form.Label>
            <Form.Control
              type="date"
              value={formData.expirationDate}
              readOnly
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="medicationImage">
            <Form.Label style={{ color: "#000000" }}>
              Imagem do Medicamento
            </Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: "#CCCCCC" }}>
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Salvando..." : formData.id ? "Atualizar" : "Salvar"}
        </Button>
      </Modal.Footer>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
      />
    </Modal>
  );
};

export default MedicamentosForm;
const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "20px",
  },
  form: {
    backgroundColor: "#CCCCCC",
    padding: "20px",
    borderRadius: "8px",
  },
  label: {
    color: "#333",
  },
  modalHeader: {
    backgroundColor: "#CCCCCC",
    padding: "20px",
    borderRadius: "8px",
  },
  modalBody: {
    backgroundColor: "#CCCCCC",
    padding: "20px",
  },
  modalFooter: {
    backgroundColor: "#CCCCCC",
    padding: "10px",
    borderRadius: "8px",
  },
};
