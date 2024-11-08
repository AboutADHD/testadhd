# Test ADHD pentru Adulți - Scala ASRS v1.1

Acesta este un proiect de testare și autoevaluare pentru ADHD la adulți, utilizând Scala **ASRS v1.1 (Adult ADHD Self-Report Scale)**. Proiectul este complet open-source și poate fi utilizat atât în scop personal, cât și pentru îmbunătățirea comunității de codare open-source.

## Disclaimer important

Este important de reținut că rezultatul obținut este pur informativ, în scop de screening și NU este menit să ofere un diagnostic. Utilizatorii sunt încurajați să consulte un profesionist calificat pentru o evaluare cuprinzătoare.

## Descrierea proiectului

Scala ASRS v1.1 este un instrument utilizat pentru screening-ul ADHD la adulți. Acest proiect web permite utilizatorilor să completeze testul ASRS și să obțină un scor bazat pe răspunsurile lor, oferind o estimare inițială a prezenței trăsăturilor ADHD.

Proiectul asigură **confidențialitate totală** - nu colectăm și nu stocăm nicio informație despre utilizatori.

## Caracteristici

- **Test complet confidențial** - Nu colectăm date personale
- **Interfață prietenoasă și ușor de utilizat**
- **Scor instantaneu** - Obțineți rezultate imediat după completarea testului
- **Răspunsuri evidențiate pentru pragul ADHD** - Opțiunile care depășesc pragul pentru ADHD sunt evidențiate vizual
- **Bară de progres** - Utilizatorii sunt informați în timp real despre progresul lor
- **Disponibil în română**

## Cum să contribui

Proiectul este open-source și oricine dorește să contribuie este binevenit. Dacă aveți idei de îmbunătățire sau vreți să raportați un bug, urmați pașii de mai jos.

### 1. Fork & Clone

Faceți un **fork** al acestui repository și clonați-l local:

```bash
git clone https://github.com/hodorogandrei/testadhd.git
cd testadhd
```

2. Creați o ramură nouă (fork)

Pentru a contribui cu modificările dvs., creați o ramură nouă:

```bash
git checkout -b numele-feature-ului
```

4. Testați și verificați modificările

Încărcați index.html într-un browser și verificați că modificările dvs. funcționează corespunzător. Asigurați-vă că:
- Nu există erori în consolă.
- Modificările sunt compatibile cu toate funcționalitățile existente.
- Confidențialitatea utilizatorului rămâne intactă.

5. Trimiteți un Pull Request

După ce modificările sunt complete, trimiteți un Pull Request (PR) și adăugați o descriere clară a ceea ce ați adăugat sau modificat.

## Structura proiectului

Pentru a ajuta contribuabilii să înțeleagă mai bine structura proiectului, iată o descriere a principalelor secțun:
- `index.html`: Fișierul HTML principal care conține structura paginii, elementele vizuale și codul Javascript.
- secțiunea CSS: Stiluri CSS personalizate pentru aplicație, inclusiv animații și evidențieri ale elementelor pragului ADHD.
- secțiunea Javascript JavaScript-ul principal care gestionează logica aplicației (generarea întrebărilor, gestionează bara de progres, evidențierea întrebărilor necompletate, calculul scorurilor și interpretarea acestora
- `README.md`: Acest fișier, care descrie proiectul și oferă îndrumări despre cum se poate contribui.

## Cum funcționează

1. Întrebările sunt generate automat folosind o listă predefinită în `index.html`. Fiecare întrebare are un prag de răspuns care poate semnala ADHD.
2. Bara de progres actualizează utilizatorul în timp real în legătură cu progresul testului.
3. Eroare pentru întrebările necompletate: La apăsarea butonului de trimitere, utilizatorul este informat despre întrebările la care nu a răspuns.
4. Răspunsurile care depășesc pragul sunt contorizate și prezentate într-un raport general de calcul.
5. Scorul calculat în final poate sugera prezența sau absența trăsăturilor ADHD.

## Cerințe pentru configurare locală

Acest proiect **nu** necesită un backend sau o bază de date, fiind complet static. Încărcați fișierul index.html într-un browser pentru a rula aplicația.

## Confidențialitate și securitate

Acest proiect nu colectează date despre utilizatori. Codul poate fi verificat de oricine pentru a se asigura că nu există funcționalități ascunse de colectare a datelor.

Pentru orice întrebări sau asistență, îmi puteți scrie un email la `contact@aboutadhd.ro` sau trimite un mesaj în cadrul secțiunii `Issues` de pe GitHub.

## Licență

Acest proiect este licențiat sub licența Creative Commons Attribution 4.0 International. Puteți folosi, distribui și modifica acest cod cu condiția să acordați credit autorului original.

Sperăm că acest proiect vă va fi de folos și că veți contribui la îmbunătățirea lui!