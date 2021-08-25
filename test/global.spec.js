import wrappedPreprocessor from "./wrapper.js";
import { reset } from "../src/index.js"

afterEach(() => {
    reset()
})

describe("when given a rule with :global()", function () {
  it("should not mutate the global rule", function () {
    const code = `
<style>
:global(p){
  color: red;
  font-size: 200px;
}
</style><div><p>Hello</p></div>`;

    const filename = "/src/routes/index.svelte";

    const result = wrappedPreprocessor(code, filename).code;

    expect(result.replace(/\s/g, "")).toBe(
      `<style>
        :global(p){
          color: red;
          font-size: 200px;
        }
      </style>
      <div>
            <p>Hello</p>
      </div>
`.replace(/\s/g, "")
    );
  });
});
