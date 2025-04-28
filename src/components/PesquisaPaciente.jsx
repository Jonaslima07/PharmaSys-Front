import React, { useState, useEffect } from 'react';
import { Form, ListGroup, Alert, Button, InputGroup } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';

const PesquisaPaciente = ({ pacientes, onSelectPaciente }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPacientes, setFilteredPacientes] = useState([]);

  // Filtra pacientes baseado no input (mas não seleciona automaticamente)
  const searchPaciente = (query) => {
    if (query) {
      const filtered = pacientes.filter((paciente) =>
        paciente.nome.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredPacientes(filtered);
    } else {
      setFilteredPacientes([]);
    }
  };

  useEffect(() => {
    searchPaciente(searchQuery);
  }, [searchQuery, pacientes]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchClick = () => {
    searchPaciente(searchQuery);
    
    // Seleciona o primeiro paciente da lista apenas se existir
    if (filteredPacientes.length > 0) {
      onSelectPaciente(filteredPacientes[0]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  return (
    <div style={styles.container}>
      <InputGroup className="mb-3" style={styles.inputGroup}>
        <Form.Control
          style={styles.inputField}
          type="text"
          placeholder="Pesquise um paciente..."
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyPress={handleKeyPress}
        />
        <Button 
          variant="outline-primary" 
          style={styles.searchButton} 
          onClick={handleSearchClick}
        >
          <FaSearch />
        </Button>
      </InputGroup>

      {searchQuery && filteredPacientes.length === 0 ? (
        <Alert variant="info" style={styles.noResults}>
          Nenhum paciente encontrado.
        </Alert>
      ) : (
        <ListGroup style={styles.listGroup}>
          {filteredPacientes.map((paciente) => (
            <ListGroup.Item
              key={paciente.id}
              style={styles.listItem}
              onClick={() => onSelectPaciente(paciente)} // Seleciona ao clicar no nome
            >
              {paciente.nome}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
};

// Estilos (mantidos iguais)
const styles = {
  container: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  inputGroup: {
    width: '100%',
    maxWidth: '600px',
    borderRadius: '30px',
    marginBottom: '20px',
  },
  inputField: {
    borderRadius: '30px',
    paddingLeft: '30px',
    paddingRight: '30px',
    fontSize: '16px',
  },
  searchButton: {
    borderRadius: '30px',
    backgroundColor: '#007BFF',
    border: 'none',
    padding: '10px 20px',
    fontSize: '16px',
    color: '#fff',
  },
  listGroup: {
    width: '100%',
    maxWidth: '600px',
  },
  listItem: {
    cursor: 'pointer',
    borderRadius: '15px',
    marginBottom: '10px',
    backgroundColor: '#f0f8ff',
    transition: 'background-color 0.3s ease',
  },
  noResults: {
    width: '100%',
    maxWidth: '600px',
    height: '50px',
    textAlign: 'center',
    fontSize: '16px',
  },
};

export default PesquisaPaciente;











