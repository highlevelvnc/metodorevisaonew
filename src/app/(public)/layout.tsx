import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import LoadingScreen from '@/components/LoadingScreen'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LoadingScreen />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}
