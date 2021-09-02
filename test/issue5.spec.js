import wrappedPreprocessor from "./wrapper.js";
import { splitCode } from "./helper.js";
import { reset } from "../src/index.js";

afterEach(() => {
  reset();
});

describe("when given a rule with CSS variable", function () {
  const code = `
<style>
.hello{
--foo: var(--bar);
}
</style><h1 class="hello"></h1>`;

  const filename = "/src/routes/index.svelte";

  it("should process the rule correctly", function () {
    const result = wrappedPreprocessor(code, filename).code;
    const { css } = splitCode(result);

    expect(css.replace(/\s/g, "")).toBe(
      `<style>
    :global(.a){
    --foo: var(--bar);
    }
    </style>`.replace(/\s/g, "")
    );
  });
  it("should add class to the right HTML tag", function () {
    const result = wrappedPreprocessor(code, filename).code;
    const { html } = splitCode(result);

    expect(html).toBe(
      `<h1 class=" a"></h1>`
    );
  });
});
