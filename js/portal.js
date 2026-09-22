// 디자인/퍼블리싱 가이드 포털 — 카드 배치(드래그·Alt+방향키) 저장 + 시스템 필터. 저장은 이 브라우저(localStorage)에만.
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('grid')
  const status = document.getElementById('layoutStatus')
  const KEY = 'kes-design-guide-order'
  const cards = Array.from(grid.querySelectorAll('.card'))
  const say = (msg) => { status.textContent = msg; clearTimeout(say.t); say.t = setTimeout(() => (status.textContent = ''), 2600) }
  const order = () => Array.from(grid.querySelectorAll('.card')).map((c) => c.dataset.cardId)
  const apply = (ids) => {
    if (!Array.isArray(ids)) return
    const byId = new Map(cards.map((c) => [c.dataset.cardId, c]))
    ids.forEach((id) => byId.get(id) && grid.appendChild(byId.get(id)))
    cards.forEach((c) => !ids.includes(c.dataset.cardId) && grid.appendChild(c))
  }
  try { apply(JSON.parse(localStorage.getItem(KEY))) } catch { localStorage.removeItem(KEY) }

  // 이동 핸들
  cards.forEach((card) => {
    card.draggable = true
    const h = document.createElement('button')
    h.type = 'button'; h.className = 'card__handle'; h.title = '드래그 또는 Alt+방향키로 위치 이동'
    h.setAttribute('aria-label', `${card.querySelector('.card__title').textContent} 위치 이동`)
    h.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>'
    card.appendChild(h)
    h.addEventListener('keydown', (e) => {
      if (!e.altKey || !['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].includes(e.key)) return
      e.preventDefault()
      const list = Array.from(grid.querySelectorAll('.card:not(.is-hidden)'))
      const i = list.indexOf(card); const j = i + (['ArrowLeft', 'ArrowUp'].includes(e.key) ? -1 : 1)
      if (j < 0 || j >= list.length) return
      if (j < i) grid.insertBefore(card, list[j]); else grid.insertBefore(card, list[j].nextSibling)
      h.focus(); say(`${j + 1}번째로 이동했습니다. [배치 저장]을 누르세요.`)
    })
  })

  let dragging = null
  grid.addEventListener('dragstart', (e) => { const c = e.target.closest('.card'); if (!c) return; dragging = c; c.classList.add('is-dragging'); e.dataTransfer.effectAllowed = 'move' })
  grid.addEventListener('dragover', (e) => { const c = e.target.closest('.card'); if (!c || c === dragging) return; e.preventDefault(); grid.querySelectorAll('.is-over').forEach((x) => x.classList.remove('is-over')); c.classList.add('is-over') })
  grid.addEventListener('dragleave', (e) => { e.target.closest?.('.card')?.classList.remove('is-over') })
  grid.addEventListener('drop', (e) => {
    const c = e.target.closest('.card'); if (!c || !dragging || c === dragging) return
    e.preventDefault()
    const list = Array.from(grid.querySelectorAll('.card'))
    if (list.indexOf(dragging) < list.indexOf(c)) grid.insertBefore(dragging, c.nextSibling); else grid.insertBefore(dragging, c)
    c.classList.remove('is-over'); say('위치를 옮겼습니다. [배치 저장]을 누르세요.')
  })
  grid.addEventListener('dragend', () => { dragging?.classList.remove('is-dragging'); dragging = null; grid.querySelectorAll('.is-over').forEach((x) => x.classList.remove('is-over')) })

  document.getElementById('layoutSave').addEventListener('click', () => { try { localStorage.setItem(KEY, JSON.stringify(order())); say('배치를 저장했습니다.') } catch { say('이 브라우저에는 저장할 수 없습니다.') } })
  document.getElementById('layoutReset').addEventListener('click', () => { localStorage.removeItem(KEY); apply(cards.map((c) => c.dataset.cardId)); say('기본 배치로 되돌렸습니다.') })

  // 시스템 필터
  document.querySelectorAll('.seg__btn').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('.seg__btn').forEach((x) => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-selected', String(x === b)) })
    const f = b.dataset.filter
    cards.forEach((c) => c.classList.toggle('is-hidden', f !== 'ALL' && c.dataset.system !== f))
  }))
})
