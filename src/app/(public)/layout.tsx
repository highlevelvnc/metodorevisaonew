import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import LoadingScreen from '@/components/LoadingScreen'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    // Public marketing pages are always dark-themed for brand consistency.
    // The dark class here forces CSS variables to use dark values regardless
    // of the user's system/app theme preference.
    <div className="dark" style={{ backgroundColor: 'var(--bg-body)', color: 'var(--text-secondary)', minHeight: '100vh' }}>
      <LoadingScreen />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
