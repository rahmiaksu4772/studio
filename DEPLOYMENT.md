# Projeyi Yayına Alma

Bu doküman, Firebase Studio'da oluşturduğunuz bu Next.js projesini nasıl canlıya alacağınızı (yayınlayacağınızı) adım adım açıklar.

Projeniz, modern web uygulamaları için tasarlanmış güçlü bir servis olan **Firebase App Hosting** kullanılarak yayınlanmak üzere yapılandırılmıştır.

## Gereksinimler

Yayınlama işlemine başlamadan önce bilgisayarınızda aşağıdakilerin kurulu olduğundan emin olun:

1.  **Node.js:** [Node.js resmi web sitesinden](https://nodejs.org/) indirebilirsiniz.
2.  **Firebase CLI:** Firebase komut satırı arayüzü. Eğer kurulu değilse, aşağıdaki komutla kurabilirsiniz.

## Adım 1: Firebase CLI Kurulumu

Terminalinizi (macOS/Linux) veya Komut İstemi/PowerShell'i (Windows) açın ve aşağıdaki komutu çalıştırın:

```bash
npm install -g firebase-tools
```

Bu komut, Firebase araçlarını bilgisayarınıza genel olarak yükleyerek her yerden erişilebilir hale getirir.

## Adım 2: Firebase Hesabınıza Giriş Yapma

Firebase CLI'ı kullanarak Google hesabınızla Firebase'e giriş yapın:

```bash
firebase login
```

Bu komut, tarayıcınızda bir pencere açarak giriş yapmanızı isteyecektir. Giriş yaptıktan sonra terminale geri dönebilirsiniz.

## Adım 3: Firebase Projesini Yapılandırma

Projeniz zaten temel Firebase yapılandırma dosyalarına (`firebase.json`, `apphosting.yaml`) sahip. Ancak, bu yerel proje klasörünü buluttaki **size ait** bir Firebase projesine bağlamanız gerekir.

1.  **Firebase Konsoluna Gidin:** [Firebase Konsolu](https://console.firebase.google.com/)'nu açın ve bu projeyi yayınlamak için yeni bir proje oluşturun veya mevcut bir projenizi seçin.

2.  **Proje Dizninde `firebase init` Çalıştırın:** Terminalde, proje dosyalarınızın bulunduğu ana klasöre gidin ve aşağıdaki komutu çalıştırın:

    ```bash
    firebase init
    ```

3.  **App Hosting'i Seçin:** Komut size hangi Firebase özelliklerini kullanmak istediğinizi sorduğunda, ok tuşlarıyla `App Hosting` seçeneğinin üzerine gelin, boşluk tuşuyla seçin ve Enter'a basın.

4.  **Firebase Projesini Bağlayın:**
    *   `Please select an option` (Bir seçenek seçin) sorusuna `Use an existing project` (Mevcut bir projeyi kullan) ile cevap verin.
    *   Listeden, 1. adımda oluşturduğunuz veya seçtiğiniz Firebase projesini seçin.

5.  **Arka Uç (Backend) Yapılandırması:**
    *   CLI, bir App Hosting arka ucu oluşturmanızı isteyecektir. `Create a new backend` (Yeni bir arka uç oluştur) seçeneğini seçin.
    *   Varsayılan `app` ismini kabul edebilir veya yeni bir isim verebilirsiniz.
    *   Depo konumu (`repository location`) olarak size en yakın bölgeyi seçebilirsiniz (örn: `us-central1`).

Bu adımların sonunda, `firebase.json` ve `.firebaserc` gibi dosyalarınız güncellenerek yerel projeniz buluttaki projenize bağlanmış olacaktır.

## Adım 4: Projeyi Yayınlama (Deploy)

Artık her şey hazır! Projenizi canlıya almak için aşağıdaki komutu çalıştırmanız yeterlidir:

```bash
firebase deploy
```

Bu komut:
1.  Next.js uygulamanızı derleyecektir.
2.  Gerekli dosyaları Firebase App Hosting'e yükleyecektir.
3.  İşlem tamamlandığında, projenizin canlı olarak yayınlandığı `Hosting URL`'ini size verecektir.

**İşte bu kadar!** Artık `Hosting URL` adresine giderek projenizi canlıda görebilirsiniz. Yaptığınız her yeni değişiklikten sonra tekrar `firebase deploy` komutunu çalıştırarak projenizi güncelleyebilirsiniz.
