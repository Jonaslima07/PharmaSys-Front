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












// import React, { useState, useEffect, useRef } from 'react';
// import { Form, ListGroup, Alert, Card } from 'react-bootstrap';

// const PesquisaPaciente = ({ pacientes }) => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filteredPacientes, setFilteredPacientes] = useState([]);
//   const [selectedPaciente, setSelectedPaciente] = useState(null);
//   const pacienteRef = useRef(null);

//   // Função para fazer debounce da pesquisa
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       if (searchQuery) {
//         const filtered = pacientes.filter((paciente) =>
//           paciente.nome.toLowerCase().includes(searchQuery.toLowerCase())
//         );
//         setFilteredPacientes(filtered);
//       } else {
//         setFilteredPacientes([]);
//       }
//     }, 300); // 300ms de debounce

//     // Limpar o timer anterior antes de iniciar um novo
//     return () => clearTimeout(timer);
//   }, [searchQuery, pacientes]);

//   // Atualiza o valor da pesquisa
//   const handleSearchChange = (e) => {
//     setSearchQuery(e.target.value);
//   };

//   // Seleciona um paciente da lista e rola até ele
//   const handleSelectPaciente = (paciente) => {
//     setSelectedPaciente(paciente);
//     pacienteRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
//   };

//   return (
//     <div>
//       {/* Campo de Pesquisa */}
//       <Form.Control
//         type="text"
//         placeholder="Pesquise um paciente..."
//         value={searchQuery}
//         onChange={handleSearchChange}
//         style={{ padding: '10px', fontSize: '16px', borderRadius: '5px' }}
//       />

//       {/* Exibição da lista de pacientes filtrados apenas quando houver pesquisa */}
//       {searchQuery && filteredPacientes.length === 0 ? (
//         <Alert variant="info" style={{ marginTop: '20px' }}>
//           Nenhum paciente encontrado.
//         </Alert>
//       ) : (
//         <ListGroup style={{ marginTop: '20px' }}>
//           {filteredPacientes.map((paciente) => (
//             <ListGroup.Item
//               key={paciente.id}
//               style={{ cursor: 'pointer' }}
//               onClick={() => handleSelectPaciente(paciente)}
//             >
//               {paciente.nome}
//             </ListGroup.Item>
//           ))}
//         </ListGroup>
//       )}

//       {/* Exibição das informações do paciente selecionado */}
//       {selectedPaciente && (
//         <div ref={pacienteRef} style={{ marginTop: '20px' }}>
//           <Card>
//             <Card.Body>
//               <Card.Title>Informações do Paciente</Card.Title>
//               <Card.Text>
//                 <strong>Nome:</strong> {selectedPaciente.nome}
//               </Card.Text>
//               <Card.Text>
//                 <strong>ID:</strong> {selectedPaciente.id}
//               </Card.Text>
//               <Card.Text>
//                 <strong>Medicamento:</strong> {selectedPaciente.medicamento}
//               </Card.Text>
//               <Card.Text>
//                 <strong>Quantidade:</strong> {selectedPaciente.quantidade}
//               </Card.Text>
//             </Card.Body>
//           </Card>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PesquisaPaciente;
