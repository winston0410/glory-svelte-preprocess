import wrappedPreprocessor from "./wrapper.js";
import { reset } from "../src/index.js";
import { splitCode } from "./helper.js";

afterEach(() => {
  reset();
});

describe("when transforming HTML", function () {
  it("should only overwrite minified class", function () {
    const code = `
<style>
div {
  color: red;
}

.hello{
  font-size: 20px;
}
</style><div class="hello unrelated"></div>`;

    const filename = "/src/routes/index.svelte";

    const result = wrappedPreprocessor(code, filename).code;

    const { html } = splitCode(result);

    expect(html).toBe(`<div class=" b unrelated a"></div>`);
  });
});
