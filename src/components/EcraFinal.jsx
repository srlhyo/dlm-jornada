import { LINKS } from "../config/etapas";
import Partilha from "./Partilha";

// Ecrã final (stage 10) — conversão fiel do bloco "FINAL" de
// referencia/A_Jornada_dc.html.

const estiloDourado = {
  background:
    "linear-gradient(90deg,#A07830,#E8D5A3 40%,#C9A84C 55%,#A07830 80%)",
  backgroundSize: "200% auto",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  animation: "shimmer 4s linear infinite",
};

export default function EcraFinal({ aoRecomecar }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(rgba(251,247,239,.92) 0%,rgba(251,247,239,.72) 45%,rgba(251,247,239,.55) 75%,rgba(251,247,239,.82) 100%)",
        backdropFilter: "blur(2px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "24px",
        overflowY: "auto",
        animation: "fadeIn .8s ease both",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: ".24em",
          color: "#A07830",
          textTransform: "uppercase",
          marginTop: "auto",
          animation: "fadeUp .7s .2s ease both",
        }}
      >
        Agora é consigo
      </div>
      <h2
        style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: "clamp(36px,9vw,64px)",
          fontWeight: 600,
          margin: "14px 0 0",
          lineHeight: 1.1,
          animation: "fadeUp .8s .35s ease both",
        }}
      >
        Vamos criar
        <br />
        <span style={estiloDourado}>o seu evento?</span>
      </h2>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          marginTop: "min(32px,4dvh)",
          width: "min(100%,340px)",
          animation: "fadeUp .8s .55s ease both",
        }}
      >
        <a
          className="ligacao-ouro"
          href={LINKS.formulario}
          target="_blank"
          rel="noopener"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "54px",
            borderRadius: "999px",
            background: "#C9A84C",
            color: "#FFFFFF",
            fontSize: "15.5px",
            fontWeight: 600,
            boxShadow: "0 12px 30px rgba(201,168,76,.4)",
            transition: "transform .2s ease",
          }}
        >
          Preencher o formulário de interesse
        </a>
        <a
          className="ligacao-leve"
          href={LINKS.instagram}
          target="_blank"
          rel="noopener"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "50px",
            borderRadius: "999px",
            border: "1.5px solid #E8D5A3",
            color: "#A07830",
            fontSize: "14.5px",
            fontWeight: 600,
            background: "#FFFFFF",
          }}
        >
          Ver o Instagram
        </a>
      </div>
      <div
        style={{
          fontSize: "12.5px",
          color: "#4A4A4A",
          marginTop: "14px",
          animation: "fadeUp .8s .7s ease both",
        }}
      >
        Sem compromisso — respondemos em breve.
      </div>
      <Partilha aoRecomecar={aoRecomecar} />
      <div
        style={{
          marginTop: "auto",
          paddingTop: "min(28px,3dvh)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "5px",
          paddingBottom: "env(safe-area-inset-bottom)",
          animation: "fadeIn 1s 1s ease both",
        }}
      >
        <img
          src="/logo.png"
          alt="Do Luxo à Mesa"
          style={{ width: "min(74px,9dvh)", height: "auto" }}
        />
        <div style={{ fontSize: "10.5px", color: "#6B6B6B" }}>
          Do Luxo à Mesa · by Nádia Schultz
        </div>
      </div>
    </div>
  );
}
