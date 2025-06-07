import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { FaPlus } from "react-icons/fa";
import { FaDownload } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
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

const statusLote = ["Recebido", "Em Processamento", "Armazenado"];

const unidadesMedida = ["mg", "ml", "unidade", "frasco", "caixa", "blister"];

const LotesRecebidos = () => {
  const [lotes, setLotes] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtros, setFiltros] = useState({
    fornecedor: "todos",
    status: "todos",
    classeTerapeutica: "todos",
  });
  const [dialogAberto, setDialogAberto] = useState(false);
  const [loteEditando, setLoteEditando] = useState(null);
  const [formData, setFormData] = useState({});

  const initializeFormData = () => {
    setFormData({
      numeroLote: "",
      nomeMedicamento: "",
      dataFabricacao: new Date(),
      dataValidade: new Date(),
      quantidadeRecebida: 0,
      fornecedor: "",
      numeroNotaFiscal: "",
      formaFarmaceutica: "",
      classeTerapeutica: "",
      statusLote: "Recebido",
      observacoes: "",
      responsavelRecebimento: "",
      dataRecebimento: new Date(),
      numeroRegistroAnvisa: "",
      unidadeMedida: "",
    });
  };

  useEffect(() => {
    initializeFormData();
  }, []);

  const lotesFiltrados = lotes.filter((lote) => {
    const buscaLower = busca.toLowerCase();
    const matchBusca =
      lote.nomeMedicamento.toLowerCase().includes(buscaLower) ||
      lote.numeroLote.toLowerCase().includes(buscaLower) ||
      lote.numeroNotaFiscal.toLowerCase().includes(buscaLower);

    const matchFornecedor =
      filtros.fornecedor === "todos" || lote.fornecedor === filtros.fornecedor;
    const matchStatus =
      filtros.status === "todos" || lote.statusLote === filtros.status;
    const matchClasse =
      filtros.classeTerapeutica === "todos" ||
      lote.classeTerapeutica === filtros.classeTerapeutica;

    return matchBusca && matchFornecedor && matchStatus && matchClasse;
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

    if (!formData.numeroNotaFiscal) {
      toast({
        title: "Erro de Validação",
        description: "Número da nota fiscal é obrigatório.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.formaFarmaceutica) {
      toast({
        title: "Erro de Validação",
        description: "Forma farmacêutica é obrigatória.",
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

    const novoLote = {
      id: loteEditando?.id || Date.now().toString(),
      ...formData,
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
    setDialogAberto(true);
  };

  const excluirLote = (id) => {
    setLotes(lotes.filter((lote) => lote.id !== id));
    toast({
      title: "Sucesso",
      description: "Lote excluído com sucesso!",
      className: "bg-green-100 text-green-800 border-green-300",
    });
  };

  const exportarExcel = () => {
    const csvContent = [
      [
        "Número do Lote",
        "Nome do Medicamento",
        "Data Fabricação",
        "Data Validade",
        "Quantidade",
        "Fornecedor",
        "Status",
        "Responsável",
      ],
      ...lotesFiltrados.map((lote) => [
        lote.numeroLote,
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
      {/* Cabeçalho */}
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
        {/* Controles superiores */}
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

                <button style={styles.buttonOutline} onClick={exportarExcel}>
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
            {/* Busca e Filtros */}
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
                  placeholder="Buscar por medicamento, número do lote ou nota fiscal..."
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
                  <option value="todos">Todos fornecedores</option>
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
                  <option value="todos">Todos status</option>
                  {statusLote.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                <select
                  style={styles.input1}
                  value={filtros.classeTerapeutica}
                  onChange={(e) =>
                    setFiltros({
                      ...filtros,
                      classeTerapeutica: e.target.value,
                    })
                  }
                >
                  <option value="todos">Todas classes</option>
                  {classesTerapeuticas.map((classe) => (
                    <option key={classe} value={classe}>
                      {classe}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tabela de Lotes */}
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
                      <th style={styles.tableHeader}>Número do Lote</th>
                      <th style={styles.tableHeader}>Nome do Medicamento</th>
                      <th style={styles.tableHeader}>Data Fabricação</th>
                      <th style={styles.tableHeader}>Data Validade</th>
                      <th style={styles.tableHeader}>Quantidade</th>
                      <th style={styles.tableHeader}>Unidade</th>
                      <th style={styles.tableHeader}>Fornecedor</th>
                      <th style={styles.tableHeader}>Nota Fiscal</th>
                      <th style={styles.tableHeader}>Forma Farmacêutica</th>
                      <th style={styles.tableHeader}>Classe Terapêutica</th>
                      <th style={styles.tableHeader}>Status</th>
                      <th style={styles.tableHeader}>Responsável</th>
                      <th style={styles.tableHeader}>Data Recebimento</th>
                      <th style={styles.tableHeader}>Registro ANVISA</th>
                      <th style={styles.tableHeader}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lotesFiltrados.length === 0 ? (
                      <tr>
                        <td
                          colSpan={15}
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
                            {lote.numeroNotaFiscal}
                          </td>
                          <td style={styles.tableCell}>
                            {lote.formaFarmaceutica}
                          </td>
                          <td style={styles.tableCell}>
                            {lote.classeTerapeutica || "-"}
                          </td>
                          <td style={styles.tableCell}>
                            <span
                              style={
                                lote.statusLote === "Recebido"
                                  ? styles.badgeReceived
                                  : lote.statusLote === "Em Processamento"
                                  ? styles.badgeProcessing
                                  : styles.badgeStored
                              }
                            >
                              {lote.statusLote}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            {lote.responsavelRecebimento}
                          </td>
                          <td style={styles.tableCell}>
                            {format(lote.dataRecebimento, "dd/MM/yyyy")}
                          </td>
                          <td style={styles.tableCell}>
                            {lote.numeroRegistroAnvisa || "-"}
                          </td>
                          <td style={styles.tableCell}>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <button
                                style={styles.buttonOutline}
                                onClick={() => editarLote(lote)}
                              >
                                <Edit
                                  style={{ width: "1rem", height: "1rem" }}
                                />
                              </button>
                              <button
                                style={styles.buttonDanger}
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      `Tem certeza que deseja excluir o lote ${lote.numeroLote}?`
                                    )
                                  ) {
                                    excluirLote(lote.id);
                                  }
                                }}
                              >
                                <Trash2
                                  style={{ width: "1rem", height: "1rem" }}
                                />
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

            {/* Estatísticas */}
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
                        lotes.filter((lote) => lote.statusLote === "Armazenado")
                          .length
                      }
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                      Lotes Armazenados
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
              onFormChange={(field, value) =>
                setFormData({ ...formData, [field]: value })
              }
              onDateChange={(field, date) =>
                setFormData({ ...formData, [field]: new Date(date) })
              }
              onSave={salvarLote}
              onCancel={() => {
                setDialogAberto(false);
                setLoteEditando(null);
              }}
              isEditing={!!loteEditando}
              unidadesMedida={unidadesMedida}
              formasFarmaceuticas={formasFarmaceuticas}
              classesTerapeuticas={classesTerapeuticas}
              statusLote={statusLote}
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
    display: "inline-flex",
    padding: "0.25rem 0.5rem",
    fontSize: "0.75rem",
    fontWeight: "600",
    borderRadius: "9999px",
    backgroundColor: "#fef08a",
    color: "#92400e",
  },
  badgeProcessing: {
    display: "inline-flex",
    padding: "0.25rem 0.5rem",
    fontSize: "0.75rem",
    fontWeight: "600",
    borderRadius: "9999px",
    backgroundColor: "#bfdbfe",
    color: "#1e40af",
  },
  badgeStored: {
    display: "inline-flex",
    padding: "0.25rem 0.5rem",
    fontSize: "0.75rem",
    fontWeight: "600",
    borderRadius: "9999px",
    backgroundColor: "#d1fae5",
    color: "#065f46",
  },
};

export default LotesRecebidos;
