# A Jornada — Do Luxo à Mesa

Guia interactivo que mostra a um potencial cliente como nasce um
evento Do Luxo à Mesa, passo a passo — do Instagram e do formulário de
interesse até ao grande dia. Cena 3D (three.js) + React + Vite.

## Comandos

```bash
npm install     # primeira vez
npm run dev     # desenvolvimento (http://localhost:5173)
npm run build   # produção → dist/
npm run preview # servir o build localmente
```

## Estrutura

```
index.html               fontes, metas, favicon
src/
  main.jsx               arranque React (StrictMode)
  App.jsx                ⚠️ ESQUELETO — substituído pela conversão fiel
  styles.css             keyframes e base (do design original)
  config/etapas.js       ✏️ os textos das 9 etapas + ligações (editar AQUI)
  cena/luxo-scene.js     a cena 3D (web component; three via npm)
referencia/              o original do Claude Design — fonte da verdade,
                         só leitura (usado pela conversão)
prompt-claude-code.md    o prompt para o Claude Code fazer a conversão
netlify.toml             deploy (build → dist)
```

## Estado e próximo passo

O projecto arranca já com a cena 3D funcional e navegação básica
(esqueleto). O passo seguinte é correr o **Claude Code** na raiz com o
`prompt-claude-code.md` — converte a UI original
(`referencia/A_Jornada_dc.html`) em componentes React fiéis (hero,
cartões animados, progresso, música generativa, partilha).

## Notas técnicas

- **three fixado em 0.184.0** (a versão para que a cena foi escrita —
  não subir sem testar a cena inteira).
- A cena é um **web component** (`<luxo-scene stage petals>`), não um
  componente React — decisão deliberada: fica intacta, estável e
  independente do resto.
- Antes do lançamento: trocar o `LINKS.formulario` em
  `src/config/etapas.js` pelo URL de produção.
