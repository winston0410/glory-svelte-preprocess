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

  it("should fill the class cache correctly", function () {
    const classCache = {};
    const declarationCache = {};
    const tokenizer = createTokenizer(classCache, declarationCache);
    const ast = parse(code, { filename: "" });
    tokenizer.generateToken(ast.css);
    expect(classCache).toStrictEqual({ active: { a: true } });
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

  it("should fill the class cache correctly", function () {
    const classCache = {};
    const declarationCache = {};
    const tokenizer = createTokenizer(classCache, declarationCache);
    const ast = parse(code, { filename: "" });
    tokenizer.generateToken(ast.css);
    expect(classCache).toStrictEqual({
      active: { a: true },
      inactive: { b: true },
    });
  });
});
