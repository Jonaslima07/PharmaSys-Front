import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './logincss.css';
import { GoogleLogin } from '@react-oauth/google'; // Importar GoogleLogin

const CriarContaForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [role, setRole] = useState('farmaceutico');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState(''); // Adicionando telefone
  const [registrationId, setRegistrationId] = useState(''); // Adicionando registro profissional
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [jwtToken, setJwtToken] = useState('');

  const navigate = useNavigate();

  const checkEmailExists = async (email) => {
    try {
      const response = await fetch(`http://localhost:5000/users?email=${email}`);
      const data = await response.json();
      return data.length > 0;
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      return false;
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const showToast = (message, type) => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  const createUser = async (userData) => {
    try {
      const response = await fetch('http://localhost:5000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      return await response.json();
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !birthDate || !phone || !registrationId || !password || password !== confirmPassword) {
      showToast('Por favor, preencha todos os campos corretamente.', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('A senha deve ter pelo menos 6 caracteres.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        showToast('Este email já está cadastrado.', 'error');
        setIsLoading(false);
        return;
      }

      const newUser = {
        name,
        email,
        birthDate,
        role,
        phone,
        registrationId,
        password,
        createdAt: new Date().toISOString(),
      };

      await createUser(newUser);
      
      showToast('Conta criada com sucesso! Redirecionando para login...', 'success');
      
      // Redireciona para a tela de login após 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      showToast('Erro ao criar conta. Tente novamente.', 'error');
      console.error('Erro no cadastro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função de login com Google
  const handleGoogleLoginSuccess = async (response) => {
    const googleToken = response.credential;  // O token do Google
    try {
      // Enviar o token do Google para a API para obter um JWT
      const res = await fetch('http://localhost:5000/auth/google/callback', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${googleToken}`,
        },
      });

      const data = await res.json();
      if (data.token) {
        setJwtToken(data.token);  // Armazenar JWT na variável de estado
        navigate('/cadastropaciente');  // Redirecionando para a página protegida
      }
    } catch (error) {
      console.error('Erro no login com Google:', error);
    }
  };

  const handleGoogleLoginError = (error) => {
    console.error('Erro no login com Google:', error);
  };
  
  
  return (
    <div style={styles.authContainer}>
      <div style={styles.authLeft}>
        <img src="images/pill.png" alt="Logo" style={styles.logo} />
        <h1 style={styles.h1}>PharmaSys</h1>
        <p style={styles.p}>Sistema de Gestão Farmacêutica</p>
      </div>
      
      <div style={styles.authRight}>
        <div style={styles.authContent}>
          <h2 style={styles.h2}>Crie sua Conta</h2>
          <p style={styles.subtitle}>Preencha os dados abaixo para se registrar</p>

          {toastMessage && (
            <div style={{ 
              ...styles.toast, 
              backgroundColor: toastType === 'success' ? '#d4edda' : '#f8d7da', 
              color: toastType === 'success' ? '#155724' : '#721c24' 
            }}>
              {toastMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Campo para Nome */}
            <div style={styles.formGroup}>
              <label htmlFor="name" style={styles.label1}>Nome completo</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite seu nome completo"
                disabled={isLoading}
                style={styles.input1}
              />
            </div>

            {/* Campo para Email */}
            <div style={styles.formGroup}>
              <label htmlFor="email" style={styles.label2}>Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="digite seu email"
                disabled={isLoading}
                style={styles.input2}
              />
            </div>

            {/* Campo para Data de Nascimento */}
            <div style={styles.formGroup}>
              <label htmlFor="birthDate" style={styles.labelBirthDate}>Data de Nascimento</label>
              <input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                disabled={isLoading}
                style={styles.inputBirthDate}
              />
            </div>

            {/* Novo campo para Telefone */}
            <div style={styles.formGroup}>
              <label htmlFor="phone" style={styles.label3}>Número de Telefone</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Digite seu telefone"
                disabled={isLoading}
                style={styles.input3}
              />
            </div>

            {/* Novo campo para Registro Profissional */}
            <div style={styles.formGroup}>
              <label htmlFor="registrationId" style={styles.labelRegistration}>Registro Profissional</label>
              <input
                id="registrationId"
                type="text"
                value={registrationId}
                onChange={(e) => setRegistrationId(e.target.value)}
                placeholder="registro profissional"
                disabled={isLoading}
                style={styles.inputRegistration}
              />
            </div>

            {/* Campos para Senha */}
            <div style={styles.formGroup}>
              <label htmlFor="password" style={styles.label4}>Senha</label>
              <div style={styles.passwordContainer}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a senha"
                  disabled={isLoading}
                  style={styles.input4}
                />
                <span style={styles.eyeIcon} onClick={togglePasswordVisibility}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="confirmPassword" style={styles.label5}>Confirmar Senha</label>
              <div style={styles.passwordContainer}>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme a senha"
                  disabled={isLoading}
                  style={styles.input5}
                />
                <span style={styles.eyeIcontwo} onClick={toggleConfirmPasswordVisibility}>
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            <button type="submit" disabled={isLoading} style={styles.button}>
              {isLoading ? (
                <span style={styles.spinner}>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Criando...
                </span>
              ) : (
                'Criar Conta'
              )}
            </button>
          </form>
            
          <div style={styles.googleWrapper}>
            <div style={styles.googleInnerWrapper}>  
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginError}
                useOneTap
                shape="pill"
                theme="outline"
                size="large"
              />
            </div>
          </div>


          <p style={styles.registerLink}>
            Já tem uma conta? <Link to="/login" style={styles.link}>Faça login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};


const styles = {
  
  googleWrapper: {
  position: 'relative',
  width: '422px',
  left: '-100px',
  top: '-180px',
  marginTop: '10px',
  display: 'flex',
  justifyContent: 'center',
  backgroundColor: 'transparent', // garante que o fundo não interfira
  zIndex: 1, // garante que fique acima de outros elementos se necessário
},
  googleInnerWrapper: {
    transform: 'scale(0.9)',
    width: '100%',
    display: 'flex',
    justifyContent: 'center'
  },

  passwordContainer: {
    position: 'relative',
    width: '200px', 
  },

  eyeIcontwo: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    color: '#666',
    fontSize: '16px',
    zIndex: 2,
    marginTop: '-150px',
    left: '390px'
  },

  eyeIcon: {
    position: 'absolute',
    right: '10px',
    top: '40px',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    color: '#666',
    fontSize: '16px',
    zIndex: 2,
    marginTop: '-25px'
  },

  authContainer: {
    display: 'flex',
    height: '100vh',
    backgroundColor: 'white',
    width: '1500px',
    overflow: 'hidden', // Remover overflow indesejado (apenas um overflow permitido)
  },
  authLeft: {
    flex: 1,
    backgroundColor: '#001f3d',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem',
    position: 'relative',
    left:'-113px'

  },
  logo: {
    width: '25px',
    position:'relative',
    marginBottom: '10px',
    left: '98px',
    top:'43px'
  },
  h1: {
    fontSize: '32px',
    marginBottom: '10px',
    fontWeight: 'bold',
  },
  p: {
    fontSize: '16px',
    color: '#78C2FF',
  },
  authRight: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem',
    
  },
  authContent: {
    width: '100%',
    maxWidth: '400px',
  },
  h2: {
    fontSize: '24px',
    marginBottom: '10px',
    fontWeight: 'bold',
    color: '#001f3d',
    position: 'relative',
    top:'245px',
    left:'45px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '2rem',
    position: 'relative',
    top:'245px',
    left:'-30px',

  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    position: 'relative',
    left:'-100px',
  },
  formGroup: {
    marginBottom: '1.5rem',
  },

  inputBirthDate: {
    width: '418px',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '14px',
    boxSizing: 'border-box',
    position: 'relative',
    top:'175px',
  },

  labelBirthDate: {
    display: 'block',
    fontSize: '14px',
    color: '#333',
    marginBottom: '0.5rem',
    fontWeight: '500',
    position: 'relative',
    top:'175px',
  },

  label1: {
    display: 'block',
    fontSize: '14px',
    color: '#333',
    marginBottom: '0.5rem',
    fontWeight: '500',
    position: 'relative',
    top:'239px',
  },

  label2: {
    display: 'block',
    fontSize: '14px',
    color: '#333',
    marginBottom: '0.5rem',
    fontWeight: '500',
    position: 'relative',
    top:'209px',
  },
  label3: {
    display: 'block',
    fontSize: '14px',
    color: '#333',
    marginBottom: '0.5rem',
    fontWeight: '500',
    position: 'relative',
    top:'148px',
    left:'220px'
  },

  label4: {
    display: 'block',
    fontSize: '14px',
    color: '#333',
    marginBottom: '0.5rem',
    fontWeight: '500',
    position: 'relative',
    top:'-1px',
  },
  label5: {
    display: 'block',
    fontSize: '14px',
    color: '#333',
    marginBottom: '0.5rem',
    fontWeight: '500',
    position: 'relative',
    top:'-145px',
    left:'218px',
    
  },
  input1: {
    width: '418px',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '14px',
    boxSizing: 'border-box',
    position: 'relative',
    top:'238px',
  },

  input2: {
   width: '418px',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '14px',
    boxSizing: 'border-box',
    position: 'relative',
    top:'210px',
  },

   // Novo estilo para o input do registro profissional
  inputRegistration: {
    width: '200px',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '14px',
    boxSizing: 'border-box',
    position: 'relative',
    top: '30px',
  },

    // Novo estilo para o label do registro profissional
  labelRegistration: {
    display: 'block',
    fontSize: '14px',
    color: '#333',
    marginBottom: '0.5rem',
    fontWeight: '500',
    position: 'relative',
    top: '32px',
  },

  
  input3: {
    width: '200px',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '14px',
    boxSizing: 'border-box',
    position: 'relative',
    top: '145px',
    left:'220px'
  },
  
  input4: {
    width: '200px',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '14px',
    boxSizing: 'border-box',
    position: 'relative',
    top: '-35px',
    marginTop: '30px',
    paddingRight: '40px', 
  },

   input5: {
    width: '200px',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '14px',
    boxSizing: 'border-box',
    position: 'relative',
    top: '-150px',
    left: '218px',
    paddingRight: '40px', 
  },

  button: {
    width: '422px',
    backgroundColor: '#001f3d',
    color: 'white',
    padding: '8px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    marginTop: '1rem',
    position: 'relative',
    top:'-190px',
    
  },
  registerLink: {
    textAlign: 'center',
    fontSize: '14px',
    marginTop: '1.5rem',
    color: '#78C2FF',
    position: 'relative',
    top:'-190px',
    left:'-100px'
    
  },
  link: {
    textDecoration: 'none',
    fontWeight: '500',
    color: '#78C2FF',
  },
  toast: {
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '-6rem',
    fontSize: '14px',
    position: 'relative',
    left:'240px',
    top:'50px',

    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
};

export default CriarContaForm;
