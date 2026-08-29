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
]

export function lectureById(id) {
  return LECTURES.find((l) => l.id === id)
}

export function lectureUrl(lecture) {
  return import.meta.env.BASE_URL + 'lectures/' + lecture.file
}
