import createTokenizer from "../src/tokenizer";
import createTransformer from "../src/transformer.js";
import { getProxiedObject } from "../src/helper";
import { parse } from "svelte/compiler";
import path from "path";

describe("when given a rule with descendant combinator", function () {
  const code = `
<style lang="scss">
.main .h1 {
  color: #ff3e00;
  text-transform: uppercase;
  font-size: 4em;
  font-weight: 100;
}
</style>`;
  const filename = "/src/routes/index.svelte";

  const classCache = getProxiedObject();
  const declarationCache = getProxiedObject();

  const tokenizer = createTokenizer(classCache, declarationCache);
  const ast = parse(code, { filename });
  const parsedPath = path.parse(filename);
  tokenizer.generateToken(ast.css, parsedPath);

  it("should generate the class cache correctly", function () {
    expect(classCache).toEqual(
      expect.objectContaining({
        "/src/routes": {
          "index.svelte": {
            ".main .h1": { a: true, b: true, c: true, d: true },
          },
        },
      })
    );
  });
});

describe("when given a rule with descendant combinator", function () {
  it("should add class to the right HTML tag", function () {
    const code = `
<style>
.main .h1 {
  color: #ff3e00;
}
</style><main class="main"><h1 class="h1"></h1></main>`;

    const filename = "/src/routes/index.svelte";

    const classCache = getProxiedObject();
    const declarationCache = getProxiedObject();

    const tokenizer = createTokenizer(classCache, declarationCache);
    const ast = parse(code, { filename });
    const parsedPath = path.parse(filename);
    tokenizer.generateToken(ast.css, parsedPath);

    const transformer = createTransformer(code, parsedPath).transformHtml(
      ast.html,
      classCache
    )
    
    const result = transformer.toString();

    expect(result.replace(/\s/g, "")).toBe(
      `<style>
        .main .h1 {
          color: #ff3e00;
        }
      </style>
      <main>
          <h1 class="a"></h1>
      </main>
`.replace(/\s/g, "")
    );
  });
});
