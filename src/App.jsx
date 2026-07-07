import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Study from './pages/Study.jsx'
import ReviewWrong from './pages/ReviewWrong.jsx'
import QuizSetup from './pages/QuizSetup.jsx'
import QuizPlay from './pages/QuizPlay.jsx'
import QuizResult from './pages/QuizResult.jsx'
import Pdf from './pages/Pdf.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="study/:chapterId/:index?" element={<Study />} />
        <Route path="review-wrong/:index?" element={<ReviewWrong />} />
        <Route path="quiz-setup" element={<QuizSetup />} />
        <Route path="quiz" element={<QuizPlay />} />
        <Route path="quiz-result" element={<QuizResult />} />
        <Route path="pdf" element={<Pdf />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
