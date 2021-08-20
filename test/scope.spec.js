import createTokenizer from "../src/tokenizer";
import { parse } from "svelte/compiler";

describe("when processing multiple components", function () {
  const classCache = {};
  const declarationCache = {};

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
    [componentA, "filenameA"],
    [componentB, "filenameB"],
  ];
  
  const tokenizer = createTokenizer(classCache, declarationCache)

  for (const [code, filename] of codes) {
    const ast = parse(code, { filename });
    tokenizer.generateToken(ast.css, filename);
  }

  it("should hashing classes of each component with filename in cache", async () => {
    expect(classCache).toStrictEqual({
        "filenameA": {
            //  color:green; is now represented by class a
            "foo": {"a": true}
        },
        "filenameB":{
            //  font-size:20px; is now represented by class b
            "foo": {"b": true}
        }
    })
  });
});
