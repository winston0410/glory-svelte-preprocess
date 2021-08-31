import wrappedPreprocessor from "./wrapper.js";
import { reset } from "../src/index.js"

afterEach(() => {
    reset()
})

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

    expect(result.replace(/\s/g, "")).toBe(
      `<style>
        :global(.a){
          color: red;
        }
          
        :global(.b){
          font-size: 20px;
        }
      </style>
      <div class="b unrelated a">
      </div>
`.replace(/\s/g, "")
    );
  });
});
