import { Renderer } from 'phaser';
export class SmokeColorPipeline extends Renderer.WebGL.Pipelines.SinglePipeline {
    constructor(game) {
        super({
            game,
            fragShader: `
                precision mediump float;

                uniform sampler2D uMainSampler;
                varying vec2 outTexCoord;
                uniform vec3 targetColor;
                uniform float tolerance;
                uniform float time;
                uniform float smokeIntensity;

                float rand(vec2 co){
                    return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
                }

                float noise(vec2 p){
                    vec2 i = floor(p);
                    vec2 f = fract(p);
                    float a = rand(i);
                    float b = rand(i + vec2(1.0, 0.0));
                    float c = rand(i + vec2(0.0, 1.0));
                    float d = rand(i + vec2(1.0, 1.0));
                    vec2 u = f * f * (3.0 - 2.0 * f);
                    return mix(a, b, u.x) +
                           (c - a)* u.y * (1.0 - u.x) +
                           (d - b) * u.x * u.y;
                }

                void main() {
                    vec4 color = texture2D(uMainSampler, outTexCoord);
                    float dist = distance(color.rgb, targetColor);
                    float n = noise(outTexCoord * 6.0 + vec2(time * 0.1, time * 0.05));
                    float smoke = smoothstep(tolerance, tolerance * 0.5, dist);
                    smoke *= n * smokeIntensity;
                    vec3 smokeColor = mix(color.rgb, vec3(0.5), smoke);
                    gl_FragColor = vec4(smokeColor, color.a);
                }
            `
        });
    }
}
