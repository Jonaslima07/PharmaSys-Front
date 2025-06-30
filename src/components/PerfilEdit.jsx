import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiEye, FiEyeOff } from "react-icons/fi";

const PerfilEdit = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    id: "",
    name: "",
    email: "",
    role: "",
    phone: "",
    registrationId: "",
    createdAt: "",
    emailConfirmed: false,
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    registrationId: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    role: "",
  });

  // Buscar dados do usuário logado
  useEffect(() => {
    const fetchLoggedInUser = async () => {
      try {
        const storedUser = localStorage.getItem("userData");

        if (!storedUser) {
          throw new Error("Nenhum usuário logado");
        }

        const user = JSON.parse(storedUser);

        const response = await fetch(`http://localhost:5000/users/${user.id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar dados do usuário");
        }

        const data = await response.json();

        setUserData({
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          phone: data.phone || "",
          registrationId: data.registrationId || "",
          createdAt: data.createdAt,
          emailConfirmed: data.emailConfirmed || false,
        });

        setFormData({
          name: data.name,
          email: data.email,
          phone: data.phone || "",
          registrationId: data.registrationId || "",
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
          role: data.role,
        });

        // Se farmacêutico e sem registro, alertar e abrir edição
        if (data.role === "farmaceutico" && !data.registrationId) {
          toast.warn(
            "Por favor, preencha seu Registro Profissional (CRF) para concluir o cadastro."
          );
          setEditMode(true);
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        toast.error("Não foi possível carregar os dados do usuário.");
        navigate("/login");
      }
    };

    fetchLoggedInUser();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCancel = () => {
    setFormData({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      registrationId: userData.registrationId,
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
      role: userData.role,
    });
    setEditMode(false);
    toast.info("Edição cancelada");
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Por favor, informe seu nome completo");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      toast.error("Por favor, informe seu email");
      return false;
    } else if (!emailRegex.test(formData.email)) {
      toast.error("Por favor, informe um email válido");
      return false;
    }

    if (formData.phone && formData.phone.replace(/\D/g, "").length < 10) {
      toast.error("Telefone deve ter pelo menos 10 dígitos");
      return false;
    }

    // Validação Registro Profissional para farmacêuticos
    if (formData.role === "farmaceutico" && !formData.registrationId.trim()) {
      toast.error("Registro Profissional é obrigatório para farmacêuticos.");
      return false;
    }

    if (
      formData.currentPassword ||
      formData.newPassword ||
      formData.confirmNewPassword
    ) {
      if (!formData.currentPassword) {
        toast.error("Por favor, informe sua senha atual");
        return false;
      }

      if (formData.newPassword && formData.newPassword.length < 6) {
        toast.error("A nova senha deve ter pelo menos 6 caracteres");
        return false;
      }

      if (formData.newPassword !== formData.confirmNewPassword) {
        toast.error("As senhas não coincidem");
        return false;
      }

      if (
        formData.currentPassword &&
        formData.newPassword &&
        formData.confirmNewPassword &&
        formData.currentPassword === formData.newPassword &&
        formData.newPassword === formData.confirmNewPassword
      ) {
        toast.error("A nova senha não pode ser igual à senha atual");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const storedUser = JSON.parse(localStorage.getItem("userData"));
      const token = storedUser.token;

      const updatedData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        registrationId: formData.registrationId,
        currentPassword: formData.currentPassword,
        ...(formData.newPassword && { newPassword: formData.newPassword }),
      };

      const response = await fetch(
        `http://localhost:5000/users/${userData.id}`,
        {
          method: "PATCH", // Confirme que backend aceita PATCH
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao atualizar perfil");
      }

      const updatedUser = await response.json();

      setUserData({
        ...userData,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        registrationId: updatedUser.registrationId,
      });

      const newUserData = {
        ...storedUser,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        registrationId: updatedUser.registrationId,
      };
      localStorage.setItem("userData", JSON.stringify(newUserData));

      if (formData.newPassword) {
        toast.success("Senha salva com sucesso!");
      } else {
        toast.success("Perfil atualizado com sucesso!");
      }
      setEditMode(false);
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error(error.message || "Não foi possível atualizar o perfil");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userData");
    navigate("/login");
    toast.info("Você foi desconectado com sucesso");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Data não disponível";

    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("pt-BR", options);
  };

  return (
    <div style={styles.container}>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <h1 style={styles.mainTitle}>Meu Perfil</h1>

      <div style={styles.content}>
        <div style={styles.mainSection}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.sectionTitle}>Informações Pessoais</h2>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  style={styles.editButton}
                >
                  <svg
                    style={styles.editIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                  Editar
                </button>
              )}
            </div>

            {editMode ? (
              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label htmlFor="name" style={styles.label}>
                      Nome completo
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      style={styles.input}
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label htmlFor="email" style={styles.label}>
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      style={styles.input}
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label htmlFor="phone" style={styles.label}>
                      Telefone
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="text"
                      value={formData.phone}
                      onChange={handleChange}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label htmlFor="registrationId" style={styles.label}>
                      Registro Profissional
                    </label>
                    <input
                      id="registrationId"
                      name="registrationId"
                      type="text"
                      value={formData.registrationId}
                      onChange={handleChange}
                      style={styles.input}
                      required={formData.role === "farmaceutico"}
                    />
                  </div>
                </div>

                <div style={styles.divider}></div>

                <div>
                  <h3 style={styles.subsectionTitle}>Alterar Senha</h3>

                  <div style={{ ...styles.formGroup, gridColumn: "1 / -1" }}>
                    <label htmlFor="currentPassword" style={styles.label}>
                      Senha Atual
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        id="currentPassword"
                        name="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        value={formData.currentPassword}
                        onChange={handleChange}
                        style={styles.input1}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            current: !showPasswords.current,
                          })
                        }
                        style={styles.eyeButton}
                      >
                        {showPasswords.current ? (
                          <FiEyeOff size={18} />
                        ) : (
                          <FiEye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Campo de nova senha com olhinho */}
                  <div style={styles.formGroup}>
                    <label htmlFor="newPassword" style={styles.labelnova}>
                      Nova Senha
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        id="newPassword"
                        name="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        value={formData.newPassword}
                        onChange={handleChange}
                        style={styles.input2}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            new: !showPasswords.new,
                          })
                        }
                        style={styles.eyeButton2}
                      >
                        {showPasswords.new ? (
                          <FiEyeOff size={18} />
                        ) : (
                          <FiEye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Campo de confirmar senha com olhinho */}
                  <div style={styles.formGroup}>
                    <label htmlFor="confirmNewPassword" style={styles.label1}>
                      Confirmar Nova Senha
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        id="confirmNewPassword"
                        name="confirmNewPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={formData.confirmNewPassword}
                        onChange={handleChange}
                        style={styles.input3}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            confirm: !showPasswords.confirm,
                          })
                        }
                        style={styles.eyeButton3}
                      >
                        {showPasswords.confirm ? (
                          <FiEyeOff size={18} />
                        ) : (
                          <FiEye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div style={styles.formActions}>
                  <button
                    type="button"
                    onClick={handleCancel}
                    style={styles.cancelButton}
                  >
                    Cancelar
                  </button>
                  <button type="submit" style={styles.submitButton}>
                    Salvar Alterações
                  </button>
                </div>
              </form>
            ) : (
              <div style={styles.userInfo}>
                <p>
                  <strong>Nome:</strong> {userData.name}
                </p>
                <p>
                  <strong>Email:</strong> {userData.email}
                </p>
                <p>
                  <strong>Telefone:</strong> {userData.phone || "Não informado"}
                </p>
                {userData.role === "farmaceutico" && (
                  <p>
                    <strong>Registro Profissional:</strong>{" "}
                    {userData.registrationId || "Não informado"}
                  </p>
                )}
                <p>
                  <strong>Usuário desde:</strong> {formatDate(userData.createdAt)}
                </p>
              </div>
            )}
          </div>
        </div>

        <div style={styles.sidebar}>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Sair
          </button>

          <div style={{ marginTop: 20 }}>
            <p>
              <strong>Status do E-mail:</strong>{" "}
              {userData.emailConfirmed ? (
                <span style={{ color: "green" }}>Confirmado</span>
              ) : (
                <span style={{ color: "red" }}>Não confirmado</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: 20,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  content: {
    display: "flex",
    gap: 30,
    justifyContent: "center",
  },
  mainSection: {
    flex: 2,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    padding: 20,
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    margin: 0,
    fontWeight: "600",
    fontSize: 22,
  },
  editButton: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    cursor: "pointer",
    border: "none",
    backgroundColor: "transparent",
    color: "#007bff",
    fontWeight: "600",
  },
  editIcon: {
    width: 20,
    height: 20,
  },
  form: {
    marginTop: 15,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 20,
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    padding: 8,
    borderRadius: 4,
    border: "1px solid #ccc",
    fontSize: 16,
  },
  divider: {
    margin: "20px 0",
    borderTop: "1px solid #ccc",
  },
  subsectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 15,
  },
  input1: {
    width: "100%",
    padding: "8px 40px 8px 8px",
    fontSize: 16,
    borderRadius: 4,
    border: "1px solid #ccc",
  },
  input2: {
    width: "100%",
    padding: "8px 40px 8px 8px",
    fontSize: 16,
    borderRadius: 4,
    border: "1px solid #ccc",
  },
  input3: {
    width: "100%",
    padding: "8px 40px 8px 8px",
    fontSize: 16,
    borderRadius: 4,
    border: "1px solid #ccc",
  },
  eyeButton: {
    position: "absolute",
    right: 8,
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#555",
  },
  eyeButton2: {
    position: "absolute",
    right: 8,
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#555",
  },
  eyeButton3: {
    position: "absolute",
    right: 8,
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#555",
  },
  formActions: {
    marginTop: 30,
    display: "flex",
    justifyContent: "flex-end",
    gap: 15,
  },
  cancelButton: {
    backgroundColor: "#ccc",
    border: "none",
    padding: "10px 20px",
    borderRadius: 5,
    cursor: "pointer",
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: 5,
    cursor: "pointer",
    fontWeight: "600",
  },
  userInfo: {
    fontSize: 18,
    lineHeight: 1.5,
  },
  sidebar: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  logoutButton: {
    backgroundColor: "#dc3545",
    border: "none",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: 5,
    cursor: "pointer",
    fontWeight: "600",
  },
  labelnova: {
    fontWeight: "600",
    marginBottom: 6,
  },
  label1: {
    fontWeight: "600",
    marginBottom: 6,
  },
};

export default PerfilEdit;
