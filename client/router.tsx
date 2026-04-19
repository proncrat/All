import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from 'react-router'

import Profilepage from './Pages/Profile/Profilepage'
import SearchPage from './Pages/search/SearchPage'
import HomePage from './Pages/Home/HomePage'

import App from './Pages/Util/App'
import Home from './Pages/Profile/Home'
import {
  About,
  Picture,
  Playlist,
  Song,
  Live,
  Posts,
  Videos,
  Call,
} from './Pages/Profile/Components/ProfInner'
import Video from './Pages/Video/VideoPage'
import { SignInForm } from './Pages/Auth/SignInPage'
import { SignUpForm } from './Pages/Auth/SignUpPage'
import { SettingsPage } from './Pages/Settings/ProfileSettings'

const routes = createRoutesFromElements(
  <Route path="/" element={<App />}>
    <Route path="/settings" element={<SettingsPage />} />
    <Route path="/signin" element={<SignInForm />} />
    <Route path="/signup" element={<SignUpForm />} />
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
    <Route path="/search/" element={<SearchPage />} />
    <Route path="/video/:id" element={<Video />} />
    <Route path="/" element={<HomePage />} />
  </Route>,
)

const router = createBrowserRouter(routes)

export default router
