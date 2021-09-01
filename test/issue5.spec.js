import wrappedPreprocessor from "./wrapper.js";
import { reset } from "../src/index.js"

afterEach(() => {
    reset()
})

describe("when given a rule with CSS variable", function () {
  it("should add class to the right HTML tag", function () {
    const code = `
<style>
.hello{
--foo: var(--bar);
}
</style><h1 class="hello"></h1>`;

    const filename = "/src/routes/index.svelte";

    const result = wrappedPreprocessor(code, filename).code;

    expect(result.replace(/\s/g, "")).toBe(
      `<style>
    :global(.a){
    --foo: var(--bar);
    }
    </style>
    <h1 class="a"></h1>
`.replace(/\s/g, "")
    );
  });
});
