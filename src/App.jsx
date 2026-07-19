import { useState } from "react";
import { PETALAS } from "./config/etapas";
import "./cena/luxo-scene";
import Hero from "./components/Hero";
import CartaoEtapa from "./components/CartaoEtapa";
import PontosProgresso from "./components/PontosProgresso";
import BotaoMusica from "./components/BotaoMusica";
import EcraFinal from "./components/EcraFinal";
import { useNavegacaoJornada } from "./hooks/useNavegacaoJornada";
import { useMusica } from "./hooks/useMusica";

// ============================================================
// A Jornada — conversão fiel de referencia/A_Jornada_dc.html.
// stage: 0 = hero · 1..9 = etapas · 10 = final
// A música muda sempre dentro de irPara (chamado por gestos do
// utilizador), para o AudioContext nascer num gesto.
// ============================================================

export default function App() {
  const [etapa, setEtapa] = useState(0);
  const musica = useMusica();
  const naJornada = etapa >= 1 && etapa <= 9;

  const irPara = (n) => {
    musica.aoMudarEtapa(n);
    setEtapa(n);
  };
  const avancar = () => irPara(Math.min(10, etapa + 1));
  const recuar = () => irPara(Math.max(0, etapa - 1));

  useNavegacaoJornada(etapa, avancar, recuar);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100dvh",
        overflow: "hidden",
        fontFamily: "Inter,sans-serif",
        background: "linear-gradient(#FBF7EF,#F1E7D2)",
        color: "#1A1A1A",
      }}
    >
      {/* Atributos de web component são strings */}
      <luxo-scene
        stage={String(etapa)}
        petals={PETALAS ? "1" : "0"}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          right: 0,
          bottom: "min(230px,30dvh)",
        }}
      />

      {naJornada && (
        <>
          <BotaoMusica ligada={musica.ligada} aoAlternar={musica.alternar} />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "14px",
              padding: "0 16px calc(14px + env(safe-area-inset-bottom))",
            }}
          >
            <CartaoEtapa etapa={etapa} aoAvancar={avancar} aoRecuar={recuar} />
            <PontosProgresso etapa={etapa} aoIr={irPara} />
          </div>
        </>
      )}

      {etapa === 0 && <Hero aoComecar={() => irPara(1)} />}

      {etapa === 10 && <EcraFinal aoRecomecar={() => irPara(0)} />}
    </div>
  );
}
