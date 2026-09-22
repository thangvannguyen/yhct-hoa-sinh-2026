// Lecture slide PDFs, served statically from public/lectures/.
export const LECTURES = [
  { id: 'glucid', title: 'Glucid', file: '01-glucid.pdf', icon: '🍬' },
  { id: 'lipid', title: 'Lipid', file: '02-lipid.pdf', icon: '🧈' },
  { id: 'protid', title: 'Protid', file: '03-protid.pdf', icon: '🥩' },
  { id: 'acid-nucleic', title: 'Acid nucleic', file: '04-acid-nucleic.pdf', icon: '🧬' },
  { id: 'hormon', title: 'Hormon', file: '05-hormon.pdf', icon: '💊' },
  {
    id: 'can-bang-muoi-nuoc',
    title: 'Cân bằng muối nước',
    file: '06-can-bang-muoi-nuoc.pdf',
    icon: '💧',
  },
  {
    id: 'can-bang-acid-base',
    title: 'Cân bằng acid base',
    file: '07-can-bang-acid-base.pdf',
    icon: '⚖️',
  },
  {
    id: 'enzym-nang-luong-sinh-hoc',
    title: 'Enzym - Năng lượng sinh học',
    file: '08-enzym-nang-luong-sinh-hoc.pdf',
    icon: '⚡',
  },
  {
    id: 'hemoglobin-gan-than',
    title: 'Hemoglobin - Gan - Thận',
    file: '09-hemoglobin-gan-than.pdf',
    icon: '🩸',
  },
  {
    id: 'on-tap-trac-nghiem',
    title: 'Ôn tập trắc nghiệm (đáp án tô màu)',
    file: '10-on-tap-trac-nghiem.docx',
    icon: '📝',
    type: 'docx',
  },
]

export function lectureById(id) {
  return LECTURES.find((l) => l.id === id)
}

export function lectureUrl(lecture) {
  return import.meta.env.BASE_URL + 'lectures/' + lecture.file
}

// Word docs can't be embedded natively like PDFs, so route them through
// Microsoft's Office Online viewer. It needs a publicly reachable absolute
// URL, which only exists once the site is deployed (not on localhost).
//
// The viewer caches the rendered file by URL, so a `?v=<build id>` param is
// appended to bust that cache whenever the docx content changes and the site
// is rebuilt — otherwise it keeps showing a stale preview after deploys.
export function officeViewerUrl(lecture) {
  const url = new URL(lectureUrl(lecture), window.location.href)
  url.searchParams.set('v', __BUILD_ID__)
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url.href)}`
}
