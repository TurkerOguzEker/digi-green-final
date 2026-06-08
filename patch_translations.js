const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/locales/translations.js');
let content = fs.readFileSync(file, 'utf8');

const newHomeTr = `
        home: {
            loading: 'Yükleniyor...',
            hero: { 
                btnMobile: 'Mobil Çözümler', 
                btnExplore: 'Projeyi İncele',
                eyebrow: 'Erasmus+ Yetişkin Eğitimi Alanında İşbirliği Ortaklıkları (KA220-ADU)',
                title: 'Vatandaş Odaklı Yerel Yeşil Gelecek için\\nDijital Dönüşüm',
                desc: 'DIGI-GREEN FUTURE: Kapaklı Belediyesi koordinatörlüğünde, dijitalleşmeyi çevresel sürdürülebilirlik hedeflerine ulaşmak için güçlü bir araç olarak kullanıyoruz.'
            },
            summary: {
                durationVal: '24 Ay',
                duration: 'Süre (1 Kasım 2025 – 31 Ekim 2027)',
                budgetVal: '250.000 €',
                budget: 'Toplam Bütçe',
                programVal: 'KA220-ADU',
                program: 'Program',
                scopeVal: '5 Ortak',
                scope: 'Türkiye, Letonya, Portekiz'
            },
            about: {
                badgeVal: '24 Ay',
                badge: 'Proje Süresi',
                eyebrow: 'Stratejik Genel Bakış',
                title: 'Vizyon ve Gerekçe',
                text: 'Kapaklı Belediyesi tarafından koordine edilen bu proje, iklim kriziyle mücadelede yerel yönetimler ve vatandaşların aktif rol alması gerekliliğinden doğmuştur. Kapaklı gibi sanayileşme bölgelerindeki hava/su kirliliği ve yetersiz atık yönetimi gibi çevresel sorunlara odaklanmaktadır.',
                bullets: [
                    'Dijitalleşmeyi amaç değil, çevresel sürdürülebilirlik hedeflerine ulaşmak için araç olarak kullanmak.',
                    'Avrupa Net Sıfır Şehirler ve Paris Anlaşması hedeflerine katkı sunmak.',
                    'Çevre ve İklim Değişikliğiyle Mücadele etmek.'
                ]
            },
            target: {
                title: 'Avrupa Politikalarıyla Uyum',
                subtitle: 'Erasmus+ programının yatay önceliklerine ve Avrupa iklim hedeflerine doğrudan katkı.',
                item1: { title: 'Çevre ve İklim', desc: 'Çevre ve İklim Değişikliğiyle Mücadele önceliğine doğrudan uyum.' },
                item2: { title: 'Dijital Dönüşüm', desc: 'Teknolojiyi yeşil hedefler için araç olarak kullanarak Dijital Dönüşüm önceliğine katkı.' },
                item3: { title: 'Toplumsal Katılım', desc: 'Tüm Nesiller Arasında Öğrenme Fırsatlarının Teşviki ile doğrudan uyumlu.' }
            },
            ecosystem: {
                title1: 'Etki ve',
                title2: 'Sürdürülebilirlik',
                subtitle: 'Projemizin hem somut hem de soyut etkileriyle kalıcı bir değişim yaratmayı hedefliyoruz.',
                item1: { title: 'Mobil Çözümler', desc: 'Mobil uygulamalar aracılığıyla belediye hizmetlerine erişimi kolaylaştırmak.' },
                item2: { title: 'Geri Dönüşüm', desc: 'Atık geri dönüşüm oranını mevcut %24\\'ten %29\\'a çıkarmak.' },
                item3: { title: 'Eğitim & Okuryazarlık', desc: 'Dezavantajlı grupların dijital okuryazarlığını artırmak ve toplumsal katılımı teşvik etmek.' },
                item4: { title: 'Yeşil Gelecek', desc: 'İklim kriziyle mücadelede yerel yönetimler ve vatandaşların aktif rol alması.' }
            },
            counters: {
                grant: 'Hibe Bütçesi',
                countries: 'Ülke',
                partners: 'Ortak',
                months: 'Ay'
            },
            cta: {
                title: 'Bize Katılın',
                desc: 'Dijital dönüşüm ve yeşil gelecek için bizimle iletişime geçin.',
                button: 'İletişime Geç'
            }
        },
`;

const newAboutTr = `
        about: {
            loading: "Yükleniyor...",
            hero: {
                eyebrow: 'DIGI-GREEN FUTURE',
                title1: 'Yeşil Gelecek için',
                title2: 'Dijital',
                title3: 'Dönüşüm',
                descDefault: 'Kapaklı Belediyesi koordinatörlüğünde iklim kriziyle mücadele.'
            },
            vision: {
                label: 'VİZYONUMUZ',
                titleDefault: 'Vizyon ve Gerekçe',
                textDefault: 'İklim kriziyle mücadelede yerel yönetimler ve vatandaşların aktif rol alması gerekliliğinden doğan bu proje, Kapaklı gibi sanayileşme bölgelerindeki hava/su kirliliği ve atık yönetimine odaklanmaktadır.',
                list1: 'Dijitalleşmeyi çevresel sürdürülebilirlik için araç olarak kullanmak.',
                list2: 'Mobil uygulamalarla geri dönüşüm oranını %24\\'ten %29\\'a çıkarmak.',
                list3: 'Dezavantajlı grupların dijital okuryazarlığını artırmak.'
            },
            stats: {
                label: 'Etki',
                title: 'Etki ve Sürdürülebilirlik',
                s1: 'Farkındalık (Kişi)',
                s2: 'Geri Dönüşüm Hedefi',
                s3: 'Proje Süresi (Ay)',
                s4: 'Ortak Kurum'
            },
            target: {
                label: 'SOMUT SONUÇLAR',
                title: 'Ulaşılacak Çıktılar',
                t1Title: 'Donanım ve Altyapı',
                t1Desc: 'Kapaklı\\'ya 100 hava kalite sensörü ve 3 depozito iadeli geri dönüşüm makinesi.',
                t2Title: 'Yazılım ve Mobil',
                t2Desc: 'Kapaklı ve Liepāja için mobil uygulamalar ve e-öğrenme modülü.',
                t3Title: 'Strateji Belgesi',
                t3Desc: 'Kapaklı için SECAP (Sürdürülebilir Enerji ve İklim Eylem Planı) hazırlanması.'
            },
            cta: {
                badge: 'Ortaklıklar',
                title1: 'Konsorsiyum',
                title2: 'Ağı',
                desc: 'Geliştirilen BT altyapılarının kalıcı entegrasyonu ve konsorsiyum ağının devamlılığı sağlanacaktır.',
                button: 'Ortakları İncele'
            }
        },
`;

// Replace home: { ... } in the content with newHomeTr
content = content.replace(/home:\s*\{[\s\S]*?hero:\s*\{[^}]*\}[\s\S]*?\},/, newHomeTr.trim());

// Replace about: { loading: "Hazırlanıyor…" }, with newAboutTr
content = content.replace(/about:\s*\{\s*loading:\s*"Hazırlanıyor…"\s*\},/, newAboutTr.trim());

fs.writeFileSync(file, content, 'utf8');
console.log('Translations patched successfully!');
