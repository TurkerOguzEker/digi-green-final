export default function Footer() {
    return (
      <footer className="site-footer">
          <div className="container footer-grid">
              <div className="footer-col">
                  <h3>DIGI-GREEN <span className="highlight-green">FUTURE</span></h3>
                  <p>Kapaklı Belediyesi liderliğinde yürütülen proje.</p>
              </div>
              <div className="footer-col">
                  <h4>Bağlantılar</h4>
                  <ul>
                      <li><a href="/partners">Ortaklar</a></li>
                      <li><a href="/contact">İletişim</a></li>
                  </ul>
              </div>
          </div>
          <div className="eu-disclaimer-bar">
              <div className="container disclaimer-content">
                  <p>Co-funded by the European Union.</p>
              </div>
          </div>
      </footer>
    );
  }