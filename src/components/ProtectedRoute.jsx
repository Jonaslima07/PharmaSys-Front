import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole }) => {
  const userDataString = localStorage.getItem("userData");
  console.log("🔒 userData no ProtectedRoute:", userDataString);

  if (!userDataString) {
    console.warn("❌ Nenhum dado de usuário encontrado no localStorage");
    return <Navigate to="/login" replace />;
  }

  const userData = JSON.parse(userDataString);
  const token = userData?.token;
  const user = userData?.user;

  console.log("🔑 Token:", token);
  console.log("👤 Usuário:", user);

  if (!token || !user) {
    console.warn("❌ Token ou usuário ausente");
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    console.warn("❌ Usuário sem permissão para acessar esta rota");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
