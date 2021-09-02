import wrappedPreprocessor from "./wrapper.js";
import { splitCode } from "./helper.js";
import { reset } from "../src/index.js";

afterEach(() => {
  reset();
});

describe("when given a rule with :global()", function () {
  const code = `
<style>
:global(p){
  color: red;
  font-size: 200px;
}
</style><div><p>Hello</p></div>`;

  const filename = "/src/routes/index.svelte";
  it("should not mutate the global rule", function () {
    const result = wrappedPreprocessor(code, filename).code;
    const { css } = splitCode(result);

    expect(css.replace(/\s/g, "")).toBe(
      `<style>
        :global(p){
          color: red;
          font-size: 200px;
        }
      </style>`.replace(/\s/g, "")
    );
  });
});
