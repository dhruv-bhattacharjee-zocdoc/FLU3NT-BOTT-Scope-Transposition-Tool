import { Routes, Route } from 'react-router-dom'
import ColumnHeadersCarouselApp from './folder_→_column_headers_carousel_react.jsx'
import UserManual from './usermanual.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ColumnHeadersCarouselApp />} />
      <Route path="/usermanual" element={<UserManual />} />
    </Routes>
  )
}
