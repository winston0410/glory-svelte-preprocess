import wrappedPreprocessor from "./wrapper.js";

describe("when given a rule with attribute selector", function () {
  describe("when given a matcher of =", function () {
    it("should add class to the correct tag", function () {
      const code = `
<style>
[href="https://example.org"]{
  color: #ff3e00;
}
</style><div><a href="https://example.org"></a></div>`;

      const filename = "/src/routes/index.svelte";

      const result = wrappedPreprocessor(code, filename).code;

      expect(result.replace(/\s/g, "")).toBe(
        `<style>
        :global(.a){
          color: #ff3e00;
        }
      </style>
      <div>
          <a class="a" href="https://example.org"></a>
      </div>
`.replace(/\s/g, "")
      );
    });
  });
});

describe("when given a rule with attribute selector", function () {
  describe("when given a matcher of ^=", () => {
    it("should add class to the correct tag", function () {
      const code = `
<style>
[title^="hello"]{
  color: #ff3e00;
}
</style><div><div><img title="hello world" /></div></div>`;

      const filename = "/src/routes/index.svelte";

      const result = wrappedPreprocessor(code, filename).code;

      expect(result.replace(/\s/g, "")).toBe(
        `<style>
        :global(.a){
          color: #ff3e00;
        }
      </style>
      <div>
            <div><img class="a" title="hello world"/></div>
      </div>
`.replace(/\s/g, "")
      );
    });
  });
});

describe("when given a rule with attribute selector", function () {
  describe("when given a matcher of $=", () => {
    it("should add class to the correct tag", function () {
      const code = `
<style>
[href$="org"]{
  color: #ff3e00;
}
</style><div><a href="https://example.org"></a><a href="http://hello.org"></a></div>`;

      const filename = "/src/routes/index.svelte";

      const result = wrappedPreprocessor(code, filename).code;

      expect(result.replace(/\s/g, "")).toBe(
        `<style>
        :global(.a){
          color: #ff3e00;
        }
      </style>
      <div>
          <a class="a" href="https://example.org"></a>
          <a class="a" href="http://hello.org"></a>
      </div>
`.replace(/\s/g, "")
      );
    });
  });
});

describe("when given a rule with attribute selector", function () {
  describe("when given a matcher of *=", () => {
    it("should add class to the correct tag", function () {
      const code = `
<style>
[title*="bar"]{
  color: #ff3e00;
}
</style><div><img title="hellobarworld" /></div>`;

      const filename = "/src/routes/index.svelte";

      const result = wrappedPreprocessor(code, filename).code;

      expect(result.replace(/\s/g, "")).toBe(
        `<style>
        :global(.a){
          color: #ff3e00;
        }
      </style>
      <div>
            <img class="a" title="hellobarworld"/>
      </div>
`.replace(/\s/g, "")
      );
    });
  });
});

describe("when given a rule with attribute selector", function () {
  describe("when given a matcher of ~=", () => {
    it("should add class to the correct tag", function () {
      const code = `
<style>
[title~="bar"]{
  color: #ff3e00;
}
</style><div><img title="hello bar world" /></div>`;

      const filename = "/src/routes/index.svelte";

      const result = wrappedPreprocessor(code, filename).code;

      expect(result.replace(/\s/g, "")).toBe(
        `<style>
        :global(.a){
          color: #ff3e00;
        }
      </style>
      <div>
            <img class="a" title="hello bar world"/>
      </div>
`.replace(/\s/g, "")
      );
    });
  });
});

describe("when given a rule with attribute selector", function () {
  describe("when given a matcher of |=", () => {
    it("should add class to the correct tag", function () {
      const code = `
<style>
[title|="friend"]{
  color: #ff3e00;
}
</style><div><img title="foo-friend-bar" /></div>`;

      const filename = "/src/routes/index.svelte";

      const result = wrappedPreprocessor(code, filename).code;

      expect(result.replace(/\s/g, "")).toBe(
        `<style>
        :global(.a){
          color: #ff3e00;
        }
      </style>
      <div>
            <img class="a" title="foo-friend-bar"/>
      </div>
`.replace(/\s/g, "")
      );
    });
  });
});
