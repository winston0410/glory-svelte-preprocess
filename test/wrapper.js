import gloryPreprocessor, {reset} from "../src/index.js";

export default function(content, filename){
  const { markup } = gloryPreprocessor();
  const result = markup({ content: content, filename: filename });
  reset()
  return result
};
