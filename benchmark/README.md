# Benchmark

The example repo is taken from [sveltekit](https://github.com/sveltejs/kit/tree/af88239e3b0e361faa5abe33fd6365abd1a0fea7) example.

Apart from switching to [static-adaptor](https://www.npmjs.com/package/@sveltejs/adapter-static/v/next) for comparing HTML size, no change has been made.

## The benchmark is created based on the following commands:

```sh
npm install
npm run build
# For CSS size
dua ./build/_app/**/*.css -A
```

## Result

### Without `glory-svelte-preprocess`

```
lorri-keep-env-hack-nix-shell ❮ dua ./build/_app/**/*.css -A
    155  B ./build/_app/assets/pages/__error.svelte-66d11879.css
    161  B ./build/_app/assets/start-61d1577b.css
    567  B ./build/_app/assets/pages/[list]/[page].svelte-d37502c6.css
   1.27 KB ./build/_app/assets/pages/item/[id].svelte-49e2747f.css
   2.33 KB ./build/_app/assets/pages/__layout.svelte-8e782774.css
   4.49 KB total
```

### With `glory-svelte-preprocess`(`lazyLoad: true`)


```
lorri-keep-env-hack-nix-shell ❯ dua ./build/_app/**/*.css -A
    120  B ./build/_app/assets/pages/__error.svelte-54916324.css
    161  B ./build/_app/assets/start-61d1577b.css
    356  B ./build/_app/assets/pages/[list]/[page].svelte-032357a2.css
    775  B ./build/_app/assets/pages/item/[id].svelte-92279eba.css
   2.36 KB ./build/_app/assets/pages/__layout.svelte-2529585e.css
   3.78 KB total
```

### With `glory-svelte-preprocess`(`lazyLoad: false`)

TODO

```

```
