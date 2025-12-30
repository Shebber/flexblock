import { PrismaClient } from "@prisma/client";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";

const prisma = new PrismaClient();

export async function getServerSideProps(context) {
  const { publicId } = context.params;

  const order = await prisma.order.findUnique({
    where: { publicId },
  });

  if (!order) {
    return { props: { found: false, publicId } };
  }

  return {
    props: {
      found: true,
      order: JSON.parse(JSON.stringify(order)),
      publicId,
    },
  };
}

export default function VerifyPage({ found, order, publicId }) {
  const canvasRef = useRef(null);

  // NFC “Tap” timestamp (client-side)
  const [tappedAt, setTappedAt] = useState("");
  useEffect(() => {
    try {
      setTappedAt(
        new Date().toLocaleString(undefined, {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } catch {
      setTappedAt(new Date().toString());
    }
  }, []);

  // WebGL background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: true, antialias: false });
    if (!gl) return;

    const vertSrc = `
      attribute vec2 a;
      void main(){ gl_Position = vec4(a, 0.0, 1.0); }
    `;
    const fragSrc = `
      precision highp float;
      uniform vec2 r;
      uniform float t;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
      float noise(vec2 p){
        vec2 i = floor(p), f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0,0.0));
        float c = hash(i + vec2(0.0,1.0));
        float d = hash(i + vec2(1.0,1.0));
        vec2 u = f*f*(3.0-2.0*f);
        return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
      }
      void main(){
        vec2 uv = gl_FragCoord.xy / r.xy;
        vec2 p = uv*1.4;
        float n1 = noise(p*3.0 + vec2(0.0, t*0.3));
        float n2 = noise(p*8.0 + vec2(t*0.2, -t*0.3));
        float scan = sin(uv.y*1200.0 + t*18.0)*0.04;
        float drift = noise(vec2(uv.y*40.0, t*0.8))*0.10;
        float g = n1*0.6 + n2*0.3 + scan + drift;
        vec3 base = vec3(0.02, 0.0, 0.06);
        vec3 mag  = vec3(1.0, 0.0, 1.0);
        vec3 c = base + mag * (0.25 + g*0.4);
        vec2 d = uv-0.5; float vig = 1.0 - dot(d,d)*1.1;
        c *= clamp(vig, 0.15, 1.0);
        gl_FragColor = vec4(c, 1.0);
      }
    `;

    function compile(type, src) {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return sh;
    }

    const vs = compile(gl.VERTEX_SHADER, vertSrc);
    const fs = compile(gl.FRAGMENT_SHADER, fragSrc);

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const a = gl.getAttribLocation(prog, "a");
    const ur = gl.getUniformLocation(prog, "r");
    const ut = gl.getUniformLocation(prog, "t");

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(a);
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);

    function resize() {
      const w = innerWidth * devicePixelRatio;
      const h = innerHeight * devicePixelRatio;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    }
    window.addEventListener("resize", resize);
    resize();

    const start = performance.now();
    let raf = null;

    const loop = () => {
      const tt = (performance.now() - start) / 1000;
      gl.uniform2f(ur, canvas.width, canvas.height);
      gl.uniform1f(ut, tt);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener("resize", resize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // NOT FOUND
  if (!found) {
    return (
      <>
        <Head>
          <title>Flexblock – Verify</title>
          <meta name="description" content="Flexblock Verify – NFC authenticity check." />
          <link
            href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;600&display=swap"
            rel="stylesheet"
          />
        </Head>

        <canvas id="gl" ref={canvasRef} />

        <header>
          <img src="/assets/flexblock_wordmark_col.svg" alt="Flexblock" className="wordmark-img" />
          <span className="tag">VERIFY</span>
        </header>

        <img src="/assets/flexblock_icon_sw.svg" alt="" className="icon-watermark" />

        <main className="wrap">
          <section className="card">
            <div className="meta">
              <div className="badge badge--bad">● not verified</div>
              <h1 className="h1">No record found</h1>

              <div className="kv">
                <div className="k">NFC ID</div>
                <div className="v">
                  <span className="code">{publicId}</span>
                </div>
              </div>

              {tappedAt ? (
                <div className="kv">
                  <div className="k">Tapped</div>
                  <div className="v">{tappedAt}</div>
                </div>
              ) : null}

              <div className="muted">
                This NFC tag is not linked to a registered Flexblock order.
              </div>
            </div>
          </section>
        </main>

        <footer className="fixed-footer">© {new Date().getFullYear()} Flexblock</footer>

        <GlobalStyles />
      </>
    );
  }

  // DATA (minimal)
  const explorer = order.txHash
    ? `${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${order.txHash}`
    : null;

  const artUrl = order.nftImage || "";
  const chainLabel = "ApeChain"; // display only (store chain later if needed)

  const statusLabel =
    order.status === "paid"
      ? "in production"
      : order.status === "shipped"
      ? "shipped"
      : order.status || "pending";

  return (
    <>
      <Head>
        <title>Flexblock – Verify</title>
        <meta name="description" content="Flexblock Verify – NFC authenticity check." />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <canvas id="gl" ref={canvasRef} />

      <header>
        <img src="/assets/flexblock_wordmark_col.svg" alt="Flexblock" className="wordmark-img" />
        <span className="tag">VERIFY</span>
      </header>

      <img src="/assets/flexblock_icon_sw.svg" alt="" className="icon-watermark" />

      <main className="wrap">
        <section className="card">
          <div className="grid">
            <div className="art">
              {artUrl ? (
                <img alt="Artwork" src={artUrl} />
              ) : (
                <div className="art-placeholder">No artwork</div>
              )}
            </div>

            <div className="meta">
              <div className="badge">● verified • NFC linked</div>
              <h1 className="h1">Flexblock Authenticity</h1>

              <div className="kv">
                <div className="k">NFC ID</div>
                <div className="v">
                  <span className="code">{publicId}</span>
                </div>
              </div>

              {tappedAt ? (
                <div className="kv">
                  <div className="k">Tapped</div>
                  <div className="v">{tappedAt}</div>
                </div>
              ) : null}

              <div className="kv">
                <div className="k">Chain</div>
                <div className="v">{chainLabel}</div>
              </div>

              <div className="kv">
                <div className="k">Contract</div>
                <div className="v">
                  <span className="code">{order.nftContract || "—"}</span>
                </div>
              </div>

              <div className="kv">
                <div className="k">Token</div>
                <div className="v">{order.nftTokenId ?? "—"}</div>
              </div>

              <div className="kv">
                <div className="k">Owner</div>
                <div className="v">
                  <span className="code">{order.wallet || "—"}</span>
                </div>
              </div>

              <div className="kv">
                <div className="k">Backplate</div>
                <div className="v">{order.backplateCode || order.backplate || "—"}</div>
              </div>

              <div className="kv">
                <div className="k">Status</div>
                <div className="v">
                  <span
                    className={
                      order.status === "shipped"
                        ? "pill pill--ok"
                        : order.status === "paid"
                        ? "pill pill--warn"
                        : "pill"
                    }
                  >
                    {statusLabel}
                  </span>
                </div>
              </div>

              {explorer ? (
                <div className="actions">
                  <a className="btn" href={explorer} target="_blank" rel="noreferrer">
                    View transaction
                  </a>
                </div>
              ) : null}

              <div className="muted" style={{ marginTop: 10 }}>
                This page is intentionally minimal: it only proves authenticity and on-chain linkage.
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="fixed-footer">© {new Date().getFullYear()} Flexblock</footer>

      <GlobalStyles />
    </>
  );
}

function GlobalStyles() {
  return (
    <style jsx global>{`
      :root {
        --bg: #180018;
        --text: #f1f1f1;
        --muted: #a2a8b4;
        --magenta: #ff33ff;
        --ok: #00ffa7;
        --border: #2a002a;
      }

      * { box-sizing: border-box; }
      html, body { height: 100%; margin: 0; padding: 0; overflow-x: hidden; }

      body {
        background: var(--bg);
        color: var(--text);
        font-family: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      }

      #gl {
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        display: block;
        z-index: 0;
      }

      header {
        position: fixed;
        top: calc(env(safe-area-inset-top, 0px) + 16px);
        left: 16px;
        z-index: 3;
        display: flex;
        align-items: center;
        gap: 10px;
        filter: drop-shadow(0 0 6px rgba(255,0,255,0.3));
      }

      .wordmark-img { height: 48px; width: auto; margin-top: 2px; display: block; }
      @media (max-width: 480px) { .wordmark-img { height: 36px; } }

      .tag {
        font-weight: 400;
        color: var(--muted);
        border: 1px solid var(--border);
        padding: 4px 8px;
        border-radius: 10px;
      }

      .icon-watermark {
        position: fixed;
        right: 2vw;
        bottom: 2vh;
        opacity: 0.06;
        width: min(42vw, 500px);
        pointer-events: none;
        z-index: 1;
        user-select: none;
      }

      .wrap {
        position: relative;
        z-index: 2;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 100px 16px 40px;
      }

      .card {
        width: min(1000px, 90vw);
        background: rgba(10,10,10,0.78);
        border: 1px solid var(--border);
        border-radius: 20px;
        padding: 24px;
        backdrop-filter: blur(6px);
        box-shadow: 0 12px 40px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,0,255,0.06);
      }

      .grid {
        display: grid;
        gap: 20px;
        grid-template-columns: 1.1fr 0.9fr;
        align-items: start;
      }

      .art {
        border: 1px solid var(--border);
        border-radius: 16px;
        overflow: hidden;
        background: #0d0d0d;
      }

      .art img { width: 100%; height: auto; display: block; object-fit: contain; }
      .art-placeholder { padding: 40px; text-align: center; color: var(--muted); }

      .meta { display: grid; gap: 12px; align-content: start; min-width: 0; }

      .h1 {
        font-size: clamp(22px, 2.6vw, 30px);
        margin: 0;
        text-shadow: 0 0 12px rgba(255,0,255,0.15);
      }

      .badge {
        color: var(--magenta);
        border: 1px solid rgba(255,0,255,0.35);
        padding: 6px 10px;
        border-radius: 999px;
        font-size: 12px;
        background: rgba(255,0,255,0.08);
        width: fit-content;
      }
      .badge--bad {
        color: #ff6b6b;
        border-color: rgba(255,107,107,0.35);
        background: rgba(255,107,107,0.08);
      }

      .kv { display: grid; grid-template-columns: 110px 1fr; gap: 6px; font-size: 14px; }
      .k { color: var(--muted); }
      .v { min-width: 0; }

      .code {
        display: inline-block;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        background: #0d0d0d;
        border: 1px dashed #262626;
        padding: 4px 6px;
        border-radius: 8px;
      }

      .actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px; }

      .btn {
        border: 1px solid rgba(255,0,255,0.45);
        background: rgba(255,0,255,0.08);
        color: var(--text);
        padding: 10px 14px;
        border-radius: 12px;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease;
      }
      .btn:hover {
        transform: translateY(-1px);
        border-color: rgba(0,255,167,0.55);
        background: rgba(0,255,167,0.08);
      }

      .pill {
        display: inline-flex;
        align-items: center;
        padding: 4px 8px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,0.15);
        background: rgba(255,255,255,0.05);
        font-size: 12px;
        color: var(--text);
      }
      .pill--warn { border-color: rgba(255,0,255,0.35); background: rgba(255,0,255,0.08); }
      .pill--ok { border-color: rgba(0,255,167,0.35); background: rgba(0,255,167,0.08); color: var(--ok); }

      .muted { color: var(--muted); font-size: 12px; }

      .fixed-footer {
        position: fixed;
        right: 16px;
        top: 16px;
        color: var(--muted);
        font-size: 12px;
        z-index: 3;
      }

      @media (max-width: 900px) {
        .grid { grid-template-columns: 1fr; }
        .art { width: 70vw; margin: 0 auto 10px; }
        .card { width: 90vw; word-break: break-word; overflow-wrap: anywhere; }
        .code { white-space: normal; word-break: break-all; }
      }
    `}</style>
  );
}

