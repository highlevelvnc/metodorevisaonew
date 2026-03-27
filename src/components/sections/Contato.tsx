'use client'
import { trackEvent } from '@/components/Analytics'

const WA_LINK =
  'https://wa.me/5522992682207?text=Ol%C3%A1%2C%20Beatriz!%20Vim%20pelo%20site%20M%C3%A9todo%20Revis%C3%A3o%20e%20quero%20saber%20mais%20sobre%20as%20aulas.'

export default function Contato() {
  return (
    <section id="contato" className="py-24 bg-purple-700 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600 rounded-full opacity-30 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-800 rounded-full opacity-30 -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="text-5xl mb-6">💜</div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
          Pronto para transformar <br className="hidden sm:block" />seu desempenho?
        </h2>
        <p className="text-purple-200 text-xl mb-12 max-w-lg mx-auto">
          Entre em contato agora e vamos montar juntos o seu plano de estudos personalizado.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 bg-white text-purple-700 font-bold px-8 py-4 rounded-xl text-lg hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-white/50 shadow-lg"
            onClick={() => trackEvent('contact_whatsapp', { source: 'contato_cta' })}
            aria-label="Falar no WhatsApp"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-green-500">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.424h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Falar no WhatsApp
          </a>
          <a
            href="mailto:revisaometodo@gmail.com"
            className="inline-flex items-center justify-center gap-3 border-2 border-white/30 text-white font-bold px-8 py-4 rounded-xl text-lg hover:bg-white/10 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-white/50"
            onClick={() => trackEvent('contact_email', { source: 'contato_cta' })}
            aria-label="Enviar e-mail"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M2 7l10 7 10-7" />
            </svg>
            revisaometodo@gmail.com
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
          {[
            { icon: '⚡', label: 'Atendimento rápido' },
            { icon: '📋', label: 'Plano personalizado' },
            { icon: '🌐', label: 'Online para todo o Brasil' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 justify-center">
              <span className="text-xl">{item.icon}</span>
              <span className="text-white text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
