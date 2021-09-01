import wrappedPreprocessor from "./wrapper.js";
import { reset } from "../src/index.js";

afterEach(() => {
  reset();
});

describe("when given a rule with media query", function () {
  it("should add class to the right HTML tag", function () {
    const code = `
<style>
@media (min-width: 768px){
    .hello{
        color: red;
    }
}
</style><h1 class="hello"></h1>`;

    const filename = "/src/routes/index.svelte";

    const result = wrappedPreprocessor(code, filename).code;

    expect(result.replace(/\s/g, "")).toBe(
      `<style>
    @media(min-width: 768px){
        :global(.a){
            color: red;
        }
    }
    </style>
    <h1 class="a"></h1>
`.replace(/\s/g, "")
    );
  });
});

describe("when given a rule with media query", function () {
  describe("when given a rule of the same class", () => {
    it("should add class to the right HTML tag", function () {
      const code = `
<style>
.hello{
    color: blue;
}
@media (min-width: 768px){
    .hello{
        color: red;
    }
}
</style><h1 class="hello"></h1>`;

      const filename = "/src/routes/index.svelte";

      const result = wrappedPreprocessor(code, filename).code;

      expect(result.replace(/\s/g, "")).toBe(
        `<style>
    :global(.a){
          color: blue;
    }
    @media(min-width: 768px){
        :global(.b){
            color: red;
        }
    }
    </style>
    <h1 class="a b"></h1>
`.replace(/\s/g, "")
      );
    });
  });
});
