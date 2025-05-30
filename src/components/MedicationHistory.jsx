import React, { useState, useEffect } from 'react';
import { FaFileAlt } from 'react-icons/fa'; // Ícone de arquivo (documento)

const MedicationHistory = () => {
  const [medications, setMedications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPatient, setFilterPatient] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');  // Ordem padrão por data (mais recente)
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);  // Página atual
  const [itemsPerPage, setItemsPerPage] = useState(10);  // Número de itens por página

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Tenta buscar os históricos do servidor
        const response = await fetch('http://localhost:5000/historicos');
        if (response.ok) {
          const data = await response.json();
          setMedications(data);  // Atualiza o estado com os dados reais
        } else {
          setError('Falha ao carregar os dados.');
        }
      } catch (err) {
        setError(err.message);
        console.error("Erro ao carregar histórico:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);  // Executa apenas uma vez quando o componente for montado

  // Filtros e ordenação
  const filteredMedications = medications.filter(med => {
    const matchesSearch = 
      med.medicamento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.paciente?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesPatient = filterPatient ? med.paciente === filterPatient : true;
    
    return matchesSearch && matchesPatient;
  });

  const sortedMedications = [...filteredMedications].sort((a, b) => {
    const dateA = new Date(a.data);
    const dateB = new Date(b.data);
    
    switch (sortBy) {
      case 'date-desc':
        return dateB.getTime() - dateA.getTime();  // Data mais recente
      case 'date-asc':
        return dateA.getTime() - dateB.getTime();  // Data mais antiga
      case 'patient-asc':
        return a.paciente.localeCompare(b.paciente);  // Nome do Paciente A-Z
      case 'patient-desc':
        return b.paciente.localeCompare(a.paciente);  // Nome do Paciente Z-A
      case 'medication-asc':
        return a.medicamento.localeCompare(b.medicamento);  // Medicamento A-Z
      case 'medication-desc':
        return b.medicamento.localeCompare(a.medicamento);  // Medicamento Z-A
      default:
        return 0;
    }
  });

  // Calcular os medicamentos a serem exibidos na página atual
  const indexOfLastMedication = currentPage * itemsPerPage;
  const indexOfFirstMedication = indexOfLastMedication - itemsPerPage;
  const currentMedications = sortedMedications.slice(indexOfFirstMedication, indexOfLastMedication);

  // Total de páginas
  const totalPages = Math.ceil(filteredMedications.length / itemsPerPage);

  const handleReset = () => {
    setSearchTerm('');
    setFilterPatient('');
    setSortBy('date-desc');
    setCurrentPage(1); // Resetar para a primeira página
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (error) {
    return <div>Erro: {error}</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Histórico de Medicamentos</h1>
      
      {/* Filtros */}
      <div style={styles.filtersContainer}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Pesquisar</label>
          <input
            type="text"
            style={styles.searchInput}
            placeholder="Buscar por nome, medicamento ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Filtrar por Paciente</label>
          <select
            style={styles.selectInput}
            value={filterPatient}
            onChange={(e) => setFilterPatient(e.target.value)}
          >
            <option value="">Todos</option>
            {[...new Set(medications.map(m => m.paciente))].map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Ordenar por</label>
          <select
            style={styles.selectInput}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date-desc">Data (mais recente)</option>
            <option value="date-asc">Data (mais antiga)</option>
            <option value="patient-asc">Nome do Paciente (A-Z)</option>
            <option value="patient-desc">Nome do Paciente (Z-A)</option>
            <option value="medication-asc">Medicamento (A-Z)</option>
            <option value="medication-desc">Medicamento (Z-A)</option>
          </select>
        </div>
      </div>
      
      <div style={styles.resultsInfo}>
        {filteredMedications.length} resultados encontrados
        <button onClick={handleReset} style={styles.resetButton}>
          Limpar Filtros
        </button>
      </div>
      
      {/* Lista de medicamentos */}
      <div style={styles.medicationsList}>
        {currentMedications.map(med => (
          <div key={med.id} style={styles.medicationCard}>
            <div style={styles.iconContainer}>
               <FaFileAlt style={styles.medicationIcon} /> {/* Ícone de documento */}
            </div>
            <h3 style={styles.medicationName}>{med.medicamento}</h3>
            <p style={styles.medicationInfo}>Paciente: {med.paciente}</p>
            <p style={styles.medicationInfo}><strong>Quantidade dispensada:</strong> {med.quantidade}</p>
            <p style={styles.medicationInfo}><strong>Gramas:</strong> {med.gramas || 'N/A'}</p> {/* Exibindo as gramas */}
            <div style={styles.medicationFooter}>
              <span>Dispensado em: {formatDate(med.data)}</span>
              <span>Por: {med.dispensadoPor}</span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Paginação */}
      <div style={styles.pagination}>
        <button
          style={styles.pageButton}
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Anterior
        </button>
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            style={currentPage === index + 1 ? styles.activePageButton : styles.pageButton}
            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}
        <button
          style={styles.pageButton}
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Próximo
        </button>
      </div>
    </div>
  );
};

// Estilos movidos para uma constante conforme solicitado
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  iconContainer: {
    marginRight: '15px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor:  '#78C2FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  medicationIcon: {
    fontSize: '20px',
    color: '#001f3d',
  },

  title: {
    fontSize: '24px',
    marginBottom: '20px',
    color: '#333'
  },
  filtersContainer: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px'
  },
  filterGroup: {
    flex: 1
  },
  filterLabel: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold'
  },
  searchInput: {
    width: '100%',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px'
  },
  selectInput: {
    width: '100%',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px'
  },
  resultsInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    padding: '10px 0',
    borderBottom: '1px solid #eee'
  },
  resetButton: {
    background: 'none',
    border: 'none',
    color: '#0066cc',
    cursor: 'pointer',
    textDecoration: 'underline'
  },
  medicationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  medicationCard: {
    border: '1px solid #eee',
    borderRadius: '8px',
    padding: '15px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  },
  medicationName: {
    fontSize: '18px',
    marginBottom: '10px',
    color: '#333'
  },
  medicationInfo: {
    marginBottom: '8px',
    color: '#666'
  },
  medicationFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '10px',
    fontSize: '14px',
    color: '#888'
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    gap: '5px',
    marginTop: '30px'
  },
  pageButton: {
    padding: '5px 10px',
    border: '1px solid #ddd',
    background: '#fff',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  activePageButton: {
    padding: '5px 10px',
    border: '1px solid #0066cc',
    background: '#0066cc',
    color: '#fff',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

export default MedicationHistory;
