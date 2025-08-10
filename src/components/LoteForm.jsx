import React, { useState, useEffect } from "react";

const LoteForm = ({
  formData: initialFormData,
  onSave,
  onCancel,
  isEditing,
  loteId,
  unidadesMedida = [],
}) => {
  const defaultFormData = {
    numeroLote: "",
    nomeMedicamento: "",
    dataFabricacao: "",
    dataValidade: "",
    dataRecebimento: "",
    quantidadeRecebida: 0,
    unidadeMedida: "",
    fornecedor: "",
    loteCompraMedicamento: "",
    responsavelRecebimento: "",
    gramas: 0,
  };

  const [formData, setFormData] = useState({
    ...defaultFormData,
    ...initialFormData,
  });
  const [formErrors, setFormErrors] = useState({});
  const [existingLotes, setExistingLotes] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchLotes = async () => {
      try {
        const userDataString = localStorage.getItem("userData");
        if (!userDataString) throw new Error("Usuário não autenticado");

        const userData = JSON.parse(userDataString);
        const token = userData?.token;
        if (!token) throw new Error("Token não encontrado");

        const response = await fetch("http://localhost:5000/lotes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Erro ao carregar lotes");

        const data = await response.json();
        setExistingLotes(data);
      } catch (error) {
        console.error("Erro ao buscar lotes:", error);
        setErrorMessage(error.message);
      }
    };

    fetchLotes();
  }, []);

  useEffect(() => {
    if (initialFormData) {
      setFormData({ ...defaultFormData, ...initialFormData });
    }
  }, [initialFormData]);

  const isEmpty = (value) => !value || !value.trim();

  const validateLoteFormat = (value, fieldName) => {
    if (isEmpty(value) || value.length > 12) {
      return `${fieldName} é obrigatório (máx. 12 caracteres)`;
    }
    
    const hasLetters = /[a-zA-Z]/.test(value);
    const hasNumbers = /[0-9]/.test(value);
    
    if (!hasLetters || !hasNumbers) {
      return `O ${fieldName.toLowerCase()} deve conter letras e números`;
    }
    
    return null;
  };

  const validateForm = () => {
    const errors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Validação dos lotes
    const numeroLoteError = validateLoteFormat(formData.numeroLote, "Número do Lote");
    if (numeroLoteError) errors.numeroLote = numeroLoteError;

    const loteCompraError = validateLoteFormat(formData.loteCompraMedicamento, "Lote de Compra");
    if (loteCompraError) errors.loteCompraMedicamento = loteCompraError;

    // Validação do nome do medicamento
    if (isEmpty(formData.nomeMedicamento) || formData.nomeMedicamento.trim().length < 3) {
      errors.nomeMedicamento = "Nome do medicamento é obrigatório (mín. 3 caracteres)";
    }

    // Validação do fornecedor
    if (isEmpty(formData.fornecedor) || formData.fornecedor.trim().length < 3) {
      errors.fornecedor = "Fornecedor é obrigatório (mín. 3 caracteres)";
    }

    // Validação da quantidade recebida
    if (!formData.quantidadeRecebida || formData.quantidadeRecebida <= 0 || isNaN(formData.quantidadeRecebida)) {
      errors.quantidadeRecebida = "Quantidade deve ser maior que zero";
    }

    // Validação da unidade de medida
    if (isEmpty(formData.unidadeMedida)) {
      errors.unidadeMedida = "Selecione uma unidade de medida";
    }

    // Validação do responsável
    if (isEmpty(formData.responsavelRecebimento) || formData.responsavelRecebimento.trim().length < 3) {
      errors.responsavelRecebimento = "Responsável é obrigatório (mín. 3 caracteres)";
    }

    // Validação das datas
    if (isEmpty(formData.dataFabricacao)) {
      errors.dataFabricacao = "Data de fabricação é obrigatória";
    } else {
      const fabricacao = new Date(formData.dataFabricacao);
      if (fabricacao > today) {
        errors.dataFabricacao = "Data de fabricação não pode ser no futuro";
      }
    }

    if (isEmpty(formData.dataValidade)) {
      errors.dataValidade = "Data de validade é obrigatória";
    } else {
      const validade = new Date(formData.dataValidade);
      if (validade <= today) {
        errors.dataValidade = "Data de validade deve ser no futuro";
      }
    }

    if (isEmpty(formData.dataRecebimento)) {
      errors.dataRecebimento = "Data de recebimento é obrigatória";
    } else {
      const recebimento = new Date(formData.dataRecebimento);
      if (recebimento > today) {
        errors.dataRecebimento = "Data de recebimento não pode ser no futuro";
      }
    }

    // Validação cruzada de datas
    if (formData.dataFabricacao && formData.dataValidade) {
      const fabricacao = new Date(formData.dataFabricacao);
      const validade = new Date(formData.dataValidade);
      if (validade <= fabricacao) {
        errors.dataValidade = "Data de validade deve ser posterior à data de fabricação";
      }
    }

    if (formData.dataRecebimento && formData.dataFabricacao) {
      const recebimento = new Date(formData.dataRecebimento);
      const fabricacao = new Date(formData.dataFabricacao);
      if (recebimento < fabricacao) {
        errors.dataRecebimento = "Data de recebimento não pode ser anterior à fabricação";
      }
    }

    // Validação de gramas
    if (!formData.gramas || formData.gramas < 0 || isNaN(formData.gramas)) {
      errors.gramas = "Quantidade em gramas deve ser maior ou igual a zero";
    }

    // Validação de duplicados
    const isDuplicateNumeroLote = existingLotes.some(
      (lote) =>
        lote.numeroLote === formData.numeroLote &&
        (!isEditing || lote.id !== loteId)
    );

    const isDuplicateLoteCompra = existingLotes.some(
      (lote) =>
        lote.loteCompraMedicamento === formData.loteCompraMedicamento &&
        (!isEditing || lote.id !== loteId)
    );

    if (isDuplicateNumeroLote) {
      errors.numeroLote = "Este número de lote já existe";
    }

    if (isDuplicateLoteCompra) {
      errors.loteCompraMedicamento = "Este lote de compra já existe";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    
    let processedValue = value;
    
    if (id === "numeroLote" || id === "loteCompraMedicamento") {
      processedValue = value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12).toUpperCase();
    } else if (id === "nomeMedicamento" || id === "fornecedor" || id === "responsavelRecebimento") {
      processedValue = value.replace(/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g, '');
    }
    
    setFormData((prev) => ({ ...prev, [id]: processedValue }));
  };

  const handleNumberChange = (e) => {
    const { id, value } = e.target;
    const numericValue = Math.abs(parseFloat(value)) || 0;
    setFormData((prev) => ({ ...prev, [id]: numericValue }));
  };

  const handleDateChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validateForm()) {
      setErrorMessage("Por favor, corrija os erros destacados no formulário");
      return;
    }

    setIsSubmitting(true);

    try {
      const loteData = {
        ...formData,
      };

      if (isEditing) {
        loteData.id = loteId;
      }

      await onSave(loteData);
    } catch (error) {
      console.error("Erro no formulário:", error);
      setErrorMessage(error.message || "Erro ao processar o formulário");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={styles.formHeader}>
        <h2 style={styles.formTitle}>
          {isEditing ? "Editar Lote" : "Cadastrar Novo Lote"}
        </h2>
      </div>

      {errorMessage && <div style={styles.errorMessage}>{errorMessage}</div>}

      <div style={styles.gridContainer}>
        {/* Número do Lote */}
        <div style={styles.formGroup}>
          <label htmlFor="numeroLote" style={styles.label}>
            Número do Lote *
          </label>
          <input
            id="numeroLote"
            type="text"
            value={formData.numeroLote}
            onChange={handleChange}
            placeholder="Ex: LOT123456"
            style={{
              ...styles.input,
              borderColor: formErrors.numeroLote ? "#dc3545" : "#1e40af",
            }}
            maxLength={12}
            required
          />
          {formErrors.numeroLote && (
            <span style={styles.errorText}>{formErrors.numeroLote}</span>
          )}
        </div>

        {/* Lote de Compra */}
        <div style={styles.formGroup}>
          <label htmlFor="loteCompraMedicamento" style={styles.label}>
            Lote de Compra *
          </label>
          <input
            id="loteCompraMedicamento"
            type="text"
            value={formData.loteCompraMedicamento}
            onChange={handleChange}
            placeholder="Lote de compra"
            style={{
              ...styles.input,
              borderColor: formErrors.loteCompraMedicamento ? "#dc3545" : "#1e40af",
            }}
            maxLength={12}
            required
          />
          {formErrors.loteCompraMedicamento && (
            <span style={styles.errorText}>{formErrors.loteCompraMedicamento}</span>
          )}
        </div>

        {/* Nome do Medicamento */}
        <div style={styles.formGroup}>
          <label htmlFor="nomeMedicamento" style={styles.label}>
            Nome do Medicamento *
          </label>
          <input
            id="nomeMedicamento"
            type="text"
            value={formData.nomeMedicamento}
            onChange={handleChange}
            placeholder="Nome do medicamento"
            style={{
              ...styles.input,
              borderColor: formErrors.nomeMedicamento ? "#dc3545" : "#1e40af",
            }}
            required
          />
          {formErrors.nomeMedicamento && (
            <span style={styles.errorText}>{formErrors.nomeMedicamento}</span>
          )}
        </div>

        {/* Fornecedor */}
        <div style={styles.formGroup}>
          <label htmlFor="fornecedor" style={styles.label}>
            Fornecedor *
          </label>
          <input
            id="fornecedor"
            type="text"
            value={formData.fornecedor}
            onChange={handleChange}
            placeholder="Nome ou CNPJ do fornecedor"
            style={{
              ...styles.input,
              borderColor: formErrors.fornecedor ? "#dc3545" : "#1e40af",
            }}
            required
          />
          {formErrors.fornecedor && (
            <span style={styles.errorText}>{formErrors.fornecedor}</span>
          )}
        </div>

        {/* Quantidade Recebida */}
        <div style={styles.formGroup}>
          <label htmlFor="quantidadeRecebida" style={styles.label}>
            Quantidade Recebida *
          </label>
          <input
            id="quantidadeRecebida"
            type="number"
            value={formData.quantidadeRecebida}
            onChange={handleNumberChange}
            placeholder="Quantidade"
            style={{
              ...styles.input,
              borderColor: formErrors.quantidadeRecebida ? "#dc3545" : "#1e40af",
            }}
            min="1"
            required
          />
          {formErrors.quantidadeRecebida && (
            <span style={styles.errorText}>{formErrors.quantidadeRecebida}</span>
          )}
        </div>

        {/* Unidade de Medida */}
        <div style={styles.formGroup}>
          <label htmlFor="unidadeMedida" style={styles.label}>
            Unidade de Medida *
          </label>
          <select
            id="unidadeMedida"
            value={formData.unidadeMedida}
            onChange={handleChange}
            style={{
              ...styles.input,
              borderColor: formErrors.unidadeMedida ? "#dc3545" : "#1e40af",
            }}
            required
          >
            <option value="">Selecione a unidade</option>
            {unidadesMedida.map((unidade) => (
              <option key={unidade} value={unidade}>
                {unidade}
              </option>
            ))}
          </select>
          {formErrors.unidadeMedida && (
            <span style={styles.errorText}>{formErrors.unidadeMedida}</span>
          )}
        </div>

        {/* Gramas */}
        <div style={styles.formGroup}>
          <label htmlFor="gramas" style={styles.label}>
            Quantidade em Gramas *
          </label>
          <input
            id="gramas"
            type="number"
            value={formData.gramas}
            onChange={handleNumberChange}
            placeholder="Gramas"
            style={{
              ...styles.input,
              borderColor: formErrors.gramas ? "#dc3545" : "#1e40af",
            }}
            min="0"
            step="0.01"
            required
          />
          {formErrors.gramas && (
            <span style={styles.errorText}>{formErrors.gramas}</span>
          )}
        </div>

        {/* Responsável pelo Recebimento */}
        <div style={styles.formGroup}>
          <label htmlFor="responsavelRecebimento" style={styles.label}>
            Responsável pelo Recebimento *
          </label>
          <input
            id="responsavelRecebimento"
            type="text"
            value={formData.responsavelRecebimento}
            onChange={handleChange}
            placeholder="Nome do responsável"
            style={{
              ...styles.input,
              borderColor: formErrors.responsavelRecebimento ? "#dc3545" : "#1e40af",
            }}
            required
          />
          {formErrors.responsavelRecebimento && (
            <span style={styles.errorText}>{formErrors.responsavelRecebimento}</span>
          )}
        </div>

        {/* Data de Fabricação */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Data de Fabricação *</label>
          <input
            type="date"
            value={formData.dataFabricacao}
            onChange={(e) => handleDateChange("dataFabricacao", e.target.value)}
            style={{
              ...styles.input,
              borderColor: formErrors.dataFabricacao ? "#dc3545" : "#1e40af",
            }}
            required
          />
          {formErrors.dataFabricacao && (
            <span style={styles.errorText}>{formErrors.dataFabricacao}</span>
          )}
        </div>

        {/* Data de Validade */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Data de Validade *</label>
          <input
            type="date"
            value={formData.dataValidade}
            onChange={(e) => handleDateChange("dataValidade", e.target.value)}
            style={{
              ...styles.input,
              borderColor: formErrors.dataValidade ? "#dc3545" : "#1e40af",
            }}
            required
          />
          {formErrors.dataValidade && (
            <span style={styles.errorText}>{formErrors.dataValidade}</span>
          )}
        </div>

        {/* Data de Recebimento */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Data de Recebimento *</label>
          <input
            type="date"
            value={formData.dataRecebimento}
            onChange={(e) => handleDateChange("dataRecebimento", e.target.value)}
            style={{
              ...styles.input,
              borderColor: formErrors.dataRecebimento ? "#dc3545" : "#1e40af",
            }}
            required
          />
          {formErrors.dataRecebimento && (
            <span style={styles.errorText}>{formErrors.dataRecebimento}</span>
          )}
        </div>
      </div>

      <div style={styles.buttonContainer}>
        <button
          type="button"
          style={styles.cancelButton}
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          style={{
            ...styles.submitButton,
            opacity: isSubmitting ? 0.7 : 1,
            cursor: isSubmitting ? "not-allowed" : "pointer",
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span>Processando...</span>
          ) : isEditing ? (
            "Salvar Alterações"
          ) : (
            "Cadastrar Lote"
          )}
        </button>
      </div>
    </form>
  );
};

const styles = {
  formHeader: {
    marginBottom: "1.5rem",
    paddingBottom: "1rem",
    borderBottom: "1px solid #e5e7eb",
  },
  formTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#1e40af",
    margin: 0,
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "1.5rem",
    marginBottom: "1.5rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    border: "1px solid #1e40af",
    borderRadius: "0.375rem",
    padding: "0.625rem 0.75rem",
    fontSize: "0.875rem",
    width: "100%",
    transition: "border-color 0.2s",
  },
  errorMessage: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: "0.75rem",
    borderRadius: "0.375rem",
    marginBottom: "1.5rem",
    fontSize: "0.875rem",
  },
  errorText: {
    color: "#dc3545",
    fontSize: "0.75rem",
    marginTop: "0.25rem",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "1rem",
    marginTop: "1.5rem",
  },
  cancelButton: {
    backgroundColor: "transparent",
    color: "#4b5563",
    border: "1px solid #d1d5db",
    padding: "0.625rem 1.25rem",
    borderRadius: "0.375rem",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.875rem",
  },
  submitButton: {
    backgroundColor: "#1e40af",
    color: "white",
    border: "none",
    padding: "0.625rem 1.25rem",
    borderRadius: "0.375rem",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.875rem",
  },
};

export default LoteForm;