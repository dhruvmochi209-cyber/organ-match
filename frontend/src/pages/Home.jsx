import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="animate-fade" style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a' }}>
      {/* Light Mesh Gradient Background */}
      <div style={{ 
        position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none',
        background: '#f8fafc' 
      }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '70%', height: '70%', background: 'radial-gradient(circle, hsla(24, 95%, 53%, 0.05) 0%, transparent 60%)', filter: 'blur(120px)', animation: 'float 10s infinite alternate' }}></div>
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, hsla(24, 95%, 53%, 0.03) 0%, transparent 60%)', filter: 'blur(120px)', animation: 'float 12s infinite alternate-reverse' }}></div>
      </div>

      <nav style={{
        padding: '1.25rem 4rem',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'fixed',
        top: '1.5rem',
        left: '2rem',
        right: '2rem',
        borderRadius: '100px',
        zIndex: 1000,
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.6rem', color: '#0f172a', margin: 0, fontWeight: 900, letterSpacing: '-0.03em' }}>
            Organ<span className="text-gradient">Match</span>
          </h2>
        </div>
        <div style={{ display: 'none' }}>
        </div>
      </nav>

      <main style={{ position: 'relative', zIndex: 1 }}>
        <section style={{
          padding: '10rem 2rem',
          textAlign: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div className="animate-slide-up">
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.5rem 1.25rem', 
              background: 'white', 
              borderRadius: '100px', 
              border: '1px solid rgba(0, 0, 0, 0.05)',
              boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
              marginBottom: '2rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#334155'
            }}>
              <span style={{ color: 'var(--primary)' }}>●</span> AI-Driven Compatibility Matching
            </div>
            
            <h1 style={{ fontSize: '5.5rem', fontWeight: 1000, lineHeight: 1, marginBottom: '2.5rem', letterSpacing: '-0.06em', color: '#0f172a' }}>
              Transforming <br />
              <span className="text-gradient" style={{ filter: 'drop-shadow(0 4px 10px rgba(249, 115, 22, 0.2))' }}>Organ Donation</span>
            </h1>
            
            <p style={{ fontSize: '1.25rem', color: '#475569', marginBottom: '4rem', lineHeight: 1.7, maxWidth: '800px', margin: '0 auto 4rem' }}>
              The most advanced, secure, and transparent organ donation network. 
              Connecting donors and recipients with surgical accuracy and clinical integrity.
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => navigate('/register')} style={{ padding: '1.25rem 4rem', fontSize: '1.1rem', borderRadius: '100px', fontWeight: 800 }}>Register</button>
              <button className="btn" onClick={() => navigate('/login')} style={{ 
                padding: '1.25rem 4rem', fontSize: '1.1rem', borderRadius: '100px', 
                background: 'white', color: '#0f172a', 
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                fontWeight: 700
              }}>Log In</button>
            </div>
          </div>
        </section>
        
        <section style={{ padding: '6rem 2rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
              <div style={{ color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.8rem', marginBottom: '1rem' }}>Next-Gen Systems</div>
              <h2 style={{ fontSize: '3.5rem', fontWeight: 1000, marginBottom: '1.5rem', color: '#0f172a', letterSpacing: '-0.04em' }}>Protocol Infrastructure</h2>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(12, 1fr)', 
              gridAutoRows: 'minmax(200px, auto)',
              gap: '1.5rem' 
            }}>
              <div className="card" style={{ gridColumn: 'span 8', gridRow: 'span 2', background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '2rem' }}>🧬</div>
                <h3 style={{ fontSize: '2rem', color: '#0f172a' }}>Biological Precision Matching</h3>
                <p style={{ color: '#475569', fontSize: '1.1rem', lineHeight: 1.8 }}>Advanced genomic sequencing and HLA cross-matching algorithms for maximum transplant success rates. Utilizing cutting-edge predictive AI models and real-time biological marker analysis, we ensure optimal organ compatibility, minimized rejection risks, and improved post-operative patient outcomes.</p>
              </div>
              
              <div className="card" style={{ gridColumn: 'span 4', background: 'linear-gradient(135deg, #fb923c, #ea580c)', border: 'none', boxShadow: '0 10px 30px rgba(249, 115, 22, 0.2)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🏥</div>
                <h3 style={{ color: 'white' }}>Institutional Nodes</h3>
                <p style={{ color: 'rgba(255,255,255,0.9)' }}>Verified clinical network.</p>
              </div>

              <div className="card" style={{ gridColumn: 'span 4', background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🛡️</div>
                <h3 style={{ color: '#0f172a' }}>Secure Protocols</h3>
                <p style={{ color: '#475569' }}>End-to-end encrypted audits.</p>
              </div>

              <div className="card" style={{ gridColumn: 'span 12', background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '4rem' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '2rem', color: '#0f172a' }}>Real-time Regional Logistics</h3>
                  <p style={{ color: '#475569' }}>Dynamic proximity scoring and continuous organ preservation monitoring to significantly minimize ischemic time during transition. By integrating with high-speed emergency transport fleets and regional traffic networks, we provide real-time location tracking and ensure the fastest possible delivery routes from donor to recipient, maximizing viability and success rates.</p>
                </div>
                <div style={{ fontSize: '4rem' }}>⚡</div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: '6rem 2rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '6rem 2rem', borderRadius: '40px', background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '2rem', color: '#0f172a' }}>Ready to make a difference?</h2>
            <p style={{ fontSize: '1.25rem', color: '#475569', marginBottom: '4rem', maxWidth: '600px', margin: '0 auto 4rem' }}>
              Join the national network and help us transform organ donation management.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/register')} style={{ padding: '1.5rem 5rem', fontSize: '1.2rem', borderRadius: '100px' }}>Join the Network Now</button>
          </div>
        </section>
      </main>

      <footer style={{
        padding: '6rem 4rem',
        background: 'white',
        borderTop: '1px solid #e2e8f0',
        color: '#475569',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ maxWidth: '400px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <h4 style={{ color: '#0f172a', margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>OrganMatch</h4>
            </div>
            <p style={{ lineHeight: 1.6, marginBottom: '2rem' }}>Building the future of national transplant infrastructure through secure, AI-driven registry protocols and transparent clinical auditing.</p>
            <p style={{ fontSize: '0.85rem' }}>© 2024 OrganMatch Registry Network. All rights reserved.</p>
          </div>
          <div style={{ display: 'flex', gap: '6rem' }}>
            <div>
              <h5 style={{ color: '#0f172a', fontSize: '0.9rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800 }}>Protocol</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem' }}>
                <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Institutional Nodes</a>
                <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Security Audit</a>
                <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Registry Rules</a>
              </div>
            </div>
            <div>
              <h5 style={{ color: '#0f172a', fontSize: '0.9rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800 }}>Contact</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem' }}>
                <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Support Center</a>
                <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Clinical Inquiries</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
