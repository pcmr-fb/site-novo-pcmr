"""Automated WCAG A/AA checks for the page and quote dialog states."""
import os
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
BASE_URL = os.environ.get('BASE_URL', 'http://127.0.0.1:3000')
reports = []

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 1440, 'height': 1000}, reduced_motion='reduce')
    page.goto(BASE_URL, wait_until='networkidle')
    page.add_script_tag(path=str(ROOT / 'node_modules/axe-core/axe.min.js'))

    def audit(state):
        violations = page.evaluate("""async () => {
          const result = await axe.run(document, {runOnly: {type: 'tag', values: ['wcag2a','wcag2aa','wcag21aa']}});
          return result.violations.map(v => ({id:v.id, impact:v.impact, nodes:v.nodes.map(n => ({target:n.target, message:n.failureSummary}))}));
        }""")
        reports.append({'state': state, 'violations': violations})

    audit('desktop homepage')
    page.get_by_role('button', name='Encontre sua proteção').click()
    audit('quote insurance selection')
    dialog = page.get_by_role('dialog', name='Solicitar uma cotação')
    dialog.get_by_role('button', name='Continuar', exact=True).click()
    audit('quote contact form')
    page.keyboard.press('Escape')
    page.set_viewport_size({'width': 390, 'height': 844})
    audit('mobile homepage')
    page.get_by_role('button', name='Abrir menu').click()
    audit('mobile navigation')
    browser.close()

output = ROOT / 'test-results'
output.mkdir(exist_ok=True)
(output / 'accessibility-results.json').write_text(json.dumps(reports, ensure_ascii=False, indent=2))
print(json.dumps(reports, ensure_ascii=False, indent=2))
assert all(not report['violations'] for report in reports), 'Accessibility violations found'
