# Key Plus - sajt

Statički sajt arhitektonskog studija Key Plus, na srpskom i engleskom. Napravljen je samo od HTML, CSS i JavaScript fajlova, pa ga nije potrebno instalirati ni build-ovati.

## Struktura

```
index.html                   Početna (SR)
projekti.html                Projekti (SR)
o-nama.html                  O nama (SR)
kontakt.html                 Kontakt (SR)
politika-privatnosti.html    Politika privatnosti (SR)
en/                          iste stranice na engleskom
assets/css/motion.css        animacije
assets/css/site.css          raspored i stilovi stranica
assets/js/site.js            meni na telefonu, efekat na fotografijama, kontakt forma
assets/js/gallery.js         galerija projekata: filteri i pregled preko celog ekrana
assets/img/                  fotografije i logo
404.html                     stranica "nije pronađeno"
```

Svaka stranica sadrži dve verzije, za desktop i za telefon. Na ekranima užim od 760 px prikazuje se verzija za telefon.

## Objavljivanje na GitHub Pages

1. Napravite novi repozitorijum na GitHub-u, na primer `keyplus-sajt`.
2. Otpremite sadržaj ovog foldera u koren repozitorijuma: dugme **Add file > Upload files**, ili preko git-a:
   ```
   git init
   git add .
   git commit -m "Key Plus sajt"
   git branch -M main
   git remote add origin https://github.com/KORISNIK/keyplus-sajt.git
   git push -u origin main
   ```
3. U repozitorijumu otvorite **Settings > Pages**. Pod **Source** izaberite **Deploy from a branch**, zatim granu `main` i folder `/ (root)`, pa sačuvajte.
4. Posle minut-dva sajt je dostupan na `https://KORISNIK.github.io/keyplus-sajt/`.

### Sopstveni domen

U **Settings > Pages > Custom domain** upišite domen, na primer `keyplus.rs`. GitHub će napraviti fajl `CNAME`. Kod registra domena podesite DNS zapise koje GitHub navodi i uključite **Enforce HTTPS**.

## Kontakt forma

Forma ne zahteva server. Po podrazumevanom podešavanju otvara email program posetioca sa već popunjenom porukom za studiokeyplus@gmail.com.

Ako želite da se poruke šalju direktno sa sajta:

1. Napravite besplatnu formu na [formspree.io](https://formspree.io) sa adresom studiokeyplus@gmail.com.
2. Kopirajte adresu forme, na primer `https://formspree.io/f/abcdwxyz`.
3. U fajlovima `kontakt.html` i `en/contact.html` pronađite `data-endpoint=""` (dva puta u svakom fajlu, za desktop i telefon) i upišite adresu između navodnika.
4. U politici privatnosti upišite Formspree kao servis koji prima poruke.

## Šta još treba popuniti

- **O nama:** fotografija i kratak tekst o Tijani Čabrilo. Mesto je označeno sa `[Fotografija - Tijana Čabrilo]` i `[Kratak tekst o Tijani...]`.
- **Politika privatnosti:** `[pun naziv i PIB]`, `[rok]`, `[naziv servisa]` i `[datum objave]`, na srpskom i na engleskom.

Fotografiju Tijane dodajte u `assets/img/` i u `o-nama.html` i `en/about.html` zamenite blok sa oznakom `kp-ph-label` slikom.
