"""Validate exported HTML on an isolated static server, without an API or external requests.
The managed browser blocks file:// navigation, so the HTML is served unchanged.
"""
import json
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
from functools import partial
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'test-results'
OUTPUT.mkdir(exist_ok=True)

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT / 'artifacts')))
Thread(target=server.serve_forever, daemon=True).start()
url = f'http://127.0.0.1:{server.server_port}/pcmr-preview.html'

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 1440, 'height': 1000}, reduced_motion='reduce')
    external = []
    errors = []
    page.on('request', lambda request: external.append(request.url) if request.url.startswith(('http:', 'https:')) and request.url != url else None)
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.route('http://**/*', lambda route: route.continue_() if route.request.url == url else route.abort())
    page.route('https://**/*', lambda route: route.abort())
    page.goto(url, wait_until='networkidle')
    expect(page.get_by_role('heading', level=1)).to_contain_text('Sua vida merece')
    assert page.locator('.hero-image').evaluate('(img) => img.complete && img.naturalWidth > 0')
    assert page.evaluate('document.fonts.check(\'600 16px "Montserrat"\')')
    page.screenshot(path=str(ROOT / 'artifacts/pcmr-desktop.png'), full_page=True)
    page.screenshot(path=str(ROOT / 'artifacts/pcmr-primeira-dobra.png'))
    page.get_by_role('button', name='Encontre sua proteção').click()
    dialog = page.get_by_role('dialog', name='Solicitar uma cotação')
    dialog.get_by_role('button', name='Continuar', exact=True).click()
    expect(dialog.get_by_text('Prévia interativa:', exact=False)).to_be_visible()
    dialog.get_by_label('Nome completo').fill('Teste Arquivo Independente')
    dialog.get_by_label('Telefone com DDD').fill('11977776666')
    dialog.get_by_label('Sua cidade / UF').fill('São Paulo / SP')
    dialog.get_by_label('E-mail', exact=True).fill('offline-preview@example.com')
    dialog.get_by_role('checkbox').check()
    dialog.get_by_role('button', name='Continuar', exact=True).click()
    dialog.get_by_role('button', name='Simular cotação', exact=True).click()
    expect(dialog.get_by_role('heading', name='Simulação concluída.')).to_be_visible()
    expect(dialog.get_by_text('Nenhuma solicitação foi enviada.', exact=False)).to_be_visible()
    assert dialog.locator('.protocol code').inner_text().startswith('DEMO-')
    dialog.get_by_role('button', name='Fechar janela').click()
    page.get_by_role('button', name='Encontre sua proteção').click()
    expect(dialog.get_by_role('heading', name='O que você quer proteger?')).to_be_visible()
    page.keyboard.press('Escape')
    page.set_viewport_size({'width': 390, 'height': 844})
    page.evaluate('window.scrollTo(0,0)')
    page.wait_for_function('document.documentElement.scrollWidth <= window.innerWidth')
    assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'), page.evaluate("() => ({width:innerWidth,scroll:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>({tag:e.tagName,cls:e.getAttribute('class'),right:e.getBoundingClientRect().right,width:e.getBoundingClientRect().width})).slice(0,20)})")
    page.screenshot(path=str(ROOT / 'artifacts/pcmr-mobile.png'), full_page=True)
    assert not external, f'Unexpected network requests: {external}'
    assert not errors, f'JavaScript errors: {errors}'
    browser.close()
    server.shutdown()
    server.server_close()
    report = {'result': 'passed', 'mode': 'standalone HTML on isolated static server', 'requests_after_document': 0, 'javascript_errors': 0, 'checks': ['embedded font and photograph', 'interactive quote simulation', 'explicit no-transmission notice', 'new quote after closing success', 'mobile layout']}
    (OUTPUT / 'standalone-results.json').write_text(json.dumps(report, indent=2))
    print(json.dumps(report, indent=2))
