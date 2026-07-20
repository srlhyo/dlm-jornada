import { useEffect, useRef, useState } from "react";

// ============================================================
// Música generativa (WebAudio) — implementação copiada tal-e-qual
// do data-dc-script de referencia/A_Jornada_dc.html:
// progressão Cmaj7 · Am7 · Fmaj7 · G6, pads triangle com detune
// (envelope 2.5s/6s/9s, novo acorde a cada 8s), plucks sine
// aleatórios (0.8–2s), lowpass 3200Hz, delay 0.42s (feedback 0.32,
// wet 0.25), scheduler por setInterval 500ms com lookahead 1.2s.
// O AudioContext só nasce no primeiro gesto do utilizador
// (aoMudarEtapa/alternar são chamados por handlers de eventos).
// A música começa sempre LIGADA — não se guarda preferência entre
// visitas, por decisão da marca.
// ============================================================

// progressão calma: Cmaj7 · Am7 · Fmaj7 · G6 (midi)
const ACORDES = [
  [48, 52, 55, 59],
  [45, 48, 52, 55],
  [41, 45, 48, 52],
  [43, 47, 50, 55],
];

export function useMusica() {
  const [ligada, setLigada] = useState(true);

  // Estado do motor de áudio fora do ciclo de render (o scheduler
  // lê "ligada" via ref para não depender de closures antigas).
  const motor = useRef({
    ac: null,
    master: null,
    timer: null,
    acordeIx: 0,
    proximoAcorde: 0,
    proximoPluck: 0,
    ligada: true,
  });
  motor.current.ligada = ligada;

  useEffect(() => {
    const m = motor.current;
    return () => {
      if (m.timer) clearInterval(m.timer);
      if (m.ac) {
        try {
          m.ac.close();
        } catch {
          /* já fechado */
        }
      }
      m.timer = null;
      m.ac = null;
      m.master = null;
    };
  }, []);

  const iniciarAudio = () => {
    const m = motor.current;
    if (m.ac) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ac = (m.ac = new AC());
    if (ac.state === "suspended") ac.resume();
    const master = (m.master = ac.createGain());
    master.gain.value = 0;
    const lp = ac.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 3200;
    master.connect(lp).connect(ac.destination);
    const delay = ac.createDelay(1);
    delay.delayTime.value = 0.42;
    const fb = ac.createGain();
    fb.gain.value = 0.32;
    const wet = ac.createGain();
    wet.gain.value = 0.25;
    delay.connect(fb).connect(delay);
    delay.connect(wet).connect(master);

    m.acordeIx = 0;
    m.proximoAcorde = ac.currentTime + 0.1;
    m.proximoPluck = ac.currentTime + 1.5;

    const f = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

    const pad = (midi, t) => {
      const g = ac.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.045, t + 2.5);
      g.gain.setValueAtTime(0.045, t + 6);
      g.gain.linearRampToValueAtTime(0, t + 9);
      [0, 3].forEach((det) => {
        const o = ac.createOscillator();
        o.type = "triangle";
        o.frequency.value = f(midi);
        o.detune.value = det;
        o.connect(g);
        o.start(t);
        o.stop(t + 9.2);
      });
      g.connect(master);
    };

    const pluck = (midi, t) => {
      const g = ac.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.05, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
      const o = ac.createOscillator();
      o.type = "sine";
      o.frequency.value = f(midi);
      o.connect(g);
      g.connect(master);
      g.connect(delay);
      o.start(t);
      o.stop(t + 1.5);
    };

    m.timer = setInterval(() => {
      if (!m.ligada) return;
      const ct = ac.currentTime;
      while (m.proximoAcorde < ct + 1.2) {
        const acorde = ACORDES[m.acordeIx % 4];
        acorde.forEach((midi) => pad(midi, m.proximoAcorde));
        m.acordeIx++;
        m.proximoAcorde += 8;
      }
      while (m.proximoPluck < ct + 1.2) {
        const acorde = ACORDES[(m.acordeIx + 3) % 4];
        const midi =
          acorde[Math.floor(Math.random() * acorde.length)] +
          (Math.random() < 0.7 ? 24 : 36);
        pluck(midi, m.proximoPluck);
        m.proximoPluck += 0.8 + Math.random() * 1.2;
      }
    }, 500);
  };

  // Fade-in 1.5s ao ligar, fade-out 0.6s ao desligar.
  const definirVolume = (aoLigar) => {
    const m = motor.current;
    if (!m.ac) return;
    if (aoLigar && m.ac.state === "suspended") m.ac.resume();
    const g = m.master.gain;
    const ct = m.ac.currentTime;
    g.cancelScheduledValues(ct);
    g.setValueAtTime(g.value, ct);
    g.linearRampToValueAtTime(aoLigar ? 1 : 0, ct + (aoLigar ? 1.5 : 0.6));
    if (aoLigar) {
      m.proximoAcorde = Math.max(m.proximoAcorde, ct + 0.1);
      m.proximoPluck = Math.max(m.proximoPluck, ct + 1);
    }
  };

  // Chamar em cada mudança de etapa (sempre a partir de um gesto):
  // toca nas etapas 1..9, cala no hero e no final.
  const aoMudarEtapa = (novaEtapa) => {
    const naJornada = novaEtapa >= 1 && novaEtapa <= 9;
    if (naJornada && motor.current.ligada) {
      iniciarAudio();
      definirVolume(true);
    } else {
      definirVolume(false);
    }
  };

  const alternar = () => {
    const agoraLigada = !motor.current.ligada;
    if (agoraLigada) {
      iniciarAudio();
      definirVolume(true);
    } else {
      definirVolume(false);
    }
    motor.current.ligada = agoraLigada;
    setLigada(agoraLigada);
  };

  return { ligada, alternar, aoMudarEtapa };
}
