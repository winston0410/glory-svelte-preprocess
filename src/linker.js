export default function () {
  const map = new Map();
  let hidden = null;

  return {
    link(key, value) {
      map.set(key, value);
    },
    //  hide its parent without mutating the store
    hide(node) {
      hidden = node;
    },
    reveal() {
      hidden = null;
    },
    getParent(node) {
      if (hidden === node) {
        return null;
      } else {
        return map.get(node);
      }
    },
  };
}
