import React, { useState } from 'react';

const DuvidasComp = () => {
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const toggleQuestion = (question) => {
    setSelectedQuestion(selectedQuestion === question ? null : question);
  };

  return (
    <div style={styles.appContainer}>
      <h1 style={styles.heading}>Seção de Dúvidas</h1>
        <div style={styles.iconContainer}>
            <img
              src="/images/muiepensano.png" // Substitua pelo caminho correto da imagem que você deseja mostrar
              alt="Ícone"
              style={styles.iconimg}
            />
        </div>

      <div style={styles.question}>
        <div
          style={styles.questionHeader}
          onClick={() => toggleQuestion('qualObjetivo')}
        >
          <h2 style={styles.questionTitle}>Qual o objetivo?</h2>
          <div style={styles.icon}>
            <img
              src={selectedQuestion === 'qualObjetivo' ? "/images/arrow-up.png" : "/images/arrow-down.png"} // Substitua com o caminho correto da imagem
              alt="Seta"
              style={styles.arrowIcon}
            />
          </div>
        </div>
        {selectedQuestion === 'qualObjetivo' && (
            <div style={styles.answer}>

                <p style={styles.listItem}>  Tem como objetivo gerenciar os medicamentos evitando:  </p>
                <p style={styles.listItem}>→ Medicamentos vencidos;</p>
                <p style={styles.listItem}>→ A ausência de medicamentos;</p>
                <p style={styles.listItem}>→ O uso de carteirinhas físicas;</p>
            </div>
        )}
      </div>

      <div style={styles.question}>
        <div
          style={styles.questionHeader}
          onClick={() => toggleQuestion('comoFunciona')}
        >
          <h2 style={styles.questionTitle}>Como funciona o sistema?</h2>
          <div style={styles.icon}>
            <img
              src={selectedQuestion === 'comoFunciona' ? "/images/arrow-up.png" : "/images/arrow-down.png"} // Substitua com o caminho correto da imagem
              alt="Seta"
              style={styles.arrowIcon}
            />
          </div>
        </div>
        {selectedQuestion === 'comoFunciona' && (
          <div style={styles.answer}>
            <p style={styles.listItemx}>
              O farmacêutico/secretário(a) de saúde irá fazer o login no sistema
              clicando em login e irá adicionar suas informações para ter acesso
              às funcionalidades de cadastrar novo administrador e cadastrar um
              novo paciente e dar baixa em cada medicamento retirado.
            </p>
            <p style={styles.listItemx}>
              Já o paciente irá fazer login na seção de paciente para poder
              ter acesso aos históricos de medicamentos retirados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
// Estilos em um objeto para uso inline
const styles = {
  // Estilos em um objeto para uso inline
  appContainer: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '1450px',
    width:'-1400px',
    margin: '0 auto',
    position: 'relative',
    left: '0px',
    top: '30px',
    padding: '420px',
    backgroundColor: '#000000',
    color: 'white',
    borderRadius: '10px',
    height: '220px',
  },
  arrowIcon: {
    width: '16px', // Reduzindo o tamanho da seta
    height: '16px', // Reduzindo o tamanho da seta
    transition: 'transform 0.3s ease',
  },
  iconContainer: {
    marginRight: '10px',
    width: '24px', // Ajuste o tamanho da imagem
    height: '24px',
    position: 'relative',
    left: '-400px',
    top: '-80px',
    
  },
  iconimg: {
    width: '250px', // Ajuste o tamanho da imagem
    height: '250px', // Ajuste o tamanho da imagem
  },

  heading: {
    textAlign: 'center',
    color: '#f1f1f1',
    position: 'relative',
    left: '-10px',
    top: '-400px',
  },
  question: {
    marginBottom: '20px',
    position: 'relative',
    left: '0px',
    top: '-300px',
  },
  questionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: '#ffffff',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    border: '1px solid #ddd',
  },
  questionTitle: {
    margin: '0',
    color: '#333',
  },
  icon: {
    fontSize: '20px',
    color: '#333',
  },
  answer: {
    backgroundColor: '#ffffff',
    padding: '15px',
    borderRadius: '5px',
    marginTop: '10px',
    color: '#333',
    border: '0px solid #ddd',
  },

  listItem: {
    marginBottom: '10px',
    color: '#333',
    fontSize: '1.5rem',
    position: 'relative',
    left:'30px',
  },
  listItemx: {
    marginBottom: '10px',
    color: '#333',
    fontSize: '1.5rem',
  },
  
};

export default DuvidasComp;
