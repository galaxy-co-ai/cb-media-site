Shader debugging workflow for the cinematic intro. Use when something renders incorrectly, shows black, or produces unexpected visual output.

## Steps

1. **Read all shader files** in the project:
   - Glob for `src/shaders/**/*.{vert,frag,glsl}`
   - Also check inline shaders in `src/components/intro/**/*.tsx` (template literals assigned to `vertexShader`/`fragmentShader`)

2. **Common GLSL errors to check:**
   - Missing precision qualifier (`precision highp float;`)
   - Undeclared or misspelled uniforms/varyings
   - Type mismatches (vec3 assigned to vec4, float vs int)
   - Missing `gl_FragColor` or `gl_Position` assignment
   - Division by zero (check all denominators, especially distance calculations)
   - `texture2D` vs `texture` (depends on GLSL version)
   - Forgetting to normalize vectors before dot products
   - `mod()` with negative values behaving differently than expected

3. **Verify uniform bindings** match between JavaScript and GLSL:
   - Read the R3F component that creates the shader material
   - Compare every `uniform` declared in GLSL with the JS `uniforms` object
   - Check types match: JS `new THREE.Vector2()` = GLSL `vec2`, `{ value: 0.0 }` = `float`, etc.
   - Check that animated uniforms (GSAP targets) reference the actual `.value` property

4. **Verify texture bindings** for GPGPU:
   - FBO ping-pong: are read/write targets being swapped correctly?
   - Is the position texture being passed to the render shader?
   - Are texture dimensions consistent (512x512 or whatever the tier dictates)?

5. **Check render pipeline:**
   - Is the shader material applied to the correct mesh/points?
   - Is `transparent: true` set if using alpha?
   - Is `depthWrite: false` set for particles?
   - Is `blending: THREE.AdditiveBlending` set for glow effects?

6. **Performance flags:**
   - Any `pow()` calls in fragment shader that could be replaced with multiplication?
   - Any texture lookups in loops? (expensive)
   - Is `discard` being used? (breaks early-Z on some GPUs)

7. **Report format:**
   ```
   Shader Debug — [filename]

   Errors found:
   1. [error + exact line + fix]

   Warnings:
   1. [potential issue + suggestion]

   Uniform binding check:
   - [uniform name]: JS ✓/✗ | GLSL ✓/✗ | Type match ✓/✗
   ```

8. If the shader compiles but renders wrong, suggest adding debug outputs:
   - Set `gl_FragColor = vec4(normalizedValue, 0.0, 0.0, 1.0)` to visualize a single value as red intensity
   - This is the WebGL equivalent of `console.log`
