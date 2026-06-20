'use client';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  depositAmount?: number;
  quantity: number;
  onQuantityChange: (id: string, newQuantity: number) => void;
}

export default function ProductCard({
  id,
  name,
  description,
  price,
  depositAmount,
  quantity,
  onQuantityChange
}: ProductCardProps) {
  return (
    <div className="glass-panel" style={{
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      height: '100%'
    }}>
      <div style={{
        width: '100%',
        aspectRatio: '1',
        background: 'var(--primary-50)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '4rem'
      }}>
        📦
      </div>
      
      <div style={{ flexGrow: 1 }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{name}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
          {description}
        </p>
        
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-600)' }}>
            ${price.toFixed(2)}
          </span>
          {depositAmount !== undefined && depositAmount > 0 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              + ${depositAmount.toFixed(2)} deposit
            </span>
          )}
        </div>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-color)',
        borderRadius: 'var(--radius-full)',
        padding: '0.25rem',
        marginTop: 'auto'
      }}>
        <button 
          onClick={() => onQuantityChange(id, Math.max(0, quantity - 1))}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: 'none',
            background: quantity > 0 ? 'white' : 'transparent',
            color: quantity > 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontSize: '1.25rem',
            cursor: quantity > 0 ? 'pointer' : 'default',
            boxShadow: quantity > 0 ? 'var(--shadow-sm)' : 'none',
            transition: 'all 0.2s'
          }}
          disabled={quantity <= 0}
        >
          -
        </button>
        <span style={{ fontWeight: 700, minWidth: '30px', textAlign: 'center' }}>
          {quantity}
        </span>
        <button 
          onClick={() => onQuantityChange(id, quantity + 1)}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: 'none',
            background: 'var(--primary-500)',
            color: 'white',
            fontSize: '1.25rem',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.2s'
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}
