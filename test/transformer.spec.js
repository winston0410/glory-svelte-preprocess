import createTransformer from "../src/transformer.js";
import { parse } from "svelte/compiler";
import path from "path";

describe("when transforming html", function () {
  const code = `
<style>
  .my-long-class-name{
    font-size: 20rem;
  }
</style>

<p class="my-long-class-name"></p>
    `;

  const filename = "/src/index.svelte";

  const classCache = {
    "/src": {
      "index.svelte": new Map([
        [
          {
            type: "Selector",
            children: [
              {
                type: "ClassSelector",
                name: "my-long-class-name",
                start: 10,
                end: 29,
              },
            ],
            start: 10,
            end: 29,
          },
          { a: true },
        ],
      ]),
      "dummy.svelte": new Map([
        [
          {
            type: "Selector",
            children: [
              {
                type: "ClassSelector",
                name: "my-long-class-name",
                start: 10,
                end: 29,
              },
            ],
            start: 10,
            end: 29,
          },
          { b: true },
        ],
      ]),
    },
  };

  it("should only transformed with classes associated with current component", function () {
    const ast = parse(code, { filename });
    const parsedPath = path.parse(filename);
    const transformer = createTransformer(code, parsedPath).transformHtml(
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

describe("when transforming css", function () {
  describe("when <style> does not exist", function () {
    const code = `<p>hello</p>`;
    const filename = `/src/routes/__layout.svelte`;

    const declarationCache = {
      none: {
        none: { "font-size:100px;": "a" },
      },
    };

    describe("when given an non-empty declaration cache", function () {
      const ast = parse(code, { filename });
      const parsedPath = path.parse(filename);
      const transformer = createTransformer(code, parsedPath).transformCss(
        ast.css,
        declarationCache
      );
      it("should insert the styling correctly", async () => {
        const result = transformer.toString();

        expect(result.replace(/\s/g, "")).toBe(
          `<style>
        :global(.a){
          font-size: 100px;
        }
      </style>

      <p>hello</p>
`.replace(/\s/g, "")
        );
      });
    });
  });
});
