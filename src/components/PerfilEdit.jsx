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

      if (data.role === "farmaceutico" && !data.crf) {
        toast.warn("Por favor, preencha seu CRF para concluir o cadastro.");
      }

      // Chama fetchUsuarios apenas se for administrador
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

    // Impede letras no campo CRF
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
    if (!formData.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Verifique os campos obrigatórios");
      return false;
    }
    if (formData.phone && formData.phone.replace(/\D/g, "").length < 10) {
      toast.error("Telefone inválido");
      return false;
    }
    if (formData.role === "farmaceutico") {
      if (!formData.crf.trim()) {
        toast.error("CRF obrigatório");
        return false;
      }
      if (!/^\d{5}$/.test(formData.crf)) {
        toast.error("CRF deve ter exatamente 5 dígitos numéricos");
        return false;
      }
    }
    if (formData.newPassword || formData.confirmNewPassword || formData.currentPassword) {
      if (
        !formData.currentPassword ||
        formData.newPassword.length < 6 ||
        formData.newPassword !== formData.confirmNewPassword
      ) {
        toast.error("Verifique as senhas");
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
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };


  return (
    <div style={styles.container}>
      <ToastContainer position="top-right" autoClose={5000} />

      <h1 style={styles.mainTitle}>Meu Perfil</h1>

      <div style={styles.content}>
        <div style={styles.mainSection}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.sectionTitle}>Informações Pessoais</h2>
              {!editMode && (
                <button onClick={() => setEditMode(true)} style={styles.editButton}>
                  Editar
                </button>
              )}
            </div>

            {editMode ? (
              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Nome completo</label>
                    <input
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      style={styles.input}
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Email</label>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      style={styles.input}
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Telefone</label>
                    <input
                      name="phone"
                      type="text"
                      value={formData.phone}
                      onChange={handleChange}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>CRF</label>
                    <input
                      name="crf"
                      type="text"
                      value={formData.crf}
                      onChange={handleChange}
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.passwordSection}>
                  <h3 style={styles.subTitle}>Alterar senha</h3>

                  {["currentPassword", "newPassword", "confirmNewPassword"].map((field, index) => (
                    <div style={styles.passwordGroup} key={index}>
                      <label style={styles.label}>
                        {field === "currentPassword"
                          ? "Senha Atual"
                          : field === "newPassword"
                          ? "Nova Senha"
                          : "Confirmar Nova Senha"}
                      </label>
                      <div style={styles.passwordInputWrapper}>
                        <input
                          name={field}
                          type={showPasswords[field] ? "text" : "password"}
                          value={formData[field] ?? ""}
                          onChange={handleChange}
                          style={styles.input}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords((prev) => ({
                              ...prev,
                              [field]: !prev[field],
                            }))
                          }
                          style={styles.passwordToggle}
                          tabIndex={-1}
                        >
                          {showPasswords[field] ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={styles.buttonGroup}>
                  <button type="submit" style={styles.saveButton}>
                    Salvar
                  </button>
                  <button type="button" onClick={handleCancel} style={styles.cancelButton}>
                    Cancelar
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
                  <strong>Telefone:</strong> {userData.phone || "-"}
                </p>
                <p>
                  <strong>CRF:</strong> {userData.crf || "-"}
                </p>
                <p>
                  <strong>Perfil:</strong> {userData.role}
                </p>
                <p>
                  <strong>Criado em:</strong> {formatDate(userData.createdAt)}
                </p>
              </div>
            )}
          </div>

          <button onClick={handleLogout} style={styles.logoutButton}>
            Sair
          </button>
        </div>

        {userData.role === "administrador" && (
  <div style={styles.usersListSection}>
    <h2>Lista de Usuários</h2>
    <table style={styles.table}>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nome</th>
          <th>Email</th>
          <th>Telefone</th>
          <th>CRF</th>
          <th>Perfil</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {usuarios.length === 0 ? (
          <tr>
            <td colSpan="7" style={{ textAlign: "center", padding: 10 }}>
              Nenhum usuário encontrado
            </td>
          </tr>
        ) : (
          usuarios.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.phone || "-"}</td>
              <td>{user.crf || "-"}</td>
              <td>{user.role}</td>
              <td>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  style={{
                    backgroundColor: "#e74c3c",
                    color: "#fff",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
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
)}

      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "800px",
    margin: "30px auto",
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 0 8px rgba(0,0,0,0.1)",
  },
  mainTitle: {
    textAlign: "center",
    marginBottom: "30px",
    color: "#001f3d",
  },
  content: {
    display: "flex",
    flexDirection: "column",
  },
  mainSection: {
    backgroundColor: "#f9f9f9",
    padding: "20px",
    borderRadius: "6px",
  },
  card: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "6px",
    boxShadow: "0 0 5px rgba(0,0,0,0.05)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  sectionTitle: {
    fontSize: "22px",
    color: "#001f3d",
  },
  editButton: {
    cursor: "pointer",
    backgroundColor: "transparent",
    border: "none",
    color: "#001f3d",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontWeight: "bold",
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
  },
  label: {
    fontWeight: "600",
    marginBottom: "5px",
    color: "#333",
  },
  input: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  passwordSection: {
    marginTop: "20px",
  },
  subTitle: {
    fontSize: "18px",
    marginBottom: "15px",
    color: "#001f3d",
  },
  passwordGroup: {
    marginBottom: "15px",
  },
  passwordInputWrapper: {
    display: "flex",
    alignItems: "center",
  },
  passwordToggle: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0 8px",
    fontSize: "18px",
    color: "#001f3d",
  },
  buttonGroup: {
    display: "flex",
    gap: "15px",
    justifyContent: "flex-end",
  },
  saveButton: {
    backgroundColor: "#001f3d",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#ccc",
    color: "#333",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  userInfo: {
    lineHeight: "1.6",
    color: "#333",
  },
  logoutButton: {
    marginTop: "30px",
    backgroundColor: "#c0392b",
    color: "#fff",
    padding: "10px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  },
  usersListSection: {
    marginTop: "40px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
};

export default PerfilEdit;
