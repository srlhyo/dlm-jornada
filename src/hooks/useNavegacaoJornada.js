import { useEffect, useRef } from "react";

// ============================================================
// Navegação por scroll, toque e teclado (só activa nas etapas
// 1..9). Limiar de wheel ±80 com lock de 800ms; swipe vertical
// de 60px; setas →/↓ avançam e ←/↑ recuam. Listeners no window,
// passive, removidos no unmount — comportamento 1:1 com o
// data-dc-script de referencia/A_Jornada_dc.html.
// ============================================================

export function useNavegacaoJornada(etapa, avancar, recuar) {
  // Os listeners registam-se uma só vez; lêem sempre o estado
  // mais recente através desta ref (evita re-registos por render).
  const actual = useRef();
  actual.current = { etapa, avancar, recuar };

  useEffect(() => {
    let acumulado = 0;
    let bloqueioAte = 0;
    let toqueY = null;

    const naJornada = () => {
      const s = actual.current.etapa;
      return s >= 1 && s <= 9;
    };

    const aoRodar = (e) => {
      if (!naJornada()) return;
      const agora = Date.now();
      if (agora < bloqueioAte) return;
      acumulado += e.deltaY;
      if (acumulado > 80) {
        bloqueioAte = agora + 800;
        acumulado = 0;
        actual.current.avancar();
      } else if (acumulado < -80) {
        bloqueioAte = agora + 800;
        acumulado = 0;
        actual.current.recuar();
      }
    };

    const aoTocar = (e) => {
      toqueY = e.touches[0].clientY;
    };

    const aoLargar = (e) => {
      if (!naJornada() || toqueY == null) return;
      const dy = toqueY - e.changedTouches[0].clientY;
      if (dy > 60) actual.current.avancar();
      else if (dy < -60) actual.current.recuar();
      toqueY = null;
    };

    const aoTecla = (e) => {
      if (!naJornada()) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") actual.current.avancar();
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") actual.current.recuar();
    };

    window.addEventListener("wheel", aoRodar, { passive: true });
    window.addEventListener("touchstart", aoTocar, { passive: true });
    window.addEventListener("touchend", aoLargar, { passive: true });
    window.addEventListener("keydown", aoTecla);
    return () => {
      window.removeEventListener("wheel", aoRodar);
      window.removeEventListener("touchstart", aoTocar);
      window.removeEventListener("touchend", aoLargar);
      window.removeEventListener("keydown", aoTecla);
    };
  }, []);
}
