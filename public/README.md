# PWA Icons

Bu klasöre aşağıdaki ikon dosyalarını eklemeniz gerekiyor:

## Gerekli İkonlar

1. **favicon.ico** (16x16, 32x32, 48x48)
   - Tarayıcı sekmesinde görünür

2. **apple-touch-icon.png** (180x180)
   - iOS cihazlarda ana ekran ikonu

3. **pwa-64x64.png** (64x64)
   - Küçük uygulama ikonu

4. **pwa-192x192.png** (192x192)
   - Android uygulama ikonu (normal)

5. **pwa-512x512.png** (512x512)
   - Android uygulama ikonu (yüksek çözünürlük)
   - Splash screen için kullanılır

## İkon Oluşturma

Bu ikonları oluşturmak için:

1. Niğtaş logosunu kullanın
2. Şeffaf arka plan veya beyaz arka plan
3. Online araçlar:
   - https://realfavicongenerator.net/
   - https://www.pwabuilder.com/imageGenerator

## Renk Şeması

- Primary Color: #1e40af (blue-700)
- Background: #ffffff (white)
- Theme Color: #1e40af (tarayıcı başlığı)

## Not

İkonları eklediğinizde, build alıp uygulamayı test edin:
```bash
npm run build
npm run preview
```
