import wrappedPreprocessor from "./wrapper.js";
import { reset } from "../src/index.js";
import { splitCode } from "./helper.js";

afterEach(() => {
  reset();
});

describe("when processing multiple components", function () {
  describe("when they have a class of the same name", function () {
    const componentA = `<style>
  .foo{
    color: green;
  }
</style><p class="foo"></p>`;

    const componentB = `<style>
  .foo{
    font-size: 20px;
  }
</style><p class="foo"></p>`;

    const resultA = wrappedPreprocessor(componentA, "/src/filenameA").code;
    const resultB = wrappedPreprocessor(componentB, "/src/filenameB").code;
    it("should generate markup correctly without leakage", async () => {
      const { html: htmlA } = splitCode(resultA);
      expect(htmlA).toBe(`<p class=" a"></p>`);

      const { html: htmlB } = splitCode(resultB);
      expect(htmlB).toBe(`<p class=" b"></p>`);
    });
  });
});
