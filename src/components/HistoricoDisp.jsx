import React, { useState, useEffect } from 'react';
import { FaFileAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const HistoricoDisp = () => {
  const [medications, setMedications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPatient, setFilterPatient] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();

  // Função para obter o token (padronizada igual aos outros componentes)
  const getToken = () => {
    const userDataString = localStorage.getItem('userData');
    if (!userDataString) {
      navigate('/login');
      return null;
    }
    
    try {
      const userData = JSON.parse(userDataString);
      if (!userData?.token) {
        navigate('/login');
        return null;
      }
      return userData.token;
    } catch (error) {
      console.error('Erro ao parsear userData:', error);
      navigate('/login');
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const token = getToken();
        if (!token) return;

        const response = await fetch('http://localhost:5000/historico', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('userData');
            navigate('/login');
            return;
          }
          throw new Error('Falha ao carregar os dados');
        }

        const data = await response.json();
        setMedications(data);
      } catch (err) {
        console.error("Erro ao carregar histórico:", err);
        setError(err.message);
        toast.error(err.message || 'Erro ao carregar histórico');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const extrairNumeroRegistro = (observacao) => {
    if (!observacao) return 'N/A';
    const match = observacao.match(/registro:\s*(\d+)/i);
    return match ? match[1] : 'N/A';
  };

  const filteredMedications = medications.filter(med => {
    const matchesSearch =
      med.medicamento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.paciente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.numero_registro?.toString().includes(searchTerm);

    const matchesPatient = filterPatient ? med.paciente === filterPatient : true;

    return matchesSearch && matchesPatient;
  });

  const sortedMedications = [...filteredMedications].sort((a, b) => {
    const dateA = new Date(a.data);
    const dateB = new Date(b.data);

    switch (sortBy) {
      case 'date-desc':
        return dateB.getTime() - dateA.getTime();
      case 'date-asc':
        return dateA.getTime() - dateB.getTime();
      case 'patient-asc':
        return a.paciente?.localeCompare(b.paciente);
      case 'patient-desc':
        return b.paciente?.localeCompare(a.paciente);
      case 'medication-asc':
        return a.medicamento?.localeCompare(b.medicamento);
      case 'medication-desc':
        return b.medicamento?.localeCompare(a.medicamento);
      default:
        return 0;
    }
  });

  const indexOfLastMedication = currentPage * itemsPerPage;
  const indexOfFirstMedication = indexOfLastMedication - itemsPerPage;
  const currentMedications = sortedMedications.slice(indexOfFirstMedication, indexOfLastMedication);
  const totalPages = Math.ceil(filteredMedications.length / itemsPerPage);

  const handleReset = () => {
    setSearchTerm('');
    setFilterPatient('');
    setSortBy('date-desc');
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Data inválida' : date.toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Hora inválida' : date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Hora inválida';
    }
  };

  if (isLoading) return <div style={styles.loading}>Carregando...</div>;
  if (error) return <div style={styles.error}>Erro: {error}</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Histórico de Dispensação</h1>

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
            {[...new Set(medications.map(m => m.paciente))].filter(Boolean).map(p => (
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
        <button onClick={handleReset} style={styles.resetButton}>Limpar Filtros</button>
      </div>

      {currentMedications.length > 0 ? (
        <>
          <div style={styles.medicationsList}>
            {currentMedications.map(med => (
              <div key={`${med.id}-${med.data}`} style={styles.medicationCard}>
                <div style={styles.iconContainer}>
                  <FaFileAlt style={styles.medicationIcon} />
                </div>
                <div style={styles.medicationContent}>
                  <h3 style={styles.medicationName}>{med.medicamento || 'Medicamento não informado'}</h3>
                  <p style={styles.medicationInfo}>Paciente: {med.paciente || 'Não informado'}</p>
                  <p style={styles.medicationInfo}><strong>Quantidade dispensada:</strong> {med.quantidade || 'N/A'}</p>
                  <p style={styles.medicationInfo}><strong>Gramas:</strong> {med.gramas || 'N/A'}</p>
                  <div style={styles.medicationFooter}>
                    <span>Dispensado em: {formatDate(med.data)} {formatTime(med.data)}</span>
                    <span>Número de Registro: {med.numero_registro || extrairNumeroRegistro(med.observacao)}</span>
                    <span>Por: {med.dispensadoPor || 'Não informado'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                style={styles.pageButton}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }, (_, index) => (
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
          )}
        </>
      ) : (
        <div style={styles.noResults}>
          Nenhum registro encontrado com os filtros atuais
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f5f7fa',
    minHeight: '100vh'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.2rem'
  },
  error: {
    color: '#dc3545',
    padding: '20px',
    textAlign: 'center',
    fontSize: '1.2rem'
  },
  iconContainer: {
    marginRight: '15px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#78C2FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  medicationContent: {
    flex: 1
  },
  medicationIcon: {
    fontSize: '20px',
    color: '#001f3d',
  },
  title: {
    fontSize: '24px',
    marginBottom: '20px',
    color: '#333',
    textAlign: 'center'
  },
  filtersContainer: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  },
  filterGroup: {
    flex: '1 1 300px'
  },
  filterLabel: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
    color: '#555'
  },
  searchInput: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px'
  },
  selectInput: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    backgroundColor: 'white'
  },
  resultsInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#fff',
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  resetButton: {
    background: 'none',
    border: 'none',
    color: '#0066cc',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: '14px'
  },
  medicationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '20px'
  },
  medicationCard: {
    border: '1px solid #eee',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
    display: 'flex',
    transition: 'transform 0.2s, box-shadow 0.2s',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
    }
  },
  medicationName: {
    fontSize: '18px',
    marginBottom: '10px',
    color: '#333'
  },
  medicationInfo: {
    marginBottom: '8px',
    color: '#555',
    fontSize: '15px'
  },
  medicationFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '15px',
    fontSize: '14px',
    color: '#777',
    flexWrap: 'wrap',
    gap: '10px'
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    gap: '5px',
    marginTop: '30px',
    flexWrap: 'wrap'
  },
  pageButton: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    background: '#fff',
    borderRadius: '4px',
    cursor: 'pointer',
    minWidth: '40px',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#f0f0f0'
    }
  },
  activePageButton: {
    padding: '8px 12px',
    border: '1px solid #0066cc',
    background: '#0066cc',
    color: '#fff',
    borderRadius: '4px',
    cursor: 'pointer',
    minWidth: '40px'
  },
  noResults: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
    color: '#666',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }
};

export default HistoricoDisp;