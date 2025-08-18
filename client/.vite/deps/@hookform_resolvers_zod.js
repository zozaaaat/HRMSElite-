import {
  o,
  r
} from "./chunk-6EDRGGLH.js";
import {
  appendErrors
} from "./chunk-GHLB7QBT.js";
import "./chunk-HZACRLOW.js";
import "./chunk-G3PMV62Z.js";

// node_modules/@hookform/resolvers/zod/dist/zod.mjs
var n = function(r2, e) {
  for (var n2 = {}; r2.length; ) {
    var t2 = r2[0], s = t2.code, i = t2.message, a = t2.path.join(".");
    if (!n2[a]) if ("unionErrors" in t2) {
      var u = t2.unionErrors[0].errors[0];
      n2[a] = { message: u.message, type: u.code };
    } else n2[a] = { message: i, type: s };
    if ("unionErrors" in t2 && t2.unionErrors.forEach(function(e2) {
      return e2.errors.forEach(function(e3) {
        return r2.push(e3);
      });
    }), e) {
      var c = n2[a].types, f = c && c[t2.code];
      n2[a] = appendErrors(a, e, n2, s, f ? [].concat(f, t2.message) : t2.message);
    }
    r2.shift();
  }
  return n2;
};
var t = function(o2, t2, s) {
  return void 0 === s && (s = {}), function(i, a, u) {
    try {
      return Promise.resolve(function(e, n2) {
        try {
          var a2 = Promise.resolve(o2["sync" === s.mode ? "parse" : "parseAsync"](i, t2)).then(function(e2) {
            return u.shouldUseNativeValidation && o({}, u), { errors: {}, values: s.raw ? i : e2 };
          });
        } catch (r2) {
          return n2(r2);
        }
        return a2 && a2.then ? a2.then(void 0, n2) : a2;
      }(0, function(r2) {
        if (function(r3) {
          return Array.isArray(null == r3 ? void 0 : r3.errors);
        }(r2)) return { values: {}, errors: r(n(r2.errors, !u.shouldUseNativeValidation && "all" === u.criteriaMode), u) };
        throw r2;
      }));
    } catch (r2) {
      return Promise.reject(r2);
    }
  };
};
export {
  t as zodResolver
};
//# sourceMappingURL=@hookform_resolvers_zod.js.map
