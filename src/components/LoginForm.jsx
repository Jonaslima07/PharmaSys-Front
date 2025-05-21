import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './logincss.css';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      showToast('Por favor, preencha todos os campos.', 'error');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (email === 'demo@pharmasys.com' && password === 'password') {
        showToast('Login realizado com sucesso.', 'success');
        navigate('/dashboard');
      } else {
        showToast('Email ou senha incorretos.', 'error');
      }
    }, 1500);
  };

  const showToast = (message, type) => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
          <h2 style={styles.h2}>Bem-vindo de volta</h2>
          <p style={styles.subtitle}>Acesse sua conta para continuar</p>

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
            <div style={styles.formGroup}>
              <label htmlFor="email" style={styles.labelemail}>Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="digite seu email"
                disabled={isLoading}
                style={styles.inputemail}
              />
            </div>

            <div style={styles.formGroup}>
              <div style={styles.passwordContainer}>
                <label htmlFor="password" style={styles.label}>Senha</label>
                <Link to="/forgot-password" style={styles.forgotPasswordLink}>Esqueceu a senha?</Link>
              </div>
              <div style={styles.passwordInputContainer}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="digite sua senha"
                  disabled={isLoading}
                  style={styles.input}
                />
                <button 
                  type="button" 
                  onClick={togglePasswordVisibility} 
                  style={styles.eyeButton}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} style={styles.button}>
              {isLoading ? (
                <span style={styles.spinner}>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Entrando...
                </span>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <div style={styles.demoAccount}>
            <p style={styles.demoText1}>Conta de demonstração:</p>
            <p style={styles.demoText2}>Email: demo@pharmasys.com</p>
            <p style={styles.demoText3}>Senha: password</p>
          </div>

          <p style={styles.registerLink}>
            Não possui uma conta? <Link to="/CriarConta" style={styles.link}>Crie uma agora</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  authContainer: {
    display: 'flex',
    height: '100vh',
    backgroundColor: 'white',
    width: '1500px' // Ensures it takes full width of the viewport

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
    minWidth: '40%',
    position:'relative',
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
    backgroundColor: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem',
    height: '730px', // Let the form take up the necessary space dynamically
    maxWidth: '1000px', // Alterado de width para maxWidth
    width: '100%', // Adicionado para ocupar espaço disponível
    margin: '20 20px' // Adicionado margem para não colar nas bordas

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
    position:'relative',
    top:'45px'
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '2rem',
    position:'relative',
    top:'45px'
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    position: 'relative',
    left: '-100px'
    
   

  },
  formGroup: {
    marginBottom: '1.5rem',
  },
  labelemail: {
    display: 'block',
    fontSize: '14px',
    color: '#333',
    marginBottom: '0.5rem',
    fontWeight: '500',
    position: 'relative',
    top:'65px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    color: '#333',
    marginBottom: '0.5rem',
    fontWeight: '500',
    position: 'relative',
    top:'39px'
  },
  inputemail: {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '14px',
    boxSizing: 'border-box',
    position: 'relative',
    top:'60px'
    
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '14px',
    boxSizing: 'border-box',
    position: 'relative',
    top:'25px'

    
  },
  passwordInputContainer: {
    position: 'relative',
  },
  eyeButton: {
    position: 'relative',
    right: '10px',
    top: '50',
    left:'370px',
    transform: 'translateY(-50%)',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#666',
  },
  button: {
    width: '100%',
    backgroundColor: '#001f3d',
    color: 'white',
    padding: '8px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    marginTop: '1rem',
    transition: 'background-color 0.3s',
    position: 'relative',
    top:'-35px'
    

  },
  spinner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  passwordContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',

  },//color: '#78C2FF',
  forgotPasswordLink: {
    fontSize: '12px',
    color: '#007bff',
    textDecoration: 'none',
    position: 'relative',
    top:'35px'
  },
  demoAccount: {
    position: 'relative',
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#f4f6f9',
    borderRadius: '6px',
    border: '1px solid #ddd',
    left: '-100px',
    top:'-6px',
    height:'80px',
    
    
  },
  demoText1: {
    fontSize: '14px',
    position: 'relative',
    top:'-5px'
  },
  demoText2: {
    fontSize: '14px',
    position: 'relative',
    top:'-25px'
  },
  demoText3: {
    fontSize: '14px',
    position: 'relative',
    top:'-42px'
  },

  registerLink: {
    textAlign: 'center',
    fontSize: '14px',
    marginTop: '1.5rem',
    color: '#78C2FF',
    position:'relative',
    left:'-113px',
    top:'-145px'
    
    
  },
  link: {
    color: '#001f3d',
    textDecoration: 'none',
    fontWeight: '500',
    color: '#78C2FF',
  },
  toast: {
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '1rem',
    fontSize: '14px',
    textAlign: 'center',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  }
};

export default LoginForm;
