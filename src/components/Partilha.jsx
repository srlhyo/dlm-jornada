import { useEffect, useRef, useState } from "react";

// Partilha do ecrã final — overlay "convite dourado": véu com blur
// sobre a cena 3D, pétalas douradas a cair, brilhos a flutuar e um
// cartão-convite com borda shimmer que entra em perspectiva 3D.
// Só WhatsApp e Copiar; fecha com X, clique fora ou Esc.

const OURO = "#C9A84C";
const OURO_ESCURO = "#A07830";

// Pétalas e brilhos gerados uma vez por sessão (posições estáveis)
const PETALAS = Array.from({ length: 18 }, () => ({
  esquerda: Math.random() * 100,
  tamanho: 7 + Math.random() * 7,
  duracao: 4 + Math.random() * 3.5,
  atraso: Math.random() * 4.5,
  tom: Math.random() < 0.5 ? "#E8D5A3" : "#C9A84C",
}));
const BRILHOS = Array.from({ length: 12 }, () => ({
  esquerda: 6 + Math.random() * 88,
  topo: 12 + Math.random() * 76,
  duracao: 2.2 + Math.random() * 2,
  atraso: Math.random() * 2.5,
}));

const estiloDourado = {
  background:
    "linear-gradient(90deg,#A07830,#E8D5A3 40%,#C9A84C 55%,#A07830 80%)",
  backgroundSize: "200% auto",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  animation: "shimmer 4s linear infinite",
};

const estiloContorno = {
  height: "40px",
  padding: "0 20px",
  borderRadius: "999px",
  border: "1.5px solid #E8D5A3",
  background: "none",
  color: OURO_ESCURO,
  fontSize: "12.5px",
  fontWeight: 600,
  letterSpacing: ".04em",
  cursor: "pointer",
};

const IconeWhatsApp = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const IconeCopiar = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="9" width="11" height="11" rx="2.5" />
    <path d="M5 15H4.5A2.5 2.5 0 012 12.5v-8A2.5 2.5 0 014.5 2h8A2.5 2.5 0 0115 4.5V5" />
  </svg>
);

export default function Partilha({ aoRecomecar }) {
  const [aberto, setAberto] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [erro, setErro] = useState("");
  const temporizador = useRef(null);

  useEffect(() => () => clearTimeout(temporizador.current), []);

  // Esc fecha o convite
  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e) => e.key === "Escape" && fechar();
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [aberto]);

  const fechar = () => {
    setAberto(false);
    setCopiado(false);
    setErro("");
    clearTimeout(temporizador.current);
  };

  const partilharWhatsApp = () => {
    window.open(
      "https://wa.me/?text=" +
        encodeURIComponent(
          "Descubra como nasce um evento Do Luxo à Mesa, passo a passo: " +
            location.href,
        ),
      "_blank",
      "noopener",
    );
    fechar();
  };

  const copiar = () => {
    const promessa = navigator.clipboard
      ? navigator.clipboard.writeText(location.href)
      : Promise.reject();
    promessa
      .then(() => {
        setErro("");
        setCopiado(true);
        clearTimeout(temporizador.current);
        temporizador.current = setTimeout(fechar, 1500);
      })
      .catch(() => setErro("Não foi possível copiar"));
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "min(24px,3dvh)",
          animation: "fadeUp .8s .85s ease both",
        }}
      >
        <button
          className="botao-contorno"
          onClick={() => setAberto(true)}
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

      {aberto && (
        <div
          onClick={fechar}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            background:
              "radial-gradient(ellipse at 50% 42%, rgba(232,213,163,.42), rgba(251,247,239,.88) 68%)",
            backdropFilter: "blur(7px)",
            WebkitBackdropFilter: "blur(7px)",
            perspective: "1000px",
            animation: "fadeIn .45s ease both",
          }}
        >
          {/* pétalas douradas a cair (eco das pétalas da cena 3D) */}
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
            {PETALAS.map((p, i) => (
              <span
                key={`p${i}`}
                style={{
                  position: "absolute",
                  top: 0,
                  left: `${p.esquerda}%`,
                  width: `${p.tamanho}px`,
                  height: `${p.tamanho * 0.62}px`,
                  borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                  background: `linear-gradient(120deg, ${p.tom}, #FDF8EC)`,
                  opacity: 0,
                  animation: `petala-cai ${p.duracao}s linear ${p.atraso}s infinite`,
                }}
              />
            ))}
            {BRILHOS.map((b, i) => (
              <span
                key={`b${i}`}
                style={{
                  position: "absolute",
                  left: `${b.esquerda}%`,
                  top: `${b.topo}%`,
                  width: "4px",
                  height: "4px",
                  borderRadius: "50%",
                  background: "#FFEFC4",
                  boxShadow: "0 0 8px 2px rgba(201,168,76,.55)",
                  opacity: 0,
                  animation: `brilho-flutua ${b.duracao}s ease-in-out ${b.atraso}s infinite`,
                }}
              />
            ))}
          </div>

          {/* cartão-convite */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "min(100%, 340px)",
              borderRadius: "26px",
              padding: "30px 26px 26px",
              textAlign: "center",
              border: "1.5px solid transparent",
              background:
                "linear-gradient(rgba(255,255,255,.96),rgba(255,255,255,.96)) padding-box," +
                "linear-gradient(100deg,#E8D5A3,#C9A84C 30%,#FDF8EC 50%,#C9A84C 70%,#E8D5A3) border-box",
              backgroundSize: "auto, 300% 100%",
              boxShadow:
                "0 24px 70px rgba(160,120,48,.28), 0 0 0 8px rgba(255,255,255,.25)",
              animation:
                "cartao-in .7s cubic-bezier(.2,1.4,.4,1) both, borda-flui 5s linear infinite",
            }}
          >
            <button
              onClick={fechar}
              aria-label="Fechar"
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                border: "1.5px solid #E8D5A3",
                background: "none",
                color: OURO_ESCURO,
                fontSize: "14px",
                lineHeight: 1,
                cursor: "pointer",
              }}
            >
              ✕
            </button>
            <div
              style={{
                fontSize: "10.5px",
                fontWeight: 600,
                letterSpacing: ".24em",
                color: OURO_ESCURO,
                textTransform: "uppercase",
                animation: "fadeUp .6s .25s ease both",
              }}
            >
              Partilhe a magia
            </div>
            <h3
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "27px",
                fontWeight: 600,
                margin: "10px 0 6px",
                lineHeight: 1.15,
                animation: "fadeUp .6s .35s ease both",
              }}
            >
              Uma jornada <span style={estiloDourado}>para partilhar</span>
            </h3>
            <p
              style={{
                fontSize: "13px",
                lineHeight: 1.55,
                color: "#4A4A4A",
                margin: "0 0 20px",
                animation: "fadeUp .6s .45s ease both",
              }}
            >
              Envie esta experiência a alguém especial.
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "11px",
                animation: "fadeUp .6s .55s ease both",
              }}
            >
              <button
                className="ligacao-ouro"
                onClick={partilharWhatsApp}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "9px",
                  height: "50px",
                  borderRadius: "999px",
                  border: "none",
                  background: OURO,
                  color: "#FFFFFF",
                  fontSize: "14.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 10px 26px rgba(201,168,76,.4)",
                  transition: "transform .2s ease",
                }}
              >
                <IconeWhatsApp /> WhatsApp
              </button>
              <button
                className="ligacao-leve"
                onClick={copiar}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "9px",
                  height: "48px",
                  borderRadius: "999px",
                  border: "1.5px solid #E8D5A3",
                  background: copiado ? OURO : "#FFFFFF",
                  color: copiado ? "#FFFFFF" : OURO_ESCURO,
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background .3s ease, color .3s ease",
                }}
              >
                {copiado ? "Copiado ✓" : <><IconeCopiar /> Copiar</>}
              </button>
            </div>
            <div
              style={{
                fontSize: "11.5px",
                color: OURO_ESCURO,
                marginTop: erro ? "10px" : 0,
                minHeight: erro ? "14px" : 0,
              }}
            >
              {erro}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
