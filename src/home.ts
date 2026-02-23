// ============================================================
//  PAGES / HOME (Accueil)
//
//  Logique de la page d'accueil : toggle sidebar, rendu des
//  cartes manga, filtres par catégorie et recherche.
//
//  CSS : classes Tailwind + composants @apply définis dans
//  src/style.css (.manga-card, .badge-shonen…)
// ============================================================

// --- Types ---

interface Manga {
  title:       string
  author:      string
  category:    'shonen' | 'shojo' | 'seinen' | 'josei'
  cover:       string
  description: string
  rating:      number
  volumes:     number
  year:        number
  price:       number
}

// --- Constantes ---

const CATEGORY_LABELS: Record<Manga['category'], string> = {
  shonen: 'Shōnen',
  shojo:  'Shōjo',
  seinen: 'Seinen',
  josei:  'Josei',
}

// --- Toggle sidebar ---
// Bascule entre grid-cols-[256px_1fr] et grid-cols-[80px_1fr]
// pour réduire ou étendre la sidebar Tailwind.
// Les labels (.menu-label) reçoivent la classe hidden pour disparaître.

const toggle = document.getElementById('toggle')!
const layout = document.getElementById('layout')!
const labels = document.querySelectorAll('.menu-label')

toggle.addEventListener('click', () => {
  const collapsed = layout.classList.toggle('grid-cols-[80px_1fr]')
  layout.classList.toggle('grid-cols-[256px_1fr]', !collapsed)
  labels.forEach(l => l.classList.toggle('hidden'))
})

// --- Rendu des cartes ---

/**
 * Génère le HTML d'une carte manga.
 * Les classes (.manga-card, .manga-card-cover, .badge-shonen…)
 * sont définies via @apply dans src/style.css.
 */
function renderCard(manga: Manga): string {
  return `
    <article class="manga-card">
      <img class="manga-card-cover"
           src="${manga.cover}"
           alt="Couverture de ${manga.title}"
           loading="lazy" />
      <div class="manga-card-body">
        <div class="flex items-start justify-between gap-2">
          <h2 class="manga-card-title">${manga.title}</h2>
          <span class="badge badge-${manga.category}">${CATEGORY_LABELS[manga.category]}</span>
        </div>
        <p class="manga-card-author">✍ ${manga.author}</p>
        <p class="manga-card-desc">${manga.description}</p>
        <div class="manga-card-footer">
          <div class="flex items-center gap-1 text-sm text-slate-300">
            <span class="text-yellow-400">★</span>
            <span>${manga.rating}</span>
            <span class="text-slate-500">· ${manga.volumes} vol.</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="manga-year">${manga.year}</span>
            <span class="manga-price">${manga.price.toFixed(2)} €</span>
          </div>
        </div>
      </div>
    </article>
  `
}

function renderGrid(mangas: Manga[]): void {
  const grid     = document.getElementById('cards-grid')!
  const noResult = document.getElementById('no-result')!
  const count    = document.getElementById('header-count')
  const rCount   = document.getElementById('result-count')
  const label    = `${mangas.length} manga${mangas.length > 1 ? 's' : ''}`

  if (count)  count.textContent  = label
  if (rCount) rCount.textContent = `${mangas.length} résultat${mangas.length > 1 ? 's' : ''}`

  if (mangas.length === 0) {
    grid.innerHTML = ''
    noResult.classList.remove('hidden')
  } else {
    noResult.classList.add('hidden')
    grid.innerHTML = mangas.map(renderCard).join('')
  }
}

// --- Filtres et recherche ---

let allMangas:    Manga[]  = []
let activeFilter: string  = 'all'
let searchQuery:  string  = ''

function applyFilters(): void {
  let result = allMangas
  if (activeFilter !== 'all') result = result.filter(m => m.category === activeFilter)
  if (searchQuery.trim()) result = result.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.author.toLowerCase().includes(searchQuery.toLowerCase())
  )
  renderGrid(result)
}

// --- Chargement des données ---

fetch('/mangas.json')
  .then(r => r.json())
  .then((data: Manga[]) => {
    allMangas = data
    document.getElementById('loading')?.remove()
    renderGrid(allMangas)
  })

// Clic sur un bouton de filtre
// Bascule les classes filter-btn-active / filter-btn-inactive
document.getElementById('filters')!.addEventListener('click', (e: MouseEvent) => {
  const btn = (e.target as Element).closest<HTMLButtonElement>('[data-filter]')
  if (!btn) return
  activeFilter = btn.dataset.filter!
  document.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach(b => {
    b.classList.toggle('filter-btn-active',   b === btn)
    b.classList.toggle('filter-btn-inactive', b !== btn)
  })
  applyFilters()
})

// Saisie dans la barre de recherche (debounce 200 ms)
let timer: ReturnType<typeof setTimeout>
document.getElementById('search')!.addEventListener('input', (e: Event) => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    searchQuery = (e.target as HTMLInputElement).value
    applyFilters()
  }, 200)
})
