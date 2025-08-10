import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import {
  FaPlus,
  FaDownload,
  FaSearch,
  FaEdit,
  FaTrashAlt,
} from "react-icons/fa";
import LoteForm from "./LoteForm";

const formasFarmaceuticas = [
  "Comprimido",
  "Cápsula",
  "Solução",
  "Suspensão",
  "Xarope",
  "Pomada",
  "Creme",
  "Gel",
  "Injeção",
  "Gotas",
];

const classesTerapeuticas = [
  "Analgésicos",
  "Antibióticos",
  "Anti-inflamatórios",
  "Antihipertensivos",
  "Antidiabéticos",
  "Antihistamínicos",
  "Anticonvulsivantes",
  "Antidepressivos",
  "Vitaminas",
  "Outros",
];

const statusLote = ["Vencido", "A vencer"];
const unidadesMedida = ["mg", "ml", "unidade", "frasco", "caixa", "blister"];

const LotesRecebidos = () => {
  const [lotes, setLotes] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtros, setFiltros] = useState({
    fornecedor: "todos",
    status: "todos",
    unidade: "todas",
  });
  const [dialogAberto, setDialogAberto] = useState(false);
  const [loteEditando, setLoteEditando] = useState(null);
  const [formData, setFormData] = useState({});
  const [loteId, setLoteId] = useState(null);
  const [excluindo, setExcluindo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forceReload, setForceReload] = useState(false);

  const calculateStatus = (dataValidade) => {
    if (!dataValidade) return "A vencer";
    const dataVal = new Date(dataValidade);
    if (isNaN(dataVal.getTime())) return "A vencer";
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    dataVal.setHours(0, 0, 0, 0);
    return dataVal < hoje ? "Vencido" : "A vencer";
  };

  const getStatusStyle = (status) => {
    return status === "Vencido"
      ? {
          backgroundColor: "#fee2e2",
          color: "#b91c1c",
          padding: "0.25rem 0.5rem",
          borderRadius: "0.375rem",
        }
      : {
          backgroundColor: "#dbeafe",
          color: "#1e40af",
          padding: "0.25rem 0.5rem",
          borderRadius: "0.375rem",
        };
  };

  const initializeFormData = () => {
    const hoje = new Date();
    const umMesAFrente = new Date();
    umMesAFrente.setMonth(umMesAFrente.getMonth() + 1);
    setFormData({
      numeroLote: "",
      nomeMedicamento: "",
      dataFabricacao: hoje,
      dataValidade: umMesAFrente,
      quantidadeRecebida: 0,
      fornecedor: "",
      statusLote: calculateStatus(umMesAFrente),
      responsavelRecebimento: "",
      dataRecebimento: hoje,
      unidadeMedida: "",
      loteCompraMedicamento: "",
      gramas: 0,
    });
  };

  useEffect(() => {
    const fetchLotes = async () => {
      setLoading(true);
      try {
        let userData = null;
        try {
          const userDataString = localStorage.getItem("userData");
          if (userDataString && userDataString !== "undefined") {
            userData = JSON.parse(userDataString);
          }
        } catch (error) {
          console.error("Erro ao parsear userData:", error);
          toast.error("Erro ao carregar dados do usuário");
          return;
        }

        const token = userData?.token;
        if (!token) {
          toast.error("Token de autenticação não encontrado");
          return;
        }

        const response = await fetch("http://localhost:5000/lotes", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Erro ao carregar os lotes");

        const data = await response.json();
        setLotes(data);
      } catch (error) {
        console.error("Erro ao buscar lotes:", error);
        toast.error(error.message || "Erro ao carregar lotes");
      } finally {
        setLoading(false);
      }
    };

    fetchLotes();
  }, [forceReload]);

  const lotesFiltrados = lotes.filter((lote) => {
    try {
      const buscaLower = busca.toLowerCase();
      const status = calculateStatus(lote.dataValidade);

      const matchBusca =
        lote.nomeMedicamento?.toLowerCase().includes(buscaLower) ||
        lote.numeroLote?.toLowerCase().includes(buscaLower) ||
        false;
      const matchFornecedor =
        filtros.fornecedor === "todos" ||
        (lote.fornecedor && lote.fornecedor === filtros.fornecedor);
      const matchStatus =
        filtros.status === "todos" || status === filtros.status;
      const matchUnidade =
        filtros.unidade === "todas" ||
        (lote.unidadeMedida && lote.unidadeMedida === filtros.unidade);

      return matchBusca && matchFornecedor && matchStatus && matchUnidade;
    } catch (error) {
      console.error("Erro ao filtrar lote:", lote, error);
      return false;
    }
  });

  const validarFormulario = () => {
    if (!formData.numeroLote || formData.numeroLote.length > 12) {
      toast.error("Número do lote inválido");
      return false;
    }
    if (!formData.nomeMedicamento) {
      toast.error("Nome do medicamento obrigatório");
      return false;
    }
    if (
      !formData.dataFabricacao ||
      new Date(formData.dataFabricacao) > new Date()
    ) {
      toast.error("Data de fabricação inválida");
      return false;
    }
    if (
      !formData.dataValidade ||
      new Date(formData.dataValidade) <= new Date(formData.dataFabricacao)
    ) {
      toast.error("Data de validade inválida");
      return false;
    }
    if (!formData.quantidadeRecebida || formData.quantidadeRecebida <= 0) {
      toast.error("Quantidade inválida");
      return false;
    }
    if (!formData.fornecedor) {
      toast.error("Fornecedor obrigatório");
      return false;
    }
    if (!formData.responsavelRecebimento) {
      toast.error("Responsável obrigatório");
      return false;
    }
    if (
      !formData.loteCompraMedicamento ||
      formData.loteCompraMedicamento.length > 12
    ) {
      toast.error("Lote de compra inválido");
      return false;
    }
    if (
      !formData.dataRecebimento ||
      new Date(formData.dataRecebimento) > new Date()
    ) {
      toast.error("Data de recebimento inválida");
      return false;
    }
    if (!formData.unidadeMedida) {
      toast.error("Unidade obrigatória");
      return false;
    }
    return true;
  };

  const handleSaveLote = async (novoLote) => {
  // Remove a validação duplicada (já feita no LoteForm)
  // Apenas prepara os dados e faz a chamada à API
  
  try {
    const userData = JSON.parse(localStorage.getItem("userData"));
    const token = userData?.token;
    
    if (!token) {
      toast.error("Sessão expirada. Faça login novamente.");
      return;
    }

    const method = loteEditando ? "PUT" : "POST";
    const url = loteEditando 
      ? `http://localhost:5000/lotes/${novoLote.id}` 
      : "http://localhost:5000/lotes";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(novoLote),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro ao salvar lote");
    }

    const data = await response.json();
    setForceReload(prev => !prev); // Força atualização da lista
    
    toast.success(
      loteEditando 
        ? "Lote atualizado com sucesso!" 
        : "Lote cadastrado com sucesso!"
    );
    
    setDialogAberto(false);
    setLoteEditando(null);
    
  } catch (error) {
    console.error("Erro ao salvar lote:", error);
    toast.error(error.message || "Falha ao salvar lote");
  }
};
  const editarLote = (lote) => {
    setLoteEditando(lote);
    setFormData(lote);
    setLoteId(lote.id);
    setDialogAberto(true);
  };

  const excluirLote = async (id, nomeMedicamento) => {
    if (!window.confirm(`Deseja excluir o lote "${nomeMedicamento}"?`)) return;

    try {
      setExcluindo(id);
      let userData = null;
      try {
        const userDataString = localStorage.getItem("userData");
        if (userDataString && userDataString !== "undefined") {
          userData = JSON.parse(userDataString);
        }
      } catch (error) {
        console.error("Erro ao parsear userData:", error);
        toast.error("Erro ao carregar dados do usuário");
        return;
      }

      const token = userData?.token;
      if (!token) {
        toast.error("Token de autenticação não encontrado");
        return;
      }

      const response = await fetch(`http://localhost:5000/lotes/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Erro ao excluir lote");

      // Atualiza a lista após exclusão
      setForceReload(prev => !prev);
      toast.success("Lote excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir lote:", error);
      toast.error(error.message || "Falha ao excluir lote");
    } finally {
      setExcluindo(null);
    }
  };

  const exportarExcel = () => {
    if (lotesFiltrados.length === 0) {
      toast.warning("Nenhum dado para exportar");
      return;
    }

    const csvContent = [
      [
        "Núm Lote do medicamento",
        "Núm do Lote Compra",
        "Nome do Medicamento",
        "Data Fabricação",
        "Data Validade",
        "Quantidade medicamentos no lote",
        "Fornecedor",
        "Status",
        "Responsável",
      ],
      ...lotesFiltrados.map((lote) => [
        lote.numeroLote,
        lote.loteCompraMedicamento,
        lote.nomeMedicamento,
        format(new Date(lote.dataFabricacao), "dd/MM/yyyy"),
        format(new Date(lote.dataValidade), "dd/MM/yyyy"),
        lote.quantidadeRecebida.toString(),
        lote.fornecedor,
        calculateStatus(lote.dataValidade),
        lote.responsavelRecebimento,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "lotes_medicamentos.csv";
    link.click();

    toast.success("Arquivo exportado com sucesso!");
  };

  if (loading) return <div>Carregando lotes...</div>;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "1.875rem", fontWeight: "400" }}>
            Sistema de Gestão Farmacêutica
          </h1>
          <p style={styles.headerText}>
            Gerenciamento de Lotes de Medicamentos
          </p>
        </div>
      </header>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "1.5rem" }}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <h2 style={styles.cardTitle}>Lotes de Medicamentos</h2>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button
                  style={styles.buttonPrimary}
                  onClick={() => {
                    setLoteEditando(null);
                    initializeFormData();
                    setDialogAberto(true);
                  }}
                >
                  <FaPlus
                    style={{
                      width: "1rem",
                      height: "1rem",
                      marginRight: "0.5rem",
                    }}
                  />
                  Novo Lote
                </button>

                <button
                  style={styles.buttonexcell}
                  onClick={exportarExcel}
                  disabled={lotes.length === 0}
                >
                  <FaDownload
                    style={{
                      width: "1rem",
                      height: "1rem",
                      marginRight: "0.5rem",
                    }}
                  />
                  Exportar Excel
                </button>
              </div>
            </div>
          </div>

          <div style={{ padding: "1.5rem" }}>
            <div style={{ marginBottom: "0.5rem" }}>
              <div
                style={{
                  position: "relative",
                  width: "600px",
                  marginBottom: "1rem",
                }}
              >
                <FaSearch
                  style={{
                    position: "absolute",
                    left: "0.75rem",
                    top: "0.75rem",
                    width: "1rem",
                    height: "1rem",
                    color: "#9ca3af",
                  }}
                />
                <input
                  style={{ ...styles.input, paddingLeft: "2.5rem" }}
                  placeholder="Buscar por medicamento ou número do lote..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <select
                  style={styles.input2}
                  value={filtros.fornecedor}
                  onChange={(e) =>
                    setFiltros({ ...filtros, fornecedor: e.target.value })
                  }
                >
                  <option value="todos">Todos fornecedores</option>
                  {Array.from(new Set(lotes.map((lote) => lote.fornecedor)))
                    .filter(Boolean)
                    .map((fornecedor) => (
                      <option key={fornecedor} value={fornecedor}>
                        {fornecedor}
                      </option>
                    ))}
                </select>

                <select
                  style={styles.input3}
                  value={filtros.status}
                  onChange={(e) =>
                    setFiltros({ ...filtros, status: e.target.value })
                  }
                >
                  <option value="todos">Todos status</option>
                  {statusLote.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                <select
                  style={styles.input1}
                  value={filtros.unidade}
                  onChange={(e) =>
                    setFiltros({ ...filtros, unidade: e.target.value })
                  }
                >
                  <option value="todas">Todas as unidades</option>
                  {unidadesMedida.map((unidade) => (
                    <option key={unidade} value={unidade}>
                      {unidade}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              style={{
                borderRadius: "0.5rem",
                border: "1px solid #1e40af",
                overflow: "hidden",
                position: "relative",
                top: "-35px",
              }}
            >
              <div style={{ overflowX: "auto" }}>
                <table style={styles.table}>
                  <thead style={{ backgroundColor: "#dbeafe" }}>
                    <tr>
                      <th style={styles.tableHeader}>
                        Núm Lote do medicamento
                      </th>
                      <th style={styles.tableHeader}>Núm do Lote Compra</th>
                      <th style={styles.tableHeader}>Nome do Medicamento</th>
                      <th style={styles.tableHeader}>Data Fabricação</th>
                      <th style={styles.tableHeader}>Data Validade</th>
                      <th style={styles.tableHeader}>
                        Quantidade medicamentos no lote
                      </th>
                      <th style={styles.tableHeader}>Gramas</th>
                      <th style={styles.tableHeader}>Unidade</th>
                      <th style={styles.tableHeader}>Fornecedor</th>
                      <th style={styles.tableHeader}>Status</th>
                      <th style={styles.tableHeader}>Responsável</th>
                      <th style={styles.tableHeader}>Data Recebimento</th>
                      <th style={styles.tableHeader}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lotesFiltrados.length === 0 ? (
                      <tr>
                        <td
                          colSpan={13}
                          style={{
                            textAlign: "center",
                            padding: "2rem",
                            color: "#6b7280",
                          }}
                        >
                          {lotes.length === 0
                            ? "Nenhum lote cadastrado"
                            : "Nenhum lote encontrado com os filtros aplicados"}
                        </td>
                      </tr>
                    ) : (
                      lotesFiltrados.map((lote, index) => (
                        <tr
                          key={lote.id}
                          style={
                            index % 2 === 0
                              ? styles.tableRowEven
                              : styles.tableRowOdd
                          }
                        >
                          <td style={styles.tableCell}>{lote.numeroLote}</td>
                          <td style={styles.tableCell}>
                            {lote.loteCompraMedicamento}
                          </td>
                          <td style={styles.tableCell}>
                            {lote.nomeMedicamento}
                          </td>
                          <td style={styles.tableCell}>
                            {format(
                              new Date(lote.dataFabricacao),
                              "dd/MM/yyyy"
                            )}
                          </td>
                          <td style={styles.tableCell}>
                            {format(new Date(lote.dataValidade), "dd/MM/yyyy")}
                          </td>
                          <td style={styles.tableCell}>
                            {lote.quantidadeRecebida}
                          </td>
                          <td style={styles.tableCell}>{lote.gramas}</td>
                          <td style={styles.tableCell}>{lote.unidadeMedida}</td>
                          <td style={styles.tableCell}>{lote.fornecedor}</td>
                          <td style={styles.tableCell}>
                            <span
                              style={getStatusStyle(
                                calculateStatus(lote.dataValidade)
                              )}
                            >
                              {calculateStatus(lote.dataValidade)}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            {lote.responsavelRecebimento}
                          </td>
                          <td style={styles.tableCell}>
                            {format(
                              new Date(lote.dataRecebimento),
                              "dd/MM/yyyy"
                            )}
                          </td>
                          <td style={styles.tableCell}>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <button
                                style={styles.buttonOutline}
                                onClick={() => editarLote(lote)}
                              >
                                <FaEdit
                                  style={{ width: "1rem", height: "1rem" }}
                                />
                              </button>
                              <button
                                style={styles.buttonDanger}
                                onClick={() =>
                                  excluirLote(lote.id, lote.nomeMedicamento)
                                }
                                disabled={excluindo === lote.id}
                              >
                                {excluindo === lote.id ? (
                                  "Excluindo..."
                                ) : (
                                  <FaTrashAlt
                                    style={{ width: "1rem", height: "1rem" }}
                                  />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {lotes.length > 0 && (
              <div
                style={{
                  marginTop: "1.5rem",
                  display: "grid",
                  gap: "1rem",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                }}
              >
                <div style={styles.card}>
                  <div style={{ padding: "1rem", textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "700",
                        color: "#1e40af",
                      }}
                    >
                      {lotes.length}
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                      Total de Lotes
                    </div>
                  </div>
                </div>
                <div style={styles.card}>
                  <div style={{ padding: "1rem", textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "700",
                        color: "#1e40af",
                      }}
                    >
                      {
                        lotes.filter(
                          (lote) =>
                            calculateStatus(lote.dataValidade) === "Vencido"
                        ).length
                      }
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                      Lotes Vencidos
                    </div>
                  </div>
                </div>
                <div style={styles.card}>
                  <div style={{ padding: "1rem", textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "700",
                        color: "#1e40af",
                      }}
                    >
                      {lotes.reduce(
                        (total, lote) =>
                          total + (Number(lote.quantidadeRecebida) || 0),
                        0
                      )}
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                      Total de Unidades
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {dialogAberto && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <LoteForm
              loteEditando={loteEditando}
              formData={formData}
              setFormData={setFormData}
              onSave={handleSaveLote}
              onCancel={() => {
                setDialogAberto(false);
                setLoteEditando(null);
                initializeFormData();
              }}
              isEditing={!!loteEditando}
              loteId={loteId}
              formasFarmaceuticas={formasFarmaceuticas}
              classesTerapeuticas={classesTerapeuticas}
              unidadesMedida={unidadesMedida}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f7fa",
  },
  header: {
    backgroundColor: "#1e3a8a",
    color: "white",
    padding: "1.5rem",
  },
  headerText: {
    color: "#bfdbfe",
    marginTop: "0.5rem",
  },
  buttonPrimary: {
    backgroundColor: "#1e40af",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "0.375rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    position: "relative",
    left: "900px",
  },
  buttonPrimaryHover: {
    backgroundColor: "#1e3a8a",
  },
  buttonOutline: {
    backgroundColor: "transparent",
    color: "#1e40af",
    border: "1px solid #1e40af",
    padding: "0.5rem 1rem",
    borderRadius: "0.375rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    position: "relative",
    left: "2px",
  },
  buttonexcell: {
    backgroundColor: "transparent",
    color: "#1e40af",
    border: "1px solid #1e40af",
    padding: "0.5rem 1rem",
    borderRadius: "0.375rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    position: "relative",
    left: "900px",
  },
  buttonOutlineHover: {
    backgroundColor: "#dbeafe",
  },
  buttonDanger: {
    backgroundColor: "transparent",
    color: "#ef4444",
    border: "1px solid #ef4444",
    padding: "0.5rem 1rem",
    borderRadius: "0.375rem",
    cursor: "pointer",
  },
  buttonDangerHover: {
    backgroundColor: "#fee2e2",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "0.5rem",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #1e40af",
  },
  cardHeader: {
    height: "120px",
    padding: "0.5rem",
    borderBottom: "1px solid #e5e7eb",
  },
  cardTitle: {
    color: "#1e40af",
    fontSize: "1.65rem",
    fontWeight: "600",
    position: "relative",
    top: "50px",
    left: "20px",
  },
  input: {
    border: "1px solid #1e40af",
    borderRadius: "0.375rem",
    padding: "0.5rem 0.75rem",
    width: "90%",
  },
  input1: {
    border: "1px solid #1e40af",
    borderRadius: "0.375rem",
    padding: "0.5rem 0.75rem",
    width: "14%",
    position: "relative",
    left: "555px",
    top: "-57px",
  },
  input2: {
    border: "1px solid #1e40af",
    borderRadius: "0.375rem",
    padding: "0.5rem 0.75rem",
    width: "20%",
    position: "relative",
    left: "555px",
    top: "-57px",
  },
  input3: {
    border: "1px solid #1e40af",
    borderRadius: "0.375rem",
    padding: "0.5rem 0.75rem",
    width: "18%",
    position: "relative",
    left: "555px",
    top: "-57px",
  },
  input4: {
    border: "1px solid #1e40af",
    borderRadius: "0.375rem",
    padding: "0.5rem 0.75rem",
    width: "18%",
    position: "relative",
    left: "555px",
    top: "-57px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    backgroundColor: "#dbeafe",
    textAlign: "left",
    padding: "1rem",
    color: "#1e40af",
    fontWeight: "600",
  },
  tableCell: {
    padding: "1rem",
    borderBottom: "1px solid #e5e7eb",
  },
  tableRowEven: {
    backgroundColor: "white",
  },
  tableRowOdd: {
    backgroundColor: "#f9fafb",
  },
  badgeReceived: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    padding: "0.25rem 0.5rem",
    borderRadius: "0.375rem",
    fontSize: "0.75rem",
    fontWeight: "500",
  },
  badgeProcessing: {
    backgroundColor: "#fef9c3",
    color: "#854d0e",
    padding: "0.25rem 0.5rem",
    borderRadius: "0.375rem",
    fontSize: "0.75rem",
    fontWeight: "500",
  },
  badgeStored: {
    backgroundColor: "#dbeafe",
    color: "#1e40af",
    padding: "0.25rem 0.5rem",
    borderRadius: "0.375rem",
    fontSize: "0.75rem",
    fontWeight: "500",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: "0.5rem",
    width: "90%",
    maxWidth: "56rem",
    maxHeight: "90vh",
    overflowY: "auto",
    padding: "1.5rem",
  },
};

export default LotesRecebidos;