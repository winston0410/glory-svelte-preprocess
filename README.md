# glory-svelte-preprocess

A svelte preprocess for safely minimizing CSS class footprint for unbeliveable performance gain. :rocket: :rocket: :rocket:

## tldr;

Given the following input:

```svelte
<style>
    .hello{
        color: red;
        font-size: 12px;
    }

    @media screen and (min-width: 600px) {
      .hello{
        margin: none;
      }
    }

    .world{
        color: red;
        font-size: 16px;
    }
</style>

<h1 class="hello">This preprocess</h1>
<h2 class="world">
    <p>does magic!</p>
</h2>
```

This preprocess will turn this into the following output in Svelte:

```svelte

<style>
    :global(.a){
        color: red;
    }

    :global(.b){
        font-size: 12px;
    }

    :global(.c){
        font-size: 16px;
    }

    @media screen and (min-width: 600px) {
      :global(.d){
        margin: none;
      }
    }
</style>

<h1 class="a b d">This preprocess</h1>
<h2 class="a c">
    <p>does magic!</p>
</h2>
```

And Svelte will generate the following HTML and CSS(should be external stylesheet, using `<style>` here for demo purpose):

```html
<style>
    .a{
        color: red;
    }

    .b{
        font-size: 12px;
    }

    .c{
        font-size: 16px;
    }

    @media screen and (min-width: 600px) {
      .d{
        margin: none;
      }
    }
</style>

<h1 class="a b d">This preprocess</h1>
<h2 class="a c">
    <p>does magic!</p>
</h2>
```

## FAQ

###  No hash for classname?

Unlike other CSS hashing solutions that hash based on the content of the stylesheet(e.g. CSS Module), Glory **hashes based on declarations**(declaration refers to the combination of property and value, like `font-size:20px`).

With that, classnames are now irrelavent and that abstration layer is removed. You are basically writing declarations to the component directly, as if using inline `style` attribute, but everything in a nicer way.

### Why do you turn everything global? Is there any scope for isolation?

As the hash is built based on declarations, you can maximize the compression gain only if you share the hash across all components.

Furthermore, with `:global()`, svelte will remove all injected `.svelte-xxxxxx` hash, compressing the CSS footprint to the very fine edge.

Despite turning everything global, during compile time all pre-transformed classnames are **additionally hashed by filename**, therefore no additional hash is needed in the classname.

This [test](https://github.com/winston0410/glory-svelte-preprocess/blob/master/test/scope.spec.js) verifies the scoping implementation.

## Installation

```sh
npm install glory-svelte-preprocess
```

## Usage

Just import this preprocessor in your `svelte.config.js`

```javascript
import gloryPreprocess from "glory-svelte-preprocess"
import preprocess from 'svelte-preprocess';

const config = {
	preprocess: [
        gloryPreprocess(),
		preprocess()
	],

	kit: {
		target: '#svelte',
		adapter: adapter()
	}
};

export default config;
```

## Related project

[glory](https://github.com/winston0410/glory)

The world fastest framework agonistic CSS-in-JS library.
