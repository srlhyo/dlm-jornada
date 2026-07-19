/* <luxo-scene stage="0-10" petals="1|0"> — cena 3D "Do Luxo à Mesa" */
(function () {
  if (customElements.get('luxo-scene')) return;
  const THREE_URL = 'https://unpkg.com/three@0.184.0/build/three.module.js';
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
      let THREE;
      try { THREE = await import(THREE_URL); } catch (e) { console.warn('Cena 3D indisponível:', e); return; }
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
        pearl: new THREE.MeshStandardMaterial({ color: 0xFDF8EC, roughness: 0.25, metalness: 0.3 })
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

      // mesa
      const top = mesh(new THREE.BoxGeometry(2.4, 0.08, 0.95), M.wood, 0, 0.72, 0, G.mesa);
      top.receiveShadow = true;
      [[-1.05, -0.35], [1.05, -0.35], [-1.05, 0.35], [1.05, 0.35]].forEach(([x, z]) =>
        mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.7, 12), M.darkGold, x, 0.35, z, G.mesa));

      // toalha
      const cloth = mesh(new THREE.BoxGeometry(2.52, 0.5, 1.06), M.white, 0, 0.55, 0, G.toalha);
      cloth.receiveShadow = true;
      mesh(new THREE.BoxGeometry(2.54, 0.025, 1.08), M.lightGold, 0, 0.335, 0, G.toalha, false);

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

      // centro de mesa
      mesh(new THREE.CylinderGeometry(0.08, 0.055, 0.2, 20), M.gold, 0, 0.9, 0, G.centro);
      [[0, 1.06, 0, 0.09, M.pearl], [-0.09, 1.02, 0.03, 0.06, M.gold], [0.1, 1.03, -0.02, 0.065, M.lightGold],
       [-0.04, 1.12, -0.05, 0.05, M.darkGold], [0.06, 1.12, 0.05, 0.045, M.gold], [-0.11, 1.08, -0.04, 0.04, M.lightGold]]
        .forEach(([x, y, z, r, mat]) => mesh(new THREE.SphereGeometry(r, 20, 16), mat, x, y, z, G.centro, false));

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

      // painel fotografável (arco)
      const panel = mesh(new THREE.BoxGeometry(2.1, 2.2, 0.05), M.cream, 0, 1.2, -1.6, G.painel);
      panel.receiveShadow = true;
      mesh(new THREE.CylinderGeometry(0.05, 0.06, 2.3, 14), M.lightGold, -1.1, 1.15, -1.58, G.painel);
      mesh(new THREE.CylinderGeometry(0.05, 0.06, 2.3, 14), M.lightGold, 1.1, 1.15, -1.58, G.painel);
      const archTrim = mesh(new THREE.TorusGeometry(1.1, 0.05, 10, 40, Math.PI), M.lightGold, 0, 2.3, -1.58, G.painel, false);
      archTrim.rotation.z = 0;
      const flowerCluster = (cx, cy) => {
        [[0, 0, 0.09, M.gold], [0.11, 0.05, 0.07, M.lightGold], [-0.1, 0.06, 0.06, M.pearl],
         [0.05, 0.13, 0.05, M.darkGold], [-0.05, -0.09, 0.055, M.lightGold]]
          .forEach(([dx, dy, r, mat]) => mesh(new THREE.SphereGeometry(r, 16, 12), mat, cx + dx, cy + dy, -1.5, G.painel, false));
      };
      flowerCluster(-0.95, 2.05); flowerCluster(0.98, 1.75); flowerCluster(-1.08, 0.6);

      // balões
      this._balloons = [];
      [[-1.7, 2.3, -0.7, 0.2, M.gold], [-1.35, 2.7, -0.9, 0.14, M.pearl], [1.6, 2.5, -0.6, 0.18, M.lightGold], [1.95, 2.15, -0.9, 0.13, M.gold], [1.3, 2.9, -1.1, 0.11, M.pearl]]
        .forEach(([x, y, z, r, mat]) => {
          const b = mesh(new THREE.SphereGeometry(r, 24, 18), mat, x, y, z, G.baloes, false);
          b.scale.y = 1.15; b.userData.baseY = y;
          const s = mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.6, 6), M.darkGold, x, y - r - 0.3, z, G.baloes, false);
          s.userData = { follow: b, off: -r - 0.3 };
          this._balloons.push(b); this._strings = this._strings || []; this._strings.push(s);
        });
      // grinalda de balões no arco + plintos com flores (referência real da marca)
      const balloonMats = [M.gold, M.pearl, M.lightGold, M.cream];
      const garland = (cx, cy, cz, n, sp) => {
        for (let i = 0; i < n; i++) {
          const r = 0.05 + Math.random() * 0.075;
          const b = mesh(new THREE.SphereGeometry(r, 16, 12), balloonMats[i % 4],
            cx + (Math.random() - 0.5) * sp, cy + (Math.random() - 0.5) * sp * 0.8, cz + (Math.random() - 0.5) * 0.18, G.baloes, false);
          b.scale.y = 1.1;
        }
      };
      garland(-0.95, 2.4, -1.5, 8, 0.5); garland(0.95, 2.25, -1.5, 7, 0.45);
      garland(-1.18, 1.5, -1.5, 5, 0.32); garland(1.18, 0.9, -1.5, 5, 0.3);
      const plinth = (x, h) => {
        const p = mesh(new THREE.CylinderGeometry(0.2, 0.2, h, 24), M.cream, x, h / 2, -1.05, G.painel);
        p.receiveShadow = true;
        mesh(new THREE.CylinderGeometry(0.07, 0.045, 0.16, 16), M.gold, x, h + 0.08, -1.05, G.painel, false);
        [[0, 0.22, 0, 0.09], [-0.1, 0.18, 0.02, 0.06], [0.1, 0.17, -0.02, 0.065], [-0.04, 0.28, -0.04, 0.05], [0.06, 0.27, 0.04, 0.045]]
          .forEach(([dx, dy, dz, r], i) => mesh(new THREE.SphereGeometry(r, 14, 10), balloonMats[(i + 1) % 4], x + dx, h + dy, -1.05 + dz, G.painel, false));
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
      // balões flutuam
      if (this._G.baloes.visible && !red) {
        this._balloons.forEach((b, i) => { b.position.y = b.userData.baseY + Math.sin(time * 0.8 + i * 1.7) * 0.06; });
        (this._strings || []).forEach((s) => { s.position.y = s.userData.follow.position.y + s.userData.off; });
      }
      // velas tremeluzem
      if (this._G.velas.visible && !red) {
        this._flames.forEach((f, i) => {
          f.scale.y = 1 + Math.sin(time * 13 + i * 2.1) * 0.14 + Math.sin(time * 29 + i) * 0.06;
          f.scale.x = f.scale.z = 1 - Math.sin(time * 17 + i) * 0.06;
        });
        this._candleLights.forEach((l, i) => { l.intensity = 2.6 + Math.sin(time * 11 + i * 3) * 0.7 + Math.sin(time * 27 + i) * 0.3; });
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
            this._dummy.updateMatrix();
            this._petalMesh.setMatrixAt(i, this._dummy.matrix);
          });
          this._petalMesh.instanceMatrix.needsUpdate = true;
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
