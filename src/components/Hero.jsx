// Ecrã inicial (stage 0) — conversão fiel do bloco "HERO" de
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

export default function Hero({ aoComecar }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(rgba(251,247,239,.97) 0%,rgba(251,247,239,.86) 36%,rgba(251,247,239,.4) 62%,rgba(251,247,239,.05) 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        textAlign: "center",
        padding: "max(20px,5dvh) 24px 24px",
        gap: 0,
        overflowY: "auto",
      }}
    >
      <img
        src="/logo.png"
        alt="Do Luxo à Mesa · by Luxury Events"
        style={{
          width: "min(44vw,180px)",
          maxHeight: "min(22dvh,180px)",
          objectFit: "contain",
          flex: "0 1 auto",
          animation: "logoIn 1.2s cubic-bezier(.2,.8,.3,1) both",
        }}
      />
      <div
        style={{
          width: "40px",
          height: "1px",
          background: "#E8D5A3",
          margin: "min(20px,2.2dvh) 0",
          animation: "fadeUp .8s .25s ease both",
        }}
      />
      <div
        style={{
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: ".24em",
          color: "#A07830",
          textTransform: "uppercase",
          animation: "fadeUp .8s .35s ease both",
        }}
      >
        Um guia interactivo
      </div>
      <h1
        style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: "clamp(38px,min(10vw,8dvh),72px)",
          fontWeight: 600,
          margin: "12px 0 0",
          lineHeight: 1.05,
          letterSpacing: ".01em",
          animation: "fadeUp .9s .45s ease both",
        }}
      >
        Do sonho
        <br />
        <span style={estiloDourado}>à mesa.</span>
      </h1>
      <p
        style={{
          fontSize: "15px",
          lineHeight: 1.6,
          color: "#4A4A4A",
          maxWidth: "340px",
          margin: "min(16px,2dvh) 0 0",
          textWrap: "pretty",
          animation: "fadeUp .8s .6s ease both",
        }}
      >
        Como nasce o seu evento, passo a passo — e o que tratamos por si
        (tudo).
      </p>
      <button
        className="botao-ouro-grande"
        onClick={aoComecar}
        style={{
          flex: "0 0 auto",
          marginTop: "min(26px,3dvh)",
          height: "52px",
          padding: "0 34px",
          borderRadius: "999px",
          border: "none",
          background: "#C9A84C",
          color: "#FFFFFF",
          fontSize: "16px",
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 12px 30px rgba(201,168,76,.45)",
          animation: "fadeUp .8s .75s ease both",
          transition: "transform .2s ease",
        }}
      >
        Começar a jornada →
      </button>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "6px 10px",
          marginTop: "min(22px,2.5dvh)",
          fontSize: "11.5px",
          fontWeight: 500,
          letterSpacing: ".06em",
          color: "#4A4A4A",
          textShadow: "0 1px 6px rgba(251,247,239,.9)",
          animation: "fadeUp .8s .9s ease both",
        }}
      >
        <span>Montagem completa</span>
        <span style={{ color: "#C9A84C" }}>·</span>
        <span>Estética personalizada</span>
        <span style={{ color: "#C9A84C" }}>·</span>
        <span>Experiência premium</span>
      </div>
    </div>
  );
}
