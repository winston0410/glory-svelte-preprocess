import wrappedPreprocessor from "./wrapper.js";
import { reset } from "../src/index.js"

afterEach(() => {
    reset()
})

describe("when given a rule with general sibling combinator", function () {
  it("should add class to the correct tag", function () {
    const code = `
<style>
p ~ span {
  color: red;
}
</style><div><p>Hello</p><span>Red</span><div><span>Not Red</span></div></div>`;

    const filename = "/src/routes/index.svelte";

    const result = wrappedPreprocessor(code, filename).code;

    expect(result.replace(/\s/g, "")).toBe(
      `<style>
        :global(.a){
          color: red;
        }
      </style>
      <div>
            <p>Hello</p>
            <span class="a">Red</span>
            <div>
              <span>Not Red</span>
            </div>
      </div>
`.replace(/\s/g, "")
    );
  });
});

describe("when given a rule with adjacent sibling combinator", function () {
  it("should add class to the correct tag", function () {
    const code = `
<style>
p + span {
  color: red;
}
</style><div><p>Hello</p><span>Red</span><span>Not Red</span><div><span>Not Red</span></div></div>`;

    const filename = "/src/routes/index.svelte";

    const result = wrappedPreprocessor(code, filename).code;

    expect(result.replace(/\s/g, "")).toBe(
      `<style>
        :global(.a){
          color: red;
        }
      </style>
      <div>
            <p>Hello</p>
            <span class="a">Red</span>
            <span>Not Red</span>
            <div>
              <span>Not Red</span>
            </div>
      </div>
`.replace(/\s/g, "")
    );
  });
});
