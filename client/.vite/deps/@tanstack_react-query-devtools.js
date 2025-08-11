"use client";
import {
  createComponent,
  createSignal,
  lazy,
  mergeProps,
  render,
  setupStyleSheet
} from "./chunk-BZNRBIVU.js";
import {
  onlineManager,
  useQueryClient
} from "./chunk-LE5IYWA3.js";
import {
  require_jsx_runtime
} from "./chunk-LXJ6CGFF.js";
import {
  require_react
} from "./chunk-HZACRLOW.js";
import {
  __toESM
} from "./chunk-G3PMV62Z.js";

// client/node_modules/@tanstack/react-query-devtools/build/modern/ReactQueryDevtools.js
var React = __toESM(require_react(), 1);

// client/node_modules/@tanstack/query-devtools/build/dev.js
var TanstackQueryDevtools = class {
  #client;
  #onlineManager;
  #queryFlavor;
  #version;
  #isMounted = false;
  #styleNonce;
  #shadowDOMTarget;
  #buttonPosition;
  #position;
  #initialIsOpen;
  #errorTypes;
  #hideDisabledQueries;
  #Component;
  #dispose;
  constructor(config) {
    const {
      client,
      queryFlavor,
      version,
      onlineManager: onlineManager2,
      buttonPosition,
      position,
      initialIsOpen,
      errorTypes,
      styleNonce,
      shadowDOMTarget,
      hideDisabledQueries
    } = config;
    this.#client = createSignal(client);
    this.#queryFlavor = queryFlavor;
    this.#version = version;
    this.#onlineManager = onlineManager2;
    this.#styleNonce = styleNonce;
    this.#shadowDOMTarget = shadowDOMTarget;
    this.#buttonPosition = createSignal(buttonPosition);
    this.#position = createSignal(position);
    this.#initialIsOpen = createSignal(initialIsOpen);
    this.#errorTypes = createSignal(errorTypes);
    this.#hideDisabledQueries = createSignal(hideDisabledQueries);
  }
  setButtonPosition(position) {
    this.#buttonPosition[1](position);
  }
  setPosition(position) {
    this.#position[1](position);
  }
  setInitialIsOpen(isOpen) {
    this.#initialIsOpen[1](isOpen);
  }
  setErrorTypes(errorTypes) {
    this.#errorTypes[1](errorTypes);
  }
  setClient(client) {
    this.#client[1](client);
  }
  mount(el) {
    if (this.#isMounted) {
      throw new Error("Devtools is already mounted");
    }
    const dispose = render(() => {
      const _self$ = this;
      const [btnPosition] = this.#buttonPosition;
      const [pos] = this.#position;
      const [isOpen] = this.#initialIsOpen;
      const [errors] = this.#errorTypes;
      const [hideDisabledQueries] = this.#hideDisabledQueries;
      const [queryClient] = this.#client;
      let Devtools;
      if (this.#Component) {
        Devtools = this.#Component;
      } else {
        Devtools = lazy(() => import("./EDEL3XIZ-OE43VESM.js"));
        this.#Component = Devtools;
      }
      setupStyleSheet(this.#styleNonce, this.#shadowDOMTarget);
      return createComponent(Devtools, mergeProps({
        get queryFlavor() {
          return _self$.#queryFlavor;
        },
        get version() {
          return _self$.#version;
        },
        get onlineManager() {
          return _self$.#onlineManager;
        },
        get shadowDOMTarget() {
          return _self$.#shadowDOMTarget;
        }
      }, {
        get client() {
          return queryClient();
        },
        get buttonPosition() {
          return btnPosition();
        },
        get position() {
          return pos();
        },
        get initialIsOpen() {
          return isOpen();
        },
        get errorTypes() {
          return errors();
        },
        get hideDisabledQueries() {
          return hideDisabledQueries();
        }
      }));
    }, el);
    this.#isMounted = true;
    this.#dispose = dispose;
  }
  unmount() {
    if (!this.#isMounted) {
      throw new Error("Devtools is not mounted");
    }
    this.#dispose?.();
    this.#isMounted = false;
  }
};
var TanstackQueryDevtoolsPanel = class {
  #client;
  #onlineManager;
  #queryFlavor;
  #version;
  #isMounted = false;
  #styleNonce;
  #shadowDOMTarget;
  #buttonPosition;
  #position;
  #initialIsOpen;
  #errorTypes;
  #hideDisabledQueries;
  #onClose;
  #Component;
  #dispose;
  constructor(config) {
    const {
      client,
      queryFlavor,
      version,
      onlineManager: onlineManager2,
      buttonPosition,
      position,
      initialIsOpen,
      errorTypes,
      styleNonce,
      shadowDOMTarget,
      onClose,
      hideDisabledQueries
    } = config;
    this.#client = createSignal(client);
    this.#queryFlavor = queryFlavor;
    this.#version = version;
    this.#onlineManager = onlineManager2;
    this.#styleNonce = styleNonce;
    this.#shadowDOMTarget = shadowDOMTarget;
    this.#buttonPosition = createSignal(buttonPosition);
    this.#position = createSignal(position);
    this.#initialIsOpen = createSignal(initialIsOpen);
    this.#errorTypes = createSignal(errorTypes);
    this.#hideDisabledQueries = createSignal(hideDisabledQueries);
    this.#onClose = createSignal(onClose);
  }
  setButtonPosition(position) {
    this.#buttonPosition[1](position);
  }
  setPosition(position) {
    this.#position[1](position);
  }
  setInitialIsOpen(isOpen) {
    this.#initialIsOpen[1](isOpen);
  }
  setErrorTypes(errorTypes) {
    this.#errorTypes[1](errorTypes);
  }
  setClient(client) {
    this.#client[1](client);
  }
  setOnClose(onClose) {
    this.#onClose[1](() => onClose);
  }
  mount(el) {
    if (this.#isMounted) {
      throw new Error("Devtools is already mounted");
    }
    const dispose = render(() => {
      const _self$ = this;
      const [btnPosition] = this.#buttonPosition;
      const [pos] = this.#position;
      const [isOpen] = this.#initialIsOpen;
      const [errors] = this.#errorTypes;
      const [hideDisabledQueries] = this.#hideDisabledQueries;
      const [queryClient] = this.#client;
      const [onClose] = this.#onClose;
      let Devtools;
      if (this.#Component) {
        Devtools = this.#Component;
      } else {
        Devtools = lazy(() => import("./RN252AT2-DSI4PSKG.js"));
        this.#Component = Devtools;
      }
      setupStyleSheet(this.#styleNonce, this.#shadowDOMTarget);
      return createComponent(Devtools, mergeProps({
        get queryFlavor() {
          return _self$.#queryFlavor;
        },
        get version() {
          return _self$.#version;
        },
        get onlineManager() {
          return _self$.#onlineManager;
        },
        get shadowDOMTarget() {
          return _self$.#shadowDOMTarget;
        }
      }, {
        get client() {
          return queryClient();
        },
        get buttonPosition() {
          return btnPosition();
        },
        get position() {
          return pos();
        },
        get initialIsOpen() {
          return isOpen();
        },
        get errorTypes() {
          return errors();
        },
        get hideDisabledQueries() {
          return hideDisabledQueries();
        },
        get onClose() {
          return onClose();
        }
      }));
    }, el);
    this.#isMounted = true;
    this.#dispose = dispose;
  }
  unmount() {
    if (!this.#isMounted) {
      throw new Error("Devtools is not mounted");
    }
    this.#dispose?.();
    this.#isMounted = false;
  }
};

// client/node_modules/@tanstack/react-query-devtools/build/modern/ReactQueryDevtools.js
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
function ReactQueryDevtools(props) {
  const queryClient = useQueryClient(props.client);
  const ref = React.useRef(null);
  const {
    buttonPosition,
    position,
    initialIsOpen,
    errorTypes,
    styleNonce,
    shadowDOMTarget,
    hideDisabledQueries
  } = props;
  const [devtools] = React.useState(
    new TanstackQueryDevtools({
      client: queryClient,
      queryFlavor: "React Query",
      version: "5",
      onlineManager,
      buttonPosition,
      position,
      initialIsOpen,
      errorTypes,
      styleNonce,
      shadowDOMTarget,
      hideDisabledQueries
    })
  );
  React.useEffect(() => {
    devtools.setClient(queryClient);
  }, [queryClient, devtools]);
  React.useEffect(() => {
    if (buttonPosition) {
      devtools.setButtonPosition(buttonPosition);
    }
  }, [buttonPosition, devtools]);
  React.useEffect(() => {
    if (position) {
      devtools.setPosition(position);
    }
  }, [position, devtools]);
  React.useEffect(() => {
    devtools.setInitialIsOpen(initialIsOpen || false);
  }, [initialIsOpen, devtools]);
  React.useEffect(() => {
    devtools.setErrorTypes(errorTypes || []);
  }, [errorTypes, devtools]);
  React.useEffect(() => {
    if (ref.current) {
      devtools.mount(ref.current);
    }
    return () => {
      devtools.unmount();
    };
  }, [devtools]);
  return (0, import_jsx_runtime.jsx)("div", { dir: "ltr", className: "tsqd-parent-container", ref });
}

// client/node_modules/@tanstack/react-query-devtools/build/modern/ReactQueryDevtoolsPanel.js
var React2 = __toESM(require_react(), 1);
var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
function ReactQueryDevtoolsPanel(props) {
  const queryClient = useQueryClient(props.client);
  const ref = React2.useRef(null);
  const { errorTypes, styleNonce, shadowDOMTarget, hideDisabledQueries } = props;
  const [devtools] = React2.useState(
    new TanstackQueryDevtoolsPanel({
      client: queryClient,
      queryFlavor: "React Query",
      version: "5",
      onlineManager,
      buttonPosition: "bottom-left",
      position: "bottom",
      initialIsOpen: true,
      errorTypes,
      styleNonce,
      shadowDOMTarget,
      onClose: props.onClose,
      hideDisabledQueries
    })
  );
  React2.useEffect(() => {
    devtools.setClient(queryClient);
  }, [queryClient, devtools]);
  React2.useEffect(() => {
    devtools.setOnClose(props.onClose ?? (() => {
    }));
  }, [props.onClose, devtools]);
  React2.useEffect(() => {
    devtools.setErrorTypes(errorTypes || []);
  }, [errorTypes, devtools]);
  React2.useEffect(() => {
    if (ref.current) {
      devtools.mount(ref.current);
    }
    return () => {
      devtools.unmount();
    };
  }, [devtools]);
  return (0, import_jsx_runtime2.jsx)(
    "div",
    {
      style: { height: "500px", ...props.style },
      className: "tsqd-parent-container",
      ref
    }
  );
}

// client/node_modules/@tanstack/react-query-devtools/build/modern/index.js
var ReactQueryDevtools2 = false ? function() {
  return null;
} : ReactQueryDevtools;
var ReactQueryDevtoolsPanel2 = false ? function() {
  return null;
} : ReactQueryDevtoolsPanel;
export {
  ReactQueryDevtools2 as ReactQueryDevtools,
  ReactQueryDevtoolsPanel2 as ReactQueryDevtoolsPanel
};
//# sourceMappingURL=@tanstack_react-query-devtools.js.map
