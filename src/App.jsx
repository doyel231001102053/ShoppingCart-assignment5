// src/App.jsx
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */
const GST_RATE = 18; // percent

const COUPONS = {
  SAVE10: 10,
  WELCOME20: 20,
  FESTIVE15: 15,
};

const PRODUCTS = [
  { id: 1, name: "Aero Wireless Headphones", category: "Audio", price: 4999, emoji: "🎧", tint: "#e0e7ff" },
  { id: 2, name: "Pulse Smart Watch", category: "Wearables", price: 7499, emoji: "⌚", tint: "#fce7f3" },
  { id: 3, name: "Nimbus Mechanical Keyboard", category: "Accessories", price: 3899, emoji: "⌨️", tint: "#dcfce7" },
  { id: 4, name: "Vertex Gaming Mouse", category: "Accessories", price: 1899, emoji: "🖱️", tint: "#fef3c7" },
  { id: 5, name: "Lumen Desk Lamp", category: "Home Office", price: 1299, emoji: "💡", tint: "#ffedd5" },
  { id: 6, name: "Orbit Bluetooth Speaker", category: "Audio", price: 2799, emoji: "🔊", tint: "#cffafe" },
  { id: 7, name: "Slate 15\" Laptop Sleeve", category: "Bags", price: 999, emoji: "💼", tint: "#ede9fe" },
  { id: 8, name: "Volt 20,000 mAh Power Bank", category: "Power", price: 2199, emoji: "🔋", tint: "#fee2e2" },
];

const inr = (n) =>
  "₹" +
  Number(n).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/* ------------------------------------------------------------------ */
/* Reducer + Context                                                   */
/* ------------------------------------------------------------------ */
const initialState = {
  items: [], // { id, name, price, emoji, tint, category, qty }
  coupon: null, // { code, percent }
  couponMessage: null, // { type: "error" | "success", text }
};

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_TO_CART": {
      const exists = state.items.find((i) => i.id === action.product.id);
      return {
        ...state,
        items: exists
          ? state.items.map((i) =>
              i.id === action.product.id ? { ...i, qty: i.qty + 1 } : i
            )
          : [...state.items, { ...action.product, qty: 1 }],
      };
    }
    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };

    case "INCREMENT":
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, qty: i.qty + 1 } : i
        ),
      };

    case "DECREMENT":
      return {
        ...state,
        items: state.items
          .map((i) => (i.id === action.id ? { ...i, qty: i.qty - 1 } : i))
          .filter((i) => i.qty > 0),
      };

    case "APPLY_COUPON": {
      const code = action.code.trim().toUpperCase();
      if (!code) {
        return {
          ...state,
          couponMessage: { type: "error", text: "Enter a coupon code first." },
        };
      }
      if (COUPONS[code]) {
        return {
          ...state,
          coupon: { code, percent: COUPONS[code] },
          couponMessage: {
            type: "success",
            text: `${code} applied — ${COUPONS[code]}% off.`,
          },
        };
      }
      return {
        ...state,
        coupon: null,
        couponMessage: { type: "error", text: `"${code}" is not a valid coupon.` },
      };
    }

    case "REMOVE_COUPON":
      return { ...state, coupon: null, couponMessage: null };

    case "CLEAR_CART":
      return initialState;

    default:
      return state;
  }
}

const CartContext = createContext(null);

function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const totals = useMemo(() => {
    const itemCount = state.items.reduce((s, i) => s + i.qty, 0);
    const subtotal = state.items.reduce((s, i) => s + i.price * i.qty, 0);
    const discount = state.coupon ? (subtotal * state.coupon.percent) / 100 : 0;
    const taxable = subtotal - discount;
    const gst = (taxable * GST_RATE) / 100;
    const grandTotal = taxable + gst;
    return { itemCount, subtotal, discount, taxable, gst, grandTotal };
  }, [state.items, state.coupon]);

  const value = useMemo(() => ({ state, dispatch, totals }), [state, totals]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
};

/* ------------------------------------------------------------------ */
/* Small inline icons                                                  */
/* ------------------------------------------------------------------ */
const Icon = ({ d, size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);
const CartIcon = () => <Icon d="M6 6h15l-1.5 9h-12zM6 6 5 3H2M9 20a1 1 0 1 0 0 .01M18 20a1 1 0 1 0 0 .01" />;
const CloseIcon = () => <Icon d="M18 6 6 18M6 6l12 12" />;
const TrashIcon = () => <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" size={18} />;
const CheckIcon = () => <Icon d="m5 12 5 5L20 7" size={18} />;
const AlertIcon = () => <Icon d="M12 8v5M12 17h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" size={18} />;
const TagIcon = () => <Icon d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8zM7.5 7.5h.01" size={18} />;

/* ------------------------------------------------------------------ */
/* Header                                                              */
/* ------------------------------------------------------------------ */
function Header({ onOpenCart, bump }) {
  const { totals } = useCart();
  return (
    <header className="header">
      <div className="container header__inner">
        <a className="brand" href="#top" aria-label="Kart home">
          <span className="brand__mark">K</span>
          <span className="brand__name">Kart</span>
        </a>
        <button
          className="btn btn--secondary cart-btn"
          onClick={onOpenCart}
          aria-label={`Open cart, ${totals.itemCount} items`}
        >
          <CartIcon />
          <span>Cart</span>
          <span key={totals.itemCount} className={`badge ${bump ? "badge--bump" : ""}`}>
            {totals.itemCount}
          </span>
        </button>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Product list                                                        */
/* ------------------------------------------------------------------ */
function ProductSkeleton() {
  return (
    <div className="card card--skeleton" aria-hidden="true">
      <div className="skeleton skeleton--img" />
      <div className="skeleton skeleton--line" />
      <div className="skeleton skeleton--line short" />
      <div className="skeleton skeleton--btn" />
    </div>
  );
}

function ProductCard({ product, onAdded }) {
  const { state, dispatch } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const timer = useRef();
  const inCart = state.items.find((i) => i.id === product.id);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleAdd = () => {
    dispatch({ type: "ADD_TO_CART", product });
    onAdded();
    setJustAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <article className="card">
      <div className="card__media" style={{ background: product.tint }}>
        <span className="card__emoji" aria-hidden="true">{product.emoji}</span>
        {inCart && <span className="chip chip--float">In cart · {inCart.qty}</span>}
      </div>
      <div className="card__body">
        <p className="card__category">{product.category}</p>
        <h3 className="card__title">{product.name}</h3>
        <div className="card__footer">
          <p className="card__price">{inr(product.price)}</p>
          <button
            className={`btn btn--primary ${justAdded ? "btn--done" : ""}`}
            onClick={handleAdd}
            aria-label={`Add ${product.name} to cart`}
          >
            {justAdded ? (<><CheckIcon /> Added</>) : "Add to Cart"}
          </button>
        </div>
      </div>
    </article>
  );
}

function ProductList({ onAdded }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <section id="products" className="container section" aria-labelledby="products-title">
      <div className="section__head">
        <h2 id="products-title">Featured products</h2>
        <p className="muted">Everything you need for a better desk setup.</p>
      </div>
      <div className="grid" aria-busy={loading}>
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
          : PRODUCTS.map((p, i) => (
              <div className="reveal" style={{ "--i": i }} key={p.id}>
                <ProductCard product={p} onAdded={onAdded} />
              </div>
            ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Cart drawer                                                         */
/* ------------------------------------------------------------------ */
function CouponBox() {
  const { state, dispatch } = useCart();
  const [code, setCode] = useState("");

  const apply = (e) => {
    e.preventDefault();
    dispatch({ type: "APPLY_COUPON", code });
  };

  return (
    <div className="coupon">
      <form className="coupon__form" onSubmit={apply}>
        <label htmlFor="coupon" className="sr-only">Coupon code</label>
        <input
          id="coupon"
          className="input"
          placeholder="Coupon code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoComplete="off"
        />
        <button type="submit" className="btn btn--secondary">Apply</button>
      </form>

      <div className="coupon__hints">
        {Object.keys(COUPONS).map((c) => (
          <button
            key={c}
            type="button"
            className="chip chip--button"
            onClick={() => {
              setCode(c);
              dispatch({ type: "APPLY_COUPON", code: c });
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <div aria-live="polite">
        {state.couponMessage && (
          <p className={`msg msg--${state.couponMessage.type}`} key={state.couponMessage.text}>
            {state.couponMessage.type === "success" ? <CheckIcon /> : <AlertIcon />}
            {state.couponMessage.text}
          </p>
        )}
      </div>
    </div>
  );
}

function CartItem({ item }) {
  const { dispatch } = useCart();
  return (
    <li className="line">
      <div className="line__thumb" style={{ background: item.tint }} aria-hidden="true">
        {item.emoji}
      </div>
      <div className="line__info">
        <p className="line__name">{item.name}</p>
        <p className="muted small">{inr(item.price)} each</p>
        <div className="qty" role="group" aria-label={`Quantity for ${item.name}`}>
          <button
            className="qty__btn"
            onClick={() => dispatch({ type: "DECREMENT", id: item.id })}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="qty__value" aria-live="polite">{item.qty}</span>
          <button
            className="qty__btn"
            onClick={() => dispatch({ type: "INCREMENT", id: item.id })}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>
      <div className="line__side">
        <p className="line__total">{inr(item.price * item.qty)}</p>
        <button
          className="icon-btn"
          onClick={() => dispatch({ type: "REMOVE_ITEM", id: item.id })}
          aria-label={`Remove ${item.name}`}
        >
          <TrashIcon />
        </button>
      </div>
    </li>
  );
}

function Summary() {
  const { state, dispatch, totals } = useCart();
  const [status, setStatus] = useState("idle"); // idle | processing | done

  useEffect(() => {
    if (status === "processing") {
      const t = setTimeout(() => {
        setStatus("done");
        dispatch({ type: "CLEAR_CART" });
      }, 1800);
      return () => clearTimeout(t);
    }
  }, [status, dispatch]);

  if (status === "done") {
    return (
      <div className="success" role="status">
        <div className="success__icon"><CheckIcon /></div>
        <h3>Order placed!</h3>
        <p className="muted">Thank you for shopping with Kart.</p>
        <button className="btn btn--secondary" onClick={() => setStatus("idle")}>
          Continue shopping
        </button>
      </div>
    );
  }

  return (
    <div className="summary">
      <CouponBox />

      <dl className="rows">
        <div className="row">
          <dt>Subtotal</dt>
          <dd>{inr(totals.subtotal)}</dd>
        </div>
        {state.coupon && (
          <div className="row row--discount">
            <dt>
              <TagIcon /> {state.coupon.code} (−{state.coupon.percent}%)
              <button
                className="link-btn"
                onClick={() => dispatch({ type: "REMOVE_COUPON" })}
              >
                Remove
              </button>
            </dt>
            <dd>−{inr(totals.discount)}</dd>
          </div>
        )}
        <div className="row">
          <dt>GST ({GST_RATE}%)</dt>
          <dd>{inr(totals.gst)}</dd>
        </div>
        <div className="row row--total">
          <dt>Grand Total</dt>
          <dd key={totals.grandTotal} className="pop">{inr(totals.grandTotal)}</dd>
        </div>
      </dl>

      <button
        className="btn btn--primary btn--lg btn--block"
        disabled={status === "processing"}
        onClick={() => setStatus("processing")}
      >
        {status === "processing" ? "Processing payment…" : "Checkout"}
      </button>

      {status === "processing" && (
        <div
          className="progress"
          role="progressbar"
          aria-label="Processing payment"
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="progress__bar" />
        </div>
      )}
    </div>
  );
}

function CartDrawer({ open, onClose }) {
  const { state, totals } = useCart();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        className={`overlay ${open ? "overlay--open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`drawer ${open ? "drawer--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        aria-hidden={!open}
      >
        <div className="drawer__head">
          <h2>Your cart <span className="muted">({totals.itemCount})</span></h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close cart">
            <CloseIcon />
          </button>
        </div>

        <div className="drawer__body">
          {state.items.length === 0 ? (
            <div className="empty">
              <div className="empty__icon" aria-hidden="true">🛒</div>
              <h3>Your cart is empty</h3>
              <p className="muted">Add a product to get started.</p>
              <button className="btn btn--secondary" onClick={onClose}>
                Browse products
              </button>
            </div>
          ) : (
            <ul className="lines">
              {state.items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </ul>
          )}
        </div>

        {state.items.length > 0 && (
          <div className="drawer__foot">
            <Summary />
          </div>
        )}
      </aside>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* App                                                                 */
/* ------------------------------------------------------------------ */
function Shop() {
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(false);

  const triggerBump = () => {
    setBump(false);
    requestAnimationFrame(() => setBump(true));
  };

  return (
    <div id="top" className="app">
      <div className="bg" aria-hidden="true" />
      <Header onOpenCart={() => setOpen(true)} bump={bump} />

      <section className="container hero">
        <span className="chip">New season · Up to 20% off with coupons</span>
        <h1>
          Gear that makes your <span className="grad">workday</span> feel better.
        </h1>
        <p className="muted hero__sub">
          Curated tech for desks, commutes and everything in between. Try
          <strong> SAVE10</strong>, <strong>FESTIVE15</strong> or <strong>WELCOME20</strong> at checkout.
        </p>
        <a href="#products" className="btn btn--primary btn--lg">Shop now</a>
      </section>

      <ProductList onAdded={triggerBump} />

      <footer className="container footer muted small">
        © {new Date().getFullYear()} Kart · Prices include no tax until checkout · GST {GST_RATE}% applied on cart total
      </footer>

      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <Shop />
    </CartProvider>
  );
}