precision lowp float;


uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform int iFrame;  // 追加: フレーム数
uniform vec4 iDate;  // 追加: 現在の日時
uniform int uThickness;  // 追加: ミミズの太さを制御

varying vec2 vUvs;


float gdv(vec2 off, int v) {
    vec4 dm = vec4(uResolution.x, uResolution.y, 1.0, 0.0);
    vec2 fc = vUvs * uResolution;
    vec2 dc = vec2(dm.x / dm.z, dm.y / dm.z);
    float cx = mod(fc.x + off.x, dc.x) + floor(fc.x / dc.x) * dc.x;
    float cy = mod(fc.y + off.y, dc.y) + floor(fc.y / dc.y) * dc.y;
    vec4 pxdata = texture2D(uTexture, vec2(cx, cy) / uResolution);
    return pxdata[v];
}


vec2 ring(vec2 r, int c) {
    const float w = 1.0; 
    const uint tmx = 65536u;
    const float psn = float(tmx);
    float d = 0.0;
    float a = 0.0;
    float b = 0.0;
    float t = 0.0;

    for(float i = -r[0]; i <= r[0]; i+=1.0) {
        for(float j = -r[0]; j <= r[0]; j+=1.0) {
            d = round(sqrt(i*i+j*j));
            if(d <= r[0] && d > r[1]) {
                t = gdv(vec2(i,j), c) * w * psn;
                a += t - fract(t);
                b += w * psn;
            }
        }
    }
    return vec2(a, b);
}

float get_xc(float x, float y, float xmod) {
	float sq = sqrt(mod(x*y+y, xmod)) / sqrt(xmod);
	float xc = mod((x*x)+(y*y), xmod) / xmod;
	return clamp((sq+xc)*0.5, 0.0, 1.0); }
float shuffle(float x, float y, float xmod, float val) {
	val = val * mod( x*y + x, xmod );
	return (val-floor(val)); }
float get_xcn(float x, float y, float xm0, float xm1, float ox, float oy) {
	float  xc = get_xc(x+ox, y+oy, xm0);
	return shuffle(x+ox, y+oy, xm1, xc); }
float get_lump(float x, float y, float nhsz, float xm0, float xm1) {
	float 	nhsz_c 	= 0.0;
	float 	xcn 	= 0.0;
	float 	nh_val 	= 0.0;
	for(float i = -nhsz; i <= nhsz; i += 1.0) {
		for(float j = -nhsz; j <= nhsz; j += 1.0) {
			nh_val = round(sqrt(i*i+j*j));
			if(nh_val <= nhsz) {
				xcn = xcn + get_xcn(x, y, xm0, xm1, i, j);
				nhsz_c = nhsz_c + 1.0; } } }
	float 	xcnf 	= ( xcn / nhsz_c );
	float 	xcaf	= xcnf;
	for(float i = 0.0; i <= nhsz; i += 1.0) {
			xcaf 	= clamp((xcnf*xcaf + xcnf*xcaf) * (xcnf+xcnf), 0.0, 1.0); }
	return xcaf; }
float reseed(int seed) {
	vec4	fc = gl_FragCoord;
	float 	r0 = get_lump(fc[0], fc[1],  2.0, 19.0 + mod(iDate[3]+float(seed),17.0), 23.0 + mod(iDate[3]+float(seed),43.0));
	float 	r1 = get_lump(fc[0], fc[1], 14.0, 13.0 + mod(iDate[3]+float(seed),29.0), 17.0 + mod(iDate[3]+float(seed),31.0));
	float 	r2 = get_lump(fc[0], fc[1],  6.0, 13.0 + mod(iDate[3]+float(seed),11.0), 51.0 + mod(iDate[3]+float(seed),37.0));
	return clamp((r0+r1)-r2,0.0,1.0); }


void main() {
    float ref_r = gdv(vec2(0.0, 0.0), 0);
    float ref_g = gdv(vec2(0.0, 0.0), 1);
    float ref_b = gdv(vec2(0.0, 0.0), 2);
    
    vec3 res_c = vec3(ref_r, ref_g, ref_b);

    vec2 nh_0 = ring(vec2(7,7-uThickness), 0);
    float nh0 = nh_0[0] / nh_0[1];

    vec2 nh_1 = ring(vec2(3,3-uThickness), 0);
    float nh1 = nh_1[0] / nh_1[1];

    if( nh0 >= 0.185	&& nh0 <= 0.200 ) { res_c[0] = 1.0; }
    if( nh0 >= 0.343	&& nh0 <= 0.580 ) { res_c[0] = 0.0; }
    if( nh0 >= 0.750	&& nh0 <= 0.850 ) { res_c[0] = 0.0; }
    if( nh1 >= 0.150	&& nh1 <= 0.280 ) { res_c[0] = 0.0; }
    if( nh1 >= 0.445	&& nh1 <= 0.680 ) { res_c[0] = 1.0; }
    if( nh0 >= 0.150	&& nh0 <= 0.180 ) { res_c[0] = 0.0; }

    res_c[1] = res_c[0];
    res_c[2] = res_c[0];
    
    if (iFrame == 0) { res_c[0] = reseed(0); res_c[1] = reseed(1); res_c[2] = reseed(2); }

    gl_FragColor = vec4(res_c[0], res_c[1], res_c[2], 1.0);
}
