import wrappedPreprocessor from "./wrapper.js";
import { reset } from "../src/index.js";
import { splitCode } from "./helper.js";

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

describe("when given multiple rules with media query", function () {
  const code = `
<style>
@media (min-width: 768px){
  .title-heading{
      font-size: 90px;
  }
}
          
@media (min-width: 1200px){
  .title-heading{
      font-size: 120px;
  }
}
</style><h1 class="title-heading"></h1>`;

  const filename = "/src/routes/index.svelte";

  it("should transform style correctly", function () {
    const result = wrappedPreprocessor(code, filename).code;
    const { css } = splitCode(result);

    expect(css.replace(/\s/g, "")).toBe(
      `<style>
    @media (min-width: 768px){
      :global(.a){
          font-size: 90px;
      }
    }
    @media (min-width: 1200px){
      :global(.b){
          font-size: 120px;
      }
    }
    </style>
`.replace(/\s/g, "")
    );
  });
  it("should add class correctly to the HTML tag", function () {
    const result = wrappedPreprocessor(code, filename).code;
    const { html } = splitCode(result);
    expect(html).toBe(`<h1 class=" a b"></h1>`);
  });
});
