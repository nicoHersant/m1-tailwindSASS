// ============================================================
//  PAGES / TABLE (Catalogue)
//
//  Logique de la page catalogue : toggle sidebar, gestion des
//  colonnes responsives, rendu du tableau, filtres, recherche
//  et tri par colonne.
// ============================================================

// --- Types ---

interface Manga {
  title:    string
  author:   string
  category: 'shonen' | 'shojo' | 'seinen' | 'josei'
  cover:    string
  year:     number
  volumes:  number
  price:    number
  rating:   number
}

// --- Constantes ---

const CAT: Record<Manga['category'], string> = {
  shonen: 'Shōnen',
  shojo:  'Shōjo',
  seinen: 'Seinen',
  josei:  'Josei',
}

// --- Toggle sidebar ---
// Bascule le modificateur BEM .layout--collapsed (layout/_layout.scss)

const toggle = document.getElementById('toggle')!
const layout = document.getElementById('layout')!
const labels = document.querySelectorAll('.menu-label')

toggle.addEventListener('click', () => {
  layout.classList.toggle('layout--collapsed')
  labels.forEach(l => l.classList.toggle('is-hidden'))
})

// --- Colonnes responsives ---
// Affiche ou masque les colonnes selon la largeur de la fenêtre.
// Synchronisé avec les breakpoints définis dans _variables.scss.

function updateColumns(): void {
  const w = window.innerWidth
  document.getElementById('th-author')!.style.display = w >= 768  ? '' : 'none'
  document.getElementById('th-cat')!.style.display    = w >= 640  ? '' : 'none'
  document.getElementById('th-year')!.style.display   = w >= 1024 ? '' : 'none'
  document.getElementById('th-vol')!.style.display    = w >= 1280 ? '' : 'none'
  document.getElementById('th-rating')!.style.display = w >= 1024 ? '' : 'none'
}

updateColumns()
window.addEventListener('resize', updateColumns)

// --- État global ---

let allMangas:    Manga[]              = []
let activeFilter: string               = 'all'
let searchQuery:  string               = ''
let sortCol:      keyof Manga | null   = null
let sortAsc:      boolean              = true

// --- Rendu ---

/**
 * Génère le HTML d'une ligne <tr> pour un manga.
 * Les cellules conditionnelles reproduisent le comportement
 * responsive des colonnes masquées dans updateColumns().
 */
function renderRow(m: Manga, i: number): string {
  const w = window.innerWidth
  return `
    <tr class="data-table__row">
      <td class="data-table__cell data-table__cell--muted" style="font-size:.75rem">${String(i + 1).padStart(2, '0')}</td>
      <td class="data-table__cell data-table__cell--thumb">
        <img src="${m.cover}" alt="${m.title}" loading="lazy" />
      </td>
      <td class="data-table__cell data-table__cell--title">${m.title}</td>
      ${w >= 768  ? `<td class="data-table__cell data-table__cell--muted">${m.author}</td>` : ''}
      ${w >= 640  ? `<td class="data-table__cell"><span class="badge badge--${m.category}">${CAT[m.category]}</span></td>` : ''}
      ${w >= 1024 ? `<td class="data-table__cell data-table__cell--muted">${m.year}</td>` : ''}
      ${w >= 1280 ? `<td class="data-table__cell data-table__cell--center">${m.volumes}</td>` : ''}
      <td class="data-table__cell data-table__cell--price">${m.price.toFixed(2)} €</td>
      ${w >= 1024 ? `<td class="data-table__cell"><span style="color:#f59e0b">★</span> ${m.rating}</td>` : ''}
    </tr>`
}

function renderTable(mangas: Manga[]): void {
  const tbody  = document.getElementById('table-body')!
  const noRes  = document.getElementById('no-result')!
  const hCount = document.getElementById('header-count')
  const cl     = document.getElementById('count-label')
  const label  = `${mangas.length} manga${mangas.length > 1 ? 's' : ''}`

  if (hCount) hCount.textContent = label
  if (cl)     cl.textContent     = String(mangas.length)

  if (!mangas.length) {
    tbody.innerHTML     = ''
    noRes.style.display = 'block'
    return
  }
  noRes.style.display = 'none'
  tbody.innerHTML = mangas.map((m, i) => renderRow(m, i)).join('')
}

// --- Filtres, recherche et tri ---

function applyFilters(): void {
  let r = allMangas

  // Filtre par catégorie
  if (activeFilter !== 'all') r = r.filter(m => m.category === activeFilter)

  // Filtre par texte (titre ou auteur)
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase()
    r = r.filter(m =>
      m.title.toLowerCase().includes(q) ||
      m.author.toLowerCase().includes(q)
    )
  }

  // Tri alphabétique ou numérique selon le type de la colonne
  if (sortCol) {
    r = [...r].sort((a, b) => {
      const va = a[sortCol!], vb = b[sortCol!]
      return typeof va === 'string'
        ? (sortAsc ? (va as string).localeCompare(vb as string) : (vb as string).localeCompare(va as string))
        : (sortAsc ? (va as number) - (vb as number) : (vb as number) - (va as number))
    })
  }

  renderTable(r)
}

// --- Chargement des données ---

fetch('/mangas.json')
  .then(r => r.json())
  .then((data: Manga[]) => { allMangas = data; renderTable(allMangas) })

// --- Événements ---

// Filtre par catégorie
document.getElementById('filters')!.addEventListener('click', (e: MouseEvent) => {
  const btn = (e.target as Element).closest<HTMLButtonElement>('[data-filter]')
  if (!btn) return
  activeFilter = btn.dataset.filter!
  document.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach(b =>
    b.classList.toggle('filter-btn--active', b === btn)
  )
  applyFilters()
})

// Recherche avec debounce (évite un appel par frappe clavier)
let timer: ReturnType<typeof setTimeout>
document.getElementById('search')!.addEventListener('input', (e: Event) => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    searchQuery = (e.target as HTMLInputElement).value
    applyFilters()
  }, 200)
})

// Tri au clic sur un en-tête de colonne (data-col)
// Un second clic sur la même colonne inverse l'ordre (asc ↔ desc)
document.querySelectorAll<HTMLTableCellElement>('th[data-col]').forEach(th => {
  th.addEventListener('click', () => {
    const col = th.dataset.col as keyof Manga
    sortAsc = sortCol === col ? !sortAsc : true
    sortCol = col

    // Réinitialise tous les indicateurs visuels
    document.querySelectorAll('.sort-icon').forEach(icon => {
      (icon as HTMLElement).textContent = '↕';
      (icon as HTMLElement).style.color = ''
    })
    // Active l'indicateur de la colonne cliquée
    const icon = th.querySelector<HTMLElement>('.sort-icon')
    if (icon) { icon.textContent = sortAsc ? '↑' : '↓'; icon.style.color = '#3b82f6' }
    th.classList.add('is-sorted')

    applyFilters()
  })
})

// Re-render au resize pour recalculer les cellules conditionnelles
window.addEventListener('resize', () =>
  renderTable(allMangas.filter(m => activeFilter === 'all' || m.category === activeFilter))
)
