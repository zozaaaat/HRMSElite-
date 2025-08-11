"use client";
import {
  useCallbackRef,
  useLayoutEffect2
} from "./chunk-W73LSJDS.js";
import {
  createContextScope
} from "./chunk-LMAY4ZXZ.js";
import {
  composeRefs
} from "./chunk-NNCI5OIM.js";
import {
  require_react_dom
} from "./chunk-LNTKQRW3.js";
import {
  require_shim
} from "./chunk-SZTS2WRW.js";
import {
  require_jsx_runtime
} from "./chunk-LXJ6CGFF.js";
import {
  require_react
} from "./chunk-HZACRLOW.js";
import {
  __toESM
} from "./chunk-G3PMV62Z.js";

// node_modules/@radix-ui/react-avatar/dist/index.mjs
var React3 = __toESM(require_react(), 1);

// node_modules/@radix-ui/react-avatar/node_modules/@radix-ui/react-primitive/dist/index.mjs
var React2 = __toESM(require_react(), 1);
var ReactDOM = __toESM(require_react_dom(), 1);

// node_modules/@radix-ui/react-avatar/node_modules/@radix-ui/react-slot/dist/index.mjs
var React = __toESM(require_react(), 1);
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
function createSlot(ownerName) {
  const SlotClone = createSlotClone(ownerName);
  const Slot2 = React.forwardRef((props, forwardedRef) => {
    const { children, ...slotProps } = props;
    const childrenArray = React.Children.toArray(children);
    const slottable = childrenArray.find(isSlottable);
    if (slottable) {
      const newElement = slottable.props.children;
      const newChildren = childrenArray.map((child) => {
        if (child === slottable) {
          if (React.Children.count(newElement) > 1) return React.Children.only(null);
          return React.isValidElement(newElement) ? newElement.props.children : null;
        } else {
          return child;
        }
      });
      return (0, import_jsx_runtime.jsx)(SlotClone, { ...slotProps, ref: forwardedRef, children: React.isValidElement(newElement) ? React.cloneElement(newElement, void 0, newChildren) : null });
    }
    return (0, import_jsx_runtime.jsx)(SlotClone, { ...slotProps, ref: forwardedRef, children });
  });
  Slot2.displayName = `${ownerName}.Slot`;
  return Slot2;
}
var Slot = createSlot("Slot");
function createSlotClone(ownerName) {
  const SlotClone = React.forwardRef((props, forwardedRef) => {
    const { children, ...slotProps } = props;
    if (React.isValidElement(children)) {
      const childrenRef = getElementRef(children);
      const props2 = mergeProps(slotProps, children.props);
      if (children.type !== React.Fragment) {
        props2.ref = forwardedRef ? composeRefs(forwardedRef, childrenRef) : childrenRef;
      }
      return React.cloneElement(children, props2);
    }
    return React.Children.count(children) > 1 ? React.Children.only(null) : null;
  });
  SlotClone.displayName = `${ownerName}.SlotClone`;
  return SlotClone;
}
var SLOTTABLE_IDENTIFIER = Symbol("radix.slottable");
function createSlottable(ownerName) {
  const Slottable2 = ({ children }) => {
    return (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
  };
  Slottable2.displayName = `${ownerName}.Slottable`;
  Slottable2.__radixId = SLOTTABLE_IDENTIFIER;
  return Slottable2;
}
var Slottable = createSlottable("Slottable");
function isSlottable(child) {
  return React.isValidElement(child) && typeof child.type === "function" && "__radixId" in child.type && child.type.__radixId === SLOTTABLE_IDENTIFIER;
}
function mergeProps(slotProps, childProps) {
  const overrideProps = { ...childProps };
  for (const propName in childProps) {
    const slotPropValue = slotProps[propName];
    const childPropValue = childProps[propName];
    const isHandler = /^on[A-Z]/.test(propName);
    if (isHandler) {
      if (slotPropValue && childPropValue) {
        overrideProps[propName] = (...args) => {
          const result = childPropValue(...args);
          slotPropValue(...args);
          return result;
        };
      } else if (slotPropValue) {
        overrideProps[propName] = slotPropValue;
      }
    } else if (propName === "style") {
      overrideProps[propName] = { ...slotPropValue, ...childPropValue };
    } else if (propName === "className") {
      overrideProps[propName] = [slotPropValue, childPropValue].filter(Boolean).join(" ");
    }
  }
  return { ...slotProps, ...overrideProps };
}
function getElementRef(element) {
  let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
  let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.ref;
  }
  getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
  mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.props.ref;
  }
  return element.props.ref || element.ref;
}

// node_modules/@radix-ui/react-avatar/node_modules/@radix-ui/react-primitive/dist/index.mjs
var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
var NODES = [
  "a",
  "button",
  "div",
  "form",
  "h2",
  "h3",
  "img",
  "input",
  "label",
  "li",
  "nav",
  "ol",
  "p",
  "select",
  "span",
  "svg",
  "ul"
];
var Primitive = NODES.reduce((primitive, node) => {
  const Slot2 = createSlot(`Primitive.${node}`);
  const Node = React2.forwardRef((props, forwardedRef) => {
    const { asChild, ...primitiveProps } = props;
    const Comp = asChild ? Slot2 : node;
    if (typeof window !== "undefined") {
      window[Symbol.for("radix-ui")] = true;
    }
    return (0, import_jsx_runtime2.jsx)(Comp, { ...primitiveProps, ref: forwardedRef });
  });
  Node.displayName = `Primitive.${node}`;
  return { ...primitive, [node]: Node };
}, {});

// node_modules/@radix-ui/react-use-is-hydrated/dist/index.mjs
var import_shim = __toESM(require_shim(), 1);
function useIsHydrated() {
  return (0, import_shim.useSyncExternalStore)(
    subscribe,
    () => true,
    () => false
  );
}
function subscribe() {
  return () => {
  };
}

// node_modules/@radix-ui/react-avatar/dist/index.mjs
var import_jsx_runtime3 = __toESM(require_jsx_runtime(), 1);
var AVATAR_NAME = "Avatar";
var [createAvatarContext, createAvatarScope] = createContextScope(AVATAR_NAME);
var [AvatarProvider, useAvatarContext] = createAvatarContext(AVATAR_NAME);
var Avatar = React3.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAvatar, ...avatarProps } = props;
    const [imageLoadingStatus, setImageLoadingStatus] = React3.useState("idle");
    return (0, import_jsx_runtime3.jsx)(
      AvatarProvider,
      {
        scope: __scopeAvatar,
        imageLoadingStatus,
        onImageLoadingStatusChange: setImageLoadingStatus,
        children: (0, import_jsx_runtime3.jsx)(Primitive.span, { ...avatarProps, ref: forwardedRef })
      }
    );
  }
);
Avatar.displayName = AVATAR_NAME;
var IMAGE_NAME = "AvatarImage";
var AvatarImage = React3.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAvatar, src, onLoadingStatusChange = () => {
    }, ...imageProps } = props;
    const context = useAvatarContext(IMAGE_NAME, __scopeAvatar);
    const imageLoadingStatus = useImageLoadingStatus(src, imageProps);
    const handleLoadingStatusChange = useCallbackRef((status) => {
      onLoadingStatusChange(status);
      context.onImageLoadingStatusChange(status);
    });
    useLayoutEffect2(() => {
      if (imageLoadingStatus !== "idle") {
        handleLoadingStatusChange(imageLoadingStatus);
      }
    }, [imageLoadingStatus, handleLoadingStatusChange]);
    return imageLoadingStatus === "loaded" ? (0, import_jsx_runtime3.jsx)(Primitive.img, { ...imageProps, ref: forwardedRef, src }) : null;
  }
);
AvatarImage.displayName = IMAGE_NAME;
var FALLBACK_NAME = "AvatarFallback";
var AvatarFallback = React3.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAvatar, delayMs, ...fallbackProps } = props;
    const context = useAvatarContext(FALLBACK_NAME, __scopeAvatar);
    const [canRender, setCanRender] = React3.useState(delayMs === void 0);
    React3.useEffect(() => {
      if (delayMs !== void 0) {
        const timerId = window.setTimeout(() => setCanRender(true), delayMs);
        return () => window.clearTimeout(timerId);
      }
    }, [delayMs]);
    return canRender && context.imageLoadingStatus !== "loaded" ? (0, import_jsx_runtime3.jsx)(Primitive.span, { ...fallbackProps, ref: forwardedRef }) : null;
  }
);
AvatarFallback.displayName = FALLBACK_NAME;
function resolveLoadingStatus(image, src) {
  if (!image) {
    return "idle";
  }
  if (!src) {
    return "error";
  }
  if (image.src !== src) {
    image.src = src;
  }
  return image.complete && image.naturalWidth > 0 ? "loaded" : "loading";
}
function useImageLoadingStatus(src, { referrerPolicy, crossOrigin }) {
  const isHydrated = useIsHydrated();
  const imageRef = React3.useRef(null);
  const image = (() => {
    if (!isHydrated) return null;
    if (!imageRef.current) {
      imageRef.current = new window.Image();
    }
    return imageRef.current;
  })();
  const [loadingStatus, setLoadingStatus] = React3.useState(
    () => resolveLoadingStatus(image, src)
  );
  useLayoutEffect2(() => {
    setLoadingStatus(resolveLoadingStatus(image, src));
  }, [image, src]);
  useLayoutEffect2(() => {
    const updateStatus = (status) => () => {
      setLoadingStatus(status);
    };
    if (!image) return;
    const handleLoad = updateStatus("loaded");
    const handleError = updateStatus("error");
    image.addEventListener("load", handleLoad);
    image.addEventListener("error", handleError);
    if (referrerPolicy) {
      image.referrerPolicy = referrerPolicy;
    }
    if (typeof crossOrigin === "string") {
      image.crossOrigin = crossOrigin;
    }
    return () => {
      image.removeEventListener("load", handleLoad);
      image.removeEventListener("error", handleError);
    };
  }, [image, crossOrigin, referrerPolicy]);
  return loadingStatus;
}
var Root = Avatar;
var Image = AvatarImage;
var Fallback = AvatarFallback;
export {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Fallback,
  Image,
  Root,
  createAvatarScope
};
//# sourceMappingURL=@radix-ui_react-avatar.js.map
