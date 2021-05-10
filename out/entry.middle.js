var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", {value, configurable: true});

// node_modules/svelte/internal/index.mjs
function noop() {
}
__name(noop, "noop");
function run(fn) {
  return fn();
}
__name(run, "run");
function blank_object() {
  return Object.create(null);
}
__name(blank_object, "blank_object");
function run_all(fns) {
  fns.forEach(run);
}
__name(run_all, "run_all");
function is_function(thing) {
  return typeof thing === "function";
}
__name(is_function, "is_function");
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
__name(safe_not_equal, "safe_not_equal");
function is_empty(obj) {
  return Object.keys(obj).length === 0;
}
__name(is_empty, "is_empty");
var tasks = new Set();
function insert(target, node, anchor) {
  target.insertBefore(node, anchor || null);
}
__name(insert, "insert");
function detach(node) {
  node.parentNode.removeChild(node);
}
__name(detach, "detach");
function text(data) {
  return document.createTextNode(data);
}
__name(text, "text");
function children(element) {
  return Array.from(element.childNodes);
}
__name(children, "children");
function claim_text(nodes, data) {
  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i];
    if (node.nodeType === 3) {
      node.data = "" + data;
      return nodes.splice(i, 1)[0];
    }
  }
  return text(data);
}
__name(claim_text, "claim_text");
var active_docs = new Set();
var current_component;
function set_current_component(component) {
  current_component = component;
}
__name(set_current_component, "set_current_component");
var dirty_components = [];
var binding_callbacks = [];
var render_callbacks = [];
var flush_callbacks = [];
var resolved_promise = Promise.resolve();
var update_scheduled = false;
function schedule_update() {
  if (!update_scheduled) {
    update_scheduled = true;
    resolved_promise.then(flush);
  }
}
__name(schedule_update, "schedule_update");
function add_render_callback(fn) {
  render_callbacks.push(fn);
}
__name(add_render_callback, "add_render_callback");
var flushing = false;
var seen_callbacks = new Set();
function flush() {
  if (flushing)
    return;
  flushing = true;
  do {
    for (let i = 0; i < dirty_components.length; i += 1) {
      const component = dirty_components[i];
      set_current_component(component);
      update(component.$$);
    }
    set_current_component(null);
    dirty_components.length = 0;
    while (binding_callbacks.length)
      binding_callbacks.pop()();
    for (let i = 0; i < render_callbacks.length; i += 1) {
      const callback = render_callbacks[i];
      if (!seen_callbacks.has(callback)) {
        seen_callbacks.add(callback);
        callback();
      }
    }
    render_callbacks.length = 0;
  } while (dirty_components.length);
  while (flush_callbacks.length) {
    flush_callbacks.pop()();
  }
  update_scheduled = false;
  flushing = false;
  seen_callbacks.clear();
}
__name(flush, "flush");
function update($$) {
  if ($$.fragment !== null) {
    $$.update();
    run_all($$.before_update);
    const dirty = $$.dirty;
    $$.dirty = [-1];
    $$.fragment && $$.fragment.p($$.ctx, dirty);
    $$.after_update.forEach(add_render_callback);
  }
}
__name(update, "update");
var outroing = new Set();
function transition_in(block, local) {
  if (block && block.i) {
    outroing.delete(block);
    block.i(local);
  }
}
__name(transition_in, "transition_in");
var globals = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : global;
var boolean_attributes = new Set([
  "allowfullscreen",
  "allowpaymentrequest",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "defer",
  "disabled",
  "formnovalidate",
  "hidden",
  "ismap",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "selected"
]);
function mount_component(component, target, anchor, customElement) {
  const {fragment, on_mount, on_destroy, after_update} = component.$$;
  fragment && fragment.m(target, anchor);
  if (!customElement) {
    add_render_callback(() => {
      const new_on_destroy = on_mount.map(run).filter(is_function);
      if (on_destroy) {
        on_destroy.push(...new_on_destroy);
      } else {
        run_all(new_on_destroy);
      }
      component.$$.on_mount = [];
    });
  }
  after_update.forEach(add_render_callback);
}
__name(mount_component, "mount_component");
function destroy_component(component, detaching) {
  const $$ = component.$$;
  if ($$.fragment !== null) {
    run_all($$.on_destroy);
    $$.fragment && $$.fragment.d(detaching);
    $$.on_destroy = $$.fragment = null;
    $$.ctx = [];
  }
}
__name(destroy_component, "destroy_component");
function make_dirty(component, i) {
  if (component.$$.dirty[0] === -1) {
    dirty_components.push(component);
    schedule_update();
    component.$$.dirty.fill(0);
  }
  component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
}
__name(make_dirty, "make_dirty");
function init(component, options, instance, create_fragment3, not_equal, props, dirty = [-1]) {
  const parent_component = current_component;
  set_current_component(component);
  const $$ = component.$$ = {
    fragment: null,
    ctx: null,
    props,
    update: noop,
    not_equal,
    bound: blank_object(),
    on_mount: [],
    on_destroy: [],
    on_disconnect: [],
    before_update: [],
    after_update: [],
    context: new Map(parent_component ? parent_component.$$.context : options.context || []),
    callbacks: blank_object(),
    dirty,
    skip_bound: false
  };
  let ready = false;
  $$.ctx = instance ? instance(component, options.props || {}, (i, ret, ...rest) => {
    const value = rest.length ? rest[0] : ret;
    if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
      if (!$$.skip_bound && $$.bound[i])
        $$.bound[i](value);
      if (ready)
        make_dirty(component, i);
    }
    return ret;
  }) : [];
  $$.update();
  ready = true;
  run_all($$.before_update);
  $$.fragment = create_fragment3 ? create_fragment3($$.ctx) : false;
  if (options.target) {
    if (options.hydrate) {
      const nodes = children(options.target);
      $$.fragment && $$.fragment.l(nodes);
      nodes.forEach(detach);
    } else {
      $$.fragment && $$.fragment.c();
    }
    if (options.intro)
      transition_in(component.$$.fragment);
    mount_component(component, options.target, options.anchor, options.customElement);
    flush();
  }
  set_current_component(parent_component);
}
__name(init, "init");
var SvelteElement;
if (typeof HTMLElement === "function") {
  SvelteElement = /* @__PURE__ */ __name(class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({mode: "open"});
    }
    connectedCallback() {
      const {on_mount} = this.$$;
      this.$$.on_disconnect = on_mount.map(run).filter(is_function);
      for (const key in this.$$.slotted) {
        this.appendChild(this.$$.slotted[key]);
      }
    }
    attributeChangedCallback(attr, _oldValue, newValue) {
      this[attr] = newValue;
    }
    disconnectedCallback() {
      run_all(this.$$.on_disconnect);
    }
    $destroy() {
      destroy_component(this, 1);
      this.$destroy = noop;
    }
    $on(type, callback) {
      const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
      callbacks.push(callback);
      return () => {
        const index = callbacks.indexOf(callback);
        if (index !== -1)
          callbacks.splice(index, 1);
      };
    }
    $set($$props) {
      if (this.$$set && !is_empty($$props)) {
        this.$$.skip_bound = true;
        this.$$set($$props);
        this.$$.skip_bound = false;
      }
    }
  }, "SvelteElement");
}
var SvelteComponent = class {
  $destroy() {
    destroy_component(this, 1);
    this.$destroy = noop;
  }
  $on(type, callback) {
    const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
    callbacks.push(callback);
    return () => {
      const index = callbacks.indexOf(callback);
      if (index !== -1)
        callbacks.splice(index, 1);
    };
  }
  $set($$props) {
    if (this.$$set && !is_empty($$props)) {
      this.$$.skip_bound = true;
      this.$$set($$props);
      this.$$.skip_bound = false;
    }
  }
};
__name(SvelteComponent, "SvelteComponent");

// src/components/test.svelte
function create_fragment(ctx) {
  let t;
  return {
    c() {
      t = text("1234asdfzxcvasdfqwer12346sadfasdvg");
    },
    l(nodes) {
      t = claim_text(nodes, "1234asdfzxcvasdfqwer12346sadfasdvg");
    },
    m(target, anchor) {
      insert(target, t, anchor);
    },
    p: noop,
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(t);
    }
  };
}
__name(create_fragment, "create_fragment");
var Test = class extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, null, create_fragment, safe_not_equal, {});
  }
};
__name(Test, "Test");
var test_default = Test;

// src/components/zxcv.svelte
function create_fragment2(ctx) {
  let t;
  return {
    c() {
      t = text("test in test!!");
    },
    l(nodes) {
      t = claim_text(nodes, "test in test!!");
    },
    m(target, anchor) {
      insert(target, t, anchor);
    },
    p: noop,
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(t);
    }
  };
}
__name(create_fragment2, "create_fragment");
var Zxcv = class extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, null, create_fragment2, safe_not_equal, {});
  }
};
__name(Zxcv, "Zxcv");
var zxcv_default = Zxcv;

// src/entry.ts:entry-point:
/* @__PURE__ */
async function component_test() {
  return test_default;
}
/* @__PURE__ */ 
__name(component_test, "component_test");
/* @__PURE__ */ async function component_zxcv() {
  return zxcv_default;
}
/* @__PURE__ */ 
__name(component_zxcv, "component_zxcv");
export {
  component_test,
  component_zxcv
};
