import React, { useState, useEffect } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';

const BatchForm = ({ batch, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: null, 
    number: '',
    expirationDate: '',
    manufacturer: '',
    quantity: 0,
    medicationName: '',
    medicationImage: '',
    manufacturingDate: '',
  });
  
  const [formErrors, setFormErrors] = useState({
    medicationName: false,
    number: false,
    manufacturer: false,
    quantity: false,
    expirationDate: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (batch) {
      const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        } catch (e) {
          console.error('Erro ao formatar data:', e);
          return '';
        }
      };

      setFormData({
        ...batch,
        expirationDate: formatDate(batch.expirationDate),
        manufacturingDate: formatDate(batch.manufacturingDate)
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        id: null, 
        number: '',
        expirationDate: today,
        manufacturer: '',
        quantity: 0,
        medicationName: '',
        medicationImage: '',
        manufacturingDate: today,
      });
    }
  }, [batch]);

  const saveBatch = async (batchData) => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const isEdit = !!batchData.id;
      const endpoint = isEdit 
        ? `http://localhost:5000/lotes/${batchData.id}`
        : 'http://localhost:5000/lotes';

      // Verifica e formata as datas corretamente
      const formatDateForServer = (dateString) => {
        if (!dateString) return null;
        try {
          return new Date(dateString).toISOString();
        } catch (e) {
          console.error('Erro ao formatar data para servidor:', e);
          return null;
        }
      };

      const payload = {
        number: batchData.number,
        expirationDate: batchData.expirationDate, // json-server lida bem com strings simples
        manufacturer: batchData.manufacturer,
        quantity: Number(batchData.quantity) || 0,
        medicationName: batchData.medicationName,
        medicationImage: batchData.medicationImage || null,
        manufacturingDate: batchData.manufacturingDate
      };

      console.log('Enviando payload:', payload); // Debug

      const response = await fetch(endpoint, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors', // Adicione esta linha
        body: JSON.stringify(payload),
      });

      console.log('Resposta do servidor:', response); // Debug

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: `Erro HTTP! status: ${response.status}` };
        }
        throw new Error(errorData.message || 'Erro ao salvar o lote');
      }

      const result = await response.json();
      console.log('Resultado:', result); // Debug
      return result;
    } catch (error) {
      console.error('Erro detalhado ao salvar o lote:', error);
      setErrorMessage(error.message || 'Erro ao salvar o lote');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };


  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const manufacturingDate = new Date(formData.manufacturingDate);
    const expirationDate = new Date(formData.expirationDate);
    
    const errors = {
      medicationName: !formData.medicationName.trim(),
      number: !formData.number.trim(),
      manufacturer: !formData.manufacturer.trim(),
      quantity: formData.quantity <= 0,
      expirationDate: manufacturingDate >= expirationDate,
    };
    
    setFormErrors(errors);

    if (Object.values(errors).some(error => error)) {
      setErrorMessage('Por favor, preencha todos os campos corretamente!');
      return;
    }

    try {
      const batchToSave = { ...formData };
      
      
      await saveBatch(batchToSave);
      onSave(); // Fecha o formulário e atualiza a lista
    } catch (error) {
      // O erro já foi tratado em saveBatch
    }
  };

  return (
    <Modal show={true} onHide={onClose} size="lg">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>{formData.id ? 'Editar Lote' : 'Adicionar Lote'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {errorMessage && (
          <div className="alert alert-danger" role="alert">
            {errorMessage}
          </div>
        )}
        
        <Form>
          <Form.Group className="mb-3" controlId="medicationName">
            <Form.Label>Nome do Medicamento</Form.Label>
            <Form.Control
              type="text"
              placeholder="Digite o nome do medicamento"
              value={formData.medicationName}
              onChange={(e) => handleInputChange('medicationName', e.target.value)}
              isInvalid={formErrors.medicationName}
            />
            <Form.Control.Feedback type="invalid">
              Por favor, informe o nome do medicamento
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="number">
            <Form.Label>Código do Lote</Form.Label>
            <Form.Control
              type="text"
              placeholder="Digite o código do lote"
              value={formData.number}
              onChange={(e) => handleInputChange('number', e.target.value)}
              isInvalid={formErrors.number}
            />
            <Form.Control.Feedback type="invalid">
              Por favor, informe o código do lote
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="manufacturer">
            <Form.Label>Fabricante</Form.Label>
            <Form.Control
              type="text"
              placeholder="Digite o fabricante"
              value={formData.manufacturer}
              onChange={(e) => handleInputChange('manufacturer', e.target.value)}
              isInvalid={formErrors.manufacturer}
            />
            <Form.Control.Feedback type="invalid">
              Por favor, informe o fabricante
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="quantity">
            <Form.Label>Quantidade</Form.Label>
            <Form.Control
              type="number"
              min="0"
              placeholder="Digite a quantidade"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
              isInvalid={formErrors.quantity}
            />
            <Form.Control.Feedback type="invalid">
              A quantidade deve ser maior que zero
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="manufacturingDate">
            <Form.Label>Data de Fabricação</Form.Label>
            <Form.Control
              type="date"
              value={formData.manufacturingDate}
              onChange={(e) => handleInputChange('manufacturingDate', e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="expirationDate">
            <Form.Label>Data de Validade</Form.Label>
            <Form.Control
              type="date"
              value={formData.expirationDate}
              onChange={(e) => handleInputChange('expirationDate', e.target.value)}
              isInvalid={formErrors.expirationDate}
            />
            <Form.Control.Feedback type="invalid">
              A data de validade deve ser posterior à data de fabricação
            </Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? 'Salvando...' : formData.id ? 'Atualizar' : 'Salvar'} Lote
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BatchForm;

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: '22px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  form: {
    backgroundColor: '#f9f9f9',
    padding: '20px',
    borderRadius: '8px',
  },
  label: {
    color: '#333',
  },
  modalHeader: {
    backgroundColor: '#78C2FF',
    padding: '20px',
    borderRadius: '8px',
  },
  modalBody: {
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  modalFooter: {
    backgroundColor: '#78C2FF',
    padding: '10px',
    borderRadius: '8px',
  },
};
