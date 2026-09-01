export default function ProductCard({
  product,
  onBuy
}) {
  return (
    <article className="product-card">
      <div className="product-icon">
        {product.icon || "🛍️"}
      </div>

      <div>
        <div className="product-category">
          {product.category}
        </div>

        <h3>{product.name}</h3>

        <p>{product.description}</p>

        <strong>
          ₹{Number(product.price).toLocaleString("en-IN")}
        </strong>
      </div>

      <button
        className="buy-button"
        onClick={() => onBuy(product)}
      >
        Buy with AI →
      </button>
    </article>
  );
}