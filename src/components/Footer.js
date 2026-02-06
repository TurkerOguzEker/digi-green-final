import Link from 'next/link';

export default function Footer() {
    return (
      <footer className="site-footer">
          <div className="container footer-grid">
              <div className="footer-col">
                  <h3>DIGI-GREEN <span className="highlight-green">FUTURE</span></h3>
                  <p>Kapaklı Belediyesi liderliğinde yürütülen, Erasmus+ KA220-ADU programı kapsamında Avrupa Birliği tarafından finanse edilen sürdürülebilir kalkınma ve dijital dönüşüm projesi.</p>
              </div>
              <div className="footer-col">
                  <h4>Hızlı Menü</h4>
                  <ul>
                      <li><Link href="/about">Proje Künyesi</Link></li>
                      <li><Link href="/partners">Ortaklar</Link></li>
                      <li><Link href="/results">Eğitim Materyalleri</Link></li>
                      <li><Link href="/contact">İletişim</Link></li>
                  </ul>
              </div>
              <div className="footer-col">
                  <h4>İletişim</h4>
                  <ul>
                      <li><i className="fas fa-map-marker-alt"></i> Kapaklı Belediyesi, Tekirdağ, TR</li>
                      <li><i className="fas fa-envelope"></i> info@digigreenfuture.eu</li>
                      <li><i className="fas fa-globe"></i> www.kapakli.bel.tr</li>
                  </ul>
              </div>
          </div>
          <div className="eu-disclaimer-bar">
              <div className="container disclaimer-content">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/Flag_of_Europe.svg" alt="EU Flag" width="40" style={{marginRight:'15px'}} />
                  <p>
                      Funded by the European Union. Views and opinions expressed are however those of the author(s) only 
                      and do not necessarily reflect those of the European Union or the European Education and Culture Executive Agency (EACEA). 
                      Neither the European Union nor EACEA can be held responsible for them.
                  </p>
              </div>
          </div>
      </footer>
    );
  }