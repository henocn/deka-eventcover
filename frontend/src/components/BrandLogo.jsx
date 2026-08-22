// Affiche le nom DKCover comme wordmark typographique sans cadre.
function BrandLogo({ size = 'md', className = '' }) {
  return (
    <span
      className={`brand-logo brand-logo--${size} ${className}`.trim()}
      aria-label="DKCover"
    >
      <span className="brand-logo__mark">DK</span>
      <span className="brand-logo__name">Cover</span>
    </span>
  );
}

export default BrandLogo;
