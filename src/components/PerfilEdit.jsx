import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiEye, FiEyeOff } from "react-icons/fi";

const PerfilEdit = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [usuarios, setUsuarios] = useState([]);
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    crf: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    role: "",
  });

  const storedUserData = JSON.parse(localStorage.getItem("userData"));
  const token = storedUserData?.token;
  const storedUser = storedUserData?.user;

  useEffect(() => {
    if (!token || !storedUser) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:5000/usuarios/${storedUser.id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Erro ao buscar dados do usuário");

        const data = await res.json();
        setUserData(data);
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          crf: data.crf || "",
          role: data.role || "",
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });

        if (data.role === "farmacêutico" && !data.crf) {
          toast.warn("Por favor, preencha seu CRF para concluir o cadastro.");
        }

        if (data.role === "administrador") {
          fetchUsuarios();
        }

      } catch {
        toast.error("Não foi possível carregar os dados do usuário.");
        navigate("/login");
      }
    };

    const fetchUsuarios = async () => {
      try {
        const res = await fetch("http://localhost:5000/usuarios", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setUsuarios(data);
      } catch {
        toast.error("Erro ao carregar lista de usuários.");
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "crf") {
      const numericValue = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCancel = () => {
    setFormData({
      name: userData.name || "",
      email: userData.email || "",
      phone: userData.phone || "",
      crf: userData.crf || "",
      role: userData.role || "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
    setEditMode(false);
    toast.info("Edição cancelada");
  };

const validateForm = () => {
  // Nome: obrigatório, sem números e sem apenas espaços
  if (!formData.name.trim()) {
    toast.error("O nome é obrigatório");
    return false;
  }
  if (!/^[A-Za-zÀ-ÿ\s]+$/.test(formData.name.trim())) {
    toast.error("O nome não pode conter números ou caracteres inválidos");
    return false;
  }

  // Email: obrigatório e formato válido
  if (!formData.email.trim()) {
    toast.error("O email é obrigatório");
    return false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    toast.error("Formato de email inválido");
    return false;
  }

  // Telefone: opcional, mas se preenchido precisa ter pelo menos 10 dígitos
  if (formData.phone && formData.phone.replace(/\D/g, "").length < 10) {
    toast.error("Telefone inválido. Informe DDD + número");
    return false;
  }

  // CRF: obrigatório apenas para farmacêutico
  if (formData.role === "farmacêutico") {
    if (!formData.crf.trim()) {
      toast.error("CRF obrigatório para farmacêuticos");
      return false;
    }
    if (!/^\d{5}$/.test(formData.crf)) {
      toast.error("CRF deve ter exatamente 5 dígitos numéricos");
      return false;
    }
  }

  // Senha: só valida se usuário tentar alterar
  if (formData.newPassword || formData.confirmNewPassword || formData.currentPassword) {
    if (!formData.currentPassword) {
      toast.error("Informe sua senha atual para alterar");
      return false;
    }
    if (formData.newPassword.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres");
      return false;
    }
    if (formData.newPassword !== formData.confirmNewPassword) {
      toast.error("A confirmação da nova senha não confere");
      return false;
    }
  }

  return true;
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const updatedData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      crf: formData.crf,
      ...(formData.newPassword && {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      }),
    };

    try {
      const res = await fetch(`http://localhost:5000/usuarios/${userData.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao atualizar perfil");
      }

      const updatedUser = await res.json();
      setUserData(updatedUser);

      setFormData((prev) => ({
        name: updatedUser.name || prev.name,
        email: updatedUser.email || prev.email,
        phone: updatedUser.phone || prev.phone,
        crf: updatedUser.crf || prev.crf,
        role: updatedUser.role || prev.role,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      }));

      localStorage.setItem("userData", JSON.stringify({ token, user: updatedUser }));
      toast.success("Perfil atualizado com sucesso!");
      setEditMode(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userData");
    navigate("/login");
    toast.info("Você foi desconectado");
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Tem certeza que deseja excluir este usuário?")) return;
    try {
      const res = await fetch(`http://localhost:5000/usuarios/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 204) {
        toast.success("Usuário deletado com sucesso!");
        setUsuarios((prev) => prev.filter((u) => u.id !== userId));
      } else {
        const data = await res.json();
        toast.error(data.message || "Erro ao deletar usuário.");
      }
    } catch {
      toast.error("Erro na exclusão.");
    }
  };

  const formatDate = (dateString) => {
  if (!dateString) return "Data não disponível";
  
  try {
    const date = new Date(dateString);
  
    const offset = -3 * 60; 
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset() + offset);
    
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return dateString; 
  }
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
                    <label htmlFor="crf" style={styles.label}>
                      CRF
                    </label>
                    <input
                      id="crf"
                      name="crf"
                      type="text"
                      value={formData.crf}
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
                        type={showPasswords.currentPassword ? "text" : "password"}
                        value={formData.currentPassword}
                        onChange={handleChange}
                        style={styles.input1}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            currentPassword: !showPasswords.currentPassword,
                          })
                        }
                        style={styles.eyeButton}
                      >
                        {showPasswords.currentPassword ? (
                          <FiEyeOff size={18} />
                        ) : (
                          <FiEye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label htmlFor="newPassword" style={styles.labelnova}>
                      Nova Senha
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        id="newPassword"
                        name="newPassword"
                        type={showPasswords.newPassword ? "text" : "password"}
                        value={formData.newPassword}
                        onChange={handleChange}
                        style={styles.input2}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            newPassword: !showPasswords.newPassword,
                          })
                        }
                        style={styles.eyeButton2}
                      >
                        {showPasswords.newPassword ? (
                          <FiEyeOff size={18} />
                        ) : (
                          <FiEye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label htmlFor="confirmNewPassword" style={styles.label1}>
                      Confirmar Nova Senha
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        id="confirmNewPassword"
                        name="confirmNewPassword"
                        type={showPasswords.confirmNewPassword ? "text" : "password"}
                        value={formData.confirmNewPassword}
                        onChange={handleChange}
                        style={styles.input3}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            confirmNewPassword: !showPasswords.confirmNewPassword,
                          })
                        }
                        style={styles.eyeButton3}
                      >
                        {showPasswords.confirmNewPassword ? (
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
                  <span style={styles.infoLabelCrf}>CRF</span>
                  <span style={styles.infoValueCrf}>
                    {userData.crf || "Não informado"}
                  </span>
                </div>

                <div style={styles.infoItem}>
                  <span style={styles.infoLabel3}>Perfil</span>
                  <span style={styles.infoValue3}>
                    {userData.role || "Não informado"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={styles.sidebarContainer}>
          <div style={styles.card2}>
            <div style={styles.avatarContainer}>
              <div style={styles.avatar}>
                {userData.name
                  ? userData.name
                      .split(" ")
                      .map((name) => name[0])
                      .join("")
                  : "US"}
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
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
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

        {/* {userData.role === "administrador" && (
          <div style={styles.usersListSection}>
            <h2 style={styles.sectionTitle}>Lista de Usuários</h2>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>ID</th>
                  <th style={styles.tableHeader}>Nome</th>
                  <th style={styles.tableHeader}>Email</th>
                  <th style={styles.tableHeader}>Telefone</th>
                  <th style={styles.tableHeader}>CRF</th>
                  <th style={styles.tableHeader}>Perfil</th>
                  <th style={styles.tableHeader}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={styles.tableCell}>
                      Nenhum usuário encontrado
                    </td>
                  </tr>
                ) : (
                  usuarios.map((user) => (
                    <tr key={user.id}>
                      <td style={styles.tableCell}>{user.id}</td>
                      <td style={styles.tableCell}>{user.name}</td>
                      <td style={styles.tableCell}>{user.email}</td>
                      <td style={styles.tableCell}>{user.phone || "-"}</td>
                      <td style={styles.tableCell}>{user.crf || "-"}</td>
                      <td style={styles.tableCell}>{user.role}</td>
                      <td style={styles.tableCell}>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          style={styles.deleteButton}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )} */}
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
    gridTemplateColumns: "1fr 1fr ",
    gap: "15px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    height: "70px",
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
    position: "relative",
    left: "370px",
    top: "-50px",
  },
  input1: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    width: "720px",
  },
  labelnova: {
    fontSize: "14px",
    color: "#7f8c8d",
    marginBottom: "5px",
    position: "relative",
    left: "2px",
    top: "20px",
  },
  input2: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    position: "relative",
    width: "355px",
    top: "16px",
  },
  input3: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    position: "relative",
    top: "-53px",
    left: "370px",
    width: "350px",
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
    position: "relative",
    top: "-30px",
  },
  submitButton: {
    padding: "8px 16px",
    border: "none",
    borderRadius: "4px",
    background: "#3498db",
    color: "white",
    cursor: "pointer",
    position: "relative",
    top: "-30px",
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
    top: "-150px",
  },
  infoValue2: {
    fontSize: "16px",
    fontWeight: "500",
    position: "relative",
    left: "375px",
    top: "-150px",
  },
  infoLabel3: {
    fontSize: "14px",
    color: "#7f8c8d",
    position: "relative",
    left: "375px",
    top: "-170px",
  },
  infoLabelCrf:{
    fontSize: "14px",
      color: "#7f8c8d",
      position: "relative",
      left: "375px",
      top: "-155px",
  },
  infoValueCrf: {
  fontSize: "16px",
    fontWeight: "500",
    position: "relative",
    left: "375px",
    top: "-160px",
  },
  infoValue3: {
    fontSize: "16px",
    fontWeight: "500",
    position: "relative",
    left: "375px",
    top: "-175px",
  },
  infoValue: {
    fontSize: "16px",
    fontWeight: "500",
  },
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
    position:"relative",
    left:"48px",
    padding: "10px 0",
    cursor: "pointer",
    fontSize: "14px",
    color: "#2c3e50",
    borderBottom: "1px solid #f5f5f5",
    transition: "color 0.2s",
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
    position: "relative",
    left: "-30px",
    top: "27px",
  },
  eyeButton3: {
    right: "10px",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#7f8c8d",
    position: "relative",
    left: "340px",
    top: "-43px",
  },
  usersListSection: {
    marginTop: "40px",
    position: "relative",
    left: "-190px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  tableHeader: {
    backgroundColor: "#2c3e50",
    color: "white",
    padding: "12px",
    textAlign: "left",
  },
  tableCell: {
    padding: "12px",
    borderBottom: "1px solid #ddd",
    textAlign: "left",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
    color: "#fff",
    border: "none",
    padding: "5px 10px",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default PerfilEdit;