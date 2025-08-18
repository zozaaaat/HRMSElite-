import {
  get,
  set
} from "./chunk-GHLB7QBT.js";

// node_modules/@hookform/resolvers/dist/resolvers.mjs
var s = (e, s2, o2) => {
  if (e && "reportValidity" in e) {
    const r2 = get(o2, s2);
    e.setCustomValidity(r2 && r2.message || ""), e.reportValidity();
  }
};
var o = (t, e) => {
  for (const o2 in e.fields) {
    const r2 = e.fields[o2];
    r2 && r2.ref && "reportValidity" in r2.ref ? s(r2.ref, o2, t) : r2.refs && r2.refs.forEach((e2) => s(e2, o2, t));
  }
};
var r = (s2, r2) => {
  r2.shouldUseNativeValidation && o(s2, r2);
  const f = {};
  for (const o2 in s2) {
    const n = get(r2.fields, o2), a = Object.assign(s2[o2] || {}, { ref: n && n.ref });
    if (i(r2.names || Object.keys(s2), o2)) {
      const s3 = Object.assign({}, get(f, o2));
      set(s3, "root", a), set(f, o2, s3);
    } else set(f, o2, a);
  }
  return f;
};
var i = (t, e) => t.some((t2) => t2.startsWith(e + "."));

export {
  o,
  r
};
//# sourceMappingURL=chunk-6EDRGGLH.js.map
