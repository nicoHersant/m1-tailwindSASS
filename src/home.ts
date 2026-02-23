// ============================================================
//  PAGES / HOME
//
//  Logique de la page d'accueil : toggle sidebar, rendu des
//  cartes manga, filtres par catégorie et recherche.
// ============================================================

// --- Types ---

interface Manga {
    title: string
    author: string
    category: 'shonen' | 'shojo' | 'seinen' | 'josei'
    cover: string
    description: string
    rating: number
    volumes: number
    year: number
    price: number
}

// --- Constantes ---

const CATEGORY_LABELS: Record<Manga['category'], string> = {
    shonen: 'Shōnen',
    shojo: 'Shōjo',
    seinen: 'Seinen',
    josei: 'Josei',
}

// --- Toggle sidebar ---
// Bascule le modificateur BEM .layout--collapsed défini dans
// src/sass/layout/_layout.scss. Un seul modificateur sémantique
// suffit pour changer toute la mise en page de la grille.

const toggle = document.getElementById('toggle')!
const layout = document.getElementById('layout')!
const labels = document.querySelectorAll('.menu-label')

toggle.addEventListener('click', () => {
    layout.classList.toggle('layout--collapsed')
    labels.forEach(l => l.classList.toggle('is-hidden'))
})

// --- Rendu des cartes ---

/**
 * Génère le HTML BEM d'une carte manga.
 * Les classes (.manga-card, .manga-card__cover, .badge--shonen…)
 * sont définies dans src/sass/components/_cards.scss et _badges.scss.
 */
function renderCard(manga: Manga): string {
    return `
    <article class="manga-card">
      <img class="manga-card__cover"
           src="${manga.cover}"
           alt="Couverture de ${manga.title}"
           loading="lazy" />
      <div class="manga-card__body">
        <div class="manga-card__head">
          <h2 class="manga-card__title">${manga.title}</h2>
          <span class="badge badge--${manga.category}">${CATEGORY_LABELS[manga.category]}</span>
        </div>
        <p class="manga-card__author">✍ ${manga.author}</p>
        <p class="manga-card__desc">${manga.description}</p>
        <div class="manga-card__footer">
          <div class="manga-card__meta">
            <span class="star">★</span>
            <span>${manga.rating}</span>
            <span>· ${manga.volumes} vol.</span>
          </div>
          <div style="display:flex;align-items:center;gap:.75rem">
            <span class="manga-card__year">${manga.year}</span>
            <span class="manga-card__price">${manga.price.toFixed(2)} €</span>
          </div>
        </div>
      </div>
    </article>
  `
}

function renderGrid(mangas: Manga[]): void {
    const grid = document.getElementById('cards-grid')!
    const noResult = document.getElementById('no-result')!
    const count = document.getElementById('header-count')
    const rCount = document.getElementById('result-count')
    const label = `${mangas.length} manga${mangas.length > 1 ? 's' : ''}`

    if (count) count.textContent = label
    if (rCount) rCount.textContent = `${mangas.length} résultat${mangas.length > 1 ? 's' : ''}`

    if (mangas.length === 0) {
        grid.innerHTML = ''
        noResult.style.display = 'block'
    } else {
        noResult.style.display = 'none'
        grid.innerHTML = mangas.map(renderCard).join('')
    }
}

// --- Filtres et recherche ---

let allMangas: Manga[] = []
let activeFilter: string = 'all'
let searchQuery: string = ''

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
document.getElementById('filters')!.addEventListener('click', (e: MouseEvent) => {
    const btn = (e.target as Element).closest<HTMLButtonElement>('[data-filter]')
    if (!btn) return
    activeFilter = btn.dataset.filter!
    document.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach(b => {
        b.classList.toggle('filter-btn--active', b === btn)
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
