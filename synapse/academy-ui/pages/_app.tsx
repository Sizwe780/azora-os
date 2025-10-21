import '../styles/globals.css'
import type { AppProps } from 'next/app'
import NavBar from '../components/NavBar'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <NavBar />
      <div className="max-w-3xl mx-auto">
        <Component {...pageProps} />
      </div>
    </>
  )
}