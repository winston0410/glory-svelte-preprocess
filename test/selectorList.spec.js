import wrappedPreprocessor from "./wrapper.js";
import { reset } from "../src/index.js";
import { splitCode } from "./helper.js";

afterEach(() => {
  reset();
});

describe("when given a rule with a selector list", function () {
  const code = `
<style>
.foo, .bar{
  color: red;
}
</style><p class="foo">Hello</p><span class="bar">Red</span>`;

  const filename = "/src/routes/index.svelte";
  it("should generate the rule correctly", function () {
    const result = wrappedPreprocessor(code, filename).code;
    const { css } = splitCode(result)

    expect(css.replace(/\s/g, "")).toBe(
      `<style>
        :global(.a){
          color: red;
        }
      </style>`.replace(/\s/g, "")
    );
  });
  it("should insert class correctly", function () {
  const result = wrappedPreprocessor(code, filename).code;
  const { html } = splitCode(result)

  expect(html).toBe(
  `<p class=" a">Hello</p><span class=" a">Red</span>`
  );
  });
});
