import wrappedPreprocessor from "./wrapper.js";
import { reset } from "../src/index.js"

afterEach(() => {
    reset()
})

describe("when given a rule with a selector list", function () {
  it("should handle all selectors", function () {
    const code = `
<style>
.foo, .bar{
  color: red;
}
</style><p class="foo">Hello</p><span class="bar">Red</span>`;

    const filename = "/src/routes/index.svelte";

    const result = wrappedPreprocessor(code, filename).code;

    expect(result.replace(/\s/g, "")).toBe(
      `<style>
        :global(.a){
          color: red;
        }
      </style>
      <p class="a">Hello</p>
      <span class="a">Red</span>
`.replace(/\s/g, "")
    );
  });
});
