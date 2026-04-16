import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from 'react-router'

import Profilepage from './components/Profilepage'
import SearchPage from './components/SearchPage'
import HomePage from './components/HomePage'

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
import Video from './components/VideoPage'
import AuthPage from './components/AuthPage'
import { SignInForm } from './components/SignInPage'
import { SignUpForm } from './components/SignUpPage'

const routes = createRoutesFromElements(
  <Route path="/" element={<App />}>
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
    <Route path="/auth/:pathname" element={<AuthPage />} />
    <Route path="/" element={<HomePage />} />
  </Route>,
)

const router = createBrowserRouter(routes)

export default router
