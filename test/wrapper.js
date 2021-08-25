import gloryPreprocessor from "../src/index.js";

export default function(content, filename){
  const { markup } = gloryPreprocessor();
  const result = markup({ content: content, filename: filename });
  return result
};
