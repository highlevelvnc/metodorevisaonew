const metrics = [
  { value: 'Estácio', label: 'Graduação', icon: '🎓' },
  { value: '500+', label: 'Alunos', icon: '👩‍🎓' },
  { value: '2 Idiomas', label: 'PT & EN', icon: '🌐' },
  { value: '4.9/5', label: 'Avaliação', icon: '⭐' },
]

export default function Metrics() {
  return (
    <section className="py-16 bg-gray-50 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m) => (
            <div key={m.label} className="text-center bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="text-3xl mb-2">{m.icon}</div>
              <div className="text-2xl lg:text-3xl font-extrabold text-gray-900 mb-1">{m.value}</div>
              <div className="text-sm text-gray-500 font-medium">{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
