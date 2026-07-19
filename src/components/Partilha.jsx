import { useEffect, useRef, useState } from "react";
import { LINKS } from "../config/etapas";

// Partilha do ecrã final — conversão fiel do menu de partilha de
// referencia/A_Jornada_dc.html: WhatsApp, Instagram (copia a ligação),
// copiar ligação e, quando o navigator.share existir, "Mais opções…".
// Toast de confirmação de 2600ms com animação popIn.

const estiloItem = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  height: "42px",
  padding: "0 14px",
  border: "none",
  borderRadius: "12px",
  background: "none",
  fontSize: "13.5px",
  fontWeight: 500,
  color: "#1A1A1A",
  cursor: "pointer",
  textAlign: "left",
};

const estiloBolinha = {
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  flex: "0 0 auto",
};

const estiloContorno = {
  height: "40px",
  padding: "0 20px",
  borderRadius: "999px",
  border: "1.5px solid #E8D5A3",
  background: "none",
  color: "#A07830",
  fontSize: "12.5px",
  fontWeight: 600,
  letterSpacing: ".04em",
  cursor: "pointer",
};

export default function Partilha({ aoRecomecar }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const [aviso, setAviso] = useState("");
  const temporizador = useRef(null);

  useEffect(() => () => clearTimeout(temporizador.current), []);

  const temNativa = typeof navigator !== "undefined" && !!navigator.share;

  const mostrarAviso = (mensagem) => {
    setAviso(mensagem);
    setMenuAberto(false);
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setAviso(""), 2600);
  };

  const textoPartilha = () =>
    "Descobre como nasce um evento Do Luxo à Mesa, passo a passo: " +
    location.href;

  const copiar = () =>
    navigator.clipboard
      ? navigator.clipboard.writeText(location.href)
      : Promise.reject();

  const partilharWhatsApp = () => {
    window.open(
      "https://wa.me/?text=" + encodeURIComponent(textoPartilha()),
      "_blank",
      "noopener",
    );
    setMenuAberto(false);
  };

  const partilharInstagram = () => {
    copiar()
      .then(() => mostrarAviso("Ligação copiada — cola no Instagram ✓"))
      .catch(() => mostrarAviso("Não foi possível copiar"));
    window.open(LINKS.instagram, "_blank", "noopener");
  };

  const copiarLigacao = () => {
    copiar()
      .then(() => mostrarAviso("Ligação copiada ✓"))
      .catch(() => mostrarAviso("Não foi possível copiar"));
  };

  const partilharNativa = () => {
    navigator
      .share({
        title: "Do Luxo à Mesa — Do sonho à mesa",
        text: "Descobre como nasce um evento Do Luxo à Mesa, passo a passo.",
        url: location.href,
      })
      .catch(() => {});
    setMenuAberto(false);
  };

  return (
    <>
      <div
        style={{
          position: "relative",
          display: "flex",
          gap: "10px",
          marginTop: "min(24px,3dvh)",
          animation: "fadeUp .8s .85s ease both",
        }}
      >
        {menuAberto && (
          <div
            style={{
              position: "absolute",
              bottom: "50px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "236px",
              background: "#FFFFFF",
              border: "1px solid #F1E8D4",
              borderRadius: "18px",
              boxShadow: "0 18px 44px rgba(26,26,26,.16)",
              padding: "8px",
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              animation: "popIn .25s ease both",
              zIndex: 5,
            }}
          >
            <button
              className="item-menu"
              onClick={partilharWhatsApp}
              style={estiloItem}
            >
              <span style={{ ...estiloBolinha, background: "#25D366" }} />
              WhatsApp
            </button>
            <button
              className="item-menu"
              onClick={partilharInstagram}
              style={estiloItem}
            >
              <span
                style={{
                  ...estiloBolinha,
                  background:
                    "linear-gradient(45deg,#F58529,#DD2A7B,#8134AF)",
                }}
              />
              Instagram{" "}
              <span style={{ fontSize: "11px", color: "#6B6B6B" }}>
                (copia a ligação)
              </span>
            </button>
            <button
              className="item-menu"
              onClick={copiarLigacao}
              style={estiloItem}
            >
              <span style={{ ...estiloBolinha, background: "#C9A84C" }} />
              Copiar ligação
            </button>
            {temNativa && (
              <button
                className="item-menu"
                onClick={partilharNativa}
                style={estiloItem}
              >
                <span style={{ ...estiloBolinha, background: "#6B6B6B" }} />
                Mais opções…
              </button>
            )}
          </div>
        )}
        <button
          className="botao-contorno"
          onClick={() => setMenuAberto((aberto) => !aberto)}
          style={estiloContorno}
        >
          ⤴ Partilhar
        </button>
        <button
          className="botao-contorno"
          onClick={aoRecomecar}
          style={estiloContorno}
        >
          ↻ Começar de novo
        </button>
      </div>
      <div
        style={{
          fontSize: "12px",
          color: "#A07830",
          marginTop: "10px",
          minHeight: "16px",
        }}
      >
        {aviso}
      </div>
    </>
  );
}
