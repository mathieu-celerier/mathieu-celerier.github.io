export function getTheme() {
  return localStorage.getItem('theme')
}

let listening = false
export function listenThemeChange() {
  if (listening) return
  listening = true
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!getTheme() || getTheme() === 'system') setTheme('system')
  })
}

export function setTheme(theme?: string, save = false) {
  const themes = ['system', 'dark', 'light']
  let selected = theme ?? getTheme() ?? 'system'
  if (!theme && save) selected = themes[(themes.indexOf(selected) + 1) % themes.length]
  if (!themes.includes(selected)) return
  if (save) localStorage.setItem('theme', selected)
  const dark =
    selected === 'dark' ||
    (selected === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', dark)
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', dark ? '#0d121b' : '#faf8f4')
  document.dispatchEvent(new Event('site-theme-change'))
  listenThemeChange()
  return selected
}
