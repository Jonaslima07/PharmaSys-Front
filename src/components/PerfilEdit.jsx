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
        });

        setFormData({
          name: data.name,
          email: data.email,
          phone: data.phone || "",
          registrationId: data.registrationId || "",
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
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
    });
    setEditMode(false);
    toast.info("Edição cancelada");
  };

  const validateForm = () => {
    // Validação do nome
    if (!formData.name.trim()) {
      toast.error("Por favor, informe seu nome completo");
      return false;
    }

    // Validação do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      toast.error("Por favor, informe seu email");
      return false;
    } else if (!emailRegex.test(formData.email)) {
      toast.error("Por favor, informe um email válido");
      return false;
    }

    // Validação do telefone (opcional, mas se informado deve ter pelo menos 10 dígitos)
    if (formData.phone && formData.phone.replace(/\D/g, "").length < 10) {
      toast.error("Telefone deve ter pelo menos 10 dígitos");
      return false;
    }

    // Validação de senha (se algum campo de senha for preenchido)
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

      // Verifica se todas as senhas são iguais
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
          method: "PATCH",
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
              <div style={styles.infoContainer}>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Nome completo</span>
                  <span style={styles.infoValue}>{userData.name}</span>
                </div>

                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Telefone</span>
                  <span style={styles.infoValue}>
                    {userData.phone || "Não informado"}
                  </span>
                </div>

                <div style={styles.infoItem}>
                  <span style={styles.infoLabel2}>Email</span>
                  <span style={styles.infoValue2}>{userData.email}</span>
                </div>

                <div style={styles.infoItem}>
                  <span style={styles.infoLabel3}>Registro Profissional</span>
                  <span style={styles.infoValue3}>
                    {userData.registrationId || "Não informado"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={styles.sidebarContainer}>
        <div style={styles.card2}>
          <div style={styles.avatarContainer}>
            <div style={styles.avatar}>
              {userData.name
                .split(" ")
                .map((name) => name[0])
                .join("")}
            </div>
          </div>

          <h2 style={styles.userName}>{userData.name}</h2>
          <p style={styles.userRole}>{userData.role}</p>

          <div style={styles.divider}></div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitule}>Conta</h3>
            <p style={styles.sectionTexto}>
              Criada em: {formatDate(userData.createdAt)}
            </p>
            <p style={styles.sectionTexto2}>
              Último acesso: Hoje,{" "}
              {new Date().toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          <div style={styles.divider}></div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitule}>Status</h3>
            <span style={styles.statusBadge}>Ativo</span>
          </div>

          <div style={styles.divider}></div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitule2}>Ações da Conta</h3>
            <ul style={styles.actionsList}>
              <li style={styles.actionItem}>
                <svg
                  style={styles.actionIcon}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Segurança da conta
              </li>
              <li style={styles.actionItem}>
                <svg
                  style={styles.actionIcon}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31 2.37 2.37a1.724 1.724 0 00-2.572 1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Preferências
              </li>
              <li
                style={{ ...styles.actionItem, color: "#e53e3e" }}
                onClick={handleLogout}
              >
                <svg
                  style={{ ...styles.actionIcon, color: "#e53e3e" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Sair
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    color: "#333",
  },

  mainTitle: {
    fontSize: "24px",
    marginBottom: "20px",
    color: "#2c3e50",
    fontWeight: "bold",
    position: "relative",
    left: "-190px",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  mainSection: {
    flex: 1,
  },
  card: {
    position: "relative",
    left: "-190px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#2c3e50",
  },
  editButton: {
    display: "flex",
    alignItems: "center",
    background: "none",
    border: "none",
    color: "#3498db",
    cursor: "pointer",
    fontSize: "14px",
  },
  editIcon: {
    width: "16px",
    height: "16px",
    marginRight: "5px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    height:'70px'
  },
  label: {
    fontSize: "14px",
    color: "#7f8c8d",
    marginBottom: "5px",
  },
  label1: {
    fontSize: "14px",
    color: "#7f8c8d",
    marginBottom: "5px",
    position:'relative',
    left:'370px',
    top:'-50px'
  },
  input1: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    width:'720px'
  },
  labelnova: {
    fontSize: "14px",
    color: "#7f8c8d",
    marginBottom: "5px",
    position:'relative',
    left:'2px',
    top:'20px'
  },
  input2: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    position:'relative',
    width:'355px',
    top:'16px'
    
  },
  input3: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    position:'relative',
    top:'-53px',
    left:'370px',
    width:'350px',
  },
  input: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
  },
  divider: {
    height: "1px",
    backgroundColor: "#ecf0f1",
    margin: "15px 0",
  },
  subsectionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: "15px",
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "1px",
  },
  cancelButton: {
    padding: "8px 16px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    background: "none",
    cursor: "pointer",
    color: "#7f8c8d",
    position:'relative',
    top:'-30px',
  },
  submitButton: {
    padding: "8px 16px",
    border: "none",
    borderRadius: "4px",
    background: "#3498db",
    color: "white",
    cursor: "pointer",
    position:'relative',
    top:'-30px',
  },
  infoContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    height: "120px",
    backgroundColor: " rgb(255, 255, 255)",
  },
  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  infoLabel: {
    fontSize: "14px",
    color: "#7f8c8d",
  },
  infoLabel2: {
    fontSize: "14px",
    color: "#7f8c8d",
    position: "relative",
    left: "375px",
    top: "-130px",
  },
  infoValue2: {
    fontSize: "16px",
    fontWeight: "500",
    position: "relative",
    left: "375px",
    top: "-130px",
  },

  infoLabel3: {
    fontSize: "14px",
    color: "#7f8c8d",
    position: "relative",
    left: "375px",
    top: "-130px",
  },
  infoValue3: {
    fontSize: "16px",
    fontWeight: "500",
    position: "relative",
    left: "375px",
    top: "-130px",
  },
  infoValue: {
    fontSize: "16px",
    fontWeight: "500",
  },
  toast: {
    padding: "12px 16px",
    borderRadius: "4px",
    border: "1px solid",
    marginTop: "10px",
  },
  //começa aqui
  sidebarContainer: {
    width: "100%",
    maxWidth: "300px",
    fontFamily: "Arial, sans-serif",
  },
  card2: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    textAlign: "center",
    position: "relative",
    left: "610px",
    top: "-210px",
  },
  avatarContainer: {
    marginBottom: "16px",
  },
  avatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    backgroundColor: "#2c3e50",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    fontWeight: "bold",
    margin: "0 auto",
  },
  userName: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: "4px",
  },
  userRole: {
    color: "#3498db",
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "16px",
  },
  section: {
    marginBottom: "16px",
  },
  sectionTitule: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: "12px",
    textAlign: "left",
    position: "relative",
    left: "100px",
  },
  sectionTitule2: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: "12px",
    textAlign: "left",
    position: "relative",
    left: "50px",
  },
  sectionTexto: {
    fontSize: "14px",
    color: "#7f8c8d",
    textAlign: "left",
    marginBottom: "6px",
    position: "relative",
    left: "55px",
  },
  sectionTexto2: {
    fontSize: "14px",
    color: "#7f8c8d",
    textAlign: "left",
    marginBottom: "6px",
    position: "relative",
    left: "50px",
  },
  statusBadge: {
    display: "inline-block",
    padding: "4px 12px",
    backgroundColor: "#e6ffed",
    color: "#2e7d32",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "500",
  },
  actionsList: {
    listStyle: "none",
    padding: "0",
    textAlign: "left",
  },
  actionItem: {
    display: "flex",
    alignItems: "center",
    padding: "10px 0",
    cursor: "pointer",
    fontSize: "14px",
    color: "#2c3e50",
    borderBottom: "1px solid #f5f5f5",
    transition: "color 0.2s",
    ":hover": {
      color: "#3498db",
    },
  },
  actionIcon: {
    width: "20px",
    height: "20px",
    marginRight: "10px",
  },
  eyeButton: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#7f8c8d",
  },
  eyeButton2: {
    right: "10px",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#7f8c8d",
    position:'relative',
    left:'-30px',
    top:'27px',
  },
  eyeButton3: {
    right: "10px",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#7f8c8d",
    position:'relative',
    left:'340px',
    top:'-43px',
  },
};

export default PerfilEdit;
