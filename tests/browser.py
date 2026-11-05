"""Run with the site running: BASE_URL=http://127.0.0.1:3000 npm run test:e2e.
Requires Python Playwright and Chromium (provided in the cloud environment).
Only fictional example.com contact details are used.
"""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'test-results'
OUTPUT.mkdir(exist_ok=True)
BASE_URL = os.environ.get('BASE_URL', 'http://127.0.0.1:3000')
results = []

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
    context = browser.new_context(viewport={'width': 1440, 'height': 1000}, reduced_motion='reduce')
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(BASE_URL, wait_until='networkidle')
    expect(page.get_by_role('heading', level=1)).to_contain_text('Sua vida merece')
    page.evaluate('document.fonts.ready')
    assert page.locator('.hero-image').evaluate('(img) => img.complete && img.naturalWidth > 0')
    page.screenshot(path=str(OUTPUT / 'desktop.png'), full_page=True)
    assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
    results.append('Desktop layout and local assets load without overflow')

    page.get_by_role('button', name='Para sua empresa', exact=True).click()
    expect(page.locator('.insurance-card')).to_have_count(2)
    page.get_by_role('button', name='Todos os seguros', exact=True).click()
    expect(page.locator('.insurance-card')).to_have_count(6)
    page.get_by_role('button', name='Conhecer seguro residencial', exact=True).click()
    expect(page.get_by_role('dialog', name='Seguro residencial')).to_be_visible()
    page.get_by_role('button', name='Cotar seguro residencial').click()
    dialog = page.get_by_role('dialog', name='Solicitar uma cotação')
    expect(dialog).to_be_visible()
    expect(dialog.locator('input[value="residencial"]')).to_be_checked()
    results.append('Insurance filtering, details and preselected quote work')

    dialog.get_by_role('button', name='Continuar', exact=True).click()
    dialog.get_by_role('button', name='Continuar', exact=True).click()
    expect(dialog.get_by_role('heading', name='Vamos nos conhecer?')).to_be_visible()
    dialog.get_by_label('Nome completo').fill('Pessoa Teste Navegador')
    dialog.get_by_label('Telefone com DDD').fill('11988887777')
    dialog.get_by_label('Sua cidade / UF').fill('São Paulo / SP')
    dialog.get_by_label('E-mail', exact=True).fill('browser-test@example.com')
    dialog.get_by_label('Quer contar algo mais?', exact=False).fill('Teste automatizado da prévia; não contatar.')
    dialog.get_by_role('checkbox').check()
    dialog.get_by_role('button', name='Continuar', exact=True).click()
    expect(dialog.get_by_role('heading', name='Tudo certo por aqui?')).to_be_visible()
    expect(dialog.locator('dd').filter(has_text='(11) 98888-7777')).to_be_visible()
    page.screenshot(path=str(OUTPUT / 'quote-review.png'))
    with page.expect_response('**/api/quotes') as response:
        dialog.get_by_role('button', name='Solicitar cotação', exact=True).click()
    assert response.value.status == 201
    expect(dialog.get_by_role('heading', name='Solicitação registrada.')).to_be_visible()
    assert len(dialog.locator('.protocol code').inner_text()) == 36
    expect(dialog.get_by_text('Este é um teste da prévia.', exact=False)).to_be_visible()
    results.append('Required fields, phone formatting, consent, review and real API submission work')
    dialog.get_by_role('button', name='Voltar ao site').click()

    page.get_by_role('button', name='Pedir uma cotação gera algum compromisso?').click()
    expect(page.get_by_role('region', name='Pedir uma cotação gera algum compromisso?')).to_contain_text('Não.')
    page.get_by_role('button', name='Privacidade e seus dados', exact=True).click()
    expect(page.get_by_role('dialog', name='Privacidade e seus dados')).to_be_visible()
    page.keyboard.press('Escape')
    expect(page.get_by_role('dialog', name='Privacidade e seus dados')).not_to_be_visible()
    results.append('FAQ, privacy dialog and Escape dismissal work')

    page.get_by_role('button', name='Encontre sua proteção').click()
    dialog.get_by_role('button', name='Continuar', exact=True).click()
    dialog.get_by_label('Nome completo').fill('Teste Conexão')
    dialog.get_by_label('Telefone com DDD').fill('21988887777')
    dialog.get_by_label('Sua cidade / UF').fill('Rio de Janeiro / RJ')
    dialog.get_by_label('E-mail', exact=True).fill('offline@example.com')
    dialog.get_by_role('checkbox').check()
    dialog.get_by_role('button', name='Continuar', exact=True).click()
    page.route('**/api/quotes', lambda route: route.abort())
    dialog.get_by_role('button', name='Solicitar cotação', exact=True).click()
    expect(dialog.get_by_role('alert')).to_contain_text('Seus dados foram mantidos')
    expect(dialog.get_by_role('heading', name='Tudo certo por aqui?')).to_be_visible()
    page.unroute('**/api/quotes')
    dialog.get_by_role('button', name='Voltar', exact=True).click()
    expect(dialog.get_by_label('Nome completo')).to_have_value('Teste Conexão')
    page.keyboard.press('Escape')
    results.append('Network failure keeps the form data and does not show false success')

    for width in [320, 390, 768, 1024]:
        page.set_viewport_size({'width': width, 'height': 844})
        page.goto(BASE_URL, wait_until='networkidle')
        assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'), f'Overflow at {width}px'
    page.set_viewport_size({'width': 390, 'height': 844})
    page.goto(BASE_URL, wait_until='networkidle')
    page.screenshot(path=str(OUTPUT / 'mobile.png'), full_page=True)
    page.get_by_role('button', name='Abrir menu').click()
    menu = page.get_by_role('navigation', name='Navegação mobile')
    expect(menu).to_be_visible()
    menu.get_by_role('link', name='Nossos seguros').click()
    expect(menu).not_to_be_visible()
    page.locator('#quick-insurance').select_option('vida')
    page.get_by_role('button', name='Quero uma cotação', exact=True).click()
    expect(dialog.locator('input[value="vida"]')).to_be_checked()
    page.screenshot(path=str(OUTPUT / 'mobile-quote.png'))
    page.keyboard.press('Escape')
    results.append('320, 390, 768 and 1024px layouts, mobile menu and quick quote work')

    assert not errors, f'JavaScript errors: {errors}'
    results.append('No browser JavaScript errors')
    browser.close()

report = {'base_url': BASE_URL, 'passed': results}
(OUTPUT / 'browser-results.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
print(json.dumps(report, ensure_ascii=False, indent=2))
