import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="animate-fade" style={{ minHeight: '100vh', background: '#0a0f1d', color: 'white' }}>
      {/* Mesh Gradient Background */}
      <div style={{ 
        position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none',
        background: '#040712' 
      }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '70%', height: '70%', background: 'radial-gradient(circle, hsla(349, 100%, 58%, 0.1) 0%, transparent 60%)', filter: 'blur(120px)', animation: 'float 10s infinite alternate' }}></div>
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, hsla(160, 84%, 39%, 0.08) 0%, transparent 60%)', filter: 'blur(120px)', animation: 'float 12s infinite alternate-reverse' }}></div>
        <div style={{ position: 'absolute', top: '20%', right: '10%', width: '40%', height: '40%', background: 'radial-gradient(circle, hsla(217, 91%, 60%, 0.08) 0%, transparent 60%)', filter: 'blur(120px)' }}></div>
      </div>

      <nav style={{
        padding: '1.25rem 4rem',
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(40px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'fixed',
        top: '1.5rem',
        left: '2rem',
        right: '2rem',
        borderRadius: '100px',
        zIndex: 1000,
        boxShadow: '0 20px 40px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            width: '45px', 
            height: '45px', 
            background: 'var(--primary)', 
            borderRadius: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 0 20px var(--primary-glow)',
            fontSize: '1.5rem'
          }}>❤️</div>
          <h2 style={{ fontSize: '1.6rem', color: 'white', margin: 0, fontWeight: 900, letterSpacing: '-0.03em' }}>
            Organ<span className="text-gradient">Match</span>
          </h2>
        </div>
        <div style={{ display: 'none' }}>
          {/* Navbar buttons removed as requested */}
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
              background: 'rgba(255, 255, 255, 0.05)', 
              borderRadius: '100px', 
              border: '1px solid rgba(255, 255, 255, 0.1)',
              marginBottom: '2rem',
              fontSize: '0.9rem',
              fontWeight: 600
            }}>
              <span style={{ color: 'var(--primary)' }}>●</span> AI-Driven Compatibility Matching
            </div>
            
            <h1 style={{ fontSize: '5.5rem', fontWeight: 1000, lineHeight: 1, marginBottom: '2.5rem', letterSpacing: '-0.06em', color: 'white' }}>
              Transforming <br />
              <span className="text-gradient" style={{ filter: 'drop-shadow(0 0 30px var(--primary-glow))' }}>Organ Donation</span>
            </h1>
            
            <p style={{ fontSize: '1.25rem', color: '#cbd5e1', marginBottom: '4rem', lineHeight: 1.7, maxWidth: '800px', margin: '0 auto 4rem' }}>
              The most advanced, secure, and transparent organ donation network. 
              Connecting donors and recipients with surgical accuracy and clinical integrity.
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => navigate('/register')} style={{ padding: '1.25rem 4rem', fontSize: '1.1rem', borderRadius: '100px', fontWeight: 800 }}>Register</button>
              <button className="btn" onClick={() => navigate('/login')} style={{ 
                padding: '1.25rem 4rem', fontSize: '1.1rem', borderRadius: '100px', 
                background: 'rgba(255,255,255,0.05)', color: 'white', 
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                fontWeight: 700
              }}>Log In</button>
            </div>
          </div>
        </section>
        
        <section style={{ padding: '10rem 2rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
              <div style={{ color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.8rem', marginBottom: '1rem' }}>Next-Gen Systems</div>
              <h2 style={{ fontSize: '3.5rem', fontWeight: 1000, marginBottom: '1.5rem', color: 'white', letterSpacing: '-0.04em' }}>Protocol Infrastructure</h2>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(12, 1fr)', 
              gridAutoRows: 'minmax(200px, auto)',
              gap: '1.5rem' 
            }}>
              <div className="card" style={{ gridColumn: 'span 8', gridRow: 'span 2', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '2rem' }}>🧬</div>
                <h3 style={{ fontSize: '2rem', color: 'white' }}>Biological Precision Matching</h3>
                <p style={{ color: '#cbd5e1', fontSize: '1.1rem', lineHeight: 1.8 }}>Advanced genomic sequencing and HLA cross-matching algorithms for maximum transplant success rates. Utilizing cutting-edge predictive AI models and real-time biological marker analysis, we ensure optimal organ compatibility, minimized rejection risks, and improved post-operative patient outcomes.</p>
              </div>
              
              <div className="card" style={{ gridColumn: 'span 4', background: 'linear-gradient(45deg, var(--primary), #FF4D6D)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🏥</div>
                <h3 style={{ color: 'white' }}>Institutional Nodes</h3>
                <p style={{ color: 'rgba(255,255,255,0.8)' }}>Verified clinical network.</p>
              </div>

              <div className="card" style={{ gridColumn: 'span 4', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🛡️</div>
                <h3 style={{ color: 'white' }}>Secure Protocols</h3>
                <p style={{ color: '#cbd5e1' }}>End-to-end encrypted audits.</p>
              </div>

              <div className="card" style={{ gridColumn: 'span 12', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', gap: '4rem' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '2rem', color: 'white' }}>Real-time Regional Logistics</h3>
                  <p style={{ color: '#cbd5e1' }}>Dynamic proximity scoring and continuous organ preservation monitoring to significantly minimize ischemic time during transition. By integrating with high-speed emergency transport fleets and regional traffic networks, we provide real-time location tracking and ensure the fastest possible delivery routes from donor to recipient, maximizing viability and success rates.</p>
                </div>
                <div style={{ fontSize: '4rem' }}>⚡</div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: '10rem 2rem', textAlign: 'center' }}>
          <div className="glass-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '6rem 2rem', borderRadius: '40px' }}>
            <h2 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '2rem', color: 'white' }}>Ready to make a difference?</h2>
            <p style={{ fontSize: '1.25rem', color: '#cbd5e1', marginBottom: '4rem', maxWidth: '600px', margin: '0 auto 4rem' }}>
              Join the national network and help us transform organ donation management.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/register')} style={{ padding: '1.5rem 5rem', fontSize: '1.2rem', borderRadius: '100px' }}>Join the Network Now</button>
          </div>
        </section>
      </main>

      <footer style={{
        padding: '6rem 4rem',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#94a3b8',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ maxWidth: '400px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>❤️</div>
              <h4 style={{ color: 'white', margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>OrganMatch</h4>
            </div>
            <p style={{ lineHeight: 1.6, marginBottom: '2rem' }}>Building the future of national transplant infrastructure through secure, AI-driven registry protocols and transparent clinical auditing.</p>
            <p style={{ fontSize: '0.85rem' }}>© 2024 OrganMatch Registry Network. All rights reserved.</p>
          </div>
          <div style={{ display: 'flex', gap: '6rem' }}>
            <div>
              <h5 style={{ color: 'white', fontSize: '0.9rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800 }}>Protocol</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem' }}>
                <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Institutional Nodes</a>
                <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Security Audit</a>
                <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Registry Rules</a>
              </div>
            </div>
            <div>
              <h5 style={{ color: 'white', fontSize: '0.9rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800 }}>Contact</h5>
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
