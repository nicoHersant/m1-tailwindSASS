# MangaDash — Version Tailwind CSS

Dashboard de présentation de données manga, stylisé avec **Tailwind CSS v4** en approche **utility-first**.

---

## Démarrage

```bash
npm install
npm run dev   # serveur Vite sur http://localhost:5173
```

Pages disponibles :

| URL | Page |
|---|---|
| `/` ou `/index.html` | Accueil — grille de cartes |
| `/table.html` | Catalogue — tableau de données |
| `/stats.html` | Statistiques — graphiques Chart.js |

---

## Configuration Tailwind v4

```
src/
├── style.css        ← point d'entrée CSS (@import "tailwindcss" + @apply)
└── main.ts          ← point d'entrée TypeScript
```

```ts
// vite.config.ts — le plugin Tailwind compile le CSS à la volée
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
})
```

```css
/* src/style.css — une seule ligne suffit pour tout importer */
@import "tailwindcss";
```

> **Tailwind v4** n'a plus besoin de `tailwind.config.js` pour les usages courants.
> Le plugin Vite détecte automatiquement les classes utilisées dans les fichiers HTML/JS
> grâce au moteur **JIT (Just-In-Time)** : seules les classes utilisées sont générées.

---

## Approche utility-first

Tailwind est un framework **utility-first** : chaque classe CSS fait **une seule chose**.
On compose les classes directement dans le HTML pour construire les interfaces.

```html
<!-- Approche traditionnelle : une classe = beaucoup de CSS -->
<div class="card">…</div>

<!-- Approche Tailwind : des classes qui se composent -->
<div class="bg-slate-800 rounded-xl shadow-lg overflow-hidden flex flex-col
            border border-slate-700/50 hover:-translate-y-1 transition-all duration-300">
  …
</div>
```

**Quand utiliser `@apply` à la place ?**

La directive `@apply` extrait un groupe de classes dans une classe CSS nommée.
Elle est recommandée pour les **composants répétés** (cards, badges, boutons).

```css
/* src/style.css */
.manga-card {
  @apply bg-slate-800 rounded-xl shadow-lg overflow-hidden
         flex flex-col transition-all duration-300
         hover:-translate-y-1 hover:shadow-2xl
         border border-slate-700/50;
}
```

```html
<!-- HTML plus lisible grâce à @apply -->
<article class="manga-card">…</article>
```

---

## Système de grille responsive

Tailwind est **mobile-first** : les classes sans préfixe s'appliquent à tous les écrans,
les préfixes (`sm:`, `md:`, `lg:`, `xl:`) surchargent à partir d'un breakpoint.

### Breakpoints disponibles

| Préfixe | Largeur min | Usage |
|---|---|---|
| *(aucun)* | `0px` | Mobile — style de base |
| `sm:` | `640px` | Tablette portrait |
| `md:` | `768px` | Tablette paysage |
| `lg:` | `1024px` | Petit laptop |
| `xl:` | `1280px` | Desktop |
| `2xl:` | `1536px` | Grand écran |

### Grille de cartes (index.html)

```html
<!-- 1 col mobile → 2 col tablette → 3 col laptop → 4 col desktop -->
<section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
```

### Colonnes du tableau (table.html)

```html
<!-- Colonne masquée sur mobile, visible à partir de md (768px) -->
<td class="hidden md:table-cell">Auteur</td>

<!-- Colonne masquée sur mobile, visible à partir de lg (1024px) -->
<td class="hidden lg:table-cell">Note</td>
```

### Sidebar (layout principal)

```html
<!-- Grille [sidebar fixe 256px | contenu flexible] -->
<div class="grid grid-cols-[256px_1fr] transition-all duration-300">
```

---

## Modificateurs d'état

Les **variants** ajoutent un préfixe à n'importe quelle classe pour la conditionner à un état.

### Survol — `hover:`

```html
<!-- Fond au survol -->
<a class="hover:bg-slate-700">Lien</a>

<!-- Couleur au survol -->
<button class="text-slate-300 hover:text-blue-400">☰</button>

<!-- Élévation au survol (transform) -->
<article class="hover:-translate-y-1 hover:shadow-2xl transition-all">Carte</article>

<!-- Ombre colorée au survol -->
<button class="hover:shadow-blue-500/25 hover:shadow-lg">Bouton</button>
```

### Focus — `focus:`

```html
<!-- Supprime l'outline par défaut, remplace par un anneau personnalisé -->
<input class="focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500">
```

### Placeholder — `placeholder:`

```html
<input class="placeholder:text-slate-500" placeholder="Rechercher…">
```

---

## Modificateurs d'opacité — `/valeur`

Tailwind permet d'appliquer une opacité directement sur une couleur avec la syntaxe `couleur/opacité`.

```html
<!-- Fond bleu à 20% d'opacité -->
<div class="bg-blue-500/20">…</div>

<!-- Bordure bleue à 40% d'opacité -->
<span class="border border-blue-500/40">…</span>

<!-- Anneau de focus bleu à 50% d'opacité -->
<input class="focus:ring-blue-500/50">

<!-- Ombre colorée au survol à 25% -->
<button class="hover:shadow-blue-500/25">…</button>

<!-- Fond au survol à 30% d'opacité -->
<tr class="hover:bg-slate-700/30">…</tr>
```

**Opacités utilisées dans le projet :**

| Syntaxe | Opacité | Usage |
|---|---|---|
| `/20` | 20% | Fond des badges et icônes KPI |
| `/25` | 25% | Ombre colorée des boutons |
| `/30` | 30% | Survol des lignes de tableau |
| `/40` | 40% | Bordure des badges |
| `/50` | 50% | Anneau de focus, bordures subtiles |

---

## Valeurs arbitraires — `[valeur]`

Pour des valeurs qui ne sont pas dans le système Tailwind, on utilise les **crochets**.

```html
<!-- Grille avec largeur fixe personnalisée : 256px + flexible -->
<div class="grid-cols-[256px_1fr]">…</div>

<!-- Version sidebar réduite -->
<div class="grid-cols-[80px_1fr]">…</div>
```

```js
// Utilisé dans le JavaScript du toggle sidebar
layout.classList.toggle('grid-cols-[256px_1fr]')
layout.classList.toggle('grid-cols-[80px_1fr]')
```

---

## Référence des classes par catégorie

### Layout — Grille et Flex

| Classe | Propriété CSS générée | Rôle |
|---|---|---|
| `grid` | `display: grid` | Active CSS Grid |
| `grid-cols-1` | `grid-template-columns: repeat(1, 1fr)` | 1 colonne |
| `sm:grid-cols-2` | `@media(≥640px) { grid-template-columns: repeat(2,1fr) }` | 2 colonnes |
| `lg:grid-cols-3` | `@media(≥1024px) { … repeat(3,1fr) }` | 3 colonnes |
| `xl:grid-cols-4` | `@media(≥1280px) { … repeat(4,1fr) }` | 4 colonnes |
| `grid-cols-[256px_1fr]` | `grid-template-columns: 256px 1fr` | Valeur arbitraire |
| `gap-4` | `gap: 1rem` | Espacement 16px |
| `gap-6` | `gap: 1.5rem` | Espacement 24px |
| `flex` | `display: flex` | Active Flexbox |
| `flex-col` | `flex-direction: column` | Direction colonne |
| `flex-wrap` | `flex-wrap: wrap` | Retour à la ligne |
| `flex-1` | `flex: 1 1 0%` | Prend l'espace disponible |
| `flex-shrink-0` | `flex-shrink: 0` | Ne rétrécit pas |
| `items-center` | `align-items: center` | Centre verticalement |
| `items-start` | `align-items: flex-start` | Aligne en haut |
| `justify-center` | `justify-content: center` | Centre horizontalement |
| `justify-between` | `justify-content: space-between` | Espace entre éléments |
| `min-h-screen` | `min-height: 100vh` | Hauteur minimale plein écran |
| `h-screen` | `height: 100vh` | Hauteur plein écran |
| `h-16` | `height: 4rem` (64px) | Hauteur header / logo |
| `h-52` | `height: 13rem` (208px) | Hauteur image de couverture |
| `h-64` | `height: 16rem` (256px) | Hauteur canvas graphique |
| `w-full` | `width: 100%` | Largeur totale |
| `w-5`, `h-5` | `width/height: 1.25rem` (20px) | Icônes de navigation |
| `w-8`, `h-8` | `width/height: 2rem` (32px) | Avatar |
| `w-12`, `h-12` | `width/height: 3rem` (48px) | Icône KPI |

### Positionnement

| Classe | Propriété CSS | Rôle |
|---|---|---|
| `sticky` | `position: sticky` | Reste visible au scroll |
| `top-0` | `top: 0` | Collé au bord supérieur |
| `relative` | `position: relative` | Contexte de positionnement |
| `z-10` | `z-index: 10` | Empile au-dessus du contenu |
| `overflow-hidden` | `overflow: hidden` | Masque le débordement |
| `overflow-y-auto` | `overflow-y: auto` | Scroll vertical si nécessaire |
| `overflow-x-auto` | `overflow-x: auto` | Scroll horizontal (tableaux) |
| `min-w-full` | `min-width: 100%` | Tableau pleine largeur |

### Espacement

| Classe | Valeur CSS | Classe | Valeur CSS |
|---|---|---|---|
| `p-3` | `padding: .75rem` | `p-4` | `padding: 1rem` |
| `p-5` | `padding: 1.25rem` | `p-6` | `padding: 1.5rem` |
| `px-3` | `padding-left/right: .75rem` | `px-4` | `1rem` |
| `px-6` | `padding-left/right: 1.5rem` | `py-2` | `padding-top/bottom: .5rem` |
| `py-1.5` | `.375rem` | `py-3` | `.75rem` |
| `pt-3` | `padding-top: .75rem` | `mt-auto` | `margin-top: auto` |
| `mt-0.5` | `margin-top: .125rem` | `mt-1` | `.25rem` |
| `gap-1` | `gap: .25rem` | `gap-2` | `.5rem` |
| `gap-3` | `gap: .75rem` | `space-y-4` | `margin-top: 1rem` entre enfants |

### Couleurs — Fond

| Classe | Couleur | Usage |
|---|---|---|
| `bg-gray-950` | `#030712` | Fond principal très sombre |
| `bg-slate-800` | `#1e293b` | Sidebar, header, cartes |
| `bg-slate-700` | `#334155` | Survol, actif |
| `bg-slate-900` | `#0f172a` | En-tête du tableau |
| `bg-blue-600` | `#2563eb` | Bouton principal, filtre actif |
| `bg-blue-500/20` | `rgba(59,130,246,.2)` | Fond badge shōnen, KPI |
| `bg-pink-500/20` | `rgba(236,72,153,.2)` | Fond badge shōjo |
| `bg-purple-500/20` | `rgba(139,92,246,.2)` | Fond badge seinen |
| `bg-orange-500/20` | `rgba(249,115,22,.2)` | Fond badge josei |
| `bg-green-500/20` | `rgba(16,185,129,.2)` | KPI prix |
| `bg-gradient-to-br` | `background: linear-gradient(…)` | Avatar utilisateur |
| `from-blue-500` | `#3b82f6` | Début du dégradé |
| `to-purple-600` | `#9333ea` | Fin du dégradé |

### Couleurs — Texte

| Classe | Couleur | Usage |
|---|---|---|
| `text-white` | `#ffffff` | Texte principal, titres |
| `text-slate-100` | `#f1f5f9` | Variante légèrement moins blanc |
| `text-slate-200` | `#e2e8f0` | Survol des filtres inactifs |
| `text-slate-300` | `#cbd5e1` | Texte de navigation |
| `text-slate-400` | `#94a3b8` | Texte discret (auteur, label) |
| `text-slate-500` | `#64748b` | Année, très discret |
| `text-blue-400` | `#60a5fa` | Accents, icônes actives |
| `text-green-400` | `#4ade80` | Prix |
| `text-yellow-400` | `#facc15` | Étoiles de notation |
| `text-pink-400` | `#f472b6` | Badge shōjo |
| `text-purple-400` | `#c084fc` | Badge seinen |
| `text-orange-400` | `#fb923c` | Badge josei |

### Typographie

| Classe | Propriété CSS | Valeur |
|---|---|---|
| `text-xs` | `font-size` | `0.75rem` (12px) |
| `text-sm` | `font-size` | `0.875rem` (14px) |
| `text-base` | `font-size` | `1rem` (16px) |
| `text-lg` | `font-size` | `1.125rem` (18px) |
| `text-xl` | `font-size` | `1.25rem` (20px) |
| `text-2xl` | `font-size` | `1.5rem` (24px) |
| `font-medium` | `font-weight` | `500` |
| `font-semibold` | `font-weight` | `600` |
| `font-bold` | `font-weight` | `700` |
| `tracking-wide` | `letter-spacing` | `0.025em` |
| `tracking-wider` | `letter-spacing` | `0.05em` |
| `uppercase` | `text-transform` | `uppercase` |
| `leading-snug` | `line-height` | `1.375` |
| `leading-relaxed` | `line-height` | `1.625` |
| `leading-none` | `line-height` | `1` |
| `line-clamp-3` | `-webkit-line-clamp` | Tronque à 3 lignes |
| `whitespace-nowrap` | `white-space` | Pas de retour à la ligne |
| `select-none` | `user-select` | Interdit la sélection |

### Bordures

| Classe | Propriété CSS | Usage |
|---|---|---|
| `border` | `border-width: 1px` | Bordure simple |
| `border-t` | `border-top-width: 1px` | Bordure en haut |
| `border-b` | `border-bottom-width: 1px` | Bordure en bas |
| `border-slate-700` | `border-color: #334155` | Bordure principale |
| `border-slate-700/50` | `border-color: rgba(…,.5)` | Bordure subtile |
| `border-slate-600` | `border-color: #475569` | Bordure boutons |
| `border-blue-600` | `border-color: #2563eb` | Bordure filtre actif |
| `rounded` | `border-radius: .25rem` | Coins légèrement arrondis |
| `rounded-lg` | `border-radius: .5rem` | Coins moyennement arrondis |
| `rounded-xl` | `border-radius: .75rem` | Coins très arrondis |
| `rounded-full` | `border-radius: 9999px` | Cercle / pill |

### Ombres et effets

| Classe | Usage |
|---|---|
| `shadow-sm` | Ombre légère (miniatures) |
| `shadow-md` | Ombre standard (boutons) |
| `shadow-lg` | Ombre marquée (cartes) |
| `shadow-2xl` | Ombre profonde (survol) |
| `shadow-slate-900/50` | Ombre colorée semi-transparente |
| `shadow-blue-500/25` | Ombre bleue au survol des boutons |

### Transitions et animations

| Classe | Propriété CSS | Durée |
|---|---|---|
| `transition-all` | Anime toutes les propriétés | — |
| `transition-colors` | Anime uniquement les couleurs | — |
| `duration-150` | `transition-duration: 150ms` | Rapide |
| `duration-200` | `transition-duration: 200ms` | Standard |
| `duration-300` | `transition-duration: 300ms` | Lent (sidebar) |
| `duration-500` | `transition-duration: 500ms` | Très lent (barres) |
| `animate-spin` | `animation: spin 1s linear infinite` | Spinner de chargement |

### Transformations (hover)

| Classe | Propriété CSS | Effet |
|---|---|---|
| `hover:-translate-y-1` | `transform: translateY(-4px)` | Carte remonte au survol |

---

## Référence `@apply` — Composants

La directive `@apply` permet de créer des **classes composants** à partir de classes utilitaires.
Défini dans `src/style.css`.

### Navigation

```css
.nav-link {
  @apply flex items-center gap-3 px-3 py-2 rounded-lg
         text-slate-300 hover:bg-slate-700 hover:text-white
         transition-colors duration-200 text-sm font-medium;
}

.nav-link-active {
  @apply bg-slate-700 text-white;
}
```

### Badges

```css
/* Base commune */
.badge {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full
         text-xs font-semibold uppercase tracking-wide;
}

/* Variantes par catégorie — couleur/opacité */
.badge-shonen { @apply bg-blue-500/20   text-blue-400   border border-blue-500/40; }
.badge-shojo  { @apply bg-pink-500/20   text-pink-400   border border-pink-500/40; }
.badge-seinen { @apply bg-purple-500/20 text-purple-400 border border-purple-500/40; }
.badge-josei  { @apply bg-orange-500/20 text-orange-400 border border-orange-500/40; }
```

### Carte manga

```css
.manga-card        { @apply bg-slate-800 rounded-xl shadow-lg overflow-hidden flex flex-col
                            transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl
                            hover:shadow-slate-900/50 border border-slate-700/50; }
.manga-card-cover  { @apply w-full h-52 object-cover; }
.manga-card-body   { @apply p-4 flex flex-col flex-1 gap-2; }
.manga-card-title  { @apply font-bold text-white text-base leading-snug; }
.manga-card-author { @apply text-slate-400 text-sm; }
.manga-card-desc   { @apply text-slate-400 text-xs leading-relaxed flex-1 line-clamp-3; }
.manga-card-footer { @apply flex items-center justify-between pt-3 border-t border-slate-700 mt-auto; }
.manga-price       { @apply text-green-400 font-bold text-sm; }
.manga-year        { @apply text-slate-500 text-xs; }
```

### Boutons

```css
.btn          { @apply inline-flex items-center gap-2 px-4 py-2 rounded-lg
                       font-medium text-sm cursor-pointer transition-all duration-200 border-0; }
.btn-primary  { @apply bg-blue-600 text-white hover:bg-blue-500
                       shadow-md hover:shadow-blue-500/25 hover:shadow-lg; }
.btn-ghost    { @apply bg-transparent text-slate-400 hover:text-white
                       hover:bg-slate-700 border border-slate-600; }

.filter-btn          { @apply px-3 py-1.5 rounded-full text-xs font-semibold
                              border transition-all duration-200 cursor-pointer; }
.filter-btn-active   { @apply bg-blue-600 border-blue-600 text-white; }
.filter-btn-inactive { @apply bg-transparent border-slate-600 text-slate-400
                              hover:border-slate-400 hover:text-slate-200; }
```

### Formulaire

```css
.search-input {
  @apply w-full bg-slate-800 border border-slate-600 rounded-lg
         px-4 py-2 text-sm text-slate-200 placeholder:text-slate-500
         focus:outline-none focus:ring-2 focus:ring-blue-500/50
         focus:border-blue-500 transition-all duration-200;
}
```

### Tableau

```css
.th { @apply px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase
             tracking-wider bg-slate-900 cursor-pointer hover:text-slate-200
             select-none whitespace-nowrap; }
.td { @apply px-4 py-3 text-sm text-slate-300 whitespace-nowrap; }
.tr { @apply border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors duration-150; }
```

### Statistiques

```css
.stat-card    { @apply bg-slate-800 rounded-xl p-5 shadow-md
                       border border-slate-700/50 flex items-start gap-4; }
.stat-icon    { @apply w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0; }
.stat-value   { @apply text-2xl font-bold text-white leading-none; }
.stat-label   { @apply text-xs text-slate-400 mt-1; }
.stat-content { @apply flex flex-col min-w-0; }
```

---

## Tableau récapitulatif — Tailwind vs SASS

| Aspect | Tailwind | SASS |
|---|---|---|
| **Approche** | Utilitaire (`flex items-center gap-3`) | Sémantique (`.sidebar__link`) |
| **HTML** | Verbeux (beaucoup de classes) | Propre et lisible |
| **CSS** | Généré à la volée par le JIT | Fichiers `.scss` organisés |
| **Responsive** | `lg:grid-cols-3` dans le HTML | `@include responsive('lg') {}` |
| **Toggle sidebar** | 2 classes utilitaires à permuter | 1 modificateur BEM `.layout--collapsed` |
| **Variantes couleur** | Classe par classe ou `@apply` | `@each` sur une map SASS |
| **Réutilisabilité** | `@apply` dans le CSS | Mixins + composants BEM |
| **Courbe d'apprentissage** | Nécessite de connaître les classes | Progressive (CSS standard étendu) |
