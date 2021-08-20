import createTransformer from "./transformer.js";
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
