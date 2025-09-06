# Projeyi Yayına Alma

Bu doküman, Firebase Studio'da oluşturduğunuz bu Next.js projesini nasıl canlıya alacağınızı (yayınlayacağınızı) açıklar. Projenizi **Firebase App Hosting** veya **Netlify** üzerinden yayınlayabilirsiniz.

---

## Seçenek 1: Firebase App Hosting ile Yayınlama (Mevcut Yapılandırma)

Projeniz, modern web uygulamaları için tasarlanmış güçlü bir servis olan **Firebase App Hosting** kullanılarak yayınlanmak üzere yapılandırılmıştır.

### Gereksinimler

Yayınlama işlemine başlamadan önce bilgisayarınızda aşağıdakilerin kurulu olduğundan emin olun:

1.  **Node.js:** [Node.js resmi web sitesinden](https://nodejs.org/) indirebilirsiniz.
2.  **Firebase CLI:** Firebase komut satırı arayüzü. Eğer kurulu değilse, aşağıdaki komutla kurabilirsiniz.

### Adım 1: Firebase CLI Kurulumu

Terminalinizi (macOS/Linux) veya Komut İstemi/PowerShell'i (Windows) açın ve aşağıdaki komutu çalıştırın:

```bash
npm install -g firebase-tools
```

Bu komut, Firebase araçlarını bilgisayarınıza genel olarak yükleyerek her yerden erişilebilir hale getirir.

### Adım 2: Firebase Hesabınıza Giriş Yapma

Firebase CLI'ı kullanarak Google hesabınızla Firebase'e giriş yapın:

```bash
firebase login
```

Bu komut, tarayıcınızda bir pencere açarak giriş yapmanızı isteyecektir. Giriş yaptıktan sonra terminale geri dönebilirsiniz.

### Adım 3: Firebase Projesini Yapılandırma

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

### Adım 4: Projeyi Yayınlama (Deploy)

Artık her şey hazır! Projenizi canlıya almak için aşağıdaki komutu çalıştırmanız yeterlidir:

```bash
firebase deploy
```

Bu komut, projenizi derleyip Firebase App Hosting'e yükleyecek ve size canlı sitenizin linkini verecektir.

---

## Seçenek 2: GitHub ve Netlify ile Yayınlama

Bu yöntem, sürekli entegrasyon ve dağıtım (CI/CD) için harikadır. Kodunuzu GitHub'a her gönderdiğinizde Netlify sitenizi otomatik olarak günceller.

### Adım 1: Projeyi GitHub'a Aktarma

1.  **Yerel Git Deposunu Başlatma:** Projenizin ana dizininde bir terminal açın ve aşağıdaki komutları çalıştırın:
    ```bash
    git init -b main
    git add .
    git commit -m "Initial commit"
    ```

2.  **GitHub'da Depo Oluşturma:**
    *   [GitHub](https://github.com/)'a gidin ve yeni bir depo (`repository`) oluşturun. Deponuza bir isim verin ve "public" veya "private" olarak ayarlayın.

3.  **Yerel Depoyu GitHub'a Bağlama:**
    *   GitHub'da deponuzu oluşturduktan sonra size verilen komutları takip edin. Bu komutlar genellikle şuna benzer olacaktır:
    ```bash
    git remote add origin https://github.com/KULLANICI_ADINIZ/DEPO_ADINIZ.git
    git push -u origin main
    ```

### Adım 2: Projeyi Netlify Üzerinden Yayınlama

1.  **Netlify Hesabı Oluşturma:**
    *   [Netlify](https://www.netlify.com/)'a gidin ve GitHub hesabınızı kullanarak ücretsiz bir hesap oluşturun.

2.  **Yeni Site Oluşturma:**
    *   Netlify kontrol panelinde ("dashboard"), **"Add new site"** veya **"Import from Git"** butonuna tıklayın.
    *   Git sağlayıcısı olarak **GitHub**'ı seçin.
    *   Netlify'a GitHub hesabınıza erişim izni verin ve 1. Adım'da oluşturduğunuz depoyu seçin.

3.  **Derleme Ayarlarını Yapılandırma:**
    *   Netlify, projenizin bir Next.js projesi olduğunu otomatik olarak tanıyacaktır. Ayarlar genellikle doğru şekilde doldurulur:
        *   **Build command:** `next build`
        *   **Publish directory:** `.next`
    *   Bu ayarlar projenizdeki `netlify.toml` dosyası tarafından zaten sağlanmaktadır. Genellikle ek bir değişiklik yapmanız gerekmez.

4.  **Ortam Değişkenlerini Ekleme (ÇOK ÖNEMLİ):**
    *   Projenizin çalışması için `GEMINI_API_KEY` gibi API anahtarlarına ihtiyacı vardır. Bu anahtarları asla kodunuzun içine yazmamalısınız.
    *   Netlify'ın site ayarlarında **Site configuration > Build & deploy > Environment > Environment variables** bölümüne gidin.
    *   **"Add a variable"** butonuna tıklayarak projenizdeki `.env` veya `.env.local` dosyasında bulunan tüm anahtarları buraya ekleyin.
        *   **Key:** `GEMINI_API_KEY`
        *   **Value:** `sizin_gercek_api_anahtarınız`

5.  **Siteyi Yayınlama (Deploy):**
    *   **"Deploy site"** veya **"Deploy"** butonuna tıklayın. Netlify projenizi derlemeye ve yayınlamaya başlayacaktır.
    *   İlk dağıtım birkaç dakika sürebilir. İşlem tamamlandığında, sitenizin canlı URL'ini (`ornegin.netlify.app`) alacaksınız.

**İşte bu kadar!** Artık projenizi GitHub'a her `push` yaptığınızda, Netlify otomatik olarak sitenizi güncelleyecektir.
