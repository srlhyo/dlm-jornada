/* <luxo-scene stage="0-10" petals="1|0"> — cena 3D "Do Luxo à Mesa" */
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

(function () {
  if (customElements.get('luxo-scene')) return;
  const easeOutBack = (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  class LuxoScene extends HTMLElement {
    static get observedAttributes() { return ['stage', 'petals']; }
    constructor() { super(); this._stage = 0; this._petals = true; this._px = 0; this._py = 0; }
    attributeChangedCallback(n, o, v) {
      if (n === 'stage') this._stage = parseInt(v || '0', 10) || 0;
      if (n === 'petals') this._petals = v !== '0' && v !== 'false';
    }
    connectedCallback() {
      if (this._started) return; this._started = true;
      this.style.cssText += ';display:block;position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
      this._reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this._init();
    }
    disconnectedCallback() {
      cancelAnimationFrame(this._raf);
      if (this._ro) this._ro.disconnect();
      window.removeEventListener('pointermove', this._pm);
      if (this._renderer) this._renderer.dispose();
    }
    async _init() {
      // three vem do bundle (npm, versão fixada) — sem CDN, sem rede.
      this._T = THREE;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
      this.appendChild(renderer.domElement);
      this._renderer = renderer;

      // mapa de ambiente só para os materiais espelhados (não altera
      // a iluminação do resto da cena)
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();

      const scene = new THREE.Scene();
      this._scene = scene;
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
      camera.position.set(0, 2.6, 7);
      this._camera = camera;
      this._look = new THREE.Vector3(0, 1, 0);

      // materiais
      const M = {
        gold: new THREE.MeshStandardMaterial({ color: 0xC9A84C, metalness: 0.75, roughness: 0.32 }),
        lightGold: new THREE.MeshStandardMaterial({ color: 0xE8D5A3, metalness: 0.4, roughness: 0.5 }),
        darkGold: new THREE.MeshStandardMaterial({ color: 0xA07830, metalness: 0.6, roughness: 0.4 }),
        cream: new THREE.MeshStandardMaterial({ color: 0xFAF4E4, roughness: 0.85 }),
        white: new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.6 }),
        wood: new THREE.MeshStandardMaterial({ color: 0x8F6D33, roughness: 0.55, metalness: 0.1 }),
        glass: new THREE.MeshStandardMaterial({ color: 0xFFFDF4, roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.32 }),
        flame: new THREE.MeshStandardMaterial({ color: 0xFFE3A0, emissive: 0xFFB84D, emissiveIntensity: 2.4 }),
        pearl: new THREE.MeshStandardMaterial({ color: 0xFDF8EC, roughness: 0.25, metalness: 0.3 }),
        chrome: new THREE.MeshStandardMaterial({ color: 0xE8C463, metalness: 1, roughness: 0.07, envMap: envTex, envMapIntensity: 1.3 })
      };
      const mesh = (geo, mat, x, y, z, parent, cast = true) => {
        const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
        m.castShadow = cast; m.receiveShadow = false; parent.add(m); return m;
      };

      // luzes
      const ambient = new THREE.AmbientLight(0xFFF3DC, 0.55); scene.add(ambient);
      const key = new THREE.DirectionalLight(0xFFEFD0, 2.2);
      key.position.set(3.5, 6, 4); key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.left = -4; key.shadow.camera.right = 4;
      key.shadow.camera.top = 5; key.shadow.camera.bottom = -1;
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xF2E6D8, 0.7); fill.position.set(-4, 3, 2); scene.add(fill);
      this._ambient = ambient; this._key = key;

      // chão
      const floor = new THREE.Mesh(new THREE.CircleGeometry(7, 48), new THREE.MeshStandardMaterial({ color: 0xF3EAD5, roughness: 1 }));
      floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

      // candeeiro suspenso
      mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.2, 8), M.darkGold, 0, 3.7, 0, scene, false);
      mesh(new THREE.ConeGeometry(0.22, 0.2, 24, 1, true), M.gold, 0, 3.1, 0, scene, false);
      const bulb = mesh(new THREE.SphereGeometry(0.06, 16, 12), new THREE.MeshStandardMaterial({ color: 0xFFF2CC, emissive: 0xFFE1A0, emissiveIntensity: 2 }), 0, 3.0, 0, scene, false);
      const lampLight = new THREE.PointLight(0xFFDF9E, 22, 11, 2); lampLight.position.set(0, 2.9, 0); scene.add(lampLight);

      // grupos por etapa
      const G = {}; const THR = { mesa: 2, toalha: 3, loicas: 4, centro: 5, velas: 6, painel: 7, baloes: 8, final: 9 };
      for (const k in THR) { G[k] = new THREE.Group(); G[k].userData = { t: 0, thr: THR[k] }; G[k].visible = false; scene.add(G[k]); }
      this._G = G;

      // mesa (+ tapete felpudo, como nas montagens reais)
      const top = mesh(new THREE.BoxGeometry(2.4, 0.08, 0.95), M.wood, 0, 0.72, 0, G.mesa);
      top.receiveShadow = true;
      [[-1.05, -0.35], [1.05, -0.35], [-1.05, 0.35], [1.05, 0.35]].forEach(([x, z]) =>
        mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.7, 12), M.darkGold, x, 0.35, z, G.mesa));
      const rug = new THREE.Mesh(new THREE.CircleGeometry(1.75, 40),
        new THREE.MeshStandardMaterial({ color: 0xF7EFDC, roughness: 1 }));
      rug.rotation.x = -Math.PI / 2; rug.position.y = 0.004; rug.receiveShadow = true; G.mesa.add(rug);

      // toalha (+ caminho de mesa dourado)
      const cloth = mesh(new THREE.BoxGeometry(2.52, 0.5, 1.06), M.white, 0, 0.55, 0, G.toalha);
      cloth.receiveShadow = true;
      mesh(new THREE.BoxGeometry(2.54, 0.025, 1.08), M.lightGold, 0, 0.335, 0, G.toalha, false);
      mesh(new THREE.BoxGeometry(2.56, 0.008, 0.36), M.lightGold, 0, 0.806, 0, G.toalha, false);

      // loiças e guardanapos
      [-0.85, 0.85].forEach((x, i) => {
        const p = mesh(new THREE.CylinderGeometry(0.19, 0.16, 0.022, 32), M.white, x, 0.815, 0.12, G.loicas);
        p.receiveShadow = true;
        const ring = mesh(new THREE.TorusGeometry(0.125, 0.006, 8, 32), M.lightGold, x, 0.828, 0.12, G.loicas, false);
        ring.rotation.x = -Math.PI / 2;
        const nap = mesh(new THREE.BoxGeometry(0.13, 0.015, 0.13), M.gold, x, 0.836, 0.12, G.loicas, false);
        nap.rotation.y = Math.PI / 4;
        const gx = x + (i === 0 ? 0.3 : -0.3);
        mesh(new THREE.CylinderGeometry(0.032, 0.026, 0.15, 16), M.glass, gx, 0.9, -0.12, G.loicas, false);
        mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.05, 8), M.glass, gx, 0.826, -0.12, G.loicas, false);
        mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.01, 16), M.glass, gx, 0.805, -0.12, G.loicas, false);
      });

      // centro de mesa: bolo de 2 andares em cake stand dourado
      mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.025, 24), M.gold, 0, 0.815, 0, G.centro);
      mesh(new THREE.CylinderGeometry(0.028, 0.034, 0.08, 14), M.gold, 0, 0.865, 0, G.centro, false);
      mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.015, 32), M.gold, 0, 0.91, 0, G.centro);
      const tier1 = mesh(new THREE.CylinderGeometry(0.155, 0.155, 0.13, 32), M.white, 0, 0.985, 0, G.centro);
      tier1.receiveShadow = true;
      mesh(new THREE.CylinderGeometry(0.158, 0.158, 0.022, 32), M.lightGold, 0, 0.932, 0, G.centro, false);
      mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.11, 28), M.white, 0, 1.105, 0, G.centro);
      mesh(new THREE.CylinderGeometry(0.108, 0.108, 0.02, 28), M.lightGold, 0, 1.06, 0, G.centro, false);
      mesh(new THREE.SphereGeometry(0.028, 14, 10), M.pearl, 0, 1.185, 0, G.centro, false);
      mesh(new THREE.SphereGeometry(0.018, 10, 8), M.gold, 0.035, 1.172, 0.01, G.centro, false);
      // mini-bouquets a ladear o bolo
      [-0.52, 0.52].forEach((x) => {
        mesh(new THREE.CylinderGeometry(0.045, 0.032, 0.1, 16), M.gold, x, 0.855, 0.28, G.centro, false);
        [[0, 0.075, 0, 0.05, M.pearl], [0.05, 0.06, 0.02, 0.036, M.lightGold], [-0.05, 0.062, -0.015, 0.038, M.gold],
         [0.01, 0.11, -0.03, 0.03, M.darkGold]]
          .forEach(([dx, dy, dz, r, mat]) => mesh(new THREE.SphereGeometry(r, 14, 10), mat, x + dx, 0.855 + dy, 0.28 + dz, G.centro, false));
      });

      // velas
      this._flames = []; this._candleLights = [];
      [-0.45, 0.45].forEach((x, i) => {
        const h = i === 0 ? 0.2 : 0.14;
        mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.02, 16), M.gold, x, 0.81, -0.15, G.velas, false);
        mesh(new THREE.CylinderGeometry(0.013, 0.013, h, 10), M.gold, x, 0.82 + h / 2, -0.15, G.velas, false);
        mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 12), M.gold, x, 0.82 + h, -0.15, G.velas, false);
        mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.14, 12), M.cream, x, 0.9 + h, -0.15, G.velas, false);
        const f = mesh(new THREE.ConeGeometry(0.014, 0.05, 10), M.flame, x, 0.99 + h, -0.15, G.velas, false);
        this._flames.push(f);
        const l = new THREE.PointLight(0xFFC46B, 3, 2.4, 2); l.position.set(x, 1.0 + h, -0.1); G.velas.add(l);
        this._candleLights.push(l);
      });
      // tealights espalhados pela toalha
      [[-0.2, 0.33], [0.26, 0.34], [-0.68, -0.3]].forEach(([x, z]) => {
        mesh(new THREE.CylinderGeometry(0.028, 0.024, 0.035, 12), M.glass, x, 0.822, z, G.velas, false);
        const f = mesh(new THREE.ConeGeometry(0.009, 0.03, 8), M.flame, x, 0.852, z, G.velas, false);
        this._flames.push(f);
      });

      // painel fotografável (arco)
      const panel = mesh(new THREE.BoxGeometry(2.1, 2.2, 0.05), M.cream, 0, 1.2, -1.6, G.painel);
      panel.receiveShadow = true;
      mesh(new THREE.CylinderGeometry(0.05, 0.06, 2.3, 14), M.lightGold, -1.1, 1.15, -1.58, G.painel);
      mesh(new THREE.CylinderGeometry(0.05, 0.06, 2.3, 14), M.lightGold, 1.1, 1.15, -1.58, G.painel);
      const archTrim = mesh(new THREE.TorusGeometry(1.1, 0.05, 10, 40, Math.PI), M.lightGold, 0, 2.3, -1.58, G.painel, false);
      archTrim.rotation.z = 0;
      // "néon" quente a acompanhar o arco (como os letreiros das montagens)
      const neon = mesh(new THREE.TorusGeometry(1.0, 0.014, 8, 60, Math.PI),
        new THREE.MeshStandardMaterial({ color: 0xFFF6DF, emissive: 0xFFDFA0, emissiveIntensity: 1.8, roughness: 0.3 }),
        0, 2.3, -1.53, G.painel, false);
      this._neon = neon;
      const panelLight = new THREE.PointLight(0xFFE3B0, 5, 5.5, 2);
      panelLight.position.set(0, 2.1, -1.1); G.painel.add(panelLight);
      const flowerCluster = (cx, cy) => {
        [[0, 0, 0.09, M.gold], [0.11, 0.05, 0.07, M.lightGold], [-0.1, 0.06, 0.06, M.pearl],
         [0.05, 0.13, 0.05, M.darkGold], [-0.05, -0.09, 0.055, M.lightGold]]
          .forEach(([dx, dy, r, mat]) => mesh(new THREE.SphereGeometry(r, 16, 12), mat, cx + dx, cy + dy, -1.5, G.painel, false));
      };
      flowerCluster(-0.95, 2.05); flowerCluster(0.98, 1.75); flowerCluster(-1.08, 0.6);

      // ------------------------------------------------------------
      // BALÕES — geometria de látex partilhada: perfil em gota com
      // gargalo e nó (LatheGeometry), 1 geometria para todos os balões
      // ------------------------------------------------------------
      const perfilBalao = [new THREE.Vector2(0.0001, 1)];
      for (let i = 1; i <= 14; i++) {
        const a = (i / 14) * 0.88 * Math.PI;
        perfilBalao.push(new THREE.Vector2(Math.sin(a) * (1 + 0.1 * Math.cos(a)), Math.cos(a)));
      }
      perfilBalao.push(new THREE.Vector2(0.17, -0.985), new THREE.Vector2(0.055, -1.04),
        new THREE.Vector2(0.07, -1.09), new THREE.Vector2(0.0001, -1.12));
      // a Lathe espera os pontos de baixo para cima (senão as normais
      // ficam viradas para dentro e o balão parece oco)
      perfilBalao.reverse();
      const balaoGeo = new THREE.LatheGeometry(perfilBalao, 26);
      // materiais próprios dos balões: a mesma paleta, com reflexo
      // suave do ambiente (highlights de látex)
      const matBalao = (base, rough) => {
        const m = base.clone(); m.envMap = envTex; m.envMapIntensity = 0.4; m.roughness = rough; return m;
      };
      const matsBalao = [matBalao(M.cream, 0.5), matBalao(M.pearl, 0.35), matBalao(M.lightGold, 0.45), matBalao(M.gold, 0.3)];
      // mistura: 35% marfim · 25% pérola · 20% champanhe · 20% ouro,
      // com o chrome espelhado como acento espalhado (~1 em cada 6)
      const corBalao = () => {
        if (Math.random() < 0.17) return M.chrome;
        const s = Math.random();
        return s < 0.35 ? matsBalao[0] : s < 0.6 ? matsBalao[1] : s < 0.8 ? matsBalao[2] : matsBalao[3];
      };
      // 20% quase esféricos · 50% ovais · 30% alongados, nunca iguais
      const balao = (r, x, y, z, parent, mat) => {
        const b = new THREE.Mesh(balaoGeo, mat || corBalao());
        const forma = Math.random();
        const sy = forma < 0.2 ? 1.02 + Math.random() * 0.04
          : forma < 0.7 ? 1.08 + Math.random() * 0.1 : 1.18 + Math.random() * 0.12;
        b.scale.set(r * (0.92 + Math.random() * 0.12), r * sy, r * (0.92 + Math.random() * 0.12));
        b.position.set(x, y, z);
        // gargalos enfiados para dentro (contra o painel), como numa
        // grinalda real — de qualquer ângulo vê-se o corpo redondo
        b.rotation.set(1.1 + (Math.random() - 0.5) * 0.5, Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.4);
        b.castShadow = false; parent.add(b); return b;
      };

      // balões flutuantes: gota inclinada + fio fino com folga (bezier)
      // preso exactamente ao nó; o grupo sobe e desce inteiro
      this._balloons = [];
      const fioMat = new THREE.MeshBasicMaterial({ color: 0xA07830 });
      [[-1.7, 2.3, -0.7, 0.2, M.chrome], [-1.35, 2.7, -0.9, 0.14, matsBalao[1]], [1.6, 2.5, -0.6, 0.18, matsBalao[2]], [1.95, 2.15, -0.9, 0.13, M.chrome], [1.3, 2.9, -1.1, 0.11, matsBalao[1]]]
        .forEach(([x, y, z, r, mat], i) => {
          const g = new THREE.Group();
          g.position.set(x, y, z); g.userData.baseY = y;
          const b = new THREE.Mesh(balaoGeo, mat);
          b.scale.set(r * 0.97, r * (1.14 + (i % 3) * 0.05), r * 0.97);
          b.rotation.set((Math.random() - 0.5) * 0.12, Math.random() * Math.PI, (Math.random() - 0.5) * 0.24);
          g.add(b);
          const no = new THREE.Vector3(0, -1.12, 0).multiply(b.scale).applyEuler(b.rotation);
          const folga = (Math.random() < 0.5 ? -1 : 1) * (0.06 + Math.random() * 0.08);
          const curva = new THREE.QuadraticBezierCurve3(
            no,
            no.clone().add(new THREE.Vector3(folga * 0.7, -0.4, 0)),
            no.clone().add(new THREE.Vector3(folga, -0.85, 0)));
          g.add(new THREE.Mesh(new THREE.TubeGeometry(curva, 22, 0.0028, 5), fioMat));
          G.baloes.add(g); this._balloons.push(g);
        });

      // plintos com flores usam a paleta base
      const balloonMats = [M.gold, M.pearl, M.lightGold, M.cream];
      // grinalda em BOUQUETS a abraçar o arco: cachos de 4–8 balões de
      // tamanhos misturados com sobreposição entre vizinhos — o método
      // dos decoradores reais. Densa nos pilares e ombros, mais leve
      // no topo para o arco espreitar e os flutuantes respirarem.
      const pontoArco = (t) => {
        if (t < 0.28) { const u = t / 0.28; return [-1.15, 0.42 + u * 1.88]; }
        if (t > 0.72) { const u = (t - 0.72) / 0.28; return [1.15, 2.3 - u * 1.88]; }
        const th = Math.PI * (1 - (t - 0.28) / 0.44);
        return [Math.cos(th) * 1.17, 2.3 + Math.sin(th) * 1.17];
      };
      const bouquet = (cx, cy, escala) => {
        const n = 4 + Math.floor(Math.random() * 4);
        for (let i = 0; i < n; i++) {
          const r = (i === 0 ? 0.145 + Math.random() * 0.055
            : i <= 2 ? 0.09 + Math.random() * 0.045
            : i < n - 1 ? 0.055 + Math.random() * 0.035
            : 0.032 + Math.random() * 0.022) * escala;
          const a = Math.random() * Math.PI * 2, d = Math.random() * 0.17 * escala;
          // sempre À FRENTE do painel (z -1.56…-1.32), em camadas
          balao(r, cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.9,
            -1.44 + (Math.random() - 0.5) * 0.24, G.baloes);
        }
      };
      for (let i = 0; i <= 24; i++) {
        const t = i / 24;
        const [cx, cy] = pontoArco(t);
        const doTopo = Math.abs(t - 0.5) < 0.08;
        const doOmbro = !doTopo && Math.abs(t - 0.5) < 0.24;
        bouquet(cx, cy, doTopo ? 0.68 : doOmbro ? 0.9 : 1);
        // segunda camada nos pilares e (às vezes) nos ombros —
        // os 60% de baixo bem fartos, sem tapar o topo
        if (!doTopo && !doOmbro) {
          bouquet(cx + (Math.random() - 0.5) * 0.18, cy + (Math.random() - 0.5) * 0.24, 0.85);
        } else if (doOmbro && Math.random() < 0.6) {
          bouquet(cx + (Math.random() - 0.5) * 0.16, cy + (Math.random() - 0.5) * 0.18, 0.7);
        }
      }
      // luzes de fada a cintilar ao longo do arco
      const fairy = new THREE.InstancedMesh(new THREE.SphereGeometry(0.018, 8, 6),
        new THREE.MeshStandardMaterial({ color: 0xFFF4D8, emissive: 0xFFE2A2, emissiveIntensity: 2.2 }), 26);
      fairy.frustumCulled = false;
      this._fairyParams = Array.from({ length: 26 }, (_, i) => {
        const th = 0.06 * Math.PI + (i / 25) * 0.88 * Math.PI;
        return { x: Math.cos(th) * 1.6, y: 0.6 + Math.sin(th) * 1.8, ph: Math.random() * 6 };
      });
      G.baloes.add(fairy); this._fairy = fairy;
      const plinth = (x, h) => {
        const p = mesh(new THREE.CylinderGeometry(0.2, 0.2, h, 24), M.cream, x, h / 2, -1.05, G.painel);
        p.receiveShadow = true;
        mesh(new THREE.CylinderGeometry(0.07, 0.045, 0.16, 16), M.gold, x, h + 0.08, -1.05, G.painel, false);
        [[0, 0.24, 0, 0.095], [-0.11, 0.19, 0.03, 0.062], [0.11, 0.18, -0.02, 0.068], [-0.05, 0.3, -0.04, 0.052],
         [0.07, 0.29, 0.04, 0.048], [0.14, 0.24, 0.05, 0.04], [-0.15, 0.24, -0.03, 0.042], [0, 0.19, 0.11, 0.05], [-0.02, 0.2, -0.11, 0.046]]
          .forEach(([dx, dy, dz, r], i) => mesh(new THREE.SphereGeometry(r, 14, 10), balloonMats[(i + 1) % 4], x + dx, h + dy, -1.05 + dz, G.painel, false));
        // espigas secas a sair do arranjo
        [[-0.08, 22], [0.04, -16], [0.13, 30]].forEach(([dx, rot]) => {
          const e = mesh(new THREE.ConeGeometry(0.013, 0.24, 8), M.lightGold, x + dx, h + 0.42, -1.05, G.painel, false);
          e.rotation.z = (rot * Math.PI) / 180;
        });
      };
      plinth(-1.75, 0.7); plinth(1.75, 0.55);

      // final: brilhos + pétalas
      this._sparks = [];
      for (let i = 0; i < 10; i++) {
        const s = mesh(new THREE.SphereGeometry(0.022, 8, 6),
          new THREE.MeshStandardMaterial({ color: 0xFFE9B8, emissive: 0xFFD98A, emissiveIntensity: 2 }),
          (Math.random() - 0.5) * 3.4, 1.1 + Math.random() * 1.8, -1 + Math.random() * 1.6, G.final, false);
        s.userData.ph = Math.random() * Math.PI * 2;
        this._sparks.push(s);
      }
      const petalGeo = new THREE.PlaneGeometry(0.07, 0.042);
      const petalMat = new THREE.MeshStandardMaterial({ color: 0xE8D5A3, emissive: 0xC9A84C, emissiveIntensity: 0.25, side: THREE.DoubleSide });
      const petals = new THREE.InstancedMesh(petalGeo, petalMat, 34);
      petals.frustumCulled = false;
      this._petalParams = Array.from({ length: 34 }, () => ({
        x: (Math.random() - 0.5) * 4.4, z: (Math.random() - 0.5) * 2.4 - 0.3,
        sp: 0.35 + Math.random() * 0.4, ph: Math.random() * 4, sw: 0.2 + Math.random() * 0.3, rs: Math.random() * 2
      }));
      G.final.add(petals); this._petalMesh = petals;
      // poeira dourada a subir devagar (final)
      const motes = new THREE.InstancedMesh(new THREE.SphereGeometry(0.013, 6, 5),
        new THREE.MeshStandardMaterial({ color: 0xFFEFC4, emissive: 0xE8C979, emissiveIntensity: 1.6, transparent: true, opacity: 0.85 }), 40);
      motes.frustumCulled = false;
      this._moteParams = Array.from({ length: 40 }, () => ({
        x: (Math.random() - 0.5) * 4.6, z: -1.4 + Math.random() * 2.4,
        sp: 0.18 + Math.random() * 0.3, ph: Math.random() * 5, sw: 0.1 + Math.random() * 0.25
      }));
      G.final.add(motes); this._motes = motes;
      this._dummy = new THREE.Object3D();

      // confete dourado (ecrã final)
      const confetti = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.05, 0.03),
        new THREE.MeshStandardMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide, emissive: 0x8A6A20, emissiveIntensity: 0.35 }), 90);
      confetti.frustumCulled = false; confetti.visible = false; scene.add(confetti);
      const cCols = [new THREE.Color(0xC9A84C), new THREE.Color(0xE8D5A3), new THREE.Color(0xFDF8EC), new THREE.Color(0xA07830)];
      this._confParams = Array.from({ length: 90 }, (_, i) => {
        const a = Math.random() * Math.PI * 2;
        confetti.setColorAt(i, cCols[i % 4]);
        return { vx: Math.cos(a) * (0.4 + Math.random() * 1.4), vz: Math.sin(a) * (0.3 + Math.random() * 0.8), vy: 2.2 + Math.random() * 2.2, rs: 2 + Math.random() * 6, ph: Math.random() * 6 };
      });
      if (confetti.instanceColor) confetti.instanceColor.needsUpdate = true;
      this._confetti = confetti; this._burstT = null;

      // interacção / resize
      this._pm = (e) => {
        this._px = (e.clientX / innerWidth - 0.5) * 2;
        this._py = (e.clientY / innerHeight - 0.5) * 2;
      };
      window.addEventListener('pointermove', this._pm, { passive: true });
      this._distScale = 1;
      const resize = () => {
        const r = this.getBoundingClientRect();
        const w = Math.max(r.width, 1), h = Math.max(r.height, 1);
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        this._distScale = camera.aspect < 0.75 ? 1.55 : camera.aspect < 1.15 ? 1.28 : 1;
        camera.updateProjectionMatrix();
      };
      this._ro = new ResizeObserver(resize); this._ro.observe(this); resize();

      this._clock = new THREE.Clock();
      this._lookCur = new THREE.Vector3(0, 1, 0);
      const tick = () => {
        this._raf = requestAnimationFrame(tick);
        this._tick();
      };
      tick();
    }
    _camTarget(time, out, look) {
      const st = this._stage, d = this._distScale;
      if (st === 0) {
        const a = this._reduced ? 0.25 : Math.sin(time * 0.09) * 0.5;
        out.set(Math.sin(a) * 7.2 * d, 2.5, Math.cos(a) * 7.2 * d); look.set(0, 1.25, 0);
      } else if (st === 10) {
        const a = this._reduced ? 0.2 : Math.sin(time * 0.1) * 0.55;
        out.set(Math.sin(a) * 7.4 * d, 2.7, Math.cos(a) * 7.4 * d); look.set(0, 1.2, 0);
      } else if (st >= 9) {
        const a = this._reduced ? 0 : Math.sin(time * 0.12) * 0.35;
        out.set(Math.sin(a) * 6.4 * d, 2.2, Math.cos(a) * 6.4 * d); look.set(0, 1.15, 0);
      } else if (st >= 7) { out.set(0, 2.3, 6.6 * d); look.set(0, 1.3, 0); }
      else if (st >= 5) { out.set(0.7 * d, 1.7, 4.8 * d); look.set(0, 0.95, 0); }
      else if (st >= 2) { out.set(0, 2.0, 5.6 * d); look.set(0, 0.9, 0); }
      else { out.set(0, 2.6, 7.0 * d); look.set(0, 1.05, 0); }
    }
    _tick() {
      const dt = Math.min(this._clock.getDelta(), 0.05), time = this._clock.elapsedTime;
      const st = this._stage === 0 ? 11 : this._stage, red = this._reduced;
      // grupos: entrada com escala + queda suave
      for (const k in this._G) {
        const g = this._G[k], u = g.userData;
        const on = st >= u.thr;
        u.t = Math.max(0, Math.min(1, u.t + (on ? dt * 1.7 : -dt * 2.5)));
        g.visible = u.t > 0.01;
        if (!g.visible) continue;
        const s = Math.max(easeOutBack(u.t), 0.0001);
        g.scale.setScalar(red ? 1 : s);
        g.position.y = red ? 0 : (1 - easeOutCubic(u.t)) * 0.45;
      }
      // balões flutuam (grupo balão+fio sobe e desce e baloiça junto)
      if (this._G.baloes.visible && !red) {
        this._balloons.forEach((b, i) => {
          b.position.y = b.userData.baseY + Math.sin(time * 0.8 + i * 1.7) * 0.06;
          b.rotation.z = Math.sin(time * 0.5 + i * 2.3) * 0.05;
        });
      }
      // velas tremeluzem
      if (this._G.velas.visible && !red) {
        this._flames.forEach((f, i) => {
          f.scale.y = 1 + Math.sin(time * 13 + i * 2.1) * 0.14 + Math.sin(time * 29 + i) * 0.06;
          f.scale.x = f.scale.z = 1 - Math.sin(time * 17 + i) * 0.06;
        });
        this._candleLights.forEach((l, i) => { l.intensity = 2.6 + Math.sin(time * 11 + i * 3) * 0.7 + Math.sin(time * 27 + i) * 0.3; });
      }
      // néon do painel a respirar
      if (this._neon && this._G.painel.visible) {
        this._neon.material.emissiveIntensity = red ? 1.8 : 1.7 + Math.sin(time * 2.1) * 0.4 + Math.sin(time * 7.3) * 0.12;
      }
      // luzes de fada a cintilar no arco
      if (this._fairy && this._G.baloes.visible) {
        this._fairyParams.forEach((p, i) => {
          const tw = red ? 1 : 0.62 + ((Math.sin(time * 2.6 + p.ph) + 1) / 2) * 0.85;
          this._dummy.position.set(p.x, p.y, -1.38);
          this._dummy.rotation.set(0, 0, 0);
          this._dummy.scale.setScalar(tw);
          this._dummy.updateMatrix();
          this._fairy.setMatrixAt(i, this._dummy.matrix);
        });
        this._fairy.instanceMatrix.needsUpdate = true;
      }
      // final: brilhos + pétalas + luz mais quente
      const finalOn = this._G.final.visible;
      this._sparks.forEach((s) => {
        const v = red ? 1 : (Math.sin(time * 1.6 + s.userData.ph) + 1) / 2;
        s.scale.setScalar(0.4 + v * 0.9); s.material.emissiveIntensity = 0.6 + v * 2.2;
      });
      if (this._petalMesh) {
        this._petalMesh.visible = finalOn && this._petals && !red;
        if (this._petalMesh.visible) {
          this._petalParams.forEach((p, i) => {
            const y = 3.2 - ((time * p.sp + p.ph) % 3.2);
            this._dummy.position.set(p.x + Math.sin(time * 0.9 + p.ph) * p.sw, y, p.z);
            this._dummy.rotation.set(time * p.rs, p.ph, time * p.rs * 0.7);
            this._dummy.scale.setScalar(1);
            this._dummy.updateMatrix();
            this._petalMesh.setMatrixAt(i, this._dummy.matrix);
          });
          this._petalMesh.instanceMatrix.needsUpdate = true;
        }
      }
      // poeira dourada a subir no final
      if (this._motes) {
        this._motes.visible = finalOn && !red;
        if (this._motes.visible) {
          this._moteParams.forEach((p, i) => {
            const y = 0.15 + ((time * p.sp + p.ph) % 2.8);
            this._dummy.position.set(p.x + Math.sin(time * 0.7 + p.ph) * p.sw, y, p.z);
            this._dummy.rotation.set(0, 0, 0);
            this._dummy.scale.setScalar(0.7 + ((Math.sin(time * 2 + p.ph) + 1) / 2) * 0.6);
            this._dummy.updateMatrix();
            this._motes.setMatrixAt(i, this._dummy.matrix);
          });
          this._motes.instanceMatrix.needsUpdate = true;
        }
      }
      const warm = st >= 9 ? 1 : 0;
      // confete no ecrã final
      if (this._confetti) {
        if (this._stage === 10 && !red) {
          if (this._burstT == null || time - this._burstT > 7) this._burstT = time;
          const bt = time - this._burstT;
          this._confetti.visible = bt < 5;
          if (this._confetti.visible) {
            this._confParams.forEach((p, i) => {
              const t = Math.max(bt - p.ph * 0.06, 0);
              const y = 1.3 + p.vy * t - 2.0 * t * t;
              this._dummy.position.set(p.vx * t, Math.max(y, 0.03), -0.2 + p.vz * t);
              this._dummy.rotation.set(t * p.rs, p.ph, t * p.rs * 0.6);
              this._dummy.scale.setScalar(Math.max(1 - t / 4.5, 0.001));
              this._dummy.updateMatrix();
              this._confetti.setMatrixAt(i, this._dummy.matrix);
            });
            this._confetti.instanceMatrix.needsUpdate = true;
          }
        } else { this._burstT = null; this._confetti.visible = false; }
      }
      this._ambient.intensity += ((0.55 + warm * 0.25) - this._ambient.intensity) * dt * 2;
      this._key.intensity += ((2.2 + warm * 0.6) - this._key.intensity) * dt * 2;
      // câmara cinematográfica + parallax
      const pos = this._tmpV = this._tmpV || new this._T.Vector3();
      this._camTarget(time, pos, this._look);
      pos.x += this._px * 0.35; pos.y += -this._py * 0.2;
      const f = 1 - Math.exp(-2.5 * dt);
      this._camera.position.lerp(pos, f);
      this._lookCur.lerp(this._look, f);
      this._camera.lookAt(this._lookCur);
      this._renderer.render(this._scene, this._camera);
    }
  }
  customElements.define('luxo-scene', LuxoScene);
})();
