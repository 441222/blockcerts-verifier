precision mediump float;

uniform float time; // 時間ユニフォーム
uniform vec2 resolution; // 画面の解像度
uniform float isDarkMode; // ダークモードが有効かどうかを示すユニフォーム

vec3 permute(vec3 x) {
  return mod((34.0 * x + 1.0) * x, 289.0);
}
// Hue to RGB conversion
vec3 hueToRgb(float h) {
    float r = abs(h * 6.0 - 3.0) - 1.0;
    float g = 2.0 - abs(h * 6.0 - 2.0);
    float b = 2.0 - abs(h * 6.0 - 4.0);
    return clamp(vec3(r, g, b), 0.0, 1.0);
}

// Cellular noise
vec2 cellular(vec2 P) {
#define K 0.142857142857 // 1/7
#define Ko 0.428571428571 // 3/7
#define jitter 1.0 // Less gives more regular pattern
	vec2 Pi = mod(floor(P), 289.0);
	vec2 Pf = fract(P);
	vec3 oi = vec3(-1.0, 0.0, 1.0);
	vec3 of = vec3(-0.5, 0.5, 1.5);
	vec3 px = permute(Pi.x + oi);
	vec3 p = permute(px.x + Pi.y + oi);
	vec3 ox = fract(p*K) - Ko;
	vec3 oy = mod(floor(p*K),7.0)*K - Ko;
	vec3 dx = Pf.x + 0.5 + jitter*ox;
	vec3 dy = Pf.y - of + jitter*oy;
	vec3 d1 = dx * dx + dy * dy;
	p = permute(px.y + Pi.y + oi);
	ox = fract(p*K) - Ko;
	oy = mod(floor(p*K),7.0)*K - Ko;
	dx = Pf.x - 0.5 + jitter*ox;
	dy = Pf.y - of + jitter*oy;
	vec3 d2 = dx * dx + dy * dy;
	p = permute(px.z + Pi.y + oi);
	ox = fract(p*K) - Ko;
	oy = mod(floor(p*K),7.0)*K - Ko;
	dx = Pf.x - 1.5 + jitter*ox;
	dy = Pf.y - of + jitter*oy;
	vec3 d3 = dx * dx + dy * dy;
	vec3 d1a = min(d1, d2);
	d2 = max(d1, d2);
	d2 = min(d2, d3);
	d1 = min(d1a, d2);
	d2 = max(d1a, d2);
	d1.xy = (d1.x < d1.y) ? d1.xy : d1.yx;
	d1.xz = (d1.x < d1.z) ? d1.xz : d1.zx;
	d1.yz = min(d1.yz, d2.yz);
	d1.y = min(d1.y, d1.z);
	d1.y = min(d1.y, d2.x);
	return sqrt(d1.xy);
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
	vec2 position = uv * 2.0 - 1.0;
	position.x *= resolution.x / resolution.y;

	position = position * (.1 + .5 * (sin(time * .001) * 2.5)); // slowed down motion

	vec2 cec  = cellular(.35 + vec2(0.,time * .2) + position * (9. + sin(time * .01)));
    vec2 cec2 = cellular(2.+position*4.)+cos(position.y*12.)*.3;

    cec = min(cec, cec2);


    float rand = mod(fract(sin(dot(uv, vec2(12.9898,1980.223 + time))) * 43758.5453), .05);
    float l = pow(1. - sin(cec.y), .5 + (sin(time * .0011) * .3));
    float l2 = pow(1. - sin(cec.x), 1.5 + (sin(time * .001) * .3));
    l = min(l, l2);
    float v = length(uv + 1.0);
    v = smoothstep(v, 0.85, 0.65);

    vec3 color = hueToRgb(l);
    color += vec3(rand);
    color = mix(color, vec3(1.0), 0.8); // 白っぽくするためのミックス
    color *= vec3(v); // グラデーションの影響を強化

    // ダークモードの調整
    if (isDarkMode > 0.5) {
        color = mix(color, vec3(1.0) - color, 1.0); // 色の反転を少し柔らかくする
    }

    gl_FragColor = vec4(color, 1.0); // アルファ値を1.0に設定
}