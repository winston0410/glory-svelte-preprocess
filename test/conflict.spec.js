import wrappedPreprocessor from "./wrapper.js";
import { reset } from "../src/index.js"

afterEach(() => {
    reset()
})

describe("when given multiple rules for the same element", function () {
  it("should add class to the correct tag", function () {
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

    expect(result.replace(/\s/g, "")).toBe(
      `<style>
        :global(.a){
          color: red;
        }
          
        :global(.b){
          font-size: 20px;
        }
      </style>
      <div class="a b">
      </div>
`.replace(/\s/g, "")
    );
  });
});
