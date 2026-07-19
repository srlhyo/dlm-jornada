import { ETAPAS } from "../config/etapas";

// Pontos de progresso (1..9) com linha de fundo — conversão fiel do
// sc-for de referencia/A_Jornada_dc.html: ✓ nas etapas feitas, ● com
// pulse na actual, vazio nas seguintes; clicar salta para a etapa.

export default function PontosProgresso({ etapa, aoIr }) {
  return (
    <div
      style={{
        position: "relative",
        width: "min(100%,400px)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 6px",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "16px",
          right: "16px",
          top: "50%",
          height: "2px",
          background: "#E8D5A3",
        }}
      />
      {ETAPAS.map((dados, i) => {
        const n = i + 1;
        const feita = etapa > n;
        const actual = etapa === n;
        return (
          <button
            key={dados.t}
            onClick={() => aoIr(n)}
            aria-label={`Etapa ${n}: ${dados.t}`}
            style={{
              position: "relative",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              border: `2px solid ${feita || actual ? "#C9A84C" : "#E8D5A3"}`,
              background: feita ? "#C9A84C" : "#FFFFFF",
              color: feita ? "#FFFFFF" : actual ? "#C9A84C" : "#D8C592",
              fontSize: "11px",
              fontWeight: 600,
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: 0,
              animation: actual ? "pulse 1.8s ease infinite" : "none",
              transition: "background .3s ease,border-color .3s ease",
            }}
          >
            {feita ? "✓" : actual ? "●" : ""}
          </button>
        );
      })}
    </div>
  );
}
