import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrashAlt, FaCheck, FaPlus } from 'react-icons/fa';
import BatchForm from './BatchForm';
import './BatchList.css';

const BatchList = () => {
  const [batches, setBatches] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/lotes');
      if (!response.ok) {
        throw new Error(`Erro HTTP! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Filtra apenas lotes ativos (quantity > 0)
      const activeBatches = data.filter(batch => batch.quantity > 0);
      setBatches(activeBatches);
    } catch (error) {
      console.error('Erro ao carregar os lotes:', error);
      setError('Erro ao carregar os lotes. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBatch = () => {
    setSelectedBatch(null);
    setShowForm(true);
  };

  const handleEditBatch = (batch) => {
    setSelectedBatch(batch);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedBatch(null);
    loadBatches();
  };

  const handleFormSubmit = async (batchData) => {
    try {
      setIsLoading(true);
      
      // Ajusta as datas para evitar problemas de timezone
      const adjustedBatchData = {
        ...batchData,
        expirationDate: batchData.expirationDate ? 
          new Date(batchData.expirationDate).toISOString().split('T')[0] : null,
        manufacturingDate: batchData.manufacturingDate ? 
          new Date(batchData.manufacturingDate).toISOString().split('T')[0] : null,
        medicationImage: batchData.medicationImage?.startsWith('data:image') 
          ? batchData.medicationImage 
          : `data:image/jpeg;base64,${batchData.medicationImage}`
      };

      const url = batchData.id
        ? `http://localhost:5000/lotes/${batchData.id}`
        : 'http://localhost:5000/lotes';
      
      const method = batchData.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adjustedBatchData),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP! status: ${response.status}`);
      }

      handleFormClose();
    } catch (error) {
      console.error('Erro ao salvar o lote:', error);
      alert('Erro ao salvar o lote. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBatches = batches.filter(batch => {
    if (!batch) return false;
    
    const search = searchTerm.toLowerCase();
    return (
      (batch.number || '').toLowerCase().includes(search) ||
      (batch.manufacturer || '').toLowerCase().includes(search) ||
      (batch.medicationName || '').toLowerCase().includes(search) ||
      (batch.therapeuticClass || '').toLowerCase().includes(search) ||  // Filtrando pela categoria
      (batch.pharmaceuticalForm || '').toLowerCase().includes(search) ||  // Filtrando pela forma farmacêutica
      (batch.lotNumber || '').toLowerCase().includes(search)  // Adicionando filtro para o Lote de Fabricante
    );
  });

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este lote permanentemente?')) {
      try {
        const response = await fetch(`http://localhost:5000/lotes/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`Erro HTTP! status: ${response.status}`);
        }

        loadBatches();
      } catch (error) {
        console.error('Erro ao excluir o lote:', error);
        alert('Erro ao excluir o lote. Tente novamente.');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      // Adiciona um dia para compensar o fuso horário
      const date = new Date(dateString);
      date.setDate(date.getDate() + 1); // Compensa a diferença de timezone
      return date.toLocaleDateString('pt-BR');
    } catch {
      return '-';
    }
  };

  const calculateStatus = (expirationDate) => {
    if (!expirationDate) return 'A vencer';
    
    try {
      const today = new Date();
      const expDate = new Date(expirationDate);
      return expDate < today ? 'Vencido' : 'A vencer';
    } catch {
      return 'A vencer';
    }
  };

  const getStatusStyle = (status) => {
    return status === 'Vencido' 
      ? { backgroundColor: '#f12f11', color: 'white' } 
      : { backgroundColor: '#78C2FF', color: 'black' };
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Carregando lotes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={loadBatches} className="btn-retry">
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="batch-list-container">
      <h1>Controle de Cadastro de Medicamentos</h1>
      <p className="subtitle">faça o seu cadastro de medicamentos</p>

      <div className="batch-content">
        <h2>Medicamentos Cadastrados</h2>
        
        <div className="batch-actions">
          <input
            type="text"
            placeholder="Buscar por código, fabricante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button onClick={handleAddBatch} className="btn-add">
            <FaPlus /> Novo Lote
          </button>
        </div>

        {showForm && (
          <BatchForm 
            batch={selectedBatch} 
            onClose={handleFormClose} 
            onSubmit={handleFormSubmit}
            isSubmitting={isLoading}
          />
        )}

        {batches.length === 0 && !isLoading && !error && (
          <div className="empty-state">
            <img src="/images/muiedacartela.jpg" alt="Nenhum lote cadastrado" />
            <p>Nenhum lote cadastrado ainda. Clique em "Novo Lote" para começar!</p>
          </div>
        )}

        <div className="table-container">
          {filteredBatches.length > 0 ? (
            <table className="batches-table">
              <thead>
                <tr>
                  <th>Imagem</th>
                  <th>Lote de Farmácia</th>
                  <th>Lote de Fabricante</th> {/* Nova coluna para o Lote de Fabricante */}
                  <th>Medicamento</th>
                  <th>Fabricante</th>
                  <th>Validade</th>
                  <th>Quantidade</th>
                  <th>Gramas</th>
                  <th>Classe Terapêutica</th> {/* Nova coluna para Categoria */}
                  <th>Forma Farmacêutica</th> {/* Nova coluna para Forma Farmacêutica */}
                  <th>Status</th>
                  <th>Data de Fabricação</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredBatches.map((batch) => {
                  const status = calculateStatus(batch.expirationDate);
                  return (
                    <tr key={batch.id}>
                      <td className="image-cell">
                        {batch.medicationImage ? (
                          <img 
                            src={batch.medicationImage.startsWith('data:image') 
                              ? batch.medicationImage 
                              : `data:image/jpeg;base64,${batch.medicationImage}`}
                            alt={batch.medicationName || 'Medicamento'}
                            className="batch-image"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/default-muiedacartela.jpg';
                            }}
                          />
                        ) : (
                          <span className="no-image">-</span>
                        )}
                      </td>
                      <td>{batch.number || '-'}</td>
                      <td>{batch.lotNumber || '-'}</td> {/* Exibe o Lote de Fabricante */}
                      <td>{batch.medicationName || '-'}</td>
                      <td>{batch.manufacturer || '-'}</td>
                      <td>{formatDate(batch.expirationDate)}</td>
                      <td>{batch.quantity || '0'}</td>
                      <td>{batch.grams || '0'} gramas</td>
                      <td>{batch.therapeuticClass || '-'}</td> {/* Exibe a categoria */}
                      <td>{batch.pharmaceuticalForm || '-'}</td> {/* Exibe a forma farmacêutica */}
                      <td>
                        <span className="status-badge" style={getStatusStyle(status)}>
                          {status}
                        </span>
                      </td>
                      <td>{formatDate(batch.manufacturingDate)}</td>
                      <td className="actions-cell">
                        <button 
                          onClick={() => handleEditBatch(batch)}
                          className="btn-action btn-edit"
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(batch.id)}
                          className="btn-action btn-delete"
                          title="Excluir"
                        >
                          <FaTrashAlt />
                        </button>
                        <button 
                          className="btn-action btn-check"
                          title="Verificar"
                        >
                          <FaCheck />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : batches.length > 0 ? (
            <div className="no-results">
              Nenhum lote encontrado para sua busca
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default BatchList;