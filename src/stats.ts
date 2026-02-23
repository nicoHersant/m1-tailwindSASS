// ============================================================
//  PAGES / STATS (Statistiques)
//
//  Logique de la page statistiques : toggle sidebar, calcul
//  des KPI, création des 4 graphiques Chart.js et rendu du
//  tableau récapitulatif par catégorie.
//
//  Chart.js est chargé comme script global dans le HTML
//  (UMD build) — on le déclare ici pour TypeScript.
// ============================================================

// Déclaration du global Chart.js (chargé via <script> dans le HTML)
declare const Chart: any

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

type Category = Manga['category']

// --- Constantes ---

const CAT_FR: Record<Category, string> = {
  shonen: 'Shōnen',
  shojo:  'Shōjo',
  seinen: 'Seinen',
  josei:  'Josei',
}

// Couleurs associées à chaque catégorie (réutilisées dans les graphiques)
const CAT_COLORS: Record<Category, string> = {
  shonen: '#3b82f6',
  shojo:  '#ec4899',
  seinen: '#8b5cf6',
  josei:  '#f97316',
}

const CATEGORIES: Category[] = ['shonen', 'shojo', 'seinen', 'josei']

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

// --- Configuration globale Chart.js ---
// Appliquée une fois, héritée par tous les graphiques de la page.

Chart.defaults.color       = '#94a3b8'  // couleur du texte des axes
Chart.defaults.borderColor = '#1e293b'  // couleur des grilles

// --- Chargement et traitement des données ---

fetch('/mangas.json')
  .then(r => r.json())
  .then((mangas: Manga[]) => {

    // ---- KPI ----
    // Valeurs clés affichées dans les cartes .stat-card (style.css)

    document.getElementById('kpi-total')!.textContent = String(mangas.length)

    // Prix moyen : somme / nombre, arrondi à 2 décimales
    const avgPrice = mangas.reduce((s, m) => s + m.price, 0) / mangas.length
    document.getElementById('kpi-avg-price')!.textContent = avgPrice.toFixed(2) + ' €'

    // Total des volumes de tous les mangas
    document.getElementById('kpi-total-vols')!.textContent = String(
      mangas.reduce((s, m) => s + m.volumes, 0)
    )

    // Catégorie la plus représentée
    const catCount: Partial<Record<Category, number>> = {}
    mangas.forEach(m => { catCount[m.category] = (catCount[m.category] ?? 0) + 1 })
    const top = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]
    document.getElementById('kpi-top-cat')!.textContent = CAT_FR[top[0] as Category]

    // ---- Graphique 1 : Histogramme — mangas par catégorie ----
    // type: 'bar' → barres verticales
    // borderRadius → coins arrondis sur les barres (style moderne)

    new Chart(document.getElementById('categoryChart'), {
      type: 'bar',
      data: {
        labels: CATEGORIES.map(c => CAT_FR[c]),
        datasets: [{
          data:            CATEGORIES.map(c => catCount[c] ?? 0),
          backgroundColor: CATEGORIES.map(c => `${CAT_COLORS[c]}b3`), // b3 = 70% opacité en hex
          borderColor:     CATEGORIES.map(c => CAT_COLORS[c]),
          borderWidth: 1, borderRadius: 6, borderSkipped: false,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 2, color: '#94a3b8' }, grid: { color: 'rgba(30,41,59,.8)' } },
          x: { ticks: { color: '#cbd5e1' }, grid: { display: false } },
        },
      },
    })

    // ---- Graphique 2 : Donut — répartition des prix ----
    // type: 'doughnut' → anneau, idéal pour des proportions

    const priceR: Record<string, number> = { 'Moins de 7 €': 0, '7 € à 8 €': 0, 'Plus de 8 €': 0 }
    mangas.forEach(m => {
      if      (m.price < 7)  priceR['Moins de 7 €']++
      else if (m.price <= 8) priceR['7 € à 8 €']++
      else                   priceR['Plus de 8 €']++
    })

    new Chart(document.getElementById('priceChart'), {
      type: 'doughnut',
      data: {
        labels: Object.keys(priceR),
        datasets: [{
          data:            Object.values(priceR),
          backgroundColor: ['rgba(59,130,246,.8)', 'rgba(16,185,129,.8)', 'rgba(245,158,11,.8)'],
          borderColor: '#1e293b', borderWidth: 3, hoverOffset: 8,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 16, usePointStyle: true } } },
      },
    })

    // ---- Graphique 3 : Barres horizontales — note moyenne par catégorie ----
    // indexAxis: 'y' transforme un bar chart vertical en horizontal

    const catRatings: Partial<Record<Category, number>> = {}
    const catCounts2: Partial<Record<Category, number>> = {}
    mangas.forEach(m => {
      catRatings[m.category] = (catRatings[m.category] ?? 0) + m.rating
      catCounts2[m.category] = (catCounts2[m.category] ?? 0) + 1
    })

    new Chart(document.getElementById('ratingChart'), {
      type: 'bar',
      data: {
        labels: CATEGORIES.map(c => CAT_FR[c]),
        datasets: [{
          data: CATEGORIES.map(c =>
            catCounts2[c] ? ((catRatings[c]! / catCounts2[c]!).toFixed(2)) : 0
          ),
          backgroundColor: 'rgba(139,92,246,.7)', borderColor: 'rgb(139,92,246)',
          borderWidth: 1, borderRadius: 6,
        }],
      },
      options: {
        indexAxis: 'y', // ← rend les barres horizontales
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { min: 4, max: 5, ticks: { color: '#94a3b8', stepSize: .2 }, grid: { color: 'rgba(30,41,59,.8)' } },
          y: { ticks: { color: '#cbd5e1' }, grid: { display: false } },
        },
      },
    })

    // ---- Graphique 4 : Courbe — publications par décennie ----
    // type: 'line' + tension + fill → courbe lissée avec aire colorée

    const decades: Record<number, number> = {}
    mangas.forEach(m => {
      const d = Math.floor(m.year / 10) * 10
      decades[d] = (decades[d] ?? 0) + 1
    })
    const sortedD = Object.keys(decades).map(Number).sort()

    new Chart(document.getElementById('decadeChart'), {
      type: 'line',
      data: {
        labels: sortedD.map(d => `${d}s`),
        datasets: [{
          data:            sortedD.map(d => decades[d]),
          borderColor:     'rgb(59,130,246)',
          backgroundColor: 'rgba(59,130,246,.1)', // aire sous la courbe
          tension: .4,   // courbure de la ligne (0 = droite, 1 = très courbé)
          fill: true,
          pointBackgroundColor: 'rgb(59,130,246)',
          pointBorderColor: '#0f172a', pointBorderWidth: 2, pointRadius: 5,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1, color: '#94a3b8' }, grid: { color: 'rgba(30,41,59,.8)' } },
          x: { ticks: { color: '#cbd5e1' }, grid: { display: false } },
        },
      },
    })

    // ---- Tableau récapitulatif par catégorie ----
    // Utilise les classes Tailwind .tr, .td, .badge-${cat}
    // La barre de progression utilise des styles inline avec les
    // couleurs de CAT_COLORS pour éviter les classes dynamiques JIT.

    document.getElementById('stats-table-body')!.innerHTML = CATEGORIES.map(cat => {
      const items  = mangas.filter(m => m.category === cat)
      const count  = items.length
      const avgP   = count ? (items.reduce((s, m) => s + m.price,  0) / count).toFixed(2) : '—'
      const avgR   = count ? (items.reduce((s, m) => s + m.rating, 0) / count).toFixed(1) : '—'
      const totalV = items.reduce((s, m) => s + m.volumes, 0)
      const pct    = Math.round((count / mangas.length) * 100)

      return `
        <tr class="tr">
          <td class="td">
            <span class="badge badge-${cat}">${CAT_FR[cat]}</span>
          </td>
          <td class="td text-center font-bold text-slate-100">${count}</td>
          <td class="td text-right text-green-400 font-semibold">${avgP} €</td>
          <td class="td text-right hidden sm:table-cell">
            <span class="text-yellow-400">★</span> ${avgR}
          </td>
          <td class="td text-right text-slate-400 hidden md:table-cell">${totalV}</td>
          <td class="td hidden lg:table-cell">
            <div class="flex items-center gap-2">
              <div class="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
                <div style="width:${pct}%;height:100%;background-color:${CAT_COLORS[cat]};border-radius:9999px"></div>
              </div>
              <span class="text-xs text-slate-400 w-8 text-right">${pct}%</span>
            </div>
          </td>
        </tr>`
    }).join('')
  })
