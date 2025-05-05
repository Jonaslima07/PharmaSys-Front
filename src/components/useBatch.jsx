import { useState, useEffect } from 'react';

const useBatch = () => {
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      const response = await fetch('http://localhost:5000/lotes');
      if (!response.ok) {
        throw new Error('Erro ao carregar os lotes');
      }
      const data = await response.json();
      setBatches(data);
    } catch (error) {
      console.error('Erro ao carregar os lotes', error);
      alert('Erro ao carregar os lotes');
    }
  };

  const addBatch = async (batch) => {
    try {
      const response = await fetch('http://localhost:5000/lotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch),
      });
      if (!response.ok) {
        throw new Error('Erro ao adicionar lote');
      }
      const data = await response.json();
      setBatches((prevBatches) => [...prevBatches, data]);
    } catch (error) {
      console.error('Erro ao adicionar lote', error);
      alert('Erro ao adicionar lote');
    }
  };

  const updateBatch = async (id, updatedBatch) => {
    try {
      const response = await fetch(`http://localhost:5000/lotes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBatch),
      });
      if (!response.ok) {
        throw new Error('Erro ao atualizar lote');
      }
      const data = await response.json();
      setBatches((prevBatches) =>
        prevBatches.map((batch) => (batch.id === id ? data : batch))
      );
    } catch (error) {
      console.error('Erro ao atualizar lote', error);
      alert('Erro ao atualizar lote');
    }
  };

  const deleteBatch = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/lotes/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Erro ao excluir lote');
      }
      setBatches((prevBatches) => prevBatches.filter((batch) => batch.id !== id));
    } catch (error) {
      console.error('Erro ao excluir lote', error);
      alert('Erro ao excluir lote');
    }
  };

  return { batches, addBatch, updateBatch, deleteBatch };
};

export default useBatch;
