import React, { useState, useEffect } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BatchForm = ({ batch, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: null,
    number: "",
    lotNumber: "",
    expirationDate: "",
    manufacturer: "",
    quantity: 0,
    medicationName: "",
    medicationImage: "",
    manufacturingDate: "",
    grams: 0,
  });

  const [formErrors, setFormErrors] = useState({
    medicationName: false,
    number: false,
    lotNumber: false,
    manufacturer: false,
    quantity: false,
    expirationDate: false,
    grams: false,
    duplicateNumber: false,
    duplicateLotNumber: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [existingBatches, setExistingBatches] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();

  const getToken = () => {
  const userDataString = localStorage.getItem("userData");
  console.log("📦 Dados brutos do localStorage:", userDataString);

  if (!userDataString) return null;

  const userData = JSON.parse(userDataString);
  const token = userData?.token || null;

  console.log("🔑 Token do localStorage:", token);
  return token;
};



useEffect(() => {
  const fetchExistingBatches = async () => {
    const userDataString = localStorage.getItem("userData");

    console.log("📦 Dados brutos do localStorage:", userDataString);

    if (!userDataString) {
      console.error("❌ Nenhum dado de usuário encontrado.");
      navigate("/login");
      return;
    }

    const userData = JSON.parse(userDataString);
    const token = userData?.token;  // 👈 Correto: pega o token do objeto

    console.log("🔑 Token do localStorage:", token);

    if (!token) {
      console.error("❌ Token não encontrado dentro do userData.");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/lotes", {
        method: "GET",
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

        throw new Error(`Erro ao buscar lotes: ${errorText}`);
      }

      const data = await response.json();
      setExistingBatches(data);
    } catch (error) {
      console.error("❌ Erro ao buscar lotes existentes:", error);
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
        uniqueFarmacyLotId: generateUniqueId(batch.number),
        uniquePurchaseLotId: generateUniqueId(batch.lotNumber),
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
        uniqueFarmacyLotId: "",
        uniquePurchaseLotId: "",
      });
    }
  }, [batch]);

  const generateUniqueId = (value) => {
    return value ? `${value}_${new Date().getTime()}` : "";
  };

  const checkDuplicates = (number, lotNumber) => {
    let isDuplicateNumber = false;
    let isDuplicateLotNumber = false;

    const batchesToCheck = existingBatches.filter(
      (existingBatch) => !batch || existingBatch.id !== batch.id
    );

    if (number) {
      isDuplicateNumber = batchesToCheck.some(
        (batch) => batch.number === number
      );
    }

    if (lotNumber) {
      isDuplicateLotNumber = batchesToCheck.some(
        (batch) => batch.lotNumber === lotNumber
      );
    }

    return { isDuplicateNumber, isDuplicateLotNumber };
  };

 const saveBatch = async (batchData) => {
  setIsLoading(true);
  setErrorMessage("");

  try {
    const isEdit = !!batchData.id;
    const endpoint = isEdit
      ? `http://localhost:5000/lotes/${batchData.id}`
      : "http://localhost:5000/lotes";

    const payload = {
      number: batchData.number,
      lotNumber: batchData.lotNumber,
      expirationDate: batchData.expirationDate,
      manufacturer: batchData.manufacturer,
      quantity: Number(batchData.quantity) || 0,
      medicationName: batchData.medicationName,
      medicationImage: batchData.medicationImage || null,
      manufacturingDate: batchData.manufacturingDate,
      grams: batchData.grams,
      uniqueFarmacyLotId: batchData.uniqueFarmacyLotId,
      uniquePurchaseLotId: batchData.uniquePurchaseLotId,
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
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();

      if (response.status === 401 && errorText.includes("expired")) {
        localStorage.removeItem("userData");
        localStorage.removeItem("token");
        alert("Sua sessão expirou. Faça login novamente.");
        navigate("/login");
        return;
      }

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: `Erro HTTP! status: ${response.status}` };
      }
      toast.error(errorData.message || "Erro ao salvar o lote");
      throw new Error(errorData.message || "Erro ao salvar o lote");
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
    // Se estiver alterando number ou lotNumber, verifica duplicidade
    if (name === "number" || name === "lotNumber") {
      const { isDuplicateNumber, isDuplicateLotNumber } = checkDuplicates(
        name === "number" ? value : formData.number,
        name === "lotNumber" ? value : formData.lotNumber
      );

      setFormErrors((prev) => ({
        ...prev,
        duplicateNumber: isDuplicateNumber,
        duplicateLotNumber: isDuplicateLotNumber,
      }));
    }

    if (name === "number") {
      const uniqueFarmacyLotId = generateUniqueId(value);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        uniqueFarmacyLotId,
      }));
    } else if (name === "lotNumber") {
      const uniquePurchaseLotId = generateUniqueId(value);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        uniquePurchaseLotId,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, medicationImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    const manufacturingDate = new Date(
      formData.manufacturingDate + "T00:00:00"
    );
    const expirationDate = new Date(formData.expirationDate + "T00:00:00");

    const manufacturingDateString = manufacturingDate
      .toISOString()
      .split("T")[0];
    const expirationDateString = expirationDate.toISOString().split("T")[0];

    const { isDuplicateNumber, isDuplicateLotNumber } = checkDuplicates(
      formData.number,
      formData.lotNumber
    );

    const errors = {
      medicationName: !formData.medicationName.trim(),
      number: !formData.number.trim() || formData.number.length > 12,
      lotNumber: !formData.lotNumber.trim() || formData.lotNumber.length > 12,
      manufacturer: !formData.manufacturer.trim(),
      quantity: formData.quantity <= 0,
      expirationDate: manufacturingDateString >= expirationDateString,
      grams: formData.grams <= 0,
      duplicateNumber: isDuplicateNumber,
      duplicateLotNumber: isDuplicateLotNumber,
    };

    setFormErrors(errors);

    if (Object.values(errors).some((error) => error)) {
      if (errors.duplicateNumber) {
        setErrorMessage("O código do lote de farmácia já existe.");
      } else if (errors.duplicateLotNumber) {
        setErrorMessage("O lote de compra já existe.");
      } else {
        setErrorMessage("Por favor, preencha todos os campos corretamente!");
      }
      return;
    }

    try {
      const batchToSave = { ...formData };
      await saveBatch(batchToSave);
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
              placeholder="Digite o nome do medicamento"
              value={formData.medicationName}
              onChange={(e) =>
                handleInputChange("medicationName", e.target.value)
              }
              isInvalid={formErrors.medicationName}
            />
            <Form.Control.Feedback
              type="invalid"
              style={{ marginTop: "-16px", fontSize: "14px", color: "#dc3545" }}
            >
              Por favor, informe o nome do medicamento
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="number">
            <Form.Label style={{ color: "#000000" }}>
              Código Lote de Farmácia
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Digite o código do lote de farmacia"
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
                : "Por favor, informe o código do lote"}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="lotNumber">
            <Form.Label style={{ color: "#000000" }}>
              Lote de Compra do Medicamento
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Digite o lote do fabricante"
              value={formData.lotNumber}
              onChange={(e) => {
                if (e.target.value.length <= 12) {
                  handleInputChange("lotNumber", e.target.value);
                }
              }}
              isInvalid={formErrors.lotNumber || formErrors.duplicateLotNumber}
            />
            <Form.Control.Feedback
              type="invalid"
              style={{ marginTop: "-16px", fontSize: "14px", color: "#dc3545" }}
            >
              {formErrors.duplicateLotNumber
                ? "Este lote de compra já existe"
                : "Por favor, informe o lote de compra"}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Restante do formulário permanece igual */}
          <Form.Group className="mb-3" controlId="manufacturer">
            <Form.Label style={{ color: "#000000" }}>Fabricante</Form.Label>
            <Form.Control
              type="text"
              placeholder="Digite o fabricante"
              value={formData.manufacturer}
              onChange={(e) =>
                handleInputChange("manufacturer", e.target.value)
              }
              isInvalid={formErrors.manufacturer}
            />
            <Form.Control.Feedback
              type="invalid"
              style={{ marginTop: "-16px", fontSize: "14px", color: "#dc3545" }}
            >
              Por favor, informe o fabricante
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="quantity">
            <Form.Label style={{ color: "#000000" }}>Quantidade</Form.Label>
            <Form.Control
              type="number"
              min="0"
              placeholder="Digite a quantidade"
              value={formData.quantity}
              onChange={(e) =>
                handleInputChange("quantity", parseInt(e.target.value) || 0)
              }
              isInvalid={formErrors.quantity}
            />
            <Form.Control.Feedback
              type="invalid"
              style={{ marginTop: "-16px", fontSize: "14px", color: "#dc3545" }}
            >
              A quantidade deve ser maior que zero
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="grams">
            <Form.Label style={{ color: "#000000" }}>
              Gramas do Medicamento
            </Form.Label>
            <Form.Control
              type="number"
              min="0"
              placeholder="Digite a quantidade em gramas"
              value={formData.grams}
              onChange={(e) =>
                handleInputChange("grams", parseFloat(e.target.value) || 0)
              }
              isInvalid={formErrors.grams}
            />
            <Form.Control.Feedback
              type="invalid"
              style={{ marginTop: "-16px", fontSize: "14px", color: "#dc3545" }}
            >
              Por favor, informe a quantidade em gramas
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="manufacturingDate">
            <Form.Label style={{ color: "#000000" }}>
              Data de Fabricação
            </Form.Label>
            <Form.Control
              type="date"
              value={formData.manufacturingDate}
              onChange={(e) =>
                handleInputChange("manufacturingDate", e.target.value)
              }
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="expirationDate">
            <Form.Label style={{ color: "#000000" }}>
              Data de Validade
            </Form.Label>
            <Form.Control
              type="date"
              value={formData.expirationDate}
              onChange={(e) =>
                handleInputChange("expirationDate", e.target.value)
              }
              isInvalid={formErrors.expirationDate}
            />
            <Form.Control.Feedback
              type="invalid"
              style={{ marginTop: "-16px", fontSize: "14px", color: "#dc3545" }}
            >
              A data de validade deve ser posterior à data de fabricação
            </Form.Control.Feedback>
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
          {isLoading ? "Salvando..." : formData.id ? "Atualizar" : "Salvar"}{" "}
          Lote
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

export default BatchForm;

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
