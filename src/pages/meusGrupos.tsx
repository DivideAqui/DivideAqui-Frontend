import { IoCloseSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export function MeusGrupos() {

  const navigate = useNavigate();

  return (
    <>
      <main
        style={{
          minHeight: "100vh",
          padding: "140px 24px 80px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f8fdf1 0%, #eef6ff 100%)",
        }}
      >
        <section style={{ maxWidth: "760px", textAlign: "center" }}>
        <button
          type="button"
          className="IconCancelar"
          onClick={() => navigate(-1)}>
          <IoCloseSharp size={25} />
        </button>

          <h1 style={{ fontSize: "2.5rem", color: "#123" }}>Meus Grupos</h1>
          <p style={{ fontSize: "1.1rem", color: "#4b5563", marginTop: "16px" }}>
            Aqui ficará os grupos de divisão do usuário.
          </p>
        </section>
      </main>
    </>
  );
}
