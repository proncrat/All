import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from 'react-router'

import Profilepage from './components/Profilepage'

import App from './components/App'
import Home from './components/SubComponents/Home'
import {
  About,
  Picture,
  Playlist,
  Song,
  Live,
  Posts,
  Videos,
  Call,
} from './components/SubComponents/ProfInner'

const routes = createRoutesFromElements(
  <Route path="/" element={<App />}>
    <Route path="/profile/:id" element={<Profilepage />}>
      <Route index element={<Home />} />
      <Route path="videos" element={<Videos />} />
      <Route path="Posts" element={<Posts />} />
      <Route path="Live" element={<Live />} />
      <Route path="Song" element={<Song />} />
      <Route path="playlist" element={<Playlist />} />
      <Route path="Picture" element={<Picture />} />
      <Route path="About" element={<About />} />
      <Route path="Call" element={<Call />} />
    </Route>
  </Route>,
)

const router = createBrowserRouter(routes)

export default router
