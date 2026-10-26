import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/react/daygrid'
import koLocale from '@fullcalendar/react/locales/ko'
import classicThemePlugin from '@fullcalendar/react/themes/classic'

function App() {
  return (
    <main className="mx-auto max-w-5xl p-4 font-sans text-foreground">
      <h1 className="mb-4 text-2xl font-bold">치이카와 캘린더</h1>
      <FullCalendar
        plugins={[dayGridPlugin, classicThemePlugin]}
        initialView="dayGridMonth"
        locale={koLocale}
        events={[]}
      />
    </main>
  )
}

export default App
