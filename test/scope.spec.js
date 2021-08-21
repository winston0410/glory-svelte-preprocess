import createTokenizer from "../src/tokenizer";
import { getProxiedObject } from "../src/helper";
import { parse } from "svelte/compiler";
import path from "path";

describe("when processing multiple components", function () {
  const classCache = getProxiedObject();
  const declarationCache = getProxiedObject();

  const componentA = `<style>
  .foo{
    color: green;
  }
</style>

<p class="foo"></p>`;

  const componentB = `<style>
  .foo{
    font-size: 20px;
  }
</style>

<p class="foo"></p>`;

  const codes = [
    [componentA, "/src/filenameA"],
    [componentB, "/src/filenameB"],
  ];

  const tokenizer = createTokenizer(classCache, declarationCache);

  for (const [code, filename] of codes) {
    const ast = parse(code, { filename });
    const parsedPath = path.parse(filename);
    tokenizer.generateToken(ast.css, parsedPath);
  }

  it("should hashing classes of each component with filename in cache", async () => {
    expect(classCache).toEqual(
      expect.objectContaining({
        "/src": {
          filenameA: {
            //  color:green; is now represented by class a
            foo: { a: true },
          },
          filenameB: {
            //  font-size:20px; is now represented by class b
            foo: { b: true },
          },
        },
      })
    );
  });
});
