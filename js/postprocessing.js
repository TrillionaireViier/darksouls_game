// ==========================================
// DARK SOULS AAA CINEMATIC POST-PROCESSING PIPELINE
// 9-Tap HDR Bloom, ACES Filmic Tone Mapping, 
// Dark Souls Color Grading, Vignette & Micro-Grain
// ==========================================

class DarkSoulsPostProcessing {
    constructor(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.enabled = true;
        this.time = 0;

        const width = window.innerWidth;
        const height = window.innerHeight;
        const pr = Math.min(window.devicePixelRatio || 1, 2);

        // HDR Render Target for 3D Scene Pass
        const pars = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            stencilBuffer: false,
            depthBuffer: true
        };

        this.renderTarget = new THREE.WebGLRenderTarget(
            Math.floor(width * pr),
            Math.floor(height * pr),
            pars
        );

        // Orthographic 2D Compositing Pass
        this.postScene = new THREE.Scene();
        this.postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        // Composite Shader Material
        this.postMaterial = new THREE.ShaderMaterial({
            uniforms: {
                tDiffuse: { value: this.renderTarget.texture },
                resolution: { value: new THREE.Vector2(width * pr, height * pr) },
                time: { value: 0.0 },
                bloomIntensity: { value: 0.42 },
                vignetteStrength: { value: 1.15 },
                filmGrainStrength: { value: 0.022 },
                colorGradingStrength: { value: 0.65 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = vec4(position.xy, 0.0, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform vec2 resolution;
                uniform float time;
                uniform float bloomIntensity;
                uniform float vignetteStrength;
                uniform float filmGrainStrength;
                uniform float colorGradingStrength;
                varying vec2 vUv;

                // ACES Filmic S-Curve Tone Mapping
                vec3 acesFilmic(vec3 x) {
                    float a = 2.51;
                    float b = 0.03;
                    float c = 2.43;
                    float d = 0.59;
                    float e = 0.14;
                    return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
                }

                void main() {
                    vec2 uv = vUv;
                    vec4 base = texture2D(tDiffuse, uv);
                    vec3 col = base.rgb;

                    // 1. 9-Tap Luminance Bloom Blur (Soft soul-fire & sun halo)
                    vec2 texel = 1.0 / resolution;
                    vec3 bloom = vec3(0.0);
                    float weights[5];
                    weights[0] = 0.2270;
                    weights[1] = 0.1945;
                    weights[2] = 0.1216;
                    weights[3] = 0.0540;
                    weights[4] = 0.0162;

                    for (int i = 1; i < 5; i++) {
                        float dist = float(i) * 2.8;
                        vec3 s1 = texture2D(tDiffuse, uv + vec2(dist, 0.0) * texel).rgb;
                        vec3 s2 = texture2D(tDiffuse, uv - vec2(dist, 0.0) * texel).rgb;
                        vec3 s3 = texture2D(tDiffuse, uv + vec2(0.0, dist) * texel).rgb;
                        vec3 s4 = texture2D(tDiffuse, uv - vec2(0.0, dist) * texel).rgb;

                        float lum1 = dot(s1, vec3(0.299, 0.587, 0.114));
                        float lum2 = dot(s2, vec3(0.299, 0.587, 0.114));
                        float lum3 = dot(s3, vec3(0.299, 0.587, 0.114));
                        float lum4 = dot(s4, vec3(0.299, 0.587, 0.114));

                        float b1 = max(0.0, lum1 - 1.05);
                        float b2 = max(0.0, lum2 - 1.05);
                        float b3 = max(0.0, lum3 - 1.05);
                        float b4 = max(0.0, lum4 - 1.05);

                        bloom += (s1 * b1 + s2 * b2 + s3 * b3 + s4 * b4) * weights[i];
                    }
                    col += bloom * bloomIntensity;

                    // 2. Dark Souls 3 / Elden Ring Cinematic Color Grading
                    // Cool slate-teal in deep shadows, warm earthy stone in midtones, golden sun in highlights
                    float lum = dot(col, vec3(0.299, 0.587, 0.114));
                    vec3 shadowTint = vec3(0.90, 0.96, 1.04);
                    vec3 midTint    = vec3(1.03, 0.99, 0.94);
                    vec3 highTint   = vec3(1.08, 1.03, 0.95);

                    vec3 graded = col;
                    graded *= mix(shadowTint, midTint, smoothstep(0.0, 0.5, lum));
                    graded = mix(graded, graded * highTint, smoothstep(0.5, 1.0, lum));

                    // Cinematic Contrast S-Curve (smooth, avoids crushing darks or blowing highlights)
                    vec3 curve = graded * graded * (3.0 - 2.0 * graded);
                    graded = mix(graded, curve, 0.35);
                    col = mix(col, graded, colorGradingStrength);

                    // 3. Cinematic Vignette (Subtle lens perimeter falloff)
                    float d = distance(uv, vec2(0.5));
                    float vig = smoothstep(0.92, 0.42, d * vignetteStrength);
                    col *= vig;

                    // 4. Micro Film Grain (Tactile dark fantasy realism & anti-banding)
                    float noise = fract(sin(dot(uv * (time * 0.05 + 1.0), vec2(12.9898, 78.233))) * 43758.5453);
                    col += (noise - 0.5) * filmGrainStrength;

                    // 5. ACES Filmic Tone Mapping
                    col = acesFilmic(col);

                    gl_FragColor = vec4(col, 1.0);
                }
            `,
            depthTest: false,
            depthWrite: false
        });

        const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.postMaterial);
        this.postScene.add(quad);
    }

    setSize(width, height) {
        const pr = Math.min(window.devicePixelRatio || 1, 2);
        const w = Math.floor(width * pr);
        const h = Math.floor(height * pr);
        this.renderTarget.setSize(w, h);
        this.postMaterial.uniforms.resolution.value.set(w, h);
    }

    render(delta) {
        this.time += delta;
        this.postMaterial.uniforms.time.value = this.time;

        // 1. Render 3D scene to offscreen HDR target
        this.renderer.setRenderTarget(this.renderTarget);
        this.renderer.clear();
        this.renderer.render(this.scene, this.camera);

        // 2. Composite post-processing shader to screen canvas
        this.renderer.setRenderTarget(null);
        this.renderer.render(this.postScene, this.postCamera);
    }
}

if (typeof window !== 'undefined') {
    window.DarkSoulsPostProcessing = DarkSoulsPostProcessing;
}
