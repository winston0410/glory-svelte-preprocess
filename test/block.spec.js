import wrappedPreprocessor from "./wrapper.js";

describe("when svelte block is used in markup", function () {
  it("should not affect the preprocessor from running", function () {
    const code = `
<style>
.hello{
  color: red;
}
</style>
{#if true}
<div class="hello"></div>
{/if}`

    const filename = "/src/routes/index.svelte";

    const result = wrappedPreprocessor(code, filename).code;

    expect(result.replace(/\s/g, "")).toBe(
      `<style>
        :global(.a){
          color: red;
        }
      </style>
      {#if true}
      <div class="a">
      </div>
      {/if}
`.replace(/\s/g, "")
    );
  });
});
