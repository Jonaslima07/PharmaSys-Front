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
    medicationImage: '', // URL da imagem que será salva
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
        manufacturingDate: formatDate(batch.manufacturingDate),
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
        manufacturingDate: batchData.manufacturingDate,
      };

      const response = await fetch(endpoint, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors', 
        body: JSON.stringify(payload),
      });

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
      return result;
    } catch (error) {
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

      // Se houver uma imagem no campo de imagem
      if (formData.medicationImage) {
        const formDataImage = new FormData();
        formDataImage.append("file", formData.medicationImage);
        formDataImage.append("upload_preset", "your_preset_here"); // Substitua pelo seu preset do Cloudinary

        // Enviar imagem para o Cloudinary
        const response = await fetch('https://api.cloudinary.com/v1_1/your_cloud_name/image/upload', {
          method: 'POST',
          body: formDataImage,
        });

        const data = await response.json();
        batchToSave.medicationImage = data.secure_url; // Adiciona o link da imagem no payload
      }

      await saveBatch(batchToSave);
      onSave(); // Fecha o formulário e atualiza a lista
    } catch (error) {
      // O erro já foi tratado em saveBatch
    }
  };

  return (
    <Modal  show={true} onHide={onClose}>
      <Modal.Header style={{ backgroundColor: '#CCCCCC', padding: '20px', borderRadius: '8px' }} closeButton>
        <Modal.Title style={{ backgroundColor: '#CCCCCC' }}>{formData.id ? 'Editar Lote' : 'Adicionar Lote'}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ backgroundColor: '#CCCCCC' }}>
        {errorMessage && (
          <div className="alert alert-danger" role="alert">
            {errorMessage}
          </div>
        )}

        <Form style={{ backgroundColor: '#CCCCCC', padding: '20px', borderRadius: '8px' }}>
          <Form.Group className="mb-3" controlId="medicationName">
            <Form.Label style={{ color: '#000000' }}>Nome do Medicamento</Form.Label>
            <Form.Control
              type="text"
              placeholder="Digite o nome do medicamento"
              value={formData.medicationName}
              onChange={(e) => handleInputChange('medicationName', e.target.value)}
              isInvalid={formErrors.medicationName}
            />
            <Form.Control.Feedback type="invalid" style={{ marginTop: '-16px', fontSize: '14px', color: '#dc3545' }}>
              Por favor, informe o nome do medicamento
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="number">
            <Form.Label  style={{ color: '#000000' }}>Código do Lote</Form.Label>
            <Form.Control
              type="text"
              placeholder="Digite o código do lote"
              value={formData.number}
              onChange={(e) => handleInputChange('number', e.target.value)}
              isInvalid={formErrors.number}
            />
            <Form.Control.Feedback type="invalid" style={{ marginTop: '-16px', fontSize: '14px', color: '#dc3545' }}>
              Por favor, informe o código do lote
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="manufacturer">
            <Form.Label style={{ color: '#000000' }}>Fabricante</Form.Label>
            <Form.Control
              type="text"
              placeholder="Digite o fabricante"
              value={formData.manufacturer}
              onChange={(e) => handleInputChange('manufacturer', e.target.value)}
              isInvalid={formErrors.manufacturer}
            />
            <Form.Control.Feedback type="invalid" style={{ marginTop: '-16px', fontSize: '14px', color: '#dc3545' }}>
              Por favor, informe o fabricante
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="quantity">
            <Form.Label style={{ color: '#000000' }}>Quantidade</Form.Label>
            <Form.Control
              type="number"
              min="0"
              placeholder="Digite a quantidade"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
              isInvalid={formErrors.quantity}
            />
            <Form.Control.Feedback type="invalid"  style={{ marginTop: '-16px', fontSize: '14px', color: '#dc3545' }}>
              A quantidade deve ser maior que zero
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="manufacturingDate">
            <Form.Label style={{ color: '#000000' }}>Data de Fabricação</Form.Label>
            <Form.Control
              type="date"
              value={formData.manufacturingDate}
              onChange={(e) => handleInputChange('manufacturingDate', e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="expirationDate">
            <Form.Label style={{ color: '#000000' }}>Data de Validade</Form.Label>
            <Form.Control
              type="date"
              value={formData.expirationDate}
              onChange={(e) => handleInputChange('expirationDate', e.target.value)}
              isInvalid={formErrors.expirationDate}
            />
            <Form.Control.Feedback type="invalid"  style={{ marginTop: '-16px', fontSize: '14px', color: '#dc3545' }}>
              A data de validade deve ser posterior à data de fabricação
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="medicationImage">
            <Form.Label style={{ color: '#000000' }}>Imagem do Medicamento</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) => handleInputChange('medicationImage', e.target.files[0])}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: '#CCCCCC' }}>
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
    backgroundColor: '#CCCCCC',
    padding: '20px',
    borderRadius: '8px',
  },
  label: {
    color: '#333',
  },
  modalHeader: {
    backgroundColor: '#CCCCCC',
    padding: '20px',
    borderRadius: '8px',
  },
  modalBody: {
    backgroundColor: '#CCCCCC',
    padding: '20px',
  },
  modalFooter: {
    backgroundColor: '#CCCCCC',
    padding: '10px',
    borderRadius: '8px',
  },
};
