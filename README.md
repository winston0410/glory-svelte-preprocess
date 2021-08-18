# glory-svelte-preprocess

This plugin minimize your CSS classname in a revolutionary way for maximum performance.

## tldr;

Given the following input:

```svelte
<style>
    .hello{
        color: red;
        font-size: 12px;
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

This preprocess will turn this into the following output:

```svelte

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
</style>

<h1 class="a b">This preprocess</h1>
<h2 class="a c">
    <p>does magic!</p>
</h2>
```

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
