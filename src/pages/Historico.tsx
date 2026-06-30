import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";

export function Historico() {
  return (
    <>
      <Nav />
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
          <h1 style={{ fontSize: "2.5rem", color: "#123" }}>Histórico</h1>
          <p style={{ fontSize: "1.1rem", color: "#4b5563", marginTop: "16px" }}>
            Aqui ficará o histórico das divisões realizadas.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
