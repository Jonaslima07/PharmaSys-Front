import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import BatchForm from './BatchForm';

const BatchList = () => {
  const [batches, setBatches] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      const response = await fetch('http://localhost:5000/lotes');
      const data = await response.json();
      setBatches(data);
    } catch (error) {
      console.error('Erro ao carregar os lotes', error);
      alert('Erro ao carregar os lotes.');
    }
  };

  const handleAddBatch = () => {
    setSelectedBatch(null); // Reset para novo lote
    setShowForm(true);
  };

  const handleEditBatch = (batch) => {
    setSelectedBatch(batch);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedBatch(null);
    loadBatches(); // Recarrega a lista após fechar o formulário
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
        alert('Erro ao excluir o lote');
      }
    }
  };

  return (
    <div style={styles.batchList}>
      <h2 style={styles.heading}>Controle de Lotes</h2>
      <p style={styles.paragraph}>Gerencie os lotes de medicamentos do seu estoque</p>

      <div style={styles.searchBar}>
        <input
          type="text"
          placeholder="Buscar por código, fabricante..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.input}
        />
        <button
          onClick={handleAddBatch}
          style={styles.btnNovoLote}
        >
          Novo Lote
        </button>
      </div>

      {showForm && (
        <BatchForm 
          batch={selectedBatch} 
          onClose={handleFormClose} 
          onSave={handleFormClose}
        />
      )}

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.tableHeader}>Medicamento</th>
            <th style={styles.tableHeader}>Código</th>
            <th style={styles.tableHeader}>Fabricante</th>
            <th style={styles.tableHeader}>Qtd.</th>
            <th style={styles.tableHeader}>Data de Validade</th>
            <th style={styles.tableHeader}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {filteredBatches.map((batch) => (
            <tr key={batch.id} style={styles.tableRow}>
              <td style={styles.tableData}>{batch.medicationName}</td>
              <td style={styles.tableData}>{batch.number}</td>
              <td style={styles.tableData}>{batch.manufacturer}</td>
              <td style={styles.tableData}>{batch.quantity}</td>
              <td style={styles.tableData}>
                {new Date(batch.expirationDate).toLocaleDateString()}
              </td>
              <td style={styles.tableData}>
                <button 
                  onClick={() => handleEditBatch(batch)}
                  style={styles.btnEditar}
                >
                  <FaEdit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(batch.id)}
                  style={styles.btnExcluir}
                >
                  <FaTrashAlt size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
       <style>
        {`
          .batch-list {
            padding: 20px;
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
          }

          h2 {
            font-size: 28px;
            margin-bottom: 5px;
            color: #333;
          }

          p {
            font-size: 14px;
            color: #777;
          }

          .search-bar {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }

          input {
            padding: 10px;
            width: 70%;
            border-radius: 4px;
            border: 1px solid #ccc;
            font-size: 14px;
          }

          button {
            padding: 10px 20px;
            font-size: 14px;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }

          .btn-novo-lote {
            background-color: #007bff;
          }

          .btn-novo-lote:hover {
            background-color: #0056b3;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }

          table, th, td {
            border: 1px solid #ddd;
          }

          th, td {
            padding: 10px;
            text-align: left;
          }

          th {
            background-color: #4e73df;
            color: white;
          }

          tr:nth-child(even) {
            background-color: #f4f4f4;
          }

          .btn-editar {
            background-color: #28a745;
            margin-right: 10px;
          }

          .btn-editar a {
            color: white;
            text-decoration: none;
          }

          .btn-editar:hover {
            background-color: #218838;
          }

          .btn-excluir {
            background-color: #dc3545;
          }

          .btn-excluir:hover {
            background-color: #c82333;
          }
        `}
      </style>
    </div>
  );
};

export default BatchList;

// Constante de estilos inline
const styles = {
  batchList: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9f9',
  },
  heading: {
    fontSize: '28px',
    marginBottom: '5px',
    color: '#333',
  },
  paragraph: {
    fontSize: '14px',
    color: '#777',
  },
  searchBar: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  input: {
    padding: '10px',
    width: '70%',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '14px',
  },
  btnNovoLote: {
    padding: '10px 20px',
    fontSize: '14px',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#007bff',
    cursor: 'pointer',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
  },
  tableHeader: {
    padding: '10px',
    textAlign: 'left',
    backgroundColor: '#4e73df',
    color: 'white',
  },
  tableRow: {
    backgroundColor: '#fff',
  },
  tableData: {
    padding: '10px',
    textAlign: 'left',
  },
  btnEditar: {
    padding: '5px 10px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '10px',
  },
  btnExcluir: {
    padding: '5px 10px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};
