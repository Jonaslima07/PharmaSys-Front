import React, { useState } from 'react';
import { format } from 'date-fns';

const LoteForm = ({ 
  initialData = {}, 
  onSave, 
  onCancel,
  isEditing = false 
}) => {
  // Def os dados iniciais do formulário
  const defaultFormData = {
    numeroLote: '',
    nomeMedicamento: '',
    dataFabricacao: new Date(),
    dataValidade: new Date(),
    quantidadeRecebida: 0,
    unidadeMedida: '',
    fornecedor: '',
    numeroNotaFiscal: '',
    formaFarmaceutica: '',
    classeTerapeutica: '',
    statusLote: 'Recebido',
    responsavelRecebimento: '',
    dataRecebimento: new Date(),
    validadeLoteInterno: null,
    numeroRegistroAnvisa: '',
    observacoes: ''
  };

  const [formData, setFormData] = useState({
    ...defaultFormData,
    ...initialData
  });

  // Opções para os selects
  const unidadesMedida = ['mg', 'ml', 'unidade', 'frasco', 'caixa', 'blister'];
  const formasFarmaceuticas = ['Comprimido', 'Cápsula', 'Solução', 'Suspensão', 'Xarope', 'Pomada', 'Creme', 'Gel', 'Injeção', 'Gotas'];
  const classesTerapeuticas = ['Analgésicos', 'Antibióticos', 'Anti-inflamatórios', 'Antihipertensivos', 'Antidiabéticos', 'Antihistamínicos', 'Anticonvulsivantes', 'Antidepressivos', 'Vitaminas', 'Outros'];
  const statusLote = ['Recebido', 'Em Processamento', 'Armazenado'];

  // Manipuladores de eventos
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleNumberChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: parseInt(value) || 0 }));
  };

  const handleDateChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: new Date(value) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

    return (
    <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
      {/* Botão de fechar no canto superior direito */}
       <div style={styles.formHeader}>
        <h2 style={styles.formTitle}>
          {isEditing ? 'Editar Lote' : 'Cadastrar Novo Lote'}
        </h2>
      <button 
        type="button"
        onClick={onCancel}
        style={styles.closeButton}
        aria-label="Fechar formulário"
      >
        &times;
      </button>
    </div>

      <div style={styles.container}>
        {/* Número do Lote */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="numeroLote" style={styles.label}>
            Número do Lote *
          </label>
          <input
            id="numeroLote"
            type="text"
            value={formData.numeroLote}
            onChange={(e) => onFormChange('numeroLote', e.target.value.slice(0, 12))}
            placeholder="Ex: LOT123456"
            style={styles.input}
            maxLength={12}
            required
          />
        </div>

        {/* Nome do Medicamento */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="nomeMedicamento" style={styles.label}>
            Nome do Medicamento *
          </label>
          <input
            id="nomeMedicamento"
            type="text"
            value={formData.nomeMedicamento}
            onChange={(e) => onFormChange('nomeMedicamento', e.target.value)}
            placeholder="Nome do medicamento"
            style={styles.input}
            required
          />
        </div>

        {/* Data de Fabricação */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={styles.label}>Data de Fabricação *</label>
          <input
            type="date"
            value={formData.dataFabricacao ? format(formData.dataFabricacao, 'yyyy-MM-dd') : ''}
            onChange={(e) => onDateChange('dataFabricacao', e.target.value)}
            style={styles.input}
            required
          />
        </div>

        {/* Data de Validade */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={styles.label}>Data de Validade *</label>
          <input
            type="date"
            value={formData.dataValidade ? format(formData.dataValidade, 'yyyy-MM-dd') : ''}
            onChange={(e) => onDateChange('dataValidade', e.target.value)}
            style={styles.input}
            required
          />
        </div>

        {/* Quantidade Recebida */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="quantidadeRecebida" style={styles.label}>
            Quantidade Recebida *
          </label>
          <input
            id="quantidadeRecebida"
            type="number"
            value={formData.quantidadeRecebida}
            onChange={(e) => onFormChange('quantidadeRecebida', parseInt(e.target.value) || 0)}
            placeholder="Quantidade"
            style={styles.input}
            min="1"
            required
          />
        </div>

        {/* Unidade de Medida */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="unidadeMedida" style={styles.label}>
            Unidade de Medida *
          </label>
          <select
            id="unidadeMedida"
            value={formData.unidadeMedida}
            onChange={(e) => onFormChange('unidadeMedida', e.target.value)}
            style={styles.input}
            required
          >
            <option value="">Selecione a unidade</option>
            {unidadesMedida.map(unidade => (
              <option key={unidade} value={unidade}>{unidade}</option>
            ))}
          </select>
        </div>

        {/* Fornecedor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="fornecedor" style={styles.label}>
            Fornecedor *
          </label>
          <input
            id="fornecedor"
            type="text"
            value={formData.fornecedor}
            onChange={(e) => onFormChange('fornecedor', e.target.value)}
            placeholder="Nome ou CNPJ do fornecedor"
            style={styles.input}
            required
          />
        </div>

        {/* Número da Nota Fiscal */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="numeroNotaFiscal" style={styles.label}>
            Número da Nota Fiscal *
          </label>
          <input
            id="numeroNotaFiscal"
            type="text"
            value={formData.numeroNotaFiscal}
            onChange={(e) => onFormChange('numeroNotaFiscal', e.target.value)}
            placeholder="Número da nota fiscal"
            style={styles.input}
            required
          />
        </div>

        {/* Forma Farmacêutica */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="formaFarmaceutica" style={styles.label}>
            Forma Farmacêutica *
          </label>
          <select
            id="formaFarmaceutica"
            value={formData.formaFarmaceutica}
            onChange={(e) => onFormChange('formaFarmaceutica', e.target.value)}
            style={styles.input}
            required
          >
            <option value="">Selecione a forma</option>
            {formasFarmaceuticas.map(forma => (
              <option key={forma} value={forma}>{forma}</option>
            ))}
          </select>
        </div>

        {/* Classe Terapêutica */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="classeTerapeutica" style={styles.label}>
            Classe Terapêutica
          </label>
          <select
            id="classeTerapeutica"
            value={formData.classeTerapeutica}
            onChange={(e) => onFormChange('classeTerapeutica', e.target.value)}
            style={styles.input}
          >
            <option value="">Selecione a classe</option>
            {classesTerapeuticas.map(classe => (
              <option key={classe} value={classe}>{classe}</option>
            ))}
          </select>
        </div>

        {/* Status do Lote */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="statusLote" style={styles.label}>
            Status do Lote *
          </label>
          <select
            id="statusLote"
            value={formData.statusLote}
            onChange={(e) => onFormChange('statusLote', e.target.value)}
            style={styles.input}
            required
          >
            {statusLote.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {/* Responsável pelo Recebimento */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="responsavelRecebimento" style={styles.label}>
            Responsável pelo Recebimento *
          </label>
          <input
            id="responsavelRecebimento"
            type="text"
            value={formData.responsavelRecebimento}
            onChange={(e) => onFormChange('responsavelRecebimento', e.target.value)}
            placeholder="Nome do responsável"
            style={styles.input}
            required
          />
        </div>

        {/* Data de Recebimento */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={styles.label}>Data de Recebimento *</label>
          <input
            type="date"
            value={formData.dataRecebimento ? format(formData.dataRecebimento, 'yyyy-MM-dd') : ''}
            onChange={(e) => onDateChange('dataRecebimento', e.target.value)}
            style={styles.input}
            required
          />
        </div>

        {/* Validade do Lote (Controle Interno) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={styles.label}>Validade do Lote (Controle Interno)</label>
          <input
            type="date"
            value={formData.validadeLoteInterno ? format(formData.validadeLoteInterno, 'yyyy-MM-dd') : ''}
            onChange={(e) => onDateChange('validadeLoteInterno', e.target.value)}
            style={styles.input}
          />
        </div>

        {/* Número do Registro ANVISA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="numeroRegistroAnvisa" style={styles.label}>
            Número do Registro ANVISA
          </label>
          <input
            id="numeroRegistroAnvisa"
            type="text"
            value={formData.numeroRegistroAnvisa}
            onChange={(e) => onFormChange('numeroRegistroAnvisa', e.target.value)}
            placeholder="Registro ANVISA"
            style={styles.input}
          />
        </div>

        {/* Observações Adicionais */}
        <div style={{ ...styles.fullWidth, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="observacoes" style={styles.label}>
            Observações Adicionais
          </label>
          <textarea
            id="observacoes"
            value={formData.observacoes}
            onChange={(e) => onFormChange('observacoes', e.target.value)}
            placeholder="Informações extras sobre o lote"
            style={{ ...styles.input, minHeight: '100px' }}
            rows={3}
          />
        </div>

        {/* Botões de ação */}
        <div style={{ ...styles.fullWidth, display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
          <button 
            type="button"
            style={styles.buttonOutline}
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button 
            type="submit"
            style={styles.buttonPrimary}
          >
            {isEditing ? 'Salvar Alterações' : 'Cadastrar Lote'}
          </button>
        </div>
      </div>
    </form>
  );
};



export default LoteForm;

 // Estilos
  const styles = {
    container: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1rem',
      padding: '1rem 0 0rem', // Aumentei o padding top para o título jonas
    },
     formHeader: {
    gridColumn: '1 / -1',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '0.5rem'
  },
  formTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1e40af',
    margin: 0
  },
    input: {
      border: '1px solid #1e40af',
      borderRadius: '0.375rem',
      padding: '0.5rem 0.75rem',
      width: '100%'
    },
    buttonPrimary: {
      backgroundColor: '#1e40af',
      color: 'white',
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '0.375rem',
      cursor: 'pointer'
    },
    buttonOutline: {
      backgroundColor: 'transparent',
      color: '#1e40af',
      border: '1px solid #1e40af',
      padding: '0.5rem 1rem',
      borderRadius: '0.375rem',
      cursor: 'pointer'
    },
    label: {
      fontWeight: '600'
    },
    fullWidth: {
      gridColumn: '1 / -1'
    },
    closeButton: {
    position: 'relative',
    top: '-33px', 
    left:'820px',
    right: '0.5rem',
    background: 'transparent',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#6b7280',
    '&:hover': {
      color: '#1e40af'
    }
  }
};
