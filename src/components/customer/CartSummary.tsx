'use client';

interface CartSummaryProps {
  subtotal: number;
  deliveryFee: number;
  depositTotal?: number;
  total: number;
  threshold: number;
  onCheckout: () => void;
  isValid: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSummary({
  subtotal,
  deliveryFee,
  depositTotal,
  total,
  threshold,
  onCheckout,
  isValid,
  isOpen,
  onClose
}: CartSummaryProps) {
  const amountAway = Math.max(0, threshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / threshold) * 100);

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          zIndex: 99,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease'
        }}
      />

      {/* Drawer */}
      <div className="glass-panel" style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '100%',
        maxWidth: '400px',
        height: '100vh',
        zIndex: 100,
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        borderLeft: '1px solid rgba(255, 255, 255, 0.5)',
        borderRadius: 0,
        backgroundColor: 'var(--bg-color)',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.1)'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Your Order</h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'var(--text-secondary)'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ height: '1px', background: 'var(--border-color)' }}></div>

        {/* Free Delivery Progress */}
        <div style={{ background: 'var(--primary-50)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
            <span>Free Delivery Progress</span>
            <span style={{ color: amountAway === 0 ? 'var(--primary-600)' : 'var(--text-secondary)' }}>
              {amountAway === 0 ? 'Unlocked!' : `$${amountAway.toFixed(2)} away`}
            </span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'white', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: amountAway === 0 ? 'var(--primary-500)' : 'var(--text-secondary)',
              transition: 'width 0.3s ease, background 0.3s ease'
            }}></div>
          </div>
        </div>

        {/* Totals */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', fontSize: '1rem', marginTop: 'auto' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
          <span style={{ fontWeight: 600 }}>${subtotal.toFixed(2)}</span>
          
          <span style={{ color: 'var(--text-secondary)' }}>Delivery Fee</span>
          <span style={{ fontWeight: 600, color: deliveryFee === 0 ? 'var(--primary-600)' : 'inherit' }}>
            {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
          </span>

          {depositTotal !== undefined && (
            <>
              <span style={{ color: 'var(--text-secondary)' }}>Refundable Deposit</span>
              <span style={{ fontWeight: 600 }}>${depositTotal.toFixed(2)}</span>
            </>
          )}
        </div>

        <div style={{ height: '1px', background: 'var(--border-color)' }}></div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>Total</span>
          <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-600)' }}>
            ${(total + (depositTotal || 0)).toFixed(2)}
          </span>
        </div>

        <button 
          className="btn-primary" 
          style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', opacity: isValid ? 1 : 0.5 }}
          onClick={onCheckout}
          disabled={!isValid}
        >
          Proceed to Checkout
        </button>
      </div>
    </>
  );
}
