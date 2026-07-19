// Botão de som (visível só na jornada). O ♪ discreto de 44px do
// original passou despercebido, por isso: pílula com texto de estado
// ("Som ligado" / "Som desligado"), equalizador animado enquanto a
// música toca, pulso dourado à entrada e notas a subir em
// perspectiva 3D (rotateY + translateZ, via perspective no wrapper).

const OURO = "#C9A84C";
const OURO_ESCURO = "#A07830";
const CINZA = "#A8A8A8";

// Barras do equalizador — durações/atrasos diferentes para o
// movimento não parecer mecânico.
const BARRAS = [
  { altura: 10, duracao: ".85s", atraso: "0s" },
  { altura: 16, duracao: ".7s", atraso: ".15s" },
  { altura: 12, duracao: ".95s", atraso: ".3s" },
  { altura: 7, duracao: ".78s", atraso: ".45s" },
];

// Nascem à esquerda da pílula (fora dela, sobre o fundo) e sobem
// em perspectiva; se nascessem sobre o botão ficavam atrás do branco.
const NOTAS = [
  { glifo: "♪", atraso: "0s", esquerda: "-20px", duracao: "3.8s" },
  { glifo: "♫", atraso: "1.4s", esquerda: "-38px", duracao: "4.4s" },
  { glifo: "♪", atraso: "2.7s", esquerda: "-8px", duracao: "4s" },
];

export default function BotaoMusica({ ligada, aoAlternar }) {
  const rotulo = ligada ? "Desligar o som" : "Ligar o som";
  return (
    <div
      style={{
        position: "absolute",
        top: "calc(14px + env(safe-area-inset-top))",
        right: "14px",
        zIndex: 30,
        perspective: "300px",
      }}
    >
      {ligada &&
        NOTAS.map((nota, i) => (
          <span
            key={i}
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "16px",
              left: nota.esquerda,
              fontSize: "15px",
              color: OURO,
              textShadow: "0 0 6px rgba(201,168,76,.45)",
              opacity: 0,
              pointerEvents: "none",
              animation: `nota-sobe ${nota.duracao} ease-out ${nota.atraso} infinite`,
            }}
          >
            {nota.glifo}
          </span>
        ))}
      <button
        className="botao-musica"
        onClick={aoAlternar}
        aria-label={rotulo}
        title={rotulo}
        style={{
          position: "relative",
          height: "40px",
          padding: "0 16px 0 13px",
          borderRadius: "999px",
          border: "1.5px solid #E8D5A3",
          background: "rgba(255,255,255,.92)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          gap: "9px",
          cursor: "pointer",
          boxShadow: "0 6px 18px rgba(26,26,26,.08)",
          animation: "fadeIn .5s ease both, pulse 1.8s ease .6s 3",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "2.5px",
            height: "16px",
          }}
        >
          {BARRAS.map((barra, i) => (
            <span
              key={i}
              style={{
                width: "3px",
                height: `${barra.altura}px`,
                borderRadius: "2px",
                background: ligada ? OURO : CINZA,
                transformOrigin: "bottom",
                transform: ligada ? undefined : "scaleY(.3)",
                animation: ligada
                  ? `barra-eq ${barra.duracao} ease-in-out ${barra.atraso} infinite`
                  : "none",
                transition: "background .3s ease, transform .3s ease",
              }}
            />
          ))}
        </span>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: ".1em",
            textTransform: "uppercase",
            color: ligada ? OURO_ESCURO : CINZA,
            transition: "color .3s ease",
            whiteSpace: "nowrap",
          }}
        >
          {ligada ? "Som ligado" : "Som desligado"}
        </span>
      </button>
    </div>
  );
}
