import wrappedPreprocessor from "./wrapper.js";
import { reset } from "../src/index.js";
import { splitCode } from "./helper.js";

afterEach(() => {
  reset();
});

describe("when given a rule with descendant combinator", function () {
  const code = `
<style>
.main .h1{
  color: #ff3e00;
}
</style><main class="main"><h1 class="h1"></h1></main>`;

  const filename = "/src/routes/index.svelte";
  it("should add class to the right HTML tag", function () {
    const result = wrappedPreprocessor(code, filename).code;
    const { html } = splitCode(result);

    expect(html).toBe(`<main class="main"><h1 class=" a"></h1></main>`);
  });
});

describe("when given a rule with child combinator", function () {
  const code = `
<style>
.main>.h1{
  color: #ff3e00;
}
</style><main class="main"><h1 class="h1"><div><h1 class="h1"></h1></div></h1></main>`;

  const filename = "/src/routes/index.svelte";
  it("should add class to its direct child only", function () {
    const result = wrappedPreprocessor(code, filename).code;
    const { html } = splitCode(result);

    expect(html).toBe(
      `<main class="main"><h1 class=" a"><div><h1 class="h1"></h1></div></h1></main>`
    );
  });
});

describe("when given a rule with id selector", function () {
  const code = `
<style>
#hello{
color: #ff3e00;
}
</style><h1 id="hello"></h1>`;

  const filename = "/src/routes/index.svelte";
  it("should add class to the right HTML tag", function () {
    const result = wrappedPreprocessor(code, filename).code;
    const { html } = splitCode(result);

    expect(html).toBe(`<h1 class="a" id="hello"></h1>`);
  });
});

describe("when given multiple rules with id selector", function () {
  const code = `
<style>
#hello{
font-size: 20px;
color: #ff3e00;
}
</style><h1 id="hello"></h1>`;

  const filename = "/src/routes/index.svelte";
  it("should add class to the right HTML tag", function () {
    const result = wrappedPreprocessor(code, filename).code;
    const { html } = splitCode(result);

    expect(html).toBe(`<h1 class="a b" id="hello"></h1>`);
  });
});

describe("when given a rule with type selector", function () {
  const code = `
<style>
h1{
color: #ff3e00;
}
</style><h1></h1>`;

  const filename = "/src/routes/index.svelte";
  it("should add class to the right HTML tag", function () {
    const result = wrappedPreprocessor(code, filename).code;
    const { html } = splitCode(result);

    expect(html).toBe(`<h1 class="a"></h1>`);
  });
});

describe("when given rules with type selector", function () {
  const code = `
<style>
h1{
color: #ff3e00;
font-weight: 700;
}
</style><h1></h1>`;

  const filename = "/src/routes/index.svelte";
  it("should add class to the right HTML tag", function () {
    const result = wrappedPreprocessor(code, filename).code;
    const { html } = splitCode(result);

    expect(html).toBe(`<h1 class="a b"></h1>`);
  });
});

describe("when given a rule with pseudo class", function () {
  const code = `
<style>
.hello:hover{
  color: #ff3e00;
}
</style><div><h1 class="hello"></h1></div>`;

  const filename = "/src/routes/index.svelte";
  it("should generate css correctly", async () => {
    const result = wrappedPreprocessor(code, filename).code;
    const { css } = splitCode(result);

    expect(css.replace(/\s/g, "")).toBe(
      `
      <style>
        :global(.a:hover){
          color: #ff3e00;
        }</style> `.replace(/\s/g, "")
    );
  });
  it("should add class to the correct tag", function () {
    const result = wrappedPreprocessor(code, filename).code;
    const { html } = splitCode(result);

    expect(html).toBe(`<div><h1 class=" a"></h1></div>`);
  });
});

describe("when given a rule with pseudo element", function () {
  const code = `
<style>
.world::before{
  color: #ff3e00;
}
</style><div><h1 class="world"></h1></div>`;

  const filename = "/src/routes/index.svelte";
  it("should generate css correctly", async () => {
    const result = wrappedPreprocessor(code, filename).code;
    const { css } = splitCode(result);

    expect(css.replace(/\s/g, "")).toBe(
      `<style>
        :global(.a::before){
          color: #ff3e00;
        }
      </style>`.replace(/\s/g, "")
    );
  });

  it("should add class to the correct tag", function () {
    const result = wrappedPreprocessor(code, filename).code;
    const { html } = splitCode(result);

    expect(html).toBe(`<div><h1 class=" a"></h1></div>`);
  });
});

describe("when given a rule with :not pseudo selector", function () {
  const code = `
<style>
:not(.hello){
  color: #ff3e00;
}
</style><p></p><p class="world"></p>`;

  const filename = "/src/routes/index.svelte";
  it("should generate styliing correctly", function () {
    const result = wrappedPreprocessor(code, filename).code;
    const { css } = splitCode(result);

    expect(css.replace(/\s/g, "")).toBe(
      `<style>
        :global(.a){
          color: #ff3e00;
        }
      </style>
`.replace(/\s/g, "")
    );
  });

  it("should transform html correctly", function () {
    const result = wrappedPreprocessor(code, filename).code;
    const { html } = splitCode(result);

    expect(html).toBe(`<p class="a"></p><p class="world a"></p>`);
  });
});

describe("when given a rule with attribute selector", function () {
  describe("when given a matcher of =", function () {
    const code = `
<style>
[href="https://example.org"]{
  color: #ff3e00;
}
</style><div><a href="https://example.org"></a></div>`;

    const filename = "/src/routes/index.svelte";
    it("should add class to the correct tag", function () {
      const result = wrappedPreprocessor(code, filename).code;
      const { html } = splitCode(result);

      expect(html).toBe(
        `<div><a class="a" href="https://example.org"></a></div>`
      );
    });
  });
});

describe("when given a rule with attribute selector", function () {
  describe("when given a matcher of ^=", () => {
    const code = `
<style>
[title^="hello"]{
  color: #ff3e00;
}
</style><div><div><img title="hello world" /></div></div>`;

    const filename = "/src/routes/index.svelte";
    it("should add class to the correct tag", function () {
      const result = wrappedPreprocessor(code, filename).code;
      const { html } = splitCode(result);

      expect(html).toBe(
        `<div><div><img class="a" title="hello world" /></div></div>`
      );
    });
  });
});

describe("when given a rule with attribute selector", function () {
  describe("when given a matcher of $=", () => {
    const code = `
<style>
[href$="org"]{
  color: #ff3e00;
}
</style><div><a href="https://example.org"></a><a href="http://hello.org"></a></div>`;

    const filename = "/src/routes/index.svelte";
    it("should add class to the correct tag", function () {
      const result = wrappedPreprocessor(code, filename).code;
      const { html } = splitCode(result);

      expect(html).toBe(
        `<div><a class="a" href="https://example.org"></a><a class="a" href="http://hello.org"></a></div>`
      );
    });
  });
});

describe("when given a rule with attribute selector", function () {
  describe("when given a matcher of *=", () => {
    const code = `
<style>
[title*="bar"]{
  color: #ff3e00;
}
</style><div><img title="hellobarworld" /></div>`;

    const filename = "/src/routes/index.svelte";
    it("should add class to the correct tag", function () {
      const result = wrappedPreprocessor(code, filename).code;
      const { html } = splitCode(result);

      expect(html).toBe(`<div><img class="a" title="hellobarworld" /></div>`);
    });
  });
});

describe("when given a rule with attribute selector", function () {
  describe("when given a matcher of ~=", () => {
    const code = `
<style>
[title~="bar"]{
  color: #ff3e00;
}
</style><div><img title="hello bar world" /></div>`;

    const filename = "/src/routes/index.svelte";
    it("should generate styling correctly", function () {});

    it("should add class to the correct tag", function () {
      const result = wrappedPreprocessor(code, filename).code;
      const { html } = splitCode(result);

      expect(html).toBe(`<div><img class="a" title="hello bar world" /></div>`);
    });
  });
});

describe("when given a rule with attribute selector", function () {
  describe("when given a matcher of |=", () => {
    const code = `
<style>
[title|="friend"]{
  color: #ff3e00;
}
</style><div><img title="foo-friend-bar" /></div>`;

    const filename = "/src/routes/index.svelte";

    it("should generate styling correctly", function () {
      const result = wrappedPreprocessor(code, filename).code;
      const { css } = splitCode(result);

      expect(css.replace(/\s/g, "")).toBe(
        `<style>
        :global(.a){
          color: #ff3e00;
        }
      </style>`.replace(/\s/g, "")
      );
    });

    it("should add class to the correct tag", function () {
      const result = wrappedPreprocessor(code, filename).code;
      const { html } = splitCode(result);

      expect(html).toBe(`<div><img class="a" title="foo-friend-bar" /></div>`);
    });
  });
});

describe("when given a selector with general sibling combinator", function () {
  const code = `
<style>
p ~ span {
  color: red;
}
</style><div><p>Hello</p><span>Red</span><div><span>Not Red</span></div></div>`;

  const filename = "/src/routes/index.svelte";

  it("should add class to the correct tag", function () {
    const result = wrappedPreprocessor(code, filename).code;
    const { html } = splitCode(result);

    expect(html).toBe(
      `<div><p>Hello</p><span class="a">Red</span><div><span>Not Red</span></div></div>`
    );
  });
});

describe("when given a selector with adjacent sibling combinator", function () {
  const code = `
<style>
p + span {
  color: red;
}
</style><div><p>Hello</p><span>Red</span><span>Not Red</span><div><span>Not Red</span></div></div>`;

  const filename = "/src/routes/index.svelte";
  it("should add class to the correct tag", function () {
    const result = wrappedPreprocessor(code, filename).code;
    const { html } = splitCode(result);

    expect(html).toBe(
      `<div><p>Hello</p><span class="a">Red</span><span>Not Red</span><div><span>Not Red</span></div></div>`
    );
  });
});
