import React, { useState, useEffect } from "react";
import { format } from "date-fns";

const formatDateSafe = (date) => {
  if (!date) return "";
  try {
    return format(new Date(date), "yyyy-MM-dd");
  } catch (e) {
    return "";
  }
};

const LoteForm = ({ 
  initialData = {}, 
  onSave = () => {}, 
  onCancel, 
  isEditing = false, 
  loteId,
  
  unidadesMedida = []
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

  const [formData, setFormData] = useState({ ...defaultFormData, ...initialData });
  const [formErrors, setFormErrors] = useState({ 
    numeroLote: false, 
    loteCompraMedicamento: false, 
    duplicateNumeroLote: false, 
    duplicateLoteCompra: false 
  });
  const [existingLotes, setExistingLotes] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchLotes = async () => {
      try {
        const userDataString = localStorage.getItem("userData");
        if (!userDataString) throw new Error("Usuário não autenticado. Faça login novamente.");
        const userData = JSON.parse(userDataString);
        const token = userData?.token;
        if (!token) throw new Error("Token não encontrado. Faça login novamente.");

        const response = await fetch("http://localhost:5000/batch", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Erro ao carregar lotes existentes");

        const data = await response.json();
        setExistingLotes(data);
      } catch (error) {
        console.error("Erro ao buscar lotes existentes:", error);
        setErrorMessage(error.message || "Erro ao carregar lotes existentes.");
      }
    };

    fetchLotes();

    if (loteId) {
      fetchLote(loteId);
    }
  }, [loteId]);

  const fetchLote = async (id) => {
    try {
      const userDataString = localStorage.getItem("userData");
      if (!userDataString) throw new Error("Usuário não autenticado.");
      
      const userData = JSON.parse(userDataString);
      const token = userData?.token;
      if (!token) throw new Error("Token não encontrado.");

      const response = await fetch(`http://localhost:5000/batch/${id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error("Lote não encontrado");
      
      const data = await response.json();
      setFormData({ ...defaultFormData, ...data });
    } catch (error) {
      console.error("Erro ao buscar lote:", error);
      setErrorMessage(error.message || "Erro ao carregar dados do lote.");
    }
  };

  const checkDuplicates = (numeroLote, loteCompra) => {
    const lotesToCheck = existingLotes.filter((existingLote) => !isEditing || existingLote.id !== loteId);
    const isDuplicateNumeroLote = numeroLote ? lotesToCheck.some((lote) => lote.numeroLote === numeroLote) : false;
    const isDuplicateLoteCompra = loteCompra ? lotesToCheck.some((lote) => lote.loteCompraMedicamento === loteCompra) : false;
    return { isDuplicateNumeroLote, isDuplicateLoteCompra };
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    const { isDuplicateNumeroLote, isDuplicateLoteCompra } = checkDuplicates(
      id === "numeroLote" ? value : formData.numeroLote,
      id === "loteCompraMedicamento" ? value : formData.loteCompraMedicamento
    );

    setFormErrors((prev) => ({ 
      ...prev, 
      duplicateNumeroLote: isDuplicateNumeroLote, 
      duplicateLoteCompra: isDuplicateLoteCompra 
    }));
    
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleNumberChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: parseFloat(value) || 0 }));
  };

  const handleDateChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: new Date(value) }));
  };

  const validateForm = () => {
    const { isDuplicateNumeroLote, isDuplicateLoteCompra } = checkDuplicates(
      formData.numeroLote, 
      formData.loteCompraMedicamento
    );

    const errors = {
      numeroLote: !formData.numeroLote.trim() || formData.numeroLote.length > 12,
      loteCompraMedicamento: !formData.loteCompraMedicamento.trim() || formData.loteCompraMedicamento.length > 12,
      nomeMedicamento: !formData.nomeMedicamento.trim(),
      fornecedor: !formData.fornecedor.trim(),
      quantidadeRecebida: formData.quantidadeRecebida <= 0,
      unidadeMedida: !formData.unidadeMedida,
      responsavelRecebimento: !formData.responsavelRecebimento.trim(),
      duplicateNumeroLote: isDuplicateNumeroLote,
      duplicateLoteCompra: isDuplicateLoteCompra,
    };

    setFormErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    
    if (!validateForm()) {
      setErrorMessage("Por favor, preencha todos os campos obrigatórios corretamente.");
      return;
    }

    setIsSubmitting(true);

    const loteData = {
      numeroLote: formData.numeroLote,
      nomeMedicamento: formData.nomeMedicamento,
      gramas: formData.gramas,
      loteCompraMedicamento: formData.loteCompraMedicamento,
      dataFabricacao: formatDateSafe(formData.dataFabricacao),
      dataValidade: formatDateSafe(formData.dataValidade),
      dataRecebimento: formatDateSafe(formData.dataRecebimento),
      quantidadeRecebida: formData.quantidadeRecebida,
      unidadeMedida: formData.unidadeMedida,
      fornecedor: formData.fornecedor,
      responsavelRecebimento: formData.responsavelRecebimento,
     
    };

    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing ? `http://localhost:5000/batch/${loteId}` : "http://localhost:5000/batch";
      
      const userDataString = localStorage.getItem("userData");
      if (!userDataString) throw new Error("Usuário não autenticado. Faça login novamente.");

      const userData = JSON.parse(userDataString);
      const token = userData?.token;
      if (!token) throw new Error("Token não encontrado. Faça login novamente.");

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(loteData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || `Erro ao ${isEditing ? "atualizar" : "criar"} lote`);
      }

      // Chama onSave com os dados atualizados e fecha o formulário
      onSave(responseData);
      
    } catch (error) {
      console.error("Erro ao salvar lote:", error);
      setErrorMessage(error.message || "Erro ao salvar o lote. Por favor, tente novamente.");
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

      {errorMessage && (
        <div style={styles.errorMessage}>
          {errorMessage}
        </div>
      )}

      <div style={styles.gridContainer}>
        {/* Linha 1 */}
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
              borderColor: formErrors.numeroLote || formErrors.duplicateNumeroLote ? "#dc3545" : "#1e40af",
            }}
            maxLength={12}
            required
          />
          {formErrors.duplicateNumeroLote && (
            <span style={styles.errorText}>Este número de lote já existe</span>
          )}
          {formErrors.numeroLote && !formErrors.duplicateNumeroLote && (
            <span style={styles.errorText}>Número do lote inválido (máx. 12 caracteres)</span>
          )}
        </div>

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
              borderColor: formErrors.loteCompraMedicamento || formErrors.duplicateLoteCompra ? "#dc3545" : "#1e40af",
            }}
            maxLength={12}
            required
          />
          {formErrors.duplicateLoteCompra && (
            <span style={styles.errorText}>Este lote de compra já existe</span>
          )}
          {formErrors.loteCompraMedicamento && !formErrors.duplicateLoteCompra && (
            <span style={styles.errorText}>Lote de compra inválido (máx. 12 caracteres)</span>
          )}
        </div>

        {/* Linha 2 */}
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
            <span style={styles.errorText}>Campo obrigatório</span>
          )}
        </div>

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
            <span style={styles.errorText}>Campo obrigatório</span>
          )}
        </div>


        {/* Linha 4 */}
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
            <span style={styles.errorText}>Quantidade deve ser maior que zero</span>
          )}
        </div>

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
            <span style={styles.errorText}>Selecione uma unidade</span>
          )}
        </div>

        {/* Linha 5 */}
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
            style={styles.input}
            min="0"
            step="0.01"
            required
          />
        </div>

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
            <span style={styles.errorText}>Campo obrigatório</span>
          )}
        </div>

        {/* Linha 6 - Datas */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Data de Fabricação *</label>
          <input
            type="date"
            value={formatDateSafe(formData.dataFabricacao)}
            onChange={(e) => handleDateChange("dataFabricacao", e.target.value)}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Data de Validade *</label>
          <input
            type="date"
            value={formatDateSafe(formData.dataValidade)}
            onChange={(e) => handleDateChange("dataValidade", e.target.value)}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Data de Recebimento *</label>
          <input
            type="date"
            value={formatDateSafe(formData.dataRecebimento)}
            onChange={(e) => handleDateChange("dataRecebimento", e.target.value)}
            style={styles.input}
            required
          />
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
            cursor: isSubmitting ? 'not-allowed' : 'pointer'
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
    transition: "all 0.2s",
    '&:hover': {
      backgroundColor: "#f3f4f6"
    }
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
    transition: "all 0.2s",
    '&:hover': {
      backgroundColor: "#1e3a8a"
    }
  },
};

export default LoteForm;