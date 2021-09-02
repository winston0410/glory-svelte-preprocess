import wrappedPreprocessor from "./wrapper.js";
import { reset } from "../src/index.js";
import { splitCode } from "./helper.js";

afterEach(() => {
  reset();
});

describe("when svelte block is used in markup", function () {
  const code = `
<style>
.hello{
  color: red;
}
</style>{#if true}<div class="hello"></div>{/if}`;

  const filename = "/src/routes/index.svelte";

  it("should insert styling correctly", function () {
    const result = wrappedPreprocessor(code, filename).code;
    const { css } = splitCode(result);

    expect(css.replace(/\s/g, "")).toBe(
      `<style>
        :global(.a){
          color: red;
        }
      </style>`.replace(/\s/g, "")
    );
  });

  it("should insert markup correctly", function () {
    const result = wrappedPreprocessor(code, filename).code;
    const { html } = splitCode(result);

    expect(html).toBe(`{#if true}<div class=" a"></div>{/if}`);
  });
});
