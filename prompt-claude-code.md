# Prompt para o Claude Code — conversão fiel do guia "A Jornada"

> Corre o Claude Code na raiz deste projecto e cola isto.

---

## Missão

Converter o guia interactivo gerado pelo Claude Design —
`referencia/A_Jornada_dc.html` (a **fonte da verdade** visual e
comportamental) — numa aplicação React limpa DENTRO deste projecto
Vite, substituindo o esqueleto atual de `src/App.jsx` por componentes
próprios. O resultado no browser tem de ficar **indistinguível** do
original (idealmente melhor em robustez, nunca diferente em aspeto,
texto ou comportamento).

## O que JÁ está feito (não refazer)

- `src/cena/luxo-scene.js` — a cena 3D como web component
  `<luxo-scene>`, com o three importado do npm (versão fixada
  0.184.0). **NÃO converter para react-three-fiber.** Usa-se como
  elemento nativo: `<luxo-scene stage={String(stage)} petals={...} />`
  (atributos de web component são strings).
- `src/config/etapas.js` — as 9 etapas (ETAPAS), LINKS e PETALAS.
  Todo o copy vem daqui; nunca hardcoded nos componentes.
- `src/styles.css` — os keyframes originais (fadeUp, fadeUpB, fadeIn,
  pulse, popIn, shimmer, logoIn) e o bloco prefers-reduced-motion.
- `index.html` — fontes (Playfair Display + Inter), metas, favicon.
- `referencia/` — só leitura; nunca alterar nem apagar.

## Mapa de conversão do formato x-dc → React

- `{{ expressao }}` → estado/props React (a lógica vive no
  `data-dc-script` no fundo do ficheiro de referência: classe
  `Component` com `state`, `renderVals()`, handlers).
- `<sc-if value={{ c }}>` → renderização condicional JSX.
- `<x-import component-from-global-scope="luxo-scene">` →
  `<luxo-scene>` (o import do módulo regista o custom element).
- `style-hover="..."` → o dc-runtime suportava hover inline; em React
  NÃO existe — converter para classes CSS em `src/styles.css`
  (ex.: `.botao-leve:hover{background:#FBF7EF}`), mantendo os estilos
  base inline como no original.
- `data-props` (petalas, linkFormulario, linkInstagram) → já estão em
  `src/config/etapas.js`.
- O runtime `support.js` desaparece por completo — React verdadeiro.

## Comportamentos a preservar EXACTAMENTE (do data-dc-script)

1. **Máquina de estados**: `stage` 0 (hero) → 1..9 (etapas) → 10
   (final); `next/prev` com clamp; clicar num ponto de progresso
   salta para essa etapa; "Recomeçar" volta a 0 e limpa o toast.
2. **Navegação por scroll/toque/teclado** (só com stage 1..9):
   wheel acumulado (limiar ±80, lock de 800ms); swipe vertical
   (limiar 60px); setas → ↓ avançam, ← ↑ recuam. Listeners no
   `window`, passive, removidos no unmount.
3. **Música generativa (WebAudio)** — copiar a implementação do
   script de referência tal-e-qual: progressão Cmaj7·Am7·Fmaj7·G6
   (midi [[48,52,55,59],[45,48,52,55],[41,45,48,52],[43,47,50,55]]),
   pads triangle com detune (envelope 2.5s/6s/9s, novo acorde a cada
   8s), plucks sine aleatórios (0.8–2s), lowpass 3200Hz, delay 0.42s
   com feedback 0.32 e wet 0.25, scheduler por setInterval 500ms com
   lookahead 1.2s. Fade-in 1.5s ao entrar na jornada, fade-out 0.6s
   fora dela (hero e final ficam em silêncio). O AudioContext só nasce
   no primeiro gesto do utilizador. Botão ♪ com o traço quando
   desligada; preferência em `localStorage["dlam-musica"]` ("0" =
   desligada). `aria-label` a refletir o estado.
4. **Partilha (ecrã final)**: `navigator.share` quando existir, senão
   menu com copiar ligação (`navigator.clipboard`), com toast de
   confirmação (2600ms, animação popIn). Texto de partilha: o do
   script de referência.
5. **Todos os textos, cores, espaçamentos, sombras, raios e animações
   byte a byte** como no ficheiro de referência — incluindo a
   alternância fadeUp/fadeUpB entre etapas, o pulse no ponto ativo, o
   rótulo "Continuar →" na etapa 9 e o botão "Ver o Instagram" só na
   etapa 1.
6. **prefers-reduced-motion** respeitado (o CSS global já trata disso;
   não adicionar animações via JS que o ignorem).

## Organização alvo

```
src/
  components/  Hero.jsx · CartaoEtapa.jsx · PontosProgresso.jsx ·
               BotaoMusica.jsx · EcraFinal.jsx · Partilha.jsx
  hooks/       useNavegacaoJornada.js (wheel/touch/teclas) ·
               useMusica.js (WebAudio + localStorage)
  App.jsx      composição + estado do stage
```

## Regras

- PT-PT em tudo (código, comentários, aria-labels).
- ZERO dependências novas — só react, react-dom e three (fixado).
- Não alterar `src/cena/luxo-scene.js` (excepto bug real, justificado).
- Não alterar o copy nem adicionar conteúdo.
- StrictMode fica ligado — cuidado com efeitos duplos (listeners,
  AudioContext, timers: cleanup correto).

## Critérios de aceitação

- [ ] `npm run build` sem erros nem warnings novos
- [ ] Visual lado a lado com `referencia/A_Jornada_dc.html`: igual
- [ ] Cena 3D reage a todas as etapas (0–10) e às pétalas
- [ ] Scroll, swipe e teclado navegam com os limiares originais
- [ ] Música: liga na etapa 1 após gesto, cala no hero/final,
      preferência persiste após refresh
- [ ] Partilha nativa e fallback de cópia com toast
- [ ] Testado a 390px (mobile) e desktop; reduced-motion respeitado
- [ ] `referencia/` intocada
