import React, { useState, useEffect } from "react";
import { format } from "date-fns";

const LoteForm = ({
  initialData = {},
  onSave,
  onCancel,
  isEditing = false,
  loteId,
  setDialogAberto,
}) => {
  const defaultFormData = {
    numeroLote: "",
    nomeMedicamento: "",
    dataFabricacao: new Date(),
    dataValidade: new Date(),
    quantidadeRecebida: 0,
    unidadeMedida: "",
    fornecedor: "",
    loteCompraMedicamento: "",
    responsavelRecebimento: "",
    dataRecebimento: new Date(),
    gramas: 0,
  };

  const [formData, setFormData] = useState({
    ...defaultFormData,
    ...initialData,
  });

  const [formErrors, setFormErrors] = useState({
    numeroLote: false,
    loteCompraMedicamento: false,
    duplicateNumeroLote: false,
    duplicateLoteCompra: false,
  });

  const [existingLotes, setExistingLotes] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const unidadesMedida = ["mg", "ml", "unidade", "frasco", "caixa", "blister"];

  useEffect(() => {
    const fetchLotes = async () => {
      try {
        const response = await fetch("http://localhost:5000/lotesrecebidos");
        if (!response.ok) {
          throw new Error("Erro ao carregar lotes existentes");
        }
        const data = await response.json();
        setExistingLotes(data);
      } catch (error) {
        console.error("Erro ao buscar lotes existentes:", error);
      }
    };

    fetchLotes();

    if (loteId) {
      fetchLote(loteId);
    }
  }, [loteId]);

  const fetchLote = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/lotesrecebidos/${id}`
      );
      if (!response.ok) {
        throw new Error("Lote não encontrado");
      }
      const data = await response.json();
      setFormData(data);
    } catch (error) {
      console.error("Erro ao buscar lote:", error);
    }
  };

  const checkDuplicates = (numeroLote, loteCompra) => {
    let isDuplicateNumeroLote = false;
    let isDuplicateLoteCompra = false;
    
    // Filtra lotes existentes, excluindo o atual se estiver editando
    const lotesToCheck = existingLotes.filter(existingLote => 
      !isEditing || existingLote.id !== loteId
    );

    if (numeroLote) {
      isDuplicateNumeroLote = lotesToCheck.some(
        lote => lote.numeroLote === numeroLote
      );
    }

    if (loteCompra) {
      isDuplicateLoteCompra = lotesToCheck.some(
        lote => lote.loteCompraMedicamento === loteCompra
      );
    }

    return { isDuplicateNumeroLote, isDuplicateLoteCompra };
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    
    if (id === "numeroLote" || id === "loteCompraMedicamento") {
      const { isDuplicateNumeroLote, isDuplicateLoteCompra } = checkDuplicates(
        id === "numeroLote" ? value : formData.numeroLote,
        id === "loteCompraMedicamento" ? value : formData.loteCompraMedicamento
      );

      setFormErrors(prev => ({
        ...prev,
        duplicateNumeroLote: isDuplicateNumeroLote,
        duplicateLoteCompra: isDuplicateLoteCompra,
      }));
    }

    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleNumberChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: parseInt(value) || 0 }));
  };

  const handleDateChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: new Date(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    // Verifica duplicidade antes de validar outros campos
    const { isDuplicateNumeroLote, isDuplicateLoteCompra } = checkDuplicates(
      formData.numeroLote,
      formData.loteCompraMedicamento
    );

    const errors = {
      numeroLote: !formData.numeroLote.trim() || formData.numeroLote.length > 12,
      loteCompraMedicamento: !formData.loteCompraMedicamento.trim() || formData.loteCompraMedicamento.length > 12,
      duplicateNumeroLote: isDuplicateNumeroLote,
      duplicateLoteCompra: isDuplicateLoteCompra,
    };

    setFormErrors(errors);

    if (Object.values(errors).some((error) => error)) {
      if (errors.duplicateNumeroLote) {
        setErrorMessage("O número do lote de farmácia já existe.");
      } else if (errors.duplicateLoteCompra) {
        setErrorMessage("O lote de compra já existe.");
      } else {
        setErrorMessage("Por favor, preencha todos os campos corretamente!");
      }
      setIsSubmitting(false);
      return;
    }

    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing
        ? `http://localhost:5000/lotesrecebidos/${loteId}`
        : "http://localhost:5000/lotesrecebidos";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (!response.ok) {
       
        if (responseData.message && (responseData.message.includes("duplicat") || responseData.message.includes("já existe"))) {
          throw new Error(responseData.message);
        }
        throw new Error(responseData.message || `Erro ao ${isEditing ? "atualizar" : "criar"} lote`);
      }

      onSave(responseData);
      setDialogAberto(false);
    } catch (error) {
      console.error("Erro ao salvar lote:", error);
      setErrorMessage(error.message || "Erro ao salvar o lote. Por favor, tente novamente.");
      
      if (error.message.includes("número do lote")) {
        setFormErrors(prev => ({ ...prev, duplicateNumeroLote: true }));
      } else if (error.message.includes("lote de compra")) {
        setFormErrors(prev => ({ ...prev, duplicateLoteCompra: true }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ position: "relative" }}>
      {/* Botão de fechar no canto superior direito */}
      <div style={styles.formHeader}>
        <h2 style={styles.formTitle}>
          {isEditing ? "Editar Lote" : "Cadastrar Novo Lote"}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          style={styles.closeButton}
          aria-label="Fechar formulário"
        >
          &times;
        </button>
      </div>

       {errorMessage && (
        <div style={{
          gridColumn: "1 / -1",
          color: "#dc3545",
          backgroundColor: "#f8d7da",
          padding: "0.75rem",
          borderRadius: "0.375rem",
          marginBottom: "1rem",
          border: "1px solid #f5c6cb"
        }}>
          {errorMessage}
        </div>
      )}

        <div style={styles.container}>
        {/* Número do Lote */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label htmlFor="numeroLote" style={styles.label}>
            Num do Lote do medicamento *
          </label>
          <input
            id="numeroLote"
            type="text"
            value={formData.numeroLote}
            onChange={handleChange}
            placeholder="Ex: LOT123456"
            style={{
              ...styles.input,
              borderColor: formErrors.duplicateNumeroLote ? "#dc3545" : "#1e40af"
            }}
            maxLength={12}
            required
          />
          {formErrors.duplicateNumeroLote && (
            <span style={{ color: "#dc3545", fontSize: "0.875rem" }}>
              Este número de lote já existe
            </span>
          )}
        </div>


        {/* Nome do Medicamento */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <label htmlFor="nomeMedicamento" style={styles.label}>
            Nome do Medicamento *
          </label>
          <input
            id="nomeMedicamento"
            type="text"
            value={formData.nomeMedicamento}
            onChange={handleChange}
            placeholder="Nome do medicamento"
            style={styles.input}
            required
          />
        </div>

        {/* Quantidade em Gramas */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <label htmlFor="gramas" style={styles.label}>
            Quantidade em Gramas *
          </label>
          <input
            id="gramas"
            type="number"
            value={formData.gramas}
            onChange={(e) => handleNumberChange(e)} // Manuseia a alteração do valor
            placeholder="Quantidade em gramas"
            style={styles.input}
            min="0"
            required
          />
        </div>

         {/* Lote de Compra do Medicamento */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label htmlFor="loteCompraMedicamento" style={styles.label}>
            Lote de Compra do Medicamento *
          </label>
          <input
            id="loteCompraMedicamento"
            type="text"
            value={formData.loteCompraMedicamento}
            onChange={handleChange}
            placeholder="Lote de compra"
            style={{
              ...styles.input,
              borderColor: formErrors.duplicateLoteCompra ? "#dc3545" : "#1e40af"
            }}
            maxLength={12}
            required
          />
          {formErrors.duplicateLoteCompra && (
            <span style={{ color: "#dc3545", fontSize: "0.875rem" }}>
              Este lote de compra já existe
            </span>
          )}
        </div>

        {/* Data de Fabricação */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <label style={styles.label}>Data de Fabricação *</label>
          <input
            type="date"
            value={
              formData.dataFabricacao
                ? format(formData.dataFabricacao, "yyyy-MM-dd")
                : ""
            }
            onChange={(e) => handleDateChange("dataFabricacao", e.target.value)}
            style={styles.input}
            required
          />
        </div>

        {/* Data de Validade */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <label style={styles.label}>Data de Validade *</label>
          <input
            type="date"
            value={
              formData.dataValidade
                ? format(formData.dataValidade, "yyyy-MM-dd")
                : ""
            }
            onChange={(e) => handleDateChange("dataValidade", e.target.value)}
            style={styles.input}
            required
          />
        </div>

        {/* Quantidade Recebida */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <label htmlFor="quantidadeRecebida" style={styles.label}>
            Quantidade Recebida lotes *
          </label>
          <input
            id="quantidadeRecebida"
            type="number"
            value={formData.quantidadeRecebida}
            onChange={handleNumberChange}
            placeholder="Quantidade"
            style={styles.input}
            min="1"
            required
          />
        </div>

        {/* Unidade de Medida */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <label htmlFor="unidadeMedida" style={styles.label}>
            Unidade de Medida *
          </label>
          <select
            id="unidadeMedida"
            value={formData.unidadeMedida}
            onChange={handleChange}
            style={styles.input}
            required
          >
            <option value="">Selecione a unidade</option>
            {unidadesMedida.map((unidade) => (
              <option key={unidade} value={unidade}>
                {unidade}
              </option>
            ))}
          </select>
        </div>

        {/* Fornecedor */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <label htmlFor="fornecedor" style={styles.label}>
            Fornecedor *
          </label>
          <input
            id="fornecedor"
            type="text"
            value={formData.fornecedor}
            onChange={handleChange}
            placeholder="Nome ou CNPJ do fornecedor"
            style={styles.input}
            required
          />
        </div>

        {/* Responsável pelo Recebimento */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <label htmlFor="responsavelRecebimento" style={styles.label}>
            Responsável pelo Recebimento *
          </label>
          <input
            id="responsavelRecebimento"
            type="text"
            value={formData.responsavelRecebimento}
            onChange={handleChange}
            placeholder="Nome do responsável"
            style={styles.input}
            required
          />
        </div>

        {/* Data de Recebimento */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <label style={styles.label}>Data de Recebimento *</label>
          <input
            type="date"
            value={
              formData.dataRecebimento
                ? format(formData.dataRecebimento, "yyyy-MM-dd")
                : ""
            }
            onChange={(e) =>
              handleDateChange("dataRecebimento", e.target.value)
            }
            style={styles.input}
            required
          />
        </div>

        {/* Botões de ação */}
        <div
          style={{
            ...styles.fullWidth,
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.5rem",
            marginTop: "1rem",
          }}
        >
          <button type="button" style={styles.buttonOutline} onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" style={styles.buttonPrimary}>
            {isEditing ? "Salvar Alterações" : "Cadastrar Lote"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default LoteForm;

const styles = {
  container: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "1rem",
    padding: "1rem 0 0rem",
  },
  formHeader: {
    gridColumn: "1 / -1",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "0.5rem",
  },
  formTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#1e40af",
    margin: 0,
  },
  input: {
    border: "1px solid #1e40af",
    borderRadius: "0.375rem",
    padding: "0.5rem 0.75rem",
    width: "100%",
  },
  buttonPrimary: {
    backgroundColor: "#1e40af",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "0.375rem",
    cursor: "pointer",
  },
  buttonOutline: {
    backgroundColor: "transparent",
    color: "#1e40af",
    border: "1px solid #1e40af",
    padding: "0.5rem 1rem",
    borderRadius: "0.375rem",
    cursor: "pointer",
  },
  label: {
    fontWeight: "600",
  },
  fullWidth: {
    gridColumn: "1 / -1",
  },
  closeButton: {
    position: "relative",
    top: "-33px",
    left: "20px",
    right: "0.5rem",
    background: "transparent",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    color: "#6b7280",
    "&:hover": {
      color: "#1e40af",
    },
  },
};
