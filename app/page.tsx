"use client";

import {
  ArrowRight,
  Camera,
  Check,
  ChevronRight,
  Clock3,
  Headphones,
  MapPin,
  Menu,
  MessageCircle,
  Minus,
  Navigation,
  PackageCheck,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  image: string;
  badge?: string;
  description: string;
  fitment: string;
};

type CartItem = {
  id: string;
  quantity: number;
};

const STORE_PHONE = "916381366471";
const STORE_PHONE_DISPLAY = "+91 63813 66471";
const WHATSAPP_URL = `https://wa.me/${STORE_PHONE}`;

const PRODUCTS: Product[] = [
  {
    id: "axor-apex",
    name: "AXOR Apex Full-Face Helmet",
    category: "Helmets",
    price: 5499,
    oldPrice: 6500,
    image: "/images/category-helmet.webp",
    badge: "Rider favourite",
    description:
      "Full-face protection with a clear visor, aerodynamic shell and everyday touring comfort.",
    fitment: "ISI / ECE / DOT options. Size confirmation required.",
  },
  {
    id: "street-helmet",
    name: "Street Pro Full-Face Helmet",
    category: "Helmets",
    price: 1899,
    image: "/images/category-helmet.webp",
    badge: "From",
    description:
      "A practical daily-riding helmet with a wide field of view and washable comfort liner.",
    fitment: "Available in multiple sizes and colours.",
  },
  {
    id: "armoured-jacket",
    name: "Armoured Touring Jacket",
    category: "Riding Gear",
    price: 4299,
    image: "/images/category-jacket.webp",
    badge: "New stock",
    description:
      "All-season riding jacket with protective panels, ventilation zones and adjustable fit.",
    fitment: "Size and armour configuration confirmed before order.",
  },
  {
    id: "riding-gloves",
    name: "Knuckle-Pro Riding Gloves",
    category: "Riding Gear",
    price: 899,
    oldPrice: 1099,
    image: "/images/category-gloves.webp",
    badge: "Best value",
    description:
      "Full-finger gloves with reinforced knuckle protection and secure wrist closure.",
    fitment: "Multiple sizes. Share palm measurement on WhatsApp.",
  },
  {
    id: "fog-lights",
    name: "LED Auxiliary Fog Light Pair",
    category: "Accessories",
    price: 1799,
    image: "/images/category-accessories.webp",
    badge: "Popular",
    description:
      "Compact auxiliary lights for improved road visibility with sturdy mounting brackets.",
    fitment: "Wiring and bike compatibility confirmed before dispatch.",
  },
  {
    id: "mobile-holder",
    name: "Waterproof Mobile Holder",
    category: "Accessories",
    price: 699,
    image: "/images/category-accessories.webp",
    description:
      "Handlebar-mounted phone holder with weather protection and adjustable viewing angle.",
    fitment: "Universal-style mount; handlebar size check recommended.",
  },
  {
    id: "shifter-cover",
    name: "Gear Shifter Shoe Protector",
    category: "Accessories",
    price: 89,
    image: "/images/category-gloves.webp",
    badge: "Quick pick",
    description:
      "Compact gear-shifter cover that helps protect footwear during daily rides.",
    fitment: "Universal fit for most standard gear levers.",
  },
  {
    id: "chain-care",
    name: "Complete Chain Care Combo",
    category: "Maintenance",
    price: 649,
    oldPrice: 799,
    image: "/images/category-maintenance.webp",
    badge: "Combo",
    description:
      "A practical cleaning and lubrication kit for smoother, longer-lasting chain performance.",
    fitment: "Suitable for common commuter and performance-bike chains.",
  },
];

const CATEGORIES = [
  {
    name: "Helmets",
    eyebrow: "Ride protected",
    image: "/images/category-helmet.webp",
  },
  {
    name: "Accessories",
    eyebrow: "Build your bike",
    image: "/images/category-accessories.webp",
  },
  {
    name: "Riding Gear",
    eyebrow: "Gear up right",
    image: "/images/category-jacket.webp",
  },
  {
    name: "Maintenance",
    eyebrow: "Keep it sharp",
    image: "/images/category-maintenance.webp",
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState("");
  const [cartHydrated, setCartHydrated] = useState(false);
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    fulfilment: "Store pickup",
    address: "",
    notes: "",
  });

  useEffect(() => {
    const restoreCart = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem("m-square-cart");
        const parsed = saved ? JSON.parse(saved) : null;
        if (Array.isArray(parsed)) {
          setCart(
            parsed.filter(
              (item) =>
                typeof item?.id === "string" &&
                typeof item?.quantity === "number" &&
                item.quantity > 0,
            ),
          );
        }
      } catch {
        // Keep the cart usable even if browser storage is unavailable.
      }
      setCartHydrated(true);
    }, 0);
    return () => window.clearTimeout(restoreCart);
  }, []);

  useEffect(() => {
    if (!cartHydrated) return;
    try {
      window.localStorage.setItem("m-square-cart", JSON.stringify(cart));
    } catch {
      // The current cart still works for this visit.
    }
  }, [cart, cartHydrated]);

  useEffect(() => {
    const shouldLock = cartOpen || mobileOpen || selectedProduct !== null;
    document.body.style.overflow = shouldLock ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen, mobileOpen, selectedProduct]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filteredProducts = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    return PRODUCTS.filter((product) => {
      const matchesCategory =
        activeCategory === "All" || product.category === activeCategory;
      const matchesSearch =
        !normalized ||
        `${product.name} ${product.category} ${product.description}`
          .toLowerCase()
          .includes(normalized);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const cartDetails = useMemo(
    () =>
      cart.flatMap((item) => {
        const product = PRODUCTS.find((entry) => entry.id === item.id);
        return product ? [{ ...product, quantity: item.quantity }] : [];
      }),
    [cart],
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartDetails.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const addToCart = (product: Product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...current, { id: product.id, quantity: 1 }];
    });
    setToast(`${product.name} added to cart`);
    setSelectedProduct(null);
  };

  const changeQuantity = (id: string, delta: number) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (id: string) => {
    setCart((current) => current.filter((item) => item.id !== id));
  };

  const chooseCategory = (category: string) => {
    setActiveCategory(category);
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
  };

  const closeCart = () => {
    setCartOpen(false);
    setCheckoutStep(false);
  };

  const submitOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cartDetails.length) return;

    const items = cartDetails
      .map(
        (item, index) =>
          `${index + 1}. ${item.name} × ${item.quantity} — ${formatCurrency(
            item.price * item.quantity,
          )}`,
      )
      .join("\n");

    const message = [
      "Hi M Square Moto Parts, I would like to place an order.",
      "",
      `Customer: ${customer.name}`,
      `Phone: ${customer.phone}`,
      `Method: ${customer.fulfilment}`,
      customer.address ? `Address: ${customer.address}` : "",
      "",
      "Order items:",
      items,
      "",
      `Estimated total: ${formatCurrency(cartTotal)}`,
      customer.notes ? `Notes / bike model: ${customer.notes}` : "",
      "",
      "Please confirm stock, compatibility and final price.",
    ]
      .filter(Boolean)
      .join("\n");

    window.open(
      `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#home" aria-label="M Square Moto Parts home">
          <span className="brand-mark">M²</span>
          <span className="brand-copy">
            <strong>M Square</strong>
            <small>Moto Parts</small>
          </span>
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <a className="active" href="#home">
            Home
          </a>
          <a href="#shop">Shop</a>
          <a href="#categories">Categories</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="header-actions">
          <button
            type="button"
            aria-label="Search products"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((current) => !current)}
          >
            <Search size={21} />
          </button>
          <button
            type="button"
            aria-label={`Open shopping cart with ${cartCount} items`}
            onClick={() => setCartOpen(true)}
          >
            <ShoppingCart size={22} />
            <span className="cart-count">{cartCount}</span>
          </button>
          <a
            className="whatsapp-square"
            href={`${WHATSAPP_URL}?text=${encodeURIComponent(
              "Hi M Square Moto Parts, I want to check product availability.",
            )}`}
            target="_blank"
            rel="noreferrer"
            aria-label="Chat with M Square Moto Parts on WhatsApp"
          >
            <MessageCircle size={23} />
          </a>
          <button
            className="mobile-menu"
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {searchOpen && (
        <div className="search-strip">
          <Search size={20} />
          <input
            autoFocus
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search helmets, gloves, lights, chain care..."
            aria-label="Search the product catalog"
          />
          <a href="#shop" onClick={() => setSearchOpen(false)}>
            View results <ArrowRight size={17} />
          </a>
          <button
            type="button"
            aria-label="Close search"
            onClick={() => {
              setSearchOpen(false);
              setSearchQuery("");
            }}
          >
            <X size={20} />
          </button>
        </div>
      )}

      <section className="hero" id="home">
        <img
          className="hero-image"
          src="/images/hero-motorcycle.webp"
          alt="Matte black street motorcycle in a premium workshop"
        />
        <div className="hero-shade" />
        <div className="speed-lines" aria-hidden="true" />
        <div className="hero-content">
          <p className="eyebrow">
            <span />
            Chengalpattu&apos;s rider store
          </p>
          <h1>
            Built for the road.
            <br />
            Ready for <em>every ride.</em>
          </h1>
          <p className="hero-description">
            Helmets, riding gear, performance accessories and everyday bike
            essentials—available when riders need them.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#shop">
              Shop parts <ArrowRight size={20} />
            </a>
            <a
              className="button button-outline"
              href={`${WHATSAPP_URL}?text=${encodeURIComponent(
                "Hi M Square Moto Parts, I want to place an order.",
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={20} />
              Order on WhatsApp
            </a>
          </div>
          <div className="trust-row" aria-label="Store highlights">
            <div>
              <Star size={22} />
              <span>
                <strong>5.0 rating</strong>
                <small>7 Google reviews</small>
              </span>
            </div>
            <div>
              <Clock3 size={22} />
              <span>
                <strong>Open 24 hours</strong>
                <small>Order anytime</small>
              </span>
            </div>
            <div>
              <MapPin size={22} />
              <span>
                <strong>Vallam</strong>
                <small>Chengalpattu</small>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="category-rail" id="categories" aria-label="Categories">
        {CATEGORIES.map((category) => (
          <button
            className="category-card"
            type="button"
            key={category.name}
            onClick={() => chooseCategory(category.name)}
          >
            <img src={category.image} alt="" />
            <span className="category-gradient" />
            <span className="category-copy">
              <small>{category.eyebrow}</small>
              <strong>{category.name}</strong>
            </span>
            <ArrowRight size={20} />
          </button>
        ))}
      </section>

      <section className="catalog-section" id="shop">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              <span />
              Shop the essentials
            </p>
            <h2>Gear for your next ride.</h2>
          </div>
          <p>
            Browse current rider favourites. Stock, size, bike compatibility
            and the final price are confirmed directly by the store.
          </p>
        </div>

        <div className="catalog-toolbar">
          <div className="category-tabs" aria-label="Filter products">
            {["All", ...CATEGORIES.map((category) => category.name)].map(
              (category) => (
                <button
                  className={activeCategory === category ? "selected" : ""}
                  type="button"
                  key={category}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ),
            )}
          </div>
          <label className="catalog-search">
            <Search size={18} />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search catalog"
              aria-label="Search products"
            />
          </label>
        </div>

        {filteredProducts.length ? (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <article
                className="product-card"
                data-testid={`product-${product.id}`}
                key={product.id}
              >
                <button
                  className="product-visual"
                  type="button"
                  aria-label={`View ${product.name}`}
                  onClick={() => setSelectedProduct(product)}
                >
                  {product.badge && (
                    <span className="product-badge">{product.badge}</span>
                  )}
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                  />
                  <span className="quick-view">Quick view</span>
                </button>
                <div className="product-info">
                  <p>{product.category}</p>
                  <h3>{product.name}</h3>
                  <div className="product-price">
                    <strong>{formatCurrency(product.price)}</strong>
                    {product.oldPrice && (
                      <del>{formatCurrency(product.oldPrice)}</del>
                    )}
                  </div>
                  <button
                    className="add-button"
                    type="button"
                    aria-label={`Add ${product.name} to cart`}
                    onClick={() => addToCart(product)}
                  >
                    Add to cart <Plus size={18} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-results">
            <Search size={30} />
            <h3>No matching parts found</h3>
            <p>Try another keyword or ask the store to source the part.</p>
            <a
              className="button button-primary"
              href={`${WHATSAPP_URL}?text=${encodeURIComponent(
                `Hi M Square Moto Parts, can you help me find: ${searchQuery || "a bike part"}?`,
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              Ask on WhatsApp <ArrowRight size={18} />
            </a>
          </div>
        )}

        <div className="catalog-note">
          <Check size={18} />
          <p>
            Online prices are indicative. The store confirms availability,
            fitment and final price before payment.
          </p>
        </div>
      </section>

      <section className="service-strip" aria-label="Shopping support">
        <article>
          <ShieldCheck size={28} />
          <div>
            <h3>Fitment support</h3>
            <p>Confirm your bike model before you buy.</p>
          </div>
        </article>
        <article>
          <PackageCheck size={28} />
          <div>
            <h3>Pickup or delivery</h3>
            <p>Choose the method when sending your order.</p>
          </div>
        </article>
        <article>
          <Headphones size={28} />
          <div>
            <h3>Direct rider help</h3>
            <p>Talk to the store before payment.</p>
          </div>
        </article>
      </section>

      <section className="about-section" id="about">
        <div className="about-visual">
          <img
            src="/images/hero-motorcycle.webp"
            alt="Performance motorcycle in the M Square workshop"
            loading="lazy"
          />
          <div className="about-stat">
            <strong>24/7</strong>
            <span>Open for riders</span>
          </div>
        </div>
        <div className="about-copy">
          <p className="eyebrow">
            <span />
            Local store. Rider-first service.
          </p>
          <h2>Your ride deserves the right setup.</h2>
          <p>
            M Square Moto Parts serves riders in Vallam and Chengalpattu with
            helmets, bike accessories, riding gear and maintenance essentials.
            The online catalog makes discovery faster; the store team confirms
            compatibility and stock before completing each order.
          </p>
          <ul>
            <li>
              <Check size={18} /> Product and bike-fitment guidance
            </li>
            <li>
              <Check size={18} /> Fast WhatsApp ordering
            </li>
            <li>
              <Check size={18} /> Open 24 hours
            </li>
          </ul>
          <a
            className="text-link"
            href="https://www.instagram.com/msquare.moto/"
            target="_blank"
            rel="noreferrer"
          >
            Follow product updates on Instagram <ArrowRight size={18} />
          </a>
        </div>
      </section>

      <section className="rating-section">
        <div className="rating-score">
          <strong>5.0</strong>
          <div>
            <span className="stars" aria-label="5 out of 5 stars">
              <Star size={19} fill="currentColor" />
              <Star size={19} fill="currentColor" />
              <Star size={19} fill="currentColor" />
              <Star size={19} fill="currentColor" />
              <Star size={19} fill="currentColor" />
            </span>
            <p>Based on 7 Google reviews</p>
          </div>
        </div>
        <div className="rating-copy">
          <p>Trusted locally</p>
          <h2>Rider support that stays personal.</h2>
        </div>
        <a
          className="button button-outline"
          href="https://www.google.com/maps/search/?api=1&query=M+Square+Moto+Parts+Chengalpattu"
          target="_blank"
          rel="noreferrer"
        >
          View on Google <ArrowRight size={18} />
        </a>
      </section>

      <section className="contact-section" id="contact">
        <div className="contact-copy">
          <p className="eyebrow">
            <span />
            Visit or order now
          </p>
          <h2>Need a part today?</h2>
          <p>
            Send your bike model and the part you need. The store will confirm
            availability, fitment and the final amount.
          </p>
          <div className="contact-actions">
            <a
              className="button button-primary"
              href={`${WHATSAPP_URL}?text=${encodeURIComponent(
                "Hi M Square Moto Parts, I need help choosing a part for my bike.",
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={19} /> Chat on WhatsApp
            </a>
            <a className="button button-outline" href="tel:+916381366471">
              <Phone size={19} /> Call the store
            </a>
          </div>
        </div>
        <div className="store-card">
          <div className="store-card-top">
            <span className="brand-mark">M²</span>
            <div>
              <p>Open 24 hours</p>
              <h3>M Square Moto Parts</h3>
            </div>
          </div>
          <address>
            <MapPin size={22} />
            <span>
              M2F4+F2M, SH58, Santhi Nagar, Nenmeli, Chengalpattu,
              Kovilathangal, Tamil Nadu 603003
            </span>
          </address>
          <a href="tel:+916381366471">
            <Phone size={19} /> {STORE_PHONE_DISPLAY}
          </a>
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=M2F4%2BF2M%2C+SH58%2C+Santhi+Nagar%2C+Nenmeli%2C+Chengalpattu%2C+Tamil+Nadu+603003"
            target="_blank"
            rel="noreferrer"
          >
            <Navigation size={19} /> Get directions
          </a>
        </div>
      </section>

      <footer>
        <div className="footer-brand">
          <a className="brand" href="#home">
            <span className="brand-mark">M²</span>
            <span className="brand-copy">
              <strong>M Square</strong>
              <small>Moto Parts</small>
            </span>
          </a>
          <p>Built for the road. Ready for every ride.</p>
        </div>
        <div className="footer-links">
          <a href="#shop">Shop</a>
          <a href="#categories">Categories</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="footer-social">
          <a
            href="https://www.instagram.com/msquare.moto/"
            target="_blank"
            rel="noreferrer"
            aria-label="M Square Moto Parts on Instagram"
          >
            <Camera size={21} />
          </a>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="M Square Moto Parts on WhatsApp"
          >
            <MessageCircle size={21} />
          </a>
        </div>
        <p className="footer-bottom">
          © 2026 M Square Moto Parts. Product availability and pricing are
          confirmed by the store.
        </p>
      </footer>

      <nav className="mobile-bottom-nav" aria-label="Mobile shortcuts">
        <a href="#home">
          <span className="brand-mini">M²</span>
          Home
        </a>
        <a href="#shop">
          <ShoppingBag size={20} />
          Shop
        </a>
        <a href="tel:+916381366471">
          <Phone size={20} />
          Call
        </a>
        <button type="button" onClick={() => setCartOpen(true)}>
          <ShoppingCart size={20} />
          Cart
          {cartCount > 0 && <span>{cartCount}</span>}
        </button>
      </nav>

      {mobileOpen && (
        <div className="mobile-panel" role="dialog" aria-modal="true">
          <div className="mobile-panel-head">
            <a className="brand" href="#home" onClick={() => setMobileOpen(false)}>
              <span className="brand-mark">M²</span>
              <span className="brand-copy">
                <strong>M Square</strong>
                <small>Moto Parts</small>
              </span>
            </a>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            >
              <X size={25} />
            </button>
          </div>
          <nav>
            {[
              ["Home", "#home"],
              ["Shop", "#shop"],
              ["Categories", "#categories"],
              ["About", "#about"],
              ["Contact", "#contact"],
            ].map(([label, href]) => (
              <a
                href={href}
                key={label}
                onClick={() => setMobileOpen(false)}
              >
                {label} <ChevronRight size={21} />
              </a>
            ))}
          </nav>
          <a
            className="button button-primary"
            href={`${WHATSAPP_URL}?text=${encodeURIComponent(
              "Hi M Square Moto Parts, I want to place an order.",
            )}`}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={19} /> Order on WhatsApp
          </a>
        </div>
      )}

      {selectedProduct && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="product-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
          >
            <button
              className="modal-close"
              type="button"
              aria-label="Close product details"
              onClick={() => setSelectedProduct(null)}
            >
              <X size={22} />
            </button>
            <div className="product-modal-image">
              <img src={selectedProduct.image} alt={selectedProduct.name} />
            </div>
            <div className="product-modal-copy">
              <p>{selectedProduct.category}</p>
              <h2 id="product-modal-title">{selectedProduct.name}</h2>
              <div className="product-price large">
                <strong>{formatCurrency(selectedProduct.price)}</strong>
                {selectedProduct.oldPrice && (
                  <del>{formatCurrency(selectedProduct.oldPrice)}</del>
                )}
              </div>
              <p className="modal-description">
                {selectedProduct.description}
              </p>
              <div className="fitment-note">
                <ShieldCheck size={20} />
                <span>{selectedProduct.fitment}</span>
              </div>
              <button
                className="button button-primary"
                type="button"
                onClick={() => addToCart(selectedProduct)}
              >
                Add to cart <Plus size={19} />
              </button>
              <a
                className="text-link"
                href={`${WHATSAPP_URL}?text=${encodeURIComponent(
                  `Hi M Square Moto Parts, is ${selectedProduct.name} available?`,
                )}`}
                target="_blank"
                rel="noreferrer"
              >
                Ask about this product <ArrowRight size={18} />
              </a>
            </div>
          </section>
        </div>
      )}

      {cartOpen && (
        <div className="drawer-backdrop" role="presentation">
          <aside
            className="cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
          >
            <div className="drawer-head">
              <div>
                <p>{checkoutStep ? "Final step" : `${cartCount} items`}</p>
                <h2 id="cart-title">
                  {checkoutStep ? "Order details" : "Your cart"}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close cart"
                onClick={closeCart}
              >
                <X size={23} />
              </button>
            </div>

            {!checkoutStep ? (
              <>
                {cartDetails.length ? (
                  <div className="cart-list">
                    {cartDetails.map((item) => (
                      <article className="cart-item" key={item.id}>
                        <img src={item.image} alt="" />
                        <div>
                          <p>{item.category}</p>
                          <h3>{item.name}</h3>
                          <strong>{formatCurrency(item.price)}</strong>
                          <div className="quantity-row">
                            <button
                              type="button"
                              aria-label={`Decrease ${item.name} quantity`}
                              onClick={() => changeQuantity(item.id, -1)}
                            >
                              <Minus size={15} />
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              type="button"
                              aria-label={`Increase ${item.name} quantity`}
                              onClick={() => changeQuantity(item.id, 1)}
                            >
                              <Plus size={15} />
                            </button>
                            <button
                              className="remove-item"
                              type="button"
                              aria-label={`Remove ${item.name}`}
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="empty-cart">
                    <ShoppingBag size={36} />
                    <h3>Your cart is ready for a ride</h3>
                    <p>Add products from the catalog to start an order.</p>
                    <button
                      className="button button-primary"
                      type="button"
                      onClick={closeCart}
                    >
                      Browse catalog <ArrowRight size={18} />
                    </button>
                  </div>
                )}

                {cartDetails.length > 0 && (
                  <div className="drawer-summary">
                    <div>
                      <span>Estimated total</span>
                      <strong>{formatCurrency(cartTotal)}</strong>
                    </div>
                    <p>
                      Stock, fitment and final amount are confirmed on WhatsApp.
                    </p>
                    <button
                      className="button button-primary"
                      type="button"
                      onClick={() => setCheckoutStep(true)}
                    >
                      Continue to order <ArrowRight size={19} />
                    </button>
                    <button
                      className="continue-shopping"
                      type="button"
                      onClick={closeCart}
                    >
                      Continue shopping
                    </button>
                  </div>
                )}
              </>
            ) : (
              <form className="checkout-form" onSubmit={submitOrder}>
                <button
                  className="back-to-cart"
                  type="button"
                  onClick={() => setCheckoutStep(false)}
                >
                  ← Back to cart
                </button>
                <label>
                  Full name
                  <input
                    required
                    value={customer.name}
                    onChange={(event) =>
                      setCustomer({ ...customer, name: event.target.value })
                    }
                    placeholder="Your name"
                  />
                </label>
                <label>
                  Phone number
                  <input
                    required
                    inputMode="tel"
                    value={customer.phone}
                    onChange={(event) =>
                      setCustomer({ ...customer, phone: event.target.value })
                    }
                    placeholder="+91 98765 43210"
                  />
                </label>
                <label>
                  How do you want the order?
                  <select
                    value={customer.fulfilment}
                    onChange={(event) =>
                      setCustomer({
                        ...customer,
                        fulfilment: event.target.value,
                      })
                    }
                  >
                    <option>Store pickup</option>
                    <option>Local delivery</option>
                    <option>Courier delivery</option>
                  </select>
                </label>
                {customer.fulfilment !== "Store pickup" && (
                  <label>
                    Delivery address
                    <textarea
                      required
                      value={customer.address}
                      onChange={(event) =>
                        setCustomer({
                          ...customer,
                          address: event.target.value,
                        })
                      }
                      placeholder="House / street / area / PIN code"
                    />
                  </label>
                )}
                <label>
                  Bike model or notes
                  <textarea
                    value={customer.notes}
                    onChange={(event) =>
                      setCustomer({ ...customer, notes: event.target.value })
                    }
                    placeholder="Example: Royal Enfield Hunter 350, 2025"
                  />
                </label>
                <div className="checkout-total">
                  <span>Estimated total</span>
                  <strong>{formatCurrency(cartTotal)}</strong>
                </div>
                <button className="button button-primary" type="submit">
                  Send order on WhatsApp <MessageCircle size={19} />
                </button>
                <p className="secure-note">
                  <ShieldCheck size={17} />
                  No online payment is collected here. Confirm the final order
                  directly with the store.
                </p>
              </form>
            )}
          </aside>
        </div>
      )}

      {toast && (
        <div className="toast" role="status">
          <Check size={18} /> {toast}
        </div>
      )}

      <a
        className="floating-whatsapp"
        href={`${WHATSAPP_URL}?text=${encodeURIComponent(
          "Hi M Square Moto Parts, I need help with a product.",
        )}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Get product help on WhatsApp"
      >
        <MessageCircle size={25} />
        <span>Need help?</span>
      </a>
    </main>
  );
}
