import createTokenizer from "../src/tokenizer";
import { getProxiedObject } from "../src/helper";
import { parse } from "svelte/compiler";
import path from "path";

describe("when given multiple rules with identical declaration", function () {
  const code = `
<style>
  .layout-1{
    display: flex;
  }
      
  .layout-2{
    display: flex;
  }
</style>`;

  const filename = "/src/index.svelte";

  const classCache = getProxiedObject();
  const declarationCache = getProxiedObject();

  const tokenizer = createTokenizer(classCache, declarationCache);
  const ast = parse(code, { filename });
  const parsedPath = path.parse(filename);
  tokenizer.generateToken(ast.css, parsedPath);

  it("should share that token of that declaration in cache", function () {
    expect(classCache).toEqual(
      expect.objectContaining({
        "/src": {
          "index.svelte": { ".layout-1": { a: true }, ".layout-2": { a: true } },
        },
      })
    );
  });
});

describe("when given multiple components", function () {
  describe("when given multiple rules with identical declaration", function () {
    const code1 = `
<style>
  .layout-1{
    display: flex;
  }
</style>`;

    const code2 = `
<style>
  .layout-2{
    display: flex;
  }
</style>`;

    const classCache = getProxiedObject();
    const declarationCache = getProxiedObject();
    const tokenizer = createTokenizer(classCache, declarationCache);

    const list = [
      [code1, "/src/index.svelte"],
      [code2, "/src/dummy.svelte"],
    ];

    for (const [code, filename] of list) {
      const ast = parse(code, { filename });
      const parsedPath = path.parse(filename);
      tokenizer.generateToken(ast.css, parsedPath);
    }

    it("should share that token of that declaration in cache", function () {
      expect(classCache).toEqual(
        expect.objectContaining({
          "/src": {
            "index.svelte": { ".layout-1": { a: true } },
            "dummy.svelte": { ".layout-2": { a: true } },
          },
        })
      );
    });
  });
});

describe("when given a javascript expression as class attribute", function () {
  const code = `
<style>
  .active{
    color: green;
  }
</style>

<h1 class={"active"}></h1>`;

  const filename = "/src/index.svelte";

  const classCache = getProxiedObject();
  const declarationCache = getProxiedObject();
  const tokenizer = createTokenizer(classCache, declarationCache);
  const ast = parse(code, { filename });
  const parsedPath = path.parse(filename);
  tokenizer.generateToken(ast.css, parsedPath);

  it("should fill the class cache correctly", function () {
    expect(classCache).toEqual(
      expect.objectContaining({
        "/src": {
          "index.svelte": { ".active": { a: true } },
        },
      })
    );
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

  const filename = "/src/index.svelte";

  it("should fill the class cache correctly", function () {
    const classCache = getProxiedObject();
    const declarationCache = getProxiedObject();
    const tokenizer = createTokenizer(classCache, declarationCache);
    const ast = parse(code, { filename });
    const parsedPath = path.parse(filename);
    tokenizer.generateToken(ast.css, parsedPath);
    expect(classCache).toEqual(
      expect.objectContaining({
        "/src": {
          "index.svelte": {
            ".active": { a: true },
            ".inactive": { b: true },
          },
        },
      })
    );
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

  const filename = "/src/index.svelte";

  const classCache = getProxiedObject();
  const declarationCache = getProxiedObject();
  const tokenizer = createTokenizer(classCache, declarationCache);
  const ast = parse(code, { filename });

  const parsedPath = path.parse(filename);
  tokenizer.generateToken(ast.css, parsedPath);

  it("should fill the declaration cache correctly", function () {
    expect(declarationCache).toEqual(
      expect.objectContaining({ none: { "color:green;": "a" } })
    );
  });

  it("should fill the class cache correctly", function () {
    expect(classCache).toEqual(
      expect.objectContaining({
        "/src": {
          "index.svelte": { ".title::before": { a: true } },
        },
      })
    );
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

  const filename = "/src/index.svelte";

  const classCache = getProxiedObject();
  const declarationCache = getProxiedObject();
  const tokenizer = createTokenizer(classCache, declarationCache);
  const ast = parse(code, { filename });

  const parsedPath = path.parse(filename);
  tokenizer.generateToken(ast.css, parsedPath);

  it("should fill the declaration cache correctly", function () {
    expect(declarationCache).toEqual(
      expect.objectContaining({ none: { "color:green;": "a" } })
    );
  });

  it("should fill the class cache correctly", function () {
    expect(classCache).toEqual(
      expect.objectContaining({
        "/src": {
          "index.svelte": { ".title:hover": { a: true } },
        },
      })
    );
  });
});

describe("when given a rule that uses id as selector", function () {
  const code = `
<style>
  h1{
    font-size: 20rem;
  }
  .title:hover{
    color: green;
  }
</style>

<h1 class={"title"}></h1>`;

  const filename = "/src/index.svelte";

  const classCache = getProxiedObject();
  const declarationCache = getProxiedObject();
  const tokenizer = createTokenizer(classCache, declarationCache);
  const ast = parse(code, { filename });
  
  const parsedPath = path.parse(filename);
  tokenizer.generateToken(ast.css, parsedPath);
  
  it("should not be stored in declaration cache", () => {
    expect(classCache).toEqual(
      expect.objectContaining({
        "/src": {
          "index.svelte": { ".title:hover": { a: true } },
        },
      })
    );
  });

  it("should be stored in replicate cache", async () => {});
});
