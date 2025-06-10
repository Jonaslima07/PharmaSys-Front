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

// Definições estáticas (formas, status, unidades)
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
    unidade: "todas", // A chave unidade foi inicializada corretamente
  });
  const [dialogAberto, setDialogAberto] = useState(false);
  const [loteEditando, setLoteEditando] = useState(null);
  const [formData, setFormData] = useState({});
  const [loteId, setLoteId] = useState(null);

  const calculateStatus = (dataValidade) => {
    if (!dataValidade) return "A vencer";

    const hoje = new Date();
    const dataVal = new Date(dataValidade);

    // Remove a parte de hora/minuto/segundo para comparar apenas datas
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

  const handleSaveLote = (novoLote) => {
    const statusCalculado = calculateStatus(novoLote.dataValidade);
    
    const loteComStatus = {
      ...novoLote,
      statusLote: statusCalculado
    };

    if (loteEditando) {
      setLotes((prevLotes) =>
        prevLotes.map((lote) => (lote.id === loteComStatus.id ? loteComStatus : lote))
      );
    } else {
      setLotes((prevLotes) => [...prevLotes, loteComStatus]);
    }
  };

  const initializeFormData = () => {
    const hoje = new Date();
    const umMesAFrente = new Date();
    umMesAFrente.setMonth(umMesAFrente.getMonth() + 1);

    setFormData({
      numeroLote: "",
      nomeMedicamento: "",
      dataFabricacao: new Date(),
      dataValidade: umMesAFrente,
      quantidadeRecebida: 0,
      fornecedor: "",
      statusLote: calculateStatus(umMesAFrente),
      responsavelRecebimento: "",
      dataRecebimento: new Date(),
      unidadeMedida: "",
      loteCompraMedicamento:"",
    });
  };

  useEffect(() => {
    const fetchLotes = async () => {
      try {
        const response = await fetch("http://localhost:5000/lotesrecebidos");
        if (!response.ok) {
          throw new Error("Erro ao carregar os lotes.");
        }
        const data = await response.json();
        setLotes(data);
      } catch (error) {
        console.error("Erro ao buscar lotes:", error);
        toast({
          title: "Erro ao carregar lotes",
          description: error.message,
          variant: "destructive",
        });
      }
    };
    fetchLotes();
  }, []);

  const lotesFiltrados = lotes.filter((lote) => {
    try {
      const buscaLower = busca.toLowerCase();
      const statusLote = calculateStatus(lote.dataValidade);
      
      const matchBusca =
        (lote.nomeMedicamento?.toLowerCase().includes(buscaLower)) ||
        (lote.numeroLote?.toLowerCase().includes(buscaLower)) ||
        false;

      const matchFornecedor =
        filtros.fornecedor === "todos" || 
        (lote.fornecedor && lote.fornecedor === filtros.fornecedor);

      const matchStatus =
        filtros.status === "todos" || 
        statusLote === filtros.status;

       const matchUnidade =
        filtros.unidade === "todas" || // Mudança de medicamento para unidade
        (lote.unidadeMedida && lote.unidadeMedida === filtros.unidade);

      return matchBusca && matchFornecedor && matchStatus && matchUnidade;
    } catch (error) {
      console.error("Erro ao filtrar lote:", lote, error);
      return false;
    }
  });

  const validarFormulario = () => {
    if (!formData.numeroLote || formData.numeroLote.length > 12) {
      toast({
        title: "Erro de Validação",
        description:
          "Número do lote é obrigatório e deve ter no máximo 12 caracteres.",
        variant: "destructive",
      });
      return false;
    }
    if (!formData.nomeMedicamento) {
      toast({
        title: "Erro de Validação",
        description: "Nome do medicamento é obrigatório.",
        variant: "destructive",
      });
      return false;
    }
    if (!formData.dataFabricacao || formData.dataFabricacao > new Date()) {
      toast({
        title: "Erro de Validação",
        description: "Data de fabricação não pode ser futura.",
        variant: "destructive",
      });
      return false;
    }
    if (
      !formData.dataValidade ||
      formData.dataValidade <= formData.dataFabricacao
    ) {
      toast({
        title: "Erro de Validação",
        description:
          "Data de validade deve ser posterior à data de fabricação.",
        variant: "destructive",
      });
      return false;
    }
    if (!formData.quantidadeRecebida || formData.quantidadeRecebida <= 0) {
      toast({
        title: "Erro de Validação",
        description: "Quantidade recebida deve ser maior que 0.",
        variant: "destructive",
      });
      return false;
    }
    if (!formData.fornecedor) {
      toast({
        title: "Erro de Validação",
        description: "Fornecedor é obrigatório.",
        variant: "destructive",
      });
      return false;
    }
    if (!formData.responsavelRecebimento) {
      toast({
        title: "Erro de Validação",
        description: "Responsável pelo recebimento é obrigatório.",
        variant: "destructive",
      });
      return false;
    }
    if (!formData.loteCompraMedicamento || formData.loteCompraMedicamento.length > 12) {
    toast({
      title: "Erro de Validação",
      description: "Número do lote de compra é obrigatório.",
      variant: "destructive",
    });
    return false;
  }
    if (!formData.dataRecebimento || formData.dataRecebimento > new Date()) {
      toast({
        title: "Erro de Validação",
        description: "Data de recebimento não pode ser futura.",
        variant: "destructive",
      });
      return false;
    }
    if (!formData.unidadeMedida) {
      toast({
        title: "Erro de Validação",
        description: "Unidade de medida é obrigatória.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const salvarLote = () => {
    if (!validarFormulario()) return;

    const statusCalculado = calculateStatus(formData.dataValidade);

    const novoLote = {
      id: loteEditando?.id || Date.now().toString(),
      ...formData,
      statusLote: statusCalculado
    };

    if (loteEditando) {
      setLotes(
        lotes.map((lote) => (lote.id === loteEditando.id ? novoLote : lote))
      );
      toast({
        title: "Sucesso",
        description: "Lote editado com sucesso!",
        className: "bg-green-100 text-green-800 border-green-300",
      });
    } else {
      setLotes([...lotes, novoLote]);
      toast({
        title: "Sucesso",
        description: "Lote cadastrado com sucesso!",
        className: "bg-green-100 text-green-800 border-green-300",
      });
    }

    setDialogAberto(false);
    setLoteEditando(null);
    initializeFormData();
  };

  const editarLote = (lote) => {
    setLoteEditando(lote);
    setFormData(lote);
    setLoteId(lote.id);
    setDialogAberto(true);
  };

  const [excluindo, setExcluindo] = useState(null);

  const excluirLote = async (id, nomeMedicamento) => {
    if (
      !window.confirm(
        `Tem certeza que deseja excluir o lote "${nomeMedicamento}"?`
      )
    ) {
      return;
    }

    try {
      setExcluindo(id);

      const response = await fetch(
        `http://localhost:5000/lotesrecebidos/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Erro ao excluir lote");

      setLotes(lotes.filter((lote) => lote.id !== id));
      toast.success("Lote excluído com sucesso!");
    } catch (error) {
      toast.error("Falha ao excluir lote");
      console.error("Erro:", error);
    } finally {
      setExcluindo(null);
    }
  };

  const exportarExcel = () => {
    const csvContent = [
      [
        "Núm Lote do medicamento",
        "Núm do Lote Compra", 
        "Nome do Medicamento",
        "Data Fabricação",
        "Data Validade",
        "Quantidade do medicamento",
        "Fornecedor",
        "Status",
        "Responsável",
        
      ],
      ...lotesFiltrados.map((lote) => [
        lote.numeroLote,
        lote.loteCompraMedicamento,
        lote.nomeMedicamento,
        format(lote.dataFabricacao, "dd/MM/yyyy"),
        format(lote.dataValidade, "dd/MM/yyyy"),
        lote.quantidadeRecebida.toString(),
        lote.fornecedor,
        lote.statusLote,
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

    toast({
      title: "Sucesso",
      description: "Arquivo Excel exportado com sucesso!",
      className: "bg-green-100 text-green-800 border-green-300",
    });
  };

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

                <button style={styles.buttonexcell} onClick={exportarExcel}>
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
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <select
                  style={styles.input2}
                  value={filtros.fornecedor}
                  onChange={(e) =>
                    setFiltros({ ...filtros, fornecedor: e.target.value })
                  }
                >
                  <option key="todos" value="todos">
                    Todos fornecedores
                  </option>
                  {Array.from(
                    new Set(lotes.map((lote) => lote.fornecedor))
                  ).map((fornecedor) => (
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
                  <option key="todos" value="todos">
                    Todos status
                  </option>
                  {statusLote.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <select
                  style={styles.input1}
                  value={filtros.unidadeMedida}
                  onChange={(e) =>
                    setFiltros({ ...filtros, unidade: e.target.value })
                  }
                >
                  <option key="todas" value="todas">
                    Todas as unidades
                  </option>
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
                      <th style={styles.tableHeader}>Núm Lote do medicamento</th>
                      <th style={styles.tableHeader}>Núm do Lote Compra</th> 
                      <th style={styles.tableHeader}>Nome do Medicamento</th>
                      <th style={styles.tableHeader}>Data Fabricação</th>
                      <th style={styles.tableHeader}>Data Validade</th>
                      <th style={styles.tableHeader}>Quantidade do medicamento</th>
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
                          colSpan={11}
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
                          <td style={styles.tableCell}>{lote.loteCompraMedicamento}</td> 
                          <td style={styles.tableCell}>
                            {lote.nomeMedicamento}
                          </td>
                          <td style={styles.tableCell}>
                            {format(lote.dataFabricacao, "dd/MM/yyyy")}
                          </td>
                          <td style={styles.tableCell}>
                            {format(lote.dataValidade, "dd/MM/yyyy")}
                          </td>
                          <td style={styles.tableCell}>
                            {lote.quantidadeRecebida}
                          </td>
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
                            {format(lote.dataRecebimento, "dd/MM/yyyy")}
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
                      {lotes.filter(lote => calculateStatus(lote.dataValidade) === "Vencido").length}
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
                        (total, lote) => total + lote.quantidadeRecebida,
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
        <div
          style={{
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
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "0.5rem",
              width: "90%",
              maxWidth: "56rem",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "1.5rem",
            }}
          >
            <LoteForm
              formData={formData}
              onSave={handleSaveLote}
              onCancel={() => {
                setDialogAberto(false);
                setLoteEditando(null);
              }}
              isEditing={!!loteEditando}
              unidadesMedida={unidadesMedida}
              formasFarmaceuticas={formasFarmaceuticas}
              classesTerapeuticas={classesTerapeuticas}
              statusLote={statusLote}
              loteId={loteId}
              setDialogAberto={setDialogAberto}
              initializeFormData={initializeFormData}
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
};

export default LotesRecebidos;