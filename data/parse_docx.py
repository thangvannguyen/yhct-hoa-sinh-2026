import docx, re, json, os, sys
from unidecode import unidecode

SRC = '/Users/nguyenthang/Desktop/YHCT-2026/Hóa Sinh - 07-2026/Web/docs.docx'
OUT_DIR = '/Users/nguyenthang/Desktop/YHCT-2026/Hóa Sinh - 07-2026/Web/data'
IMG_DIR = os.path.join(OUT_DIR, 'images')

STRONG_COLOR = 'E5B8B7'  # always bold -> treated as final/corrected mark
WEAK_COLORS = {'C00000', 'FF0000', 'C0504D'}

d = docx.Document(SRC)
paras = d.paragraphs

CHAPTER_TITLES = {
    'HÓA HỌC GLUCID', 'HÓA HỌC LIPID', 'HÓA HỌC PROTID', 'HÓA HỌC NUCLEIC',
    'CHUYỂN HÓA GLUCID', 'CHUYỂN HÓA LIPID', 'CHUYỂN HÓA PROTID', 'ENZYM',
    'NĂNG LƯỢNG SINH HỌC', 'HORMON', 'CÂN BẰNG CHUYỂN HÓA MUỐI – NƯỚC',
    'CÂN BẰNG ACID – BASE', 'HEMOGLOBIN',
}

def slugify(text):
    s = unidecode(text).lower()
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s

qre = re.compile(r'^Câu\s*(\d+(?:\.\d+)?)\s*[:\.]?\s*(.*)$', re.UNICODE)
marker_re = re.compile(r'(?:^|(?<=\s))([A-E])[\.\)]\s*', re.UNICODE)

def get_run_image_rid(run):
    ns = '{http://schemas.openxmlformats.org/drawingml/2006/main}'
    blips = run._element.findall('.//' + ns + 'blip')
    if blips:
        rid_ns = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed'
        return blips[0].get(rid_ns)
    return None

def run_color(run):
    try:
        if run.font.color and run.font.color.type is not None:
            return str(run.font.color.rgb)
    except Exception:
        pass
    return None

# ---- group paragraphs into chapters -> questions ----
chapters = []
cur_chapter = None
cur_question = None

for p in paras:
    raw = p.text
    t = raw.strip()
    if not t:
        continue
    if t in CHAPTER_TITLES:
        if cur_question and cur_chapter:
            cur_chapter['_questions'].append(cur_question)
            cur_question = None
        cur_chapter = {'title': t, '_questions': []}
        chapters.append(cur_chapter)
        continue
    m = qre.match(t)
    if m:
        if cur_question and cur_chapter:
            cur_chapter['_questions'].append(cur_question)
        cur_question = {'number': m.group(1), 'qtext': m.group(2).strip(), 'paras': [], 'qpara': p}
        continue
    if cur_question is not None:
        cur_question['paras'].append(p)

if cur_question and cur_chapter:
    cur_chapter['_questions'].append(cur_question)

# ---- parse options within each question's paragraphs ----
def parse_question_options(q):
    options = {}  # letter -> {'text': str, 'marks': [(color,bold), ...]}
    order = []
    image_rid = None

    def ensure(letter):
        if letter not in options:
            options[letter] = {'text': '', 'marks': []}
            order.append(letter)
        return options[letter]

    for run in q['qpara'].runs:
        rid = get_run_image_rid(run)
        if rid:
            image_rid = rid

    current_letter = None
    for p in q['paras']:
        for run in p.runs:
            rid = get_run_image_rid(run)
            if rid:
                image_rid = rid

        # Build full paragraph text with run-span map. A marker letter like
        # "C." can be split across two runs (e.g. run "C" + run ". Glycogen"),
        # so marker detection must happen on the concatenated text, not
        # per-run, then be mapped back to runs only to pull color/bold.
        full_text = ''
        run_spans = []
        pos = 0
        for run in p.runs:
            t = run.text
            if t == '':
                continue
            run_spans.append((pos, pos + len(t), run))
            full_text += t
            pos += len(t)

        if not full_text:
            continue

        matches = list(marker_re.finditer(full_text))
        segments = []
        if matches:
            if matches[0].start() > 0:
                segments.append((None, 0, matches[0].start()))
            for i2, mm in enumerate(matches):
                seg_start = mm.end()
                seg_end = matches[i2 + 1].start() if i2 + 1 < len(matches) else len(full_text)
                segments.append((mm.group(1), seg_start, seg_end))
        else:
            segments.append((None, 0, len(full_text)))

        for letter, a, b in segments:
            if letter is not None:
                current_letter = letter
            elif current_letter is None:
                current_letter = 'A'
            opt = ensure(current_letter)
            opt['text'] += full_text[a:b]
            for (s, e, run) in run_spans:
                if e <= a or s >= b:
                    continue
                sub = full_text[max(a, s):min(b, e)]
                if sub.strip():
                    color = run_color(run)
                    if color:
                        opt['marks'].append((color, bool(run.bold)))
        # paragraph break -> normalize a single space between paragraphs
        if current_letter is not None and current_letter in options:
            options[current_letter]['text'] += ' '

    # cleanup whitespace + collapse duplicate-paragraph artifacts (e.g. the
    # same option text repeated 2-4x because a stray duplicate paragraph
    # restated it, as seen with Câu 29/31 in HEMOGLOBIN)
    for letter in options:
        text = re.sub(r'\s+', ' ', options[letter]['text']).strip()
        options[letter]['text'] = dedup_repeated(text)

    return options, order, image_rid


def dedup_repeated(text):
    words = text.split(' ')
    n = len(words)
    for k in (2, 3, 4):
        if n >= k and n % k == 0:
            chunk = n // k
            parts = [words[i * chunk:(i + 1) * chunk] for i in range(k)]
            if all(part == parts[0] for part in parts[1:]):
                return ' '.join(parts[0])
    return text


def resolve_answer(options, order):
    strong = [L for L in order if any(c == STRONG_COLOR and b for c, b in options[L]['marks'])]
    weak = [L for L in order if any(c in WEAK_COLORS for c, b in options[L]['marks'])]

    if len(strong) == 1:
        return strong[0], None
    if len(strong) == 0 and len(weak) == 1:
        return weak[0], None
    if len(strong) == 0 and len(weak) == 0:
        return None, 'no_answer_marked'
    if len(strong) == 1:
        return strong[0], None
    if len(strong) > 1:
        return strong[0], 'multiple_strong_marks'
    return None, 'conflicting_answers_unresolved'


# ---- build relationship id -> image filename map ----
rels = d.part.rels
rid_to_partname = {}
for rid, rel in rels.items():
    if 'image' in rel.reltype:
        rid_to_partname[rid] = rel.target_part.partname

os.makedirs(IMG_DIR, exist_ok=True)

result_chapters = []
flagged = []
image_count = 0

for ch in chapters:
    ch_id = slugify(ch['title'])
    out_questions = []
    for idx, q in enumerate(ch['_questions'], start=1):
        options, order, image_rid = parse_question_options(q)
        letters = sorted(order)
        option_texts = [options[L]['text'] for L in letters]
        answer_letter, flag = resolve_answer(options, order)
        correct_index = letters.index(answer_letter) if answer_letter else None
        if flag is None and len(letters) not in (4, 5):
            flag = 'option_count_anomaly'

        qid = f"{ch_id}-{idx}"
        image_path = None
        if image_rid and image_rid in rid_to_partname:
            part = d.part.related_parts[image_rid]
            ext = os.path.splitext(str(rid_to_partname[image_rid]))[1]
            fname = f"{qid}{ext}"
            with open(os.path.join(IMG_DIR, fname), 'wb') as f:
                f.write(part.blob)
            image_path = f"images/{fname}"
            image_count += 1

        qobj = {
            'id': qid,
            'text': q['qtext'],
            'image': image_path,
            'options': option_texts,
            'correctIndex': correct_index,
            'flag': flag,
        }
        out_questions.append(qobj)
        if flag:
            flagged.append({
                'chapter': ch['title'], 'id': qid, 'text': q['qtext'],
                'options': option_texts, 'candidates': {L: options[L]['marks'] for L in order}
            })
    result_chapters.append({'id': ch_id, 'title': ch['title'], 'questions': out_questions})

data = {'chapters': result_chapters}

with open(os.path.join(OUT_DIR, 'questions.json'), 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

total_q = sum(len(c['questions']) for c in result_chapters)
print('Total chapters:', len(result_chapters))
print('Total questions:', total_q)
print('Images extracted:', image_count)
print('Flagged questions:', len(flagged))
for fl in flagged:
    print(' -', fl['id'], '|', fl['text'][:60], '| options:', fl['options'])

with open(os.path.join(OUT_DIR, 'review_needed.json'), 'w', encoding='utf-8') as f:
    json.dump(flagged, f, ensure_ascii=False, indent=2)

# sanity: option count distribution
from collections import Counter
cnt = Counter(len(c2['options']) for ch in result_chapters for c2 in ch['questions'])
print('Option-count distribution:', cnt)
