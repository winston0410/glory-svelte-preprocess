import gloryPreprocessor from "../src/index.js";

export default function(content, filename, opts){
  const { markup } = gloryPreprocessor(opts);
  const result = markup({ content: content, filename: filename });
  return result
};
