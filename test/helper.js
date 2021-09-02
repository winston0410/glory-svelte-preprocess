export const splitCode = (code) => {
  //  This function does not take script into account, for simple testing purpose only
  const tag = "</style>";
  const index = code.indexOf(tag);
  if (index === -1) {
    return {
      css: "",
      html: code,
    };
  }
  return {
    css: code.substring(0, index + tag.length),
    html: code.substring(index + tag.length),
  };
};
