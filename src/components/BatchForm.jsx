import React, { useState, useEffect } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify'; // Importando toast e ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Importando o estilo do toast

const BatchForm = ({ batch, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: null,
    number: '',
    expirationDate: '',
    manufacturer: '',
    quantity: 0,
    medicationName: '',
    medicationImage: '', // Agora a imagem será em base64
    manufacturingDate: '',
    grams: 0, // Adicionando o campo gramas
    therapeuticClass: '', // Novo campo para categoria ou classe terapêutica
    pharmaceuticalForm: '', // Novo campo para forma farmacêutica
  });

  const [formErrors, setFormErrors] = useState({
    medicationName: false,
    number: false,
    manufacturer: false,
    quantity: false,
    expirationDate: false,
    grams: false, 
    therapeuticClass: false, // new
    pharmaceuticalForm: false, // new
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
        grams: 0,
        therapeuticClass: '', // new
        pharmaceuticalForm: '', // new
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

      const payload = {
        number: batchData.number,
        expirationDate: batchData.expirationDate,
        manufacturer: batchData.manufacturer,
        quantity: Number(batchData.quantity) || 0,
        medicationName: batchData.medicationName,
        medicationImage: batchData.medicationImage || null, // A imagem estará em base64
        manufacturingDate: batchData.manufacturingDate,
        grams: batchData.grams, // send o campo gramas
        therapeuticClass: batchData.therapeuticClass, // new
        pharmaceuticalForm: batchData.pharmaceuticalForm, // new
      };

      const response = await fetch(endpoint, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: `Erro HTTP! status: ${response.status}` };
        }
        toast.error(errorData.message || 'Erro ao salvar o lote'); // Exibe erro de toast
        throw new Error(errorData.message || 'Erro ao salvar o lote');
      }

      const result = await response.json();
      toast.success(isEdit ? 'Lote atualizado com sucesso!' : 'Lote adicionado com sucesso!'); // Exibe sucesso de toast
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, medicationImage: reader.result })); // A imagem será convertida para base64
      };
      reader.readAsDataURL(file); // Converte a imagem para base64
    }
  };

  const handleSubmit = async () => {
    const manufacturingDate = new Date(formData.manufacturingDate + 'T00:00:00'); // Adiciona a hora para garantir que é 00:00 do dia
    const expirationDate = new Date(formData.expirationDate + 'T00:00:00'); // Adiciona a hora para garantir que é 00:00 do dia

    // Pega apenas a data no formato YYYY-MM-DD para evitar problemas de horário
    const manufacturingDateString = manufacturingDate.toISOString().split('T')[0]; // data no formato YYYY-MM-DD
    const expirationDateString = expirationDate.toISOString().split('T')[0]; // data no formato YYYY-MM-DD

    const errors = {
      medicationName: !formData.medicationName.trim(),
      number: !formData.number.trim(),
      manufacturer: !formData.manufacturer.trim(),
      quantity: formData.quantity <= 0,
      expirationDate: manufacturingDateString >= expirationDateString, // Compara apenas as partes de data
      grams: formData.grams <= 0, // Valida se as gramas são positivas
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
    <Modal show={true} onHide={onClose}>
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
            <Form.Label style={{ color: '#000000' }}>Código do Lote</Form.Label>
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
            <Form.Control.Feedback type="invalid" style={{ marginTop: '-16px', fontSize: '14px', color: '#dc3545' }}>
              A quantidade deve ser maior que zero
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="grams">
            <Form.Label style={{ color: '#000000' }}>Gramas do Medicamento</Form.Label>
            <Form.Control
              type="number"
              min="0"
              placeholder="Digite a quantidade em gramas"
              value={formData.grams}
              onChange={(e) => handleInputChange('grams', parseFloat(e.target.value) || 0)}
              isInvalid={formErrors.grams}
            />
            <Form.Control.Feedback type="invalid" style={{ marginTop: '-16px', fontSize: '14px', color: '#dc3545' }}>
              Por favor, informe a quantidade em gramas
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
            <Form.Control.Feedback type="invalid" style={{ marginTop: '-16px', fontSize: '14px', color: '#dc3545' }}>
              A data de validade deve ser posterior à data de fabricação
            </Form.Control.Feedback>
          </Form.Group>

          {/* Novos campos */}
          <Form.Group className="mb-3" controlId="therapeuticClass">
            <Form.Label style={{ color: '#000000' }}>Classe Terapêutica</Form.Label>
            <Form.Control
              type="text"
              placeholder="Digite a categoria ou classe terapêutica"
              value={formData.therapeuticClass}
              onChange={(e) => handleInputChange('therapeuticClass', e.target.value)}
              isInvalid={formErrors.therapeuticClass}
            />
            <Form.Control.Feedback type="invalid" style={{ marginTop: '-16px', fontSize: '14px', color: '#dc3545' }}>
              Por favor, informe a categoria ou classe terapêutica
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="pharmaceuticalForm">
            <Form.Label style={{ color: '#000000' }}>Forma Farmacêutica</Form.Label>
            <Form.Control
              type="text"
              placeholder="Digite a forma farmacêutica (ex: xarope, comprimido)"
              value={formData.pharmaceuticalForm}
              onChange={(e) => handleInputChange('pharmaceuticalForm', e.target.value)}
              isInvalid={formErrors.pharmaceuticalForm}
            />
            <Form.Control.Feedback type="invalid" style={{ marginTop: '-16px', fontSize: '14px', color: '#dc3545' }}>
              Por favor, informe a forma farmacêutica
            </Form.Control.Feedback>
          </Form.Group>


          <Form.Group className="mb-3" controlId="medicationImage">
            <Form.Label style={{ color: '#000000' }}>Imagem do Medicamento</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleImageChange}
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
      
      {/* Add ToastContainer here to display the notifications */}
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
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
