
import admin from 'firebase-admin';
import { App, getApp, getApps, initializeApp } from 'firebase-admin/app';

// Bu fonksiyon, Firebase Admin SDK'sını yalnızca bir kez başlatmayı garanti eder.
// Sunucu Eylemleri ve Cloud Functions gibi farklı sunucu ortamlarında tutarlı çalışır.
function initializeAdmin(): App {
  // Eğer uygulama zaten başlatılmışsa, mevcut uygulamayı döndür.
  // Bu, "The default Firebase app already exists" hatasını önler.
  if (getApps().length) {
    return getApp();
  }

  // Ortam değişkeninden servis hesabı JSON'unu oku.
  // Bu yöntem, anahtarın doğrudan koda yazılmasını önleyerek güvenliği artırır.
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!serviceAccount) {
    // Gerekli ortam değişkeni ayarlanmamışsa, hata fırlat.
    // Bu, özellikle geliştirme ortamında kurulum hatalarını hızlıca fark etmeyi sağlar.
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_JSON ortam değişkeni ayarlanmamış. Lütfen .env.local dosyanızı kontrol edin.'
    );
  }

  // SDK'yı, doğrudan sağlanan servis hesabı kimlik bilgileriyle başlat.
  // Bu, kimlik bilgilerinin otomatik olarak bulunmasındaki belirsizlikleri ortadan kaldırır.
  return initializeApp({
    credential: admin.credential.cert(JSON.parse(serviceAccount)),
    projectId: 'takip-k0hdb', // Proje ID'sini açıkça belirtmek her zaman iyi bir pratiktir.
  });
}

// SDK'yı bir kez başlat ve başlatılan örneği dışa aktar.
// Bu sayede projenin farklı yerlerinden bu örneğe erişilebilir.
const adminApp = initializeAdmin();
const adminAuth = admin.auth(adminApp);
const adminDb = admin.firestore(adminApp);

export { adminApp, adminAuth, adminDb };
