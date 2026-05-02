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
import { Playlist, Song, Live } from './Pages/Profile/Components/ProfInner'
import Video from './Pages/Video/VideoPage'
import { SignInForm } from './Pages/Auth/SignInPage'
import { SignUpForm } from './Pages/Auth/SignUpPage'
import { Posts } from './Pages/Profile/pages/posts/Posts'
import { Videos } from './Pages/Profile/pages/videos/Videos'
import { SettingsPage } from './Pages/Settings/SettingsPage'
import { SettingsDebug } from './Pages/Settings/DebugSettings'
import { SettingsCustomize } from './Pages/Settings/CustomizeSettings'
import { About } from './Pages/Profile/pages/about/About'
import { PostPage } from './Pages/Post/PostPage'
import { Photos } from './Pages/Profile/pages/photos/Photos'
import { ProfileLost } from './Pages/Profile/Profile404'

const routes = createRoutesFromElements(
  <Route path="/" element={<App />}>
    <Route path="/settings" element={<SettingsPage />}>
      <Route index element={<SettingsDebug />} />
      <Route path="customize" element={<SettingsCustomize />} />
    </Route>
    <Route path="/post" element={<PostPage />} />
    <Route path="/signin" element={<SignInForm />} />
    <Route path="/signup" element={<SignUpForm />} />
    <Route path="/profile/" element={<ProfileLost />} />
    <Route path="/profile/:id" element={<Profilepage />}>
      <Route index element={<Home />} />
      <Route path="videos" element={<Videos />} />
      <Route path="Posts" element={<Posts />} />
      <Route path="Live" element={<Live />} />
      <Route path="Song" element={<Song />} />
      <Route path="playlist" element={<Playlist />} />
      <Route path="Picture" element={<Photos />} />
      <Route path="About" element={<About />} />
    </Route>
    <Route path="/search/" element={<SearchPage />} />
    <Route path="/video/:id" element={<Video />} />
    <Route path="/" element={<HomePage />} />
  </Route>,
)

const router = createBrowserRouter(routes)

export default router
