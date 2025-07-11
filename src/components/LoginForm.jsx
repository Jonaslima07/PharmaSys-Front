import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { auth, provider, signInWithPopup } from "../firebase"; 
import "./logincss.css";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const navigate = useNavigate();

  const showToast = (message, type) => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (email, password) => {
    const response = await fetch("http://localhost:5000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensagem || "Erro ao fazer login");
    }

    // Verifica se email está confirmado no login manual
    if (!data.user.emailConfirmed) {
      throw new Error("Email não confirmado. Por favor, confirme seu email antes de entrar.");
    }

    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      showToast("Por favor, preencha todos os campos", "error");
      return;
    }

    setIsLoading(true);

    try {
      const data = await handleLogin(email, password);
      localStorage.setItem("userData", JSON.stringify({ token: data.token, user: data.user }));
      showToast("Login realizado com sucesso!", "success");
      setTimeout(() => navigate("/cadastropaciente"), 1500);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();

      const res = await fetch("http://localhost:5000/auth/firebase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.mensagem || "Erro ao validar token Firebase");
      }

      if (!data.user.emailConfirmed) {
        showToast("Email não confirmado. Por favor, confirme seu email.", "error");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("userData", JSON.stringify({ token: data.token, user: data.user }));
      showToast("Login via Google realizado com sucesso!", "success");

      setTimeout(() => {
        if (!data.user.cadastroCompleto) {
          navigate("/completarcadastro");
        } else {
          navigate("/cadastrarlotes");
        }
      }, 1500);
    } catch (error) {
      console.error("Erro no login com Firebase:", error);
      showToast(error.message, "error");
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
          <h2 style={styles.h2}>Bem-vindo de volta</h2>
          <p style={styles.subtitle}>Acesse sua conta para continuar</p>

          {toastMessage && (
            <div
              style={{
                ...styles.toast,
                backgroundColor: toastType === "success" ? "#d4edda" : "#f8d7da",
                color: toastType === "success" ? "#155724" : "#721c24",
              }}
            >
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
                placeholder="Digite seu email"
                disabled={isLoading}
                style={styles.inputemail}
              />
            </div>

            <div style={styles.formGroup}>
              <div style={styles.passwordContainer}>
                <label htmlFor="password" style={styles.label}>Senha</label>
                <Link to="/forgot-password" style={styles.forgotPasswordLink}>
                  Esqueceu a senha?
                </Link>
              </div>
              <div style={styles.passwordInputContainer}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  disabled={isLoading}
                  style={styles.input}
                />
                <button type="button" onClick={togglePasswordVisibility} style={styles.eyeButton}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} style={styles.button}>
              {isLoading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div style={styles.demoAccount}>
            <p style={styles.demoText1}>Conta de demonstração:</p>
            <p style={styles.demoText2}>Email: demo@pharmasys.com</p>
            <p style={styles.demoText3}>Senha: password</p>
          </div>

          <div style={styles.googleWrapper}>
            <button onClick={handleGoogleLogin} style={styles.googleButton}>
              Entrar com Google
            </button>
          </div>

          <p style={styles.registerLink}>
            Não possui uma conta?{" "}
            <Link to="/CriarConta" style={styles.link}>
              Crie uma agora
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};


const styles = {
  authContainer: {
    display: "flex",
    height: "100vh",
    backgroundColor: "white",
    width: "1500px",
  },
  googleWrapper: {
    position: "relative",
    width: "422px",
    left: "-100px",
    top: "-190px",
    marginTop: "70px",
    display: "flex",
    justifyContent: "center",
    backgroundColor: "transparent",
    zIndex: 1,
  },
  authLeft: {
    flex: 1,
    backgroundColor: "#001f3d",
    color: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "2rem",
    minWidth: "40%",
    position: "relative",
    left: "-113px",
  },
  logo: {
    width: "25px",
    position: "relative",
    marginBottom: "10px",
    left: "98px",
    top: "43px",
  },
  h1: {
    fontSize: "32px",
    marginBottom: "10px",
    fontWeight: "bold",
  },
  p: {
    fontSize: "16px",
    color: "#78C2FF",
  },
  authRight: {
    flex: 1,
    backgroundColor: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "2rem",
    height: "730px",
    maxWidth: "1000px",
    width: "100%",
    margin: "20 20px",
  },
  authContent: {
    width: "100%",
    maxWidth: "400px",
  },
  h2: {
    fontSize: "24px",
    marginBottom: "10px",
    fontWeight: "bold",
    color: "#001f3d",
    position: "relative",
    top: "45px",
  },
  subtitle: {
    fontSize: "16px",
    color: "#666",
    marginBottom: "2rem",
    position: "relative",
    top: "45px",
  },
  form: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    position: "relative",
    left: "-100px",
  },
  formGroup: {
    marginBottom: "1.5rem",
  },
  labelemail: {
    display: "block",
    fontSize: "14px",
    color: "#333",
    marginBottom: "0.5rem",
    fontWeight: "500",
    position: "relative",
    top: "65px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    color: "#333",
    marginBottom: "0.5rem",
    fontWeight: "500",
    position: "relative",
    top: "39px",
  },
  inputemail: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "14px",
    boxSizing: "border-box",
    position: "relative",
    top: "60px",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "14px",
    boxSizing: "border-box",
    position: "relative",
    top: "25px",
  },
  passwordInputContainer: {
    position: "relative",
  },
  eyeButton: {
    position: "relative",
    right: "10px",
    top: "50",
    left: "370px",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#666",
  },
  button: {
    width: "100%",
    backgroundColor: "#001f3d",
    color: "white",
    padding: "8px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "500",
    marginTop: "1rem",
    transition: "background-color 0.3s",
    position: "relative",
    top: "-35px",
  },
  passwordContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.5rem",
  },
  forgotPasswordLink: {
    fontSize: "12px",
    color: "#007bff",
    textDecoration: "none",
    position: "relative",
    top: "35px",
  },
  demoAccount: {
    position: "relative",
    marginTop: "20px",
    padding: "15px",
    backgroundColor: "#f4f6f9",
    borderRadius: "6px",
    border: "1px solid #ddd",
    left: "-100px",
    top: "60px",
    height: "80px",
  },
  demoText1: {
    fontSize: "14px",
    position: "relative",
    top: "-5px",
  },
  demoText2: {
    fontSize: "14px",
    position: "relative",
    top: "-25px",
  },
  demoText3: {
    fontSize: "14px",
    position: "relative",
    top: "-42px",
  },
  registerLink: {
    textAlign: "center",
    fontSize: "14px",
    marginTop: "1.5rem",
    color: "#78C2FF",
    position: "relative",
    left: "-113px",
    top: "-205px",
  },
  link: {
    textDecoration: "none",
    fontWeight: "500",
    color: "#78C2FF",
  },
  toast: {
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "1rem",
    fontSize: "14px",
    textAlign: "center",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  },
};

export default LoginForm;
