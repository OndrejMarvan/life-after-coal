import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Layout from './components/Layout'
import { AuthProvider } from './lib/auth'
import Home from './pages/Home'
import Check from './pages/Check'
import Programmes from './pages/Programmes'
import ProgrammePage from './pages/Programme'
import CalendarPage from './pages/Calendar'
import Hotline from './pages/Hotline'
import Children from './pages/Children'
import Newsletter from './pages/Newsletter'
import Forum from './pages/Forum'
import ForumPost from './pages/ForumPost'
import Stories from './pages/Stories'
import Assistant from './pages/Assistant'
import Portals from './pages/Portals'
import Gaps from './pages/Gaps'
import About from './pages/About'
import Credits from './pages/Credits'
import Account from './pages/Account'
import NotFound from './pages/NotFound'
import Support from './pages/Support'

const MapPage = lazy(() => import('./pages/MapPage'))
const Admin = lazy(() => import('./pages/Admin'))
const Digest = lazy(() => import('./pages/Digest'))

function Loading() {
  const { t } = useTranslation()
  return <p className="p-8 text-center">{t('common.loading')}</p>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="check" element={<Check />} />
              <Route path="programmes" element={<Programmes />} />
              <Route path="programmes/:id" element={<ProgrammePage />} />
              <Route path="map" element={<MapPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="help" element={<Hotline />} />
              <Route path="children" element={<Children />} />
              <Route path="newsletter" element={<Newsletter />} />
              <Route path="newsletter/digest" element={<Digest />} />
              <Route path="forum" element={<Forum />} />
              <Route path="forum/:id" element={<ForumPost />} />
              <Route path="stories" element={<Stories />} />
              <Route path="assistant" element={<Assistant />} />
              <Route path="portals" element={<Portals />} />
              <Route path="gaps" element={<Gaps />} />
              <Route path="about" element={<About />} />
              <Route path="credits" element={<Credits />} />
              <Route path="support" element={<Support />} />
              <Route path="account" element={<Account />} />
              <Route path="admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}
