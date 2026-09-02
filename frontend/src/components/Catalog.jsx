import ProductCard from "./ProductCard";

const products = [
  {
    id: "developer-laptop",
    name: "Developer Laptop",
    category: "ELECTRONICS",
    description:
      "High-performance laptop for development and AI workloads.",
    price: 250000,
    icon: "💻"
  },
  {
    id: "ergonomic-chair",
    name: "Ergonomic Chair",
    category: "OFFICE",
    description:
      "Premium ergonomic chair for long working sessions.",
    price: 24999,
    icon: "🪑"
  },
  {
    id: "4k-monitor",
    name: "4K Monitor",
    category: "ELECTRONICS",
    description:
      "Ultra HD monitor for development and productivity.",
    price: 14999,
    icon: "🖥️"
  },
  {
    id: "mechanical-keyboard",
    name: "Mechanical Keyboard",
    category: "ACCESSORIES",
    description:
      "Mechanical keyboard built for developers.",
    price: 2999,
    icon: "⌨️"
  }
];

export default function Catalog({ onBuy }) {
  return (
    <section className="catalog">
      <div className="catalog-header">
        <div>
          <div className="eyebrow">
            AI PRODUCT CATALOG
          </div>

          <h2>Choose something to buy</h2>
        </div>

        <span>
          {products.length} products
        </span>
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onBuy={onBuy}
          />
        ))}
      </div>
    </section>
  );
}