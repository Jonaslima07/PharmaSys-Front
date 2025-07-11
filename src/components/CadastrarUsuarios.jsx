import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

const CadastrarUsuarios = () => {
  // const [perfil, setPerfil] = useState("servidor");

  const schema = Yup.object().shape({
    nomeCompleto: Yup.string().required("Nome é obrigatório"),
    email: Yup.string()
      .email("E-mail inválido")
      .required("E-mail é obrigatório"),
    telefone: Yup.string().required("Telefone é obrigatório"),
    senha: Yup.string()
      .min(6, "Mínimo 6 caracteres")
      .required("Senha é obrigatória"),
    confirmarSenha: Yup.string()
      .oneOf([Yup.ref("senha"), null], "Senhas não conferem")
      .required("Confirmação obrigatória"),
    dataNascimento: Yup.date().required("Data de nascimento é obrigatória"),
    registroProfissional: Yup.string().when("perfil", {
      is: "administrador",
      then: Yup.string().required("Registro profissional é obrigatório"),
      otherwise: Yup.string().notRequired(),
    }),
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { perfil: "servidor" },
  });

  const onSubmit = (data) => {
    console.log("Dados do usuário:", data);
    alert("Usuário cadastrado com sucesso!");
  };

  const perfilSelecionado = watch("perfil");

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto", padding: "20px" }}>
      <h2>Cadastro de Usuário</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Perfil:</label>
          <select {...register("perfil")}>
            <option value="servidor">Servidor</option>
            <option value="administrador">Administrador</option>
          </select>
        </div>

        <div>
          <label>Nome Completo:</label>
          <input type="text" {...register("nomeCompleto")} />
          <p style={{ color: "red" }}>{errors.nomeCompleto?.message}</p>
        </div>

        <div>
          <label>E-mail:</label>
          <input type="email" {...register("email")} />
          <p style={{ color: "red" }}>{errors.email?.message}</p>
        </div>

        <div>
          <label>Telefone:</label>
          <input type="text" {...register("telefone")} />
          <p style={{ color: "red" }}>{errors.telefone?.message}</p>
        </div>

        <div>
          <label>Senha:</label>
          <input type="password" {...register("senha")} />
          <p style={{ color: "red" }}>{errors.senha?.message}</p>
        </div>

        <div>
          <label>Confirme a Senha:</label>
          <input type="password" {...register("confirmarSenha")} />
          <p style={{ color: "red" }}>{errors.confirmarSenha?.message}</p>
        </div>

        <div>
          <label>Data de Nascimento:</label>
          <input type="date" {...register("dataNascimento")} />
          <p style={{ color: "red" }}>{errors.dataNascimento?.message}</p>
        </div>

        {perfilSelecionado === "administrador" && (
          <div>
            <label>Registro Profissional:</label>
            <input type="text" {...register("registroProfissional")} />
            <p style={{ color: "red" }}>
              {errors.registroProfissional?.message}
            </p>
          </div>
        )}

        <button type="submit" style={{ marginTop: "10px" }}>
          Cadastrar
        </button>
      </form>
    </div>
  );
};


export default CadastrarUsuarios;
