import wrappedPreprocessor from "./wrapper.js";
import { splitCode } from "./helper.js";
import { reset } from "../src/index.js"

afterEach(() => {
    reset()
})

describe("when given multiple rules for the same element", function () {
  it("should add all classes to the tag", function () {
    const code = `
<style>
div {
  color: red;
}

.hello{
  font-size: 20px;
}
</style><div class="hello"></div>`;

    const filename = "/src/routes/index.svelte";

    const result = wrappedPreprocessor(code, filename).code;

    const { html } = splitCode(result)

    expect(html).toBe(
      `<div class=" a b"></div>`
    );
  });
});
