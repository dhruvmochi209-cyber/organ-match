export default function StatusTimeline({ status }) {
  const steps = [
    { key: 'Pending', label: 'Pending', desc: 'Match generated, awaiting hospital review' },
    { key: 'Hospital Approved', label: 'Hospital Approved', desc: 'Hospital cleared the match' },
    { key: 'In Progress', label: 'In Progress', desc: 'Transplant procedure ongoing' },
    { key: 'Completed', label: 'Completed', desc: 'Transplant successfully completed' },
  ];

  const statusOrder = ['Pending','Hospital Approved','In Progress','Completed'];
  const currentIdx = statusOrder.indexOf(status);

  if (status === 'Rejected') {
    return (
      <div className="card" style={{ border: '1px solid var(--danger)', background: '#fef2f2' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--danger)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.2rem' }}>✕</div>
          <div>
            <div className="font-semibold" style={{ color: 'var(--danger-dark)', fontSize: '1.1rem' }}>Case Terminated</div>
            <p className="text-sm">This match request has been clinically rejected.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {steps.map((step, idx) => {
        const isCompleted = idx < currentIdx;
        const isActive = idx === currentIdx;
        const color = isCompleted ? 'var(--secondary)' : isActive ? 'var(--primary)' : 'var(--text-muted)';
        
        return (
          <div key={step.key} style={{ display: 'flex', gap: '1.5rem', position: 'relative', paddingBottom: idx < steps.length - 1 ? '1.5rem' : 0 }}>
            {/* Connector Line */}
            {idx < steps.length - 1 && (
              <div style={{ position: 'absolute', top: '24px', left: '11px', bottom: 0, width: '2px', background: isCompleted ? 'var(--secondary)' : 'var(--border-color)', zIndex: 0 }}></div>
            )}
            
            {/* Dot/Icon */}
            <div style={{ 
              width: '24px', height: '24px', borderRadius: '50%', 
              background: isActive ? 'white' : isCompleted ? 'var(--secondary)' : 'white',
              border: isActive ? `6px solid var(--primary)` : `2px solid ${color}`,
              zIndex: 1, position: 'relative', marginTop: '4px'
            }}></div>

            {/* Content */}
            <div style={{ flex: 1, opacity: idx > currentIdx ? 0.5 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="font-semibold" style={{ color: isActive ? 'var(--primary)' : 'var(--text-primary)', fontSize: '0.95rem' }}>
                  {step.label}
                </div>
                {isCompleted && <span style={{ color: 'var(--secondary)', fontSize: '0.8rem' }}>✓</span>}
              </div>
              <p className="text-sm" style={{ marginTop: '0.2rem', color: 'var(--text-secondary)' }}>{step.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
