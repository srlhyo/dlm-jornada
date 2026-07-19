// Botão ♪ (visível só na jornada) — conversão fiel do botão de música
// de referencia/A_Jornada_dc.html, com o traço quando desligada e
// aria-label a reflectir o estado.

export default function BotaoMusica({ ligada, aoAlternar }) {
  const rotulo = ligada ? "Desligar a música" : "Ligar a música";
  return (
    <button
      className="botao-musica"
      onClick={aoAlternar}
      aria-label={rotulo}
      title={rotulo}
      style={{
        position: "absolute",
        top: "calc(14px + env(safe-area-inset-top))",
        right: "14px",
        zIndex: 30,
        width: "44px",
        height: "44px",
        borderRadius: "50%",
        border: "1.5px solid #E8D5A3",
        background: "rgba(255,255,255,.9)",
        backdropFilter: "blur(4px)",
        color: ligada ? "#C9A84C" : "#A8A8A8",
        fontSize: "18px",
        lineHeight: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: "0 6px 18px rgba(26,26,26,.08)",
        transition: "color .3s ease",
      }}
    >
      <span style={{ position: "relative" }}>
        ♪
        {!ligada && (
          <span
            style={{
              position: "absolute",
              left: "-4px",
              top: "45%",
              width: "22px",
              height: "1.5px",
              background: "#A07830",
              transform: "rotate(-38deg)",
              borderRadius: "2px",
            }}
          />
        )}
      </span>
    </button>
  );
}
