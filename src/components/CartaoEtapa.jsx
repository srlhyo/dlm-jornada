import { ETAPAS, LINKS } from "../config/etapas";

// Cartão da etapa actual (stages 1..9) — conversão fiel do bloco
// "CARTAO" de referencia/A_Jornada_dc.html. A alternância
// fadeUp/fadeUpB entre etapas re-dispara a animação a cada mudança.

export default function CartaoEtapa({ etapa, aoAvancar, aoRecuar }) {
  const dados = ETAPAS[etapa - 1];
  return (
    <div
      style={{
        width: "min(100%,400px)",
        background: "#FFFFFF",
        border: "1px solid #F1E8D4",
        borderRadius: "24px",
        padding: "20px 22px 18px",
        boxShadow: "0 16px 44px rgba(26,26,26,.12)",
      }}
    >
      <div
        style={{
          animation: (etapa % 2 === 0 ? "fadeUp" : "fadeUpB") + " .55s ease both",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: ".2em",
            color: "#A07830",
            textTransform: "uppercase",
          }}
        >
          {`Etapa ${etapa} de 9`}
        </div>
        <div
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: "24px",
            fontWeight: 600,
            marginTop: "6px",
            lineHeight: 1.2,
          }}
        >
          {dados.t}
        </div>
        <div
          style={{
            fontSize: "14px",
            lineHeight: 1.6,
            color: "#6B6B6B",
            marginTop: "8px",
            textWrap: "pretty",
          }}
        >
          {dados.x}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginTop: "16px",
        }}
      >
        <button
          className="botao-leve"
          onClick={aoRecuar}
          aria-label="Etapa anterior"
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "999px",
            border: "1.5px solid #E8D5A3",
            background: "#FFFFFF",
            color: "#A07830",
            fontSize: "17px",
            cursor: "pointer",
            flex: "0 0 auto",
          }}
        >
          ←
        </button>
        {etapa === 1 && (
          <a
            className="ligacao-leve"
            href={LINKS.instagram}
            target="_blank"
            rel="noopener"
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "44px",
              borderRadius: "999px",
              border: "1.5px solid #E8D5A3",
              color: "#A07830",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            Ver o Instagram
          </a>
        )}
        <button
          className="botao-ouro"
          onClick={aoAvancar}
          style={{
            flex: 1,
            height: "44px",
            borderRadius: "999px",
            border: "none",
            background: "#C9A84C",
            color: "#FFFFFF",
            fontSize: "15px",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 8px 20px rgba(201,168,76,.35)",
            transition: "transform .2s ease",
          }}
        >
          {etapa === 9 ? "Continuar →" : "Seguinte →"}
        </button>
      </div>
    </div>
  );
}
