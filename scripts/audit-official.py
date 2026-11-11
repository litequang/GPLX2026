"""Read-only PDF comparison. Requires PyMuPDF; originals stay outside Git.

Usage: python scripts/audit-official.py <official-pdf-directory> [dataset.json]
Prints a derived report; redirect stdout to official-audit-report.json if desired.
This is text/answer extraction, not a complete image or legal audit.
"""
import hashlib
import json
import pathlib
import re
import sys
import unicodedata
import pymupdf

root = pathlib.Path(__file__).resolve().parent.parent
pdf_dir = pathlib.Path(sys.argv[1])
dataset = json.loads(pathlib.Path(sys.argv[2] if len(sys.argv) > 2 else root / 'dist/data/dataset.json').read_text(encoding='utf-8'))
overlay = json.loads((root / 'content/official-2026.json').read_text(encoding='utf-8'))
for filename, source in zip(['guidance-2262-official.pdf', 'questions-600-official.pdf', 'tt108-2026.pdf'], overlay['sources']):
    assert hashlib.sha256((pdf_dir / filename).read_bytes()).hexdigest() == source['sha256'], f'Changed official PDF: {filename}'

guidance = pymupdf.open(pdf_dir / 'guidance-2262-official.pdf')
numbers = lambda text: [int(n) for n in re.findall(r'^\s*(\d+)\s*$', text, re.M)]
pool_checks = {}
for page, name in [(3, 'A1'), (4, 'B1')]:
    body, critical = re.split(r'6\.\s*Nhóm', guidance[page].get_text())
    assert numbers(body) == overlay['pools'][name]
    assert numbers(critical) == overlay['critical'][name]
    pool_checks[name] = {'pool': len(numbers(body)), 'critical': len(numbers(critical)), 'matches': True}
assert numbers(guidance[5].get_text()) == overlay['critical']['ALL']

book = pymupdf.open(pdf_dir / 'questions-600-official.pdf')
questions = {}
current = option = None
for page_number, page in enumerate(book, start=1):
    underlines = [d['rect'] for d in page.get_drawings() if d.get('fill') == (0., 0., 0.) and 0 < d['rect'].height < 1.5 and d['rect'].width > 5]
    for block in page.get_text('dict')['blocks']:
        for line in block.get('lines', []):
            text = ''.join(s['text'] for s in line['spans']).strip()
            match = re.match(r'^Câu\s+(\d+)[.:]', text)
            if match:
                current, option = int(match[1]), None
                assert current not in questions, f'Duplicate question {current}'
                questions[current] = {'text': [text[match.end():]], 'options': {}, 'answers': set(), 'pdfPage': page_number}
            elif current and text and not re.fullmatch(r'\d+', text) and not text.startswith('CHƯƠNG'):
                match = re.match(r'^([1-4])\.\s*', text)
                if match:
                    option = int(match[1])
                    questions[current]['options'][option] = [text[match.end():]]
                elif option:
                    questions[current]['options'][option].append(text)
                else:
                    questions[current]['text'].append(text)
            if current and option:
                baseline = line['spans'][-1]['origin'][1]
                if any(abs(u.y0 - baseline) < 3 and min(u.x1, line['bbox'][2]) - max(u.x0, line['bbox'][0]) > 5 for u in underlines):
                    questions[current]['answers'].add(option)

assert sorted(questions) == list(range(1, 601))
# Visual review of the original PDF, not inferred from the Android answer key:
# q204 p47 uses a different underline drawing; q302 p71 has two columns in one text line.
manual = {204: {'answer': 1, 'pdfPage': 47}, 302: {'answer': 4, 'pdfPage': 71}}
for id, review in manual.items():
    assert questions[id]['pdfPage'] == review['pdfPage']
    questions[id]['answers'] = {review['answer']}
answer_mismatches = [q['id'] for q in dataset['questions'] if questions[q['id']]['answers'] != {q['answer']}]
assert not answer_mismatches, f'Answer mismatch/unresolved: {answer_mismatches}'

def normalize(text):
    text = unicodedata.normalize('NFC', text).lower().replace('hoá', 'hóa').replace('huỷ', 'hủy').replace('thuỷ', 'thủy')
    return ''.join(char for char in text if char.isalnum())

candidates = []
for q in dataset['questions']:
    parsed = questions[q['id']]
    fields = []
    if normalize(q['text']) != normalize(' '.join(parsed['text'])):
        fields.append('text')
    options = parsed['options']
    if len(q['options']) != len(options) or any(normalize(o['text']) != normalize(' '.join(options.get(o['id'], []))) for o in q['options']):
        fields.append('options')
    if fields:
        candidates.append({'id': q['id'], 'fields': fields, 'pdfPage': parsed['pdfPage']})

report = {
    'checkedOn': overlay['checkedOn'], 'datasetSha256': hashlib.sha256(json.dumps(dataset, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest(),
    'sources': overlay['sources'], 'bookPages': len(book), 'questionIdsCovered': 600,
    'answerKeysMatching': 600, 'answerIdsChanged': 0, 'automaticAnswerKeys': 598, 'manualAnswerReviews': manual,
    'appendixMembership': pool_checks, 'globalCriticalCount': 60,
    'restoredBIds': overlay['restoredB'], 'visuallyReviewedWordingCorrections': [p['id'] for p in overlay['corrections']],
    'remainingTextComparisonCandidates': candidates,
    'limitations': 'Candidates include PDF layout artifacts (chapter titles, inline columns, figure labels), spelling and real wording differences. Do not apply automatically. Image equivalence, explanations, tips, practical lessons and full current-law compliance are not verified. No newer question bank was identified in the official sources checked on this date.'
}
print(json.dumps(report, ensure_ascii=False, indent=2))
