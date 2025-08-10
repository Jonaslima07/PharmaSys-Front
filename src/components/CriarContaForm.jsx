import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { auth, provider, signInWithPopup } from '../firebase';
import './logincss.css';

const CriarContaForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [registrationId, setRegistrationId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const navigate = useNavigate();

  const showToast = (message, type) => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const checkEmailExists = async (email) => {
  try {
    const response = await fetch(`http://localhost:5000/usuarios/registro?email=${email}`);
    if (!response.ok) {
      return false; 
    }
    const data = await response.json();
    return !!data.id; 
  } catch (error) {
    console.error('Erro ao verificar email:', error);
    return false;
  }
};

const checkPhoneExists = async (phone) => {
  try {
    const response = await fetch(`http://localhost:5000/usuarios/registro?phone=${phone}`);
    if (!response.ok) {
      return false;
    }
    const data = await response.json();
    return !!data.id; 
  } catch (error) {
    console.error('Erro ao verificar telefone:', error);
    return false;
  }
};


const createUser = async (dados) => {
  const response = await fetch("http://localhost:5000/usuarios/registro", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    const erro = await response.json();
    throw new Error(erro.mensagem || "Erro ao criar usuário");
  }

  return await response.json();
};


  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!name || !email || !birthDate || !phone || !password || password !== confirmPassword) {
    showToast('Preencha todos os campos corretamente.', 'error');
    return;
  }

  if (password.length < 6) {
    showToast('A senha deve ter pelo menos 6 caracteres.', 'error');
    return;
  }

  setIsLoading(true);

  try {
    // Validações preliminares, pode manter ou remover, já que o backend também valida.
    const emailExists = await checkEmailExists(email);
    if (emailExists) {
      showToast('Este email já está cadastrado.', 'error');
      setIsLoading(false);
      return;
    }

    const phoneExists = await checkPhoneExists(phone);
    if (phoneExists) {
      showToast('Este telefone já está cadastrado.', 'error');
      setIsLoading(false);
      return;
    }

    const now = new Date();
    const createdAt = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 19);

    const finalRole = registrationId.trim() === '' ? 'administrador' : 'farmacêutico';

    const newUser = {
      name,
      email,
      birthDate,
      role: finalRole,
      phone,
      crf: registrationId.trim(),
      password,
      createdAt,
    };

    // Tenta criar o usuário
    await createUser(newUser);

    // Após criar, tenta logar automaticamente
    const loginResponse = await fetch('http://localhost:5000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const loginData = await loginResponse.json();
    if (!loginResponse.ok) throw new Error(loginData.mensagem || 'Erro no login automático');

    const token = loginData.token;
    const user = loginData.user;

    const verifyRes = await fetch(`http://localhost:5000/usuarios/verificar-cadastro?email=${email}`);
    const verifyData = await verifyRes.json();

    localStorage.setItem('userData', JSON.stringify({ token, user }));

    showToast('Conta criada com sucesso!', 'success');

    setTimeout(() => {
      if (verifyData.cadastroCompleto) {
        navigate('/cadastrarlotes');
      } else {
        navigate('/completarcadastro');
      }
    }, 1500);
  } catch (error) {
    console.error(error);
    // Exibe mensagem retornada pelo backend (erro.message) ou uma genérica
    showToast(error.message || 'Erro ao criar conta.', 'error');
  } finally {
    setIsLoading(false);
  }
};


  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();

      const res = await fetch('http://localhost:5000/auth/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.mensagem || 'Erro com Firebase');

      localStorage.setItem('userData', JSON.stringify({ token: data.token, user: data.user }));

      showToast('Conta criada com Google!', 'success');

      setTimeout(() => {
        if (!data.user.cadastroCompleto) {
          navigate('/completarcadastro');
        } else {
          navigate('/cadastrarlotes');
        }
      }, 1500);
    } catch (error) {
      console.error('Erro com Firebase:', error);
      showToast(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
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
            <div style={styles.formGroup}>
              <label style={styles.label1}>Nome completo</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={styles.input1} disabled={isLoading} />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label2}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input2} disabled={isLoading} />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.labelBirthDate}>Data de Nascimento</label>
              <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} style={styles.inputBirthDate} disabled={isLoading} />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label3}>Telefone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={styles.input3} disabled={isLoading} />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.labelRegistration}>Registro Profissional</label>
              <input type="text" value={registrationId} onChange={(e) => setRegistrationId(e.target.value)} style={styles.inputRegistration} disabled={isLoading} />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label4}>Senha</label>
              <div style={styles.passwordContainer}>
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input4} disabled={isLoading} />
                <span style={styles.eyeIcon} onClick={togglePasswordVisibility}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label5}>Confirmar Senha</label>
              <div style={styles.passwordContainer}>
                <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={styles.input5} disabled={isLoading} />
                <span style={styles.eyeIcontwo} onClick={toggleConfirmPasswordVisibility}>
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            <button type="submit" style={styles.button} disabled={isLoading}>
              {isLoading ? 'Criando...' : 'Criar Conta'}
            </button>
          </form>

          <div style={styles.googleWrapper}>
            <button onClick={handleGoogleSignup} style={styles.googleButton} disabled={isLoading}>
              Criar conta com Google
            </button>
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
  zIndex: 1, 
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
