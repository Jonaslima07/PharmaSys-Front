import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CompletarCadastro = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    // endereco: "",
    crf: "",
    birthDate: "",
    password: "",
    confirmPassword: "",
  });

  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData && userData.user) {
      setFormData((prev) => ({
        ...prev,
        name: userData.user.name || "",
        email: userData.user.email || "",
      }));

      const verificarCadastro = async () => {
        try {
          const token = userData?.token;
          const email = userData.user.email;

          const response = await fetch(
            `http://localhost:5000/usuarios/verificar-cadastro?email=${email}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const result = await response.json();

          if (response.ok && result.cadastroCompleto) {
            navigate("/cadastrarlotes");
          }
        } catch (error) {
          console.error("Erro ao verificar cadastro:", error);
        }
      };

      verificarCadastro();
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const showToast = (message, type) => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "crf") {
      const numericValue = value.replace(/\D/g, ""); 
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { phone, crf, birthDate, password, confirmPassword } = formData;

    if (!phone || !crf || !birthDate || !password || !confirmPassword) {
      showToast("Preencha todos os campos obrigatórios", "error");
      return;
    }

    if (!/^\d{5}$/.test(crf)) {
      showToast("CRF deve ter exatamente 5 dígitos numéricos", "error");
      return;
    }

    if (password.length < 6) {
      showToast("A senha deve ter pelo menos 6 caracteres", "error");
      return;
    }

    if (password !== confirmPassword) {
      showToast("As senhas não coincidem", "error");
      return;
    }

    setIsLoading(true);

    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      const token = userData?.token;

      const response = await fetch(
        "http://localhost:5000/usuarios/completar-cadastro",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            password,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.mensagem || "Erro ao completar cadastro");
      }

      const updatedUserData = {
        ...userData,
        user: { ...userData.user, cadastroCompleto: true },
      };
      localStorage.setItem("userData", JSON.stringify(updatedUserData));

      showToast("Cadastro concluído com sucesso!", "success");
      setTimeout(() => navigate("/cadastrarlotes"), 1500);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Completar Cadastro</h2>

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
          <label style={styles.label}>Nome</label>
          <input type="text" name="name" value={formData.name} disabled style={styles.input} />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Email</label>
          <input type="email" name="email" value={formData.email} disabled style={styles.input} />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Telefone *</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(XX) XXXXX-XXXX"
            style={styles.input}
          />
        </div>

        {/* <div style={styles.formGroup}>
          <label style={styles.label}>Endereço *</label>
          <input
            type="text"
            name="endereco"
            value={formData.endereco}
            onChange={handleChange}
            placeholder="Rua, número, cidade"
            style={styles.input}
          />
        </div> */}

        <div style={styles.formGroup}>
          <label style={styles.label}>CRF *</label>
          <input
            type="text"
            name="crf"
            value={formData.crf}
            onChange={handleChange}
            placeholder="Apenas 5 dígitos"
            style={styles.input}
            maxLength={5}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Data de Nascimento *</label>
          <input
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Senha *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Senha"
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Confirmar Senha *</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirmar Senha"
            style={styles.input}
          />
        </div>

        <button type="submit" disabled={isLoading} style={styles.button}>
          {isLoading ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "400px",
    margin: "50px auto",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    background: "#fff",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#001f3d",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "5px",
    fontSize: "14px",
    color: "#333",
  },
  input: {
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  button: {
    padding: "10px",
    backgroundColor: "#001f3d",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  toast: {
    padding: "10px",
    borderRadius: "6px",
    marginBottom: "10px",
    textAlign: "center",
  },
};

export default CompletarCadastro;
