import createTransformer from "../src/transformer.js";
import { parse } from "svelte/compiler";

describe("when transforming html", function () {
  const code = `
<style>
  .my-long-class-name{
    font-size: 20rem;
  }
</style>

<p class="my-long-class-name"></p>
    `;

  const filename = "index.svelte";

  const classCache = {
    [filename]: { "my-long-class-name": { a: true } },
    "dummy.svelte": { "my-long-class-name": { b: true } },
  };

  it("should only transformed with classes associated with current component", function () {
    const ast = parse(code, { filename });
    const transformer = createTransformer(code, filename).transformHtml(
      ast.html,
      classCache
    );
    const result = transformer.toString();

    expect(result.replace(/\s/g, "")).toBe(
      `<style>
        .my-long-class-name{
          font-size: 20rem;
        }
      </style>

      <p class="a"></p>
`.replace(/\s/g, "")
    );
  });
});

describe("when transforming CSS", function () {
  const componentCode = `
      <style>
  .foo{
    color: red;
  }
</style>
<p class="foo">Hello world<p/>`;

  const filename = "/src/index.svelte";

  const classCache = {
    "/src/__layout.svelte": { bar: { a: true } },
    [filename]: { foo: { a: true } },
  };

  const declarationCache = {
    none: { "color:red;": "a" },
  };

  describe("when identical declaration is found in __layout.svelte", function () {
    const ast = parse(componentCode, { filename });
    const transformer = createTransformer(componentCode, filename).transformCss(
      ast.css,
      declarationCache,
      classCache,
    );

    it("should remove that declaration found in current component", async () => {
      expect(transformer.toString().replace(/\s/g, "")).toBe(
        `<style></style><p class="foo">Hello world<p/>`.replace(/\s/g, "")
      );
    });
  });
});
