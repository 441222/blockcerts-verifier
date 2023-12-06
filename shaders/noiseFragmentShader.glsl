precision highp float;

uniform float time;
varying vec2 vUv;



// 単純な2Dノイズ関数
float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
    float r = random(vUv + time); // 時間を追加してアニメーションさせる
    gl_FragColor = vec4(vec3(r > 0.5 ? 1.0 : 0.0), 1.0); // 0.5より大きい場合は白、それ以外は黒
}
