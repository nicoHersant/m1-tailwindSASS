# MangaDash — Version SASS

Dashboard de présentation de données manga, stylisé entièrement en **SASS** avec une architecture modulaire et la méthodologie **BEM**.

---

## Démarrage

```bash
npm install   # installe sass (nécessaire pour la compilation SCSS)
npm run dev   # lance le serveur Vite sur http://localhost:5173
```

Pages disponibles en dev :
| URL | Page |
|---|---|
| `/sass-index.html` | Accueil — grille de cartes |
| `/sass-table.html` | Catalogue — tableau de données |
| `/sass-stats.html` | Statistiques — graphiques Chart.js |

---

## Structure du projet

```
src/
└── sass/
    ├── abstracts/               ← Pas de CSS généré, uniquement des outils
    │   ├── _variables.scss      ← Toutes les valeurs de design (couleurs, tailles…)
    │   ├── _mixins.scss         ← Blocs de code réutilisables
    │   └── _index.scss          ← @forward (barrel module)
    ├── base/
    │   ├── _reset.scss          ← Normalisation CSS / styles de base
    │   └── _index.scss
    ├── components/              ← Composants réutilisables
    │   ├── _badges.scss         ← Badges de catégorie (shōnen, shōjo…)
    │   ├── _buttons.scss        ← Boutons (.btn--primary, .btn--ghost)
    │   ├── _cards.scss          ← Cartes manga (BEM complet)
    │   ├── _forms.scss          ← Input de recherche
    │   ├── _table.scss          ← Tableau de données
    │   ├── _stat-cards.scss     ← Cartes KPI et graphiques
    │   └── _index.scss
    ├── layout/                  ← Mise en page
    │   ├── _layout.scss         ← Grille principale [sidebar | contenu]
    │   ├── _sidebar.scss        ← Barre de navigation latérale
    │   ├── _header.scss         ← En-tête de page
    │   └── _index.scss
    ├── pages/                   ← Styles spécifiques à chaque page
    │   ├── _home.scss
    │   ├── _catalogue.scss
    │   ├── _stats.scss
    │   └── _index.scss
    └── main.scss                ← Point d'entrée : @use dans l'ordre
```

> Architecture inspirée du pattern **7-1** : [sass-guidelin.es](https://sass-guidelin.es/#architecture)

---

## Concepts SASS illustrés

### 1. Variables — `$variable`

Centralise toutes les valeurs de design. Modifier une variable impacte tout le projet.

```scss
// src/sass/abstracts/_variables.scss

// Couleur
$color-accent: #3b82f6;

// Utilisation dynamique
background-color: rgba($color-accent, 0.2);  // → rgba(59,130,246,0.2)
color: lighten($color-accent, 15%);           // → nuance plus claire
```

**Différence variable SASS vs variable CSS :**

| Variable SASS (`$var`) | Variable CSS (`--var`) |
|---|---|
| Compilée, disparaît dans le CSS final | Présente dans le CSS, modifiable en JS |
| Utilisable dans les calculs, mixins, @each | Limitée aux valeurs de propriétés |
| `$spacing-4 * 2` = 2rem | `calc(var(--spacing-4) * 2)` |

---

### 2. Maps et `@each` — génération automatique

Une **map** est un dictionnaire clé/valeur. Couplée à `@each`, elle génère
des classes automatiquement sans répétition.

```scss
// _variables.scss
$badge-categories: (
  'shonen': #3b82f6,   // Shōnen → bleu
  'shojo':  #ec4899,   // Shōjo  → rose
  'seinen': #8b5cf6,   // Seinen → violet
  'josei':  #f97316,   // Josei  → orange
);

// _badges.scss — @each génère 4 classes à partir de la map
.badge {
  // styles de base...

  @each $name, $color in $badge-categories {
    // #{$name} = interpolation : insère la valeur dans le sélecteur
    &--#{$name} {
      background-color: rgba($color, 0.2);
      color: lighten($color, 15%);
      border-color: rgba($color, 0.4);
    }
  }
}

// CSS généré →
// .badge--shonen { background-color: rgba(59,130,246,0.2); … }
// .badge--shojo  { background-color: rgba(236,72,153,0.2); … }
// .badge--seinen { background-color: rgba(139,92,246,0.2); … }
// .badge--josei  { background-color: rgba(249,115,22,0.2); … }
```

**Usage HTML :**
```html
<span class="badge badge--shonen">Shōnen</span>
<span class="badge badge--seinen">Seinen</span>
```

---

### 3. Mixins — `@mixin` / `@include`

Un mixin est un bloc de CSS paramétrable et réutilisable.

```scss
// _mixins.scss

// Mixin sans paramètre
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

// Mixin avec paramètre et valeur par défaut
@mixin flex-align($justify: flex-start) {
  display: flex;
  align-items: center;
  justify-content: $justify;
}

// Mixin qui génère du CSS complexe
@mixin badge-variant($color) {
  background-color: rgba($color, 0.2);
  color: lighten($color, 15%); 
  border-color: rgba($color, 0.4);
}

// Mixin avec @content (comme un <slot>)
@mixin responsive($bp) {
  $width: map.get(v.$breakpoints, $bp);
  @media (min-width: #{$width}) {
    @content;  // contenu injecté par l'appelant
  }
}
```

```scss
// Utilisation avec @include
.sidebar {
  @include mx.flex-column;     // appel sans paramètre
}

.header {
  @include mx.flex-align(space-between);  // appel avec paramètre
}

// Utilisation du mixin responsive avec @content
.cards-grid {
  grid-template-columns: 1fr;

  @include mx.responsive('sm') { grid-template-columns: repeat(2, 1fr); }
  @include mx.responsive('lg') { grid-template-columns: repeat(3, 1fr); }
  @include mx.responsive('xl') { grid-template-columns: repeat(4, 1fr); }
}
```

**Mixins disponibles dans ce projet :**

| Mixin | Paramètres | Rôle |
|---|---|---|
| `flex-center` | — | Centre horizontalement et verticalement |
| `flex-align($justify)` | `flex-start` | Flex avec alignement configurable |
| `flex-column` | — | Pile les enfants verticalement |
| `card-base` | — | Fond + bordure + ombre des cartes |
| `btn-base` | — | Base commune de tous les boutons |
| `badge-variant($color)` | couleur | Fond + texte + bordure semi-transparents |
| `responsive($bp)` | `'sm'` `'md'` `'lg'` `'xl'` | Génère une media query |
| `line-clamp($lines)` | `3` | Tronque le texte après N lignes |
| `custom-scrollbar(...)` | width, track, thumb | Scrollbar personnalisée webkit |
| `focus-ring($color)` | accent | Anneau de focus accessible |
| `sr-only` | — | Masqué visuellement, lisible par lecteur d'écran |

---

### 4. Nesting et méthodologie BEM

SASS permet d'imbriquer les sélecteurs. Combiné à BEM, cela donne un code
très lisible et organisé.

**BEM :**
- `block` → composant autonome
- `block__element` → partie du composant (`__`)
- `block--modifier` → variante du composant (`--`)

```scss
// _sidebar.scss

.sidebar {                          // Block
  background-color: v.$color-bg-card;

  &__logo {                         // Element : .sidebar__logo
    height: v.$header-height;
    // …
  }

  &__link {                         // Element : .sidebar__link
    color: v.$color-text-secondary;

    &:hover {                       // Pseudo-classe imbriquée
      background-color: v.$color-bg-hover;
    }

    &--active {                     // Modifier : .sidebar__link--active
      color: v.$color-text-primary;
      background-color: v.$color-bg-active;
    }
  }

  &__label {
    &.is-hidden {                   // Classe JS combinée
      opacity: 0;
      width: 0;
      overflow: hidden;
    }
  }
}
```

**HTML correspondant :**
```html
<aside class="sidebar">
  <div class="sidebar__logo">…</div>
  <nav class="sidebar__nav">
    <a class="sidebar__link sidebar__link--active" href="…">
      <svg class="sidebar__icon">…</svg>
      <span class="sidebar__label">Accueil</span>
    </a>
  </nav>
</aside>
```

**Le toggle sidebar en JS :**
```js
// SASS (1 classe BEM sémantique)
layout.classList.toggle('layout--collapsed')

// Tailwind (2 classes utilitaires à permuter)
layout.classList.toggle('grid-cols-[256px_1fr]')
layout.classList.toggle('grid-cols-[80px_1fr]')
```

---

### 5. `@use` et `@forward` — imports modernes

> `@import` est **déprécié** depuis SASS 2.0. Les remplaçants sont `@use` et `@forward`.

| Directive | Rôle |
|---|---|
| `@use 'module'` | Charge un module dans le fichier courant |
| `@forward 'module'` | Re-exporte un module vers les fichiers parents |

```scss
// abstracts/_index.scss — agrège les partials du dossier
@forward 'variables';   // re-exporte pour les consommateurs
@forward 'mixins';

// layout/_sidebar.scss — consomme les abstracts
@use '../abstracts/variables' as v;  // namespace : v.$color-accent
@use '../abstracts/mixins' as mx;    // namespace : @include mx.flex-center

// main.scss — orchestre tout
@use 'abstracts';    // charge abstracts/_index.scss
@use 'base';
@use 'layout';
@use 'components';
@use 'pages';
```

**Pourquoi `@use` plutôt que `@import` ?**
- Chaque fichier est chargé **une seule fois** (singleton)
- Les variables sont **encapsulées** dans un namespace
- Pas de risque de conflit de noms entre fichiers

---

### 6. Fonctions de couleur SASS

SASS fournit des fonctions pour manipuler les couleurs.

```scss
// Éclaircir une couleur de 15%
color: lighten(#3b82f6, 15%);       // → #6fa7f9

// Assombrir de 10%
background: darken(#334155, 10%);   // → #202c3c

// Ajouter de la transparence
background: rgba(#3b82f6, 0.2);     // → rgba(59,130,246,0.2)
```

**Utilisées dans ce projet :**
```scss
// _badges.scss
color: lighten($color, 15%);           // texte du badge
border-color: rgba($color, 0.4);       // bordure du badge

// _header.scss
color: lighten(v.$color-accent, 15%);  // couleur du badge du header

// _mixins.scss — dans custom-scrollbar
&:hover { background: lighten($thumb, 10%); }
```

---

### 7. Animations — `@keyframes`

```scss
// pages/_home.scss

// Déclaration de l'animation avec une variable SASS pour la durée
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

// Application
.spinner {
  animation: spin 1s linear infinite;
}
```

---

### 8. Pseudo-éléments et pseudo-classes

```scss
// _forms.scss
.search-input {
  &::placeholder {
    color: v.$color-text-faint;    // style du placeholder
  }

  &:focus {
    border-color: v.$color-accent;
    box-shadow: 0 0 0 3px rgba(v.$color-accent, 0.25);
  }
}

// _table.scss
.data-table {
  &__th {
    &:hover { color: v.$color-text-secondary; }

    &.is-sorted .sort-icon {
      opacity: 1;
      color: v.$color-accent;
    }
  }
}
```

---

## Référence des Variables

### Couleurs

| Variable | Valeur | Usage |
|---|---|---|
| `$color-bg-app` | `#030712` | Fond principal (très sombre) |
| `$color-bg-surface` | `#0f172a` | Fond secondaire |
| `$color-bg-card` | `#1e293b` | Fond cartes / sidebar |
| `$color-bg-hover` | `#334155` | Survol d'éléments |
| `$color-bg-active` | `#334155` | État actif |
| `$color-border` | `#334155` | Bordure principale |
| `$color-border-subtle` | `rgba(#334155, 0.5)` | Bordure légère |
| `$color-text-primary` | `#f1f5f9` | Texte principal |
| `$color-text-secondary` | `#cbd5e1` | Texte secondaire |
| `$color-text-muted` | `#94a3b8` | Texte discret |
| `$color-text-faint` | `#64748b` | Texte très discret |
| `$color-accent` | `#3b82f6` | Bleu accent |
| `$color-accent-dark` | `#2563eb` | Bleu foncé (hover) |
| `$color-success` | `#10b981` | Vert (prix) |
| `$color-warning` | `#f59e0b` | Ambre (étoiles) |
| `$color-danger` | `#ef4444` | Rouge (erreurs) |

### Map des catégories

```scss
$badge-categories: (
  'shonen': #3b82f6,   // bleu
  'shojo':  #ec4899,   // rose
  'seinen': #8b5cf6,   // violet
  'josei':  #f97316,   // orange
);
```

### Typographie

| Variable | Valeur |
|---|---|
| `$font-size-xs` | `0.75rem` (12px) |
| `$font-size-sm` | `0.875rem` (14px) |
| `$font-size-base` | `1rem` (16px) |
| `$font-size-lg` | `1.125rem` (18px) |
| `$font-size-xl` | `1.25rem` (20px) |
| `$font-size-2xl` | `1.5rem` (24px) |
| `$font-weight-normal` | `400` |
| `$font-weight-medium` | `500` |
| `$font-weight-semibold` | `600` |
| `$font-weight-bold` | `700` |

### Espacements (base 4px)

| Variable | Valeur |
|---|---|
| `$spacing-1` | `0.25rem` (4px) |
| `$spacing-2` | `0.5rem` (8px) |
| `$spacing-3` | `0.75rem` (12px) |
| `$spacing-4` | `1rem` (16px) |
| `$spacing-6` | `1.5rem` (24px) |
| `$spacing-8` | `2rem` (32px) |

### Layout / Effets

| Variable | Valeur |
|---|---|
| `$sidebar-width` | `256px` |
| `$sidebar-width-collapsed` | `80px` |
| `$header-height` | `64px` |
| `$radius-sm/md/lg/xl/full` | `4 / 8 / 12 / 16 / 9999px` |
| `$shadow-sm/md/lg/xl` | ombres progressives |
| `$transition-fast/base/slow` | `150 / 200 / 300ms ease` |

### Breakpoints

| Variable | Valeur |
|---|---|
| `$breakpoints('sm')` | `640px` |
| `$breakpoints('md')` | `768px` |
| `$breakpoints('lg')` | `1024px` |
| `$breakpoints('xl')` | `1280px` |

---

## Référence des Composants BEM

### Layout

| Classe | Type | Rôle |
|---|---|---|
| `.layout` | Block | Grille principale [sidebar \| contenu] |
| `.layout__main` | Element | Zone contenu (header + main) |
| `.layout--collapsed` | **Modifier** | Sidebar réduite à 80px |
| `.sidebar` | Block | Barre de navigation latérale |
| `.sidebar__logo` | Element | Zone logo / titre |
| `.sidebar__nav` | Element | Conteneur de navigation |
| `.sidebar__link` | Element | Lien de navigation |
| `.sidebar__link--active` | **Modifier** | Lien de la page active |
| `.sidebar__icon` | Element | Icône SVG du lien |
| `.sidebar__label` | Element | Texte du lien (masquable) |
| `.sidebar__footer` | Element | Pied de sidebar |
| `.header` | Block | En-tête de page |
| `.header__toggle` | Element | Bouton hamburger |
| `.header__title` | Element | Titre de la page |
| `.header__actions` | Element | Zone d'actions |
| `.header__badge` | Element | Badge compteur |
| `.header__avatar` | Element | Avatar utilisateur |
| `.main` | Block | Zone de contenu scrollable |

### Composants

| Classe | Type | Rôle |
|---|---|---|
| `.badge` | Block | Étiquette de catégorie |
| `.badge--shonen/shojo/seinen/josei` | **Modifier** | Couleurs par catégorie |
| `.manga-card` | Block | Carte de présentation |
| `.manga-card__cover` | Element | Image de couverture |
| `.manga-card__body` | Element | Corps de la carte |
| `.manga-card__head` | Element | Titre + badge |
| `.manga-card__title` | Element | Titre du manga |
| `.manga-card__author` | Element | Auteur |
| `.manga-card__desc` | Element | Description tronquée |
| `.manga-card__footer` | Element | Note + prix |
| `.manga-card__meta` | Element | Métadonnées (étoiles, volumes) |
| `.manga-card__price` | Element | Prix (vert) |
| `.manga-card__year` | Element | Année de publication |
| `.btn` | Block | Bouton de base |
| `.btn--primary` | **Modifier** | Bouton principal (bleu) |
| `.btn--ghost` | **Modifier** | Bouton fantôme (transparent) |
| `.filter-btn` | Block | Bouton filtre catégorie |
| `.filter-btn--active` | **Modifier** | Filtre sélectionné |
| `.search-input` | Block | Champ de recherche |
| `.search-input--constrained` | **Modifier** | Largeur limitée |
| `.data-table-wrapper` | Block | Conteneur responsive du tableau |
| `.data-table` | Block | Tableau de données |
| `.data-table__th` | Element | En-tête de colonne |
| `.data-table__row` | Element | Ligne de données |
| `.data-table__cell` | Element | Cellule |
| `.data-table__cell--title` | **Modifier** | Titre mis en valeur |
| `.data-table__cell--price` | **Modifier** | Prix (vert) |
| `.data-table__cell--muted` | **Modifier** | Texte discret |
| `.data-table__cell--center` | **Modifier** | Centré |
| `.data-table__cell--thumb` | **Modifier** | Miniature image |
| `.kpi-grid` | Block | Grille des KPI |
| `.kpi-card` | Block | Carte KPI |
| `.kpi-card__icon` | Element | Icône |
| `.kpi-card__value` | Element | Valeur principale |
| `.kpi-card__label` | Element | Libellé |
| `.kpi-card--blue/green/purple/orange` | **Modifier** | Couleur de l'icône |
| `.chart-card` | Block | Carte de graphique |
| `.chart-card__title` | Element | Titre |
| `.chart-card__canvas` | Element | Conteneur Chart.js |
| `.charts-grid` | Block | Grille des graphiques |
| `.progress-bar` | Block | Barre de progression |
| `.progress-bar__track` | Element | Piste (fond gris) |
| `.progress-bar__fill` | Element | Remplissage coloré |
| `.progress-bar__fill--shonen/shojo/seinen/josei` | **Modifier** | Couleur par catégorie |

---

## Comparaison SASS vs Tailwind

| Aspect | SASS | Tailwind |
|---|---|---|
| **Approche** | Sémantique (`.sidebar__link`) | Utilitaire (`flex items-center gap-3`) |
| **HTML** | Propre et lisible | Verbeux (beaucoup de classes) |
| **CSS** | Fichiers `.scss` organisés | Généré à la volée par le JIT |
| **Toggle sidebar** | `layout--collapsed` (1 classe) | `grid-cols-[256px_1fr]` (2 classes) |
| **Responsive** | `@include responsive('lg') {}` | `lg:grid-cols-3` dans le HTML |
| **Variantes couleur** | `@each` sur une map | Classe par classe ou `@apply` |
| **Réutilisabilité** | Mixins + @extend | `@apply` dans le CSS |
| **Courbe d'apprentissage** | Progressive | Nécessite de connaître les classes |
