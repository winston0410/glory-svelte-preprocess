import wrappedPreprocessor from "./wrapper.js";
import { reset } from "../src/index.js"

afterEach(() => {
    reset()
})

describe("when given a rule with descendant combinator", function () {
  it("should add class to the right HTML tag", function () {
    const code = `
<style>
.main .h1{
  color: #ff3e00;
}
</style><main class="main"><h1 class="h1"></h1></main>`;

    const filename = "/src/routes/index.svelte";

    const result = wrappedPreprocessor(code, filename).code;

    expect(result.replace(/\s/g, "")).toBe(
      `<style>
        :global(.a){
          color: #ff3e00;
        }
      </style>
      <main class="main">
          <h1 class="a"></h1>
      </main>
`.replace(/\s/g, "")
    );
  });
});

describe("when given a rule with child combinator", function () {
  it("should add class to its direct child", function () {
    const code = `
<style>
.main>.h1{
  color: #ff3e00;
}
</style><main class="main"><h1 class="h1"></h1></main>`;

    const filename = "/src/routes/index.svelte";

    const result = wrappedPreprocessor(code, filename).code;

    expect(result.replace(/\s/g, "")).toBe(
      `<style>
        :global(.a){
          color: #ff3e00;
        }
      </style>
      <main class="main">
          <h1 class="a"></h1>
      </main>
`.replace(/\s/g, "")
    );
  });

  it("should not add class in other level", function () {
    const code = `
<style>
.main>.h1{
  color: #ff3e00;
}
</style><main class="main"><div><h1 class="h1"></h1></div></main>`;

    const filename = "/src/routes/index.svelte";

    const result = wrappedPreprocessor(code, filename).code;

    expect(result.replace(/\s/g, "")).toBe(
      `<style>
        :global(.a){
          color: #ff3e00;
        }
      </style>
      <main class="main">
          <div>
          <h1 class="h1"></h1>
          </div>
      </main>
`.replace(/\s/g, "")
    );
  });
});

describe("when given a rule with id selector", function () {
  it("should add class to the right HTML tag", function () {
    const code = `
<style>
#hello{
color: #ff3e00;
}
</style><h1 id="hello"></h1>`;

    const filename = "/src/routes/index.svelte";

    const result = wrappedPreprocessor(code, filename).code;

    expect(result.replace(/\s/g, "")).toBe(
      `<style>
    :global(.a){
    color: #ff3e00;
    }
    </style>
    <h1 class="a" id="hello"></h1>
`.replace(/\s/g, "")
    );
  });
});

describe("when given a rule with type selector", function () {
  it("should add class to the right HTML tag", function () {
    const code = `
<style>
h1{
color: #ff3e00;
}
</style><h1></h1>`;

    const filename = "/src/routes/index.svelte";

    const result = wrappedPreprocessor(code, filename).code;

    expect(result.replace(/\s/g, "")).toBe(
      `<style>
    :global(.a){
    color: #ff3e00;
    }
    </style>
    <h1 class="a"></h1>
`.replace(/\s/g, "")
    );
  });
});

describe("when given a rule with pseudo class", function () {
  it("should add class to the correct tag", function () {
    const code = `
<style>
.hello:hover{
  color: #ff3e00;
}
</style><div><h1 class="hello"></h1></div>`;

    const filename = "/src/routes/index.svelte";

    const result = wrappedPreprocessor(code, filename).code;

    expect(result.replace(/\s/g, "")).toBe(
      `<style>
        :global(.a:hover){
          color: #ff3e00;
        }
      </style>
      <div>
          <h1 class="a"></h1>
      </div>
`.replace(/\s/g, "")
    );
  });
});

describe("when given a rule with pseudo element", function () {
  it("should add class to the correct tag", function () {
    const code = `
<style>
.world::before{
  color: #ff3e00;
}
</style><div><h1 class="world"></h1></div>`;

    const filename = "/src/routes/index.svelte";

    const result = wrappedPreprocessor(code, filename).code;

    expect(result.replace(/\s/g, "")).toBe(
      `<style>
        :global(.a::before){
          color: #ff3e00;
        }
      </style>
      <div>
          <h1 class="a"></h1>
      </div>
`.replace(/\s/g, "")
    );
  });
});

describe("when given a rule with :not pseudo selector", function () {
  it("should transform the html correctly", function () {
    const code = `
<style>
:not(.hello){
  color: #ff3e00;
}
</style><p></p><p class="world"></p>`;

    const filename = "/src/routes/index.svelte";

    const result = wrappedPreprocessor(code, filename).code;

    expect(result.replace(/\s/g, "")).toBe(
      `<style>
        :global(.a){
          color: #ff3e00;
        }
      </style><p class="a"></p><p class="world a"></p>
`.replace(/\s/g, "")
    );
  });
});

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

describe("when given a selector with general sibling combinator", function () {
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

describe("when given a selector with adjacent sibling combinator", function () {
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
