import createTokenizer from "../src/tokenizer";
import { parse } from "svelte/compiler";

describe("when given a javascript expression as class attribute", function () {
  const code = `
<style>
  .active{
    color: green;
  }
</style>

<h1 class={"active"}></h1>`;

  const filename = "index.svelte";

  const classCache = {};
  const declarationCache = {};
  const tokenizer = createTokenizer(classCache, declarationCache);
  const ast = parse(code, { filename });
  tokenizer.generateToken(ast.css, filename);
  
  it("should fill the class cache correctly", function () {
    expect(classCache).toStrictEqual({
      "index.svelte": { active: { a: true } },
    });
  });
});

describe("when given an dynamic javascript expression as class attribute", function () {
  const code = `<script>
  export let isActive = true
</script>

<style>
  .active{
    color: green;
  }
  .inactive{
    color: red;
  }
</style>

<h1 class={isActive ? "active" : "inactive"}></h1>`;

  const filename = "index.svelte";

  it("should fill the class cache correctly", function () {
    const classCache = {};
    const declarationCache = {};
    const tokenizer = createTokenizer(classCache, declarationCache);
    const ast = parse(code, { filename });
    tokenizer.generateToken(ast.css, filename);
    expect(classCache).toStrictEqual({
      "index.svelte": {
        active: { a: true },
        inactive: { b: true },
      },
    });
  });
});

describe("when given a css declaration with psuedo elements", function () {
  const code = `
<style>
  .title::before{
    color: green;
  }
</style>

<h1 class={"title"}></h1>`;

  const filename = "index.svelte";

  const classCache = {};
  const declarationCache = {};
  const tokenizer = createTokenizer(classCache, declarationCache);
  const ast = parse(code, { filename });
  tokenizer.generateToken(ast.css, filename);

  it("should fill the declaration cache correctly", function () {
    expect(declarationCache).toStrictEqual({ none: { "color:green;": "a" } });
  });

  it("should fill the class cache correctly", function () {
    expect(classCache).toStrictEqual({
      "index.svelte": { "title::before": { a: true } },
    });
  });
});

describe("when given a css declaration with psuedo class", function () {
  const code = `
<style>
  .title:hover{
    color: green;
  }
</style>

<h1 class={"title"}></h1>`;

  const filename = "index.svelte";

  const classCache = {};
  const declarationCache = {};
  const tokenizer = createTokenizer(classCache, declarationCache);
  const ast = parse(code, { filename });
  tokenizer.generateToken(ast.css, filename);

  it("should fill the declaration cache correctly", function () {
    expect(declarationCache).toStrictEqual({ none: { "color:green;": "a" } });
  });

  it("should fill the class cache correctly", function () {
    expect(classCache).toStrictEqual({
      "index.svelte": { "title:hover": { a: true } },
    });
  });
});
