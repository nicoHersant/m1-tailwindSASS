// ============================================================
//  PAGES / TABLE (Catalogue)
//
//  Logique de la page catalogue : toggle sidebar, rendu du
//  tableau, filtres, recherche et tri par colonne.
//
//  CSS : classes Tailwind + composants @apply définis dans
//  src/style.css (.tr, .td, .th, .badge-shonen…)
//  La visibilité responsive des colonnes est gérée par CSS
//  (hidden md:table-cell, etc.) — aucun JS nécessaire.
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
// Bascule entre grid-cols-[256px_1fr] et grid-cols-[80px_1fr]
// pour réduire ou étendre la sidebar Tailwind.

const toggle = document.getElementById('toggle')!
const layout = document.getElementById('layout')!
const labels = document.querySelectorAll('.menu-label')

toggle.addEventListener('click', () => {
  const collapsed = layout.classList.toggle('grid-cols-[80px_1fr]')
  layout.classList.toggle('grid-cols-[256px_1fr]', !collapsed)
  labels.forEach(l => l.classList.toggle('hidden'))
})

// --- État global ---

let allMangas:    Manga[]            = []
let activeFilter: string             = 'all'
let searchQuery:  string             = ''
let sortCol:      keyof Manga | null = null
let sortAsc:      boolean            = true

// --- Rendu ---

/**
 * Génère le HTML d'une ligne <tr> pour un manga.
 * Les cellules optionnelles reprennent les mêmes classes
 * responsive que leurs <th> (hidden md:table-cell, etc.)
 * afin de rester synchronisées avec l'en-tête du tableau.
 */
function renderRow(m: Manga, i: number): string {
  return `
    <tr class="tr">
      <td class="td text-slate-500 text-xs">${String(i + 1).padStart(2, '0')}</td>
      <td class="td">
        <img src="${m.cover}" alt="${m.title}" loading="lazy" class="w-8 h-10 object-cover rounded" />
      </td>
      <td class="td font-medium text-white">${m.title}</td>
      <td class="td text-slate-400 hidden md:table-cell">${m.author}</td>
      <td class="td hidden sm:table-cell">
        <span class="badge badge-${m.category}">${CAT[m.category]}</span>
      </td>
      <td class="td text-slate-400 hidden lg:table-cell">${m.year}</td>
      <td class="td text-center hidden xl:table-cell">${m.volumes}</td>
      <td class="td text-green-400 font-semibold">${m.price.toFixed(2)} €</td>
      <td class="td hidden lg:table-cell">
        <span class="text-yellow-400">★</span> ${m.rating}
      </td>
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
    tbody.innerHTML = ''
    noRes.classList.remove('hidden')
    return
  }
  noRes.classList.add('hidden')
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

    applyFilters()
  })
})
