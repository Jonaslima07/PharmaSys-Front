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
      setBatches(data);
    } catch (error) {
      console.error('Erro ao carregar os lotes', error);
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
      const url = batchData.id 
        ? `http://localhost:5000/lotes/${batchData.id}`
        : 'http://localhost:5000/lotes';
      
      const method = batchData.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batchData),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP! status: ${response.status}`);
      }

      // Fecha o formulário e recarrega os dados
      handleFormClose();
    } catch (error) {
      console.error('Erro ao salvar o lote', error);
      alert('Erro ao salvar o lote. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBatches = batches.filter(
    batch =>
      batch.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (batch.medicationName && batch.medicationName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este lote?')) {
      try {
        const response = await fetch(`http://localhost:5000/lotes/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`Erro HTTP! status: ${response.status}`);
        }

        loadBatches();
      } catch (error) {
        console.error('Erro ao excluir o lote', error);
        alert('Erro ao excluir o lote. Tente novamente.');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatManufactureDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calculateStatus = (expirationDate) => {
    if (!expirationDate) return 'A vencer';
    
    const today = new Date();
    const expDate = new Date(expirationDate);
    return expDate < today ? 'Vencido' : 'A vencer';
  };

  const getStatusStyle = (status) => {
    return status === 'Vencido' 
      ? { backgroundColor: '#f12f11', color: '#0000000' } 
      : { backgroundColor: '#78C2FF', color: '#000000' };
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
      <h1>Controle de Lotes</h1>
      <p className="subtitle">Gerencie os lotes de medicamentos do seu estoque</p>

      <div className="batch-content">
        <h2>Lotes de Medicamentos</h2>
        
        <div className="batch-actions">
          <input
            type="text"
            placeholder="Buscar por código, fabricante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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

        {/* Adicione esta condição para mostrar a imagem quando não há lotes */}
        {batches.length === 0 && !isLoading && !error && (
          <div className="empty-state">
            <img src="images/muiedacartela.jpg" alt="Nenhum lote cadastrado" />
            <p>Nenhum lote cadastrado ainda. Clique em "Novo Lote" para começar!</p>
          </div>
        )}

        <div className="table-container">
          {filteredBatches.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Número do Lote</th>
                  <th>Medicamento</th>
                  <th>Fabricante</th>
                  <th>Validade</th>
                  <th>Quantidade</th>
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
                      <td>{batch.number || '-'}</td>
                      <td>{batch.medicationName || '-'}</td>
                      <td>{batch.manufacturer || '-'}</td>
                      <td>{formatDate(batch.expirationDate)}</td>
                      <td>{batch.quantity || '0'}</td>
                      <td>
                        <span className="status-badge" style={getStatusStyle(status)}>
                          {status}
                        </span>
                      </td>
                      <td>{formatManufactureDate(batch.manufacturingDate)}</td>
                      <td>
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
                        <button className="btn-action btn-check">
                          <FaCheck />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : batches.length > 0 ? (
            <tr>
              <td colSpan="8" className="no-results">
                Nenhum lote encontrado para sua busca
              </td>
            </tr>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default BatchList;