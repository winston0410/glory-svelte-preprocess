import wrappedPreprocessor from "./wrapper.js";
import { reset } from "../src/index.js";

describe("when given multiple rules for the same element", function () {
  const code = `
<style>
.hello{
  font-size: 20px;
  color: red;
}
</style><div class="hello"></div>`;

  const filename = "/src/routes/index.svelte";

  const layoutCode = `
<style>
div {
    color: red;
}
</style>
<slot></slot>`;

  const layoutFilename = "/src/routes/__layout.svelte";

  wrappedPreprocessor(layoutCode, layoutFilename).code;
  
  const result = wrappedPreprocessor(code, filename).code;
  it("should hoist class to layout.svelte", function () {
    expect(result.replace(/\s/g, "")).toBe(
      `<style>
        :global(.b){
          font-size: 20px;
        }
      </style>
      <div class="b a">
      </div>
`.replace(/\s/g, "")
    );
  });
});
