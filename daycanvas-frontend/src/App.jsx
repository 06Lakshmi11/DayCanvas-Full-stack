import { useEffect, useRef, useState } from 'react'
import CalendarGrid from './components/CalendarGrid.jsx'
import NoteModal from './components/NoteModal.jsx'
import Sidebar from './components/Sidebar.jsx'
import ThemeSwitcher from './components/ThemeSwitcher.jsx'
import HolidaySettings from './components/HolidaySettings.jsx'
import BackupControls from './components/BackupControls.jsx'
import UndoToast from './components/UndoToast.jsx'
import AuthScreen from './components/AuthScreen.jsx'
import { toDateKey } from './utils/dateUtils.js'
import { fetchHolidays } from './utils/holidays.js'
import {
  currentTimeHHMM,
  requestNotificationPermission,
  showReminderNotification,
} from './utils/reminders.js'
import {
  getToken,
  setToken,
  fetchCurrentUser,
  fetchNotes,
  createNoteApi,
  updateNoteApi,
  deleteNoteApi,
} from './utils/api.js'
import './App.css'

const THEME_KEY = 'calendar-notes:theme'
const COUNTRY_KEY = 'calendar-notes:country'
const SHOW_HOLIDAYS_KEY = 'calendar-notes:show-holidays'

// Converts a note as returned by the backend (_id) into the shape the rest
// of the app already expects (id), so no other component needs to change.
function mapApiNote(note) {
  return { ...note, id: note._id }
}

function groupByDate(notes) {
  const grouped = {}
  for (const note of notes) {
    const key = note.dateKey
    grouped[key] = [...(grouped[key] || []), mapApiNote(note)]
  }
  return grouped
}

export default function App() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [notesByDate, setNotesByDate] = useState({})
  const [selectedDate, setSelectedDate] = useState(null)
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'sage')

  const [country, setCountry] = useState(() => localStorage.getItem(COUNTRY_KEY) || 'IN')
  const [showHolidays, setShowHolidays] = useState(
    () => localStorage.getItem(SHOW_HOLIDAYS_KEY) !== 'false',
  )
  const [holidaysByDate, setHolidaysByDate] = useState({})
  const [holidayStatus, setHolidayStatus] = useState('idle') // idle | loading | ok | empty | error

  const [undoData, setUndoData] = useState(null) // { dateKey, note } | null
  const undoTimerRef = useRef(null)

  // ---------- auth state ----------
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [notesLoading, setNotesLoading] = useState(false)

  // On first load, if a token exists, verify it and load that user's notes.
  useEffect(() => {
    async function checkSession() {
      const token = getToken()
      if (!token) {
        setAuthChecked(true)
        return
      }
      try {
        const { user: currentUser } = await fetchCurrentUser()
        setUser(currentUser)
        await loadAllNotes()
      } catch {
        setToken(null) // stale/invalid token
      } finally {
        setAuthChecked(true)
      }
    }
    checkSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadAllNotes() {
    setNotesLoading(true)
    try {
      const { notes } = await fetchNotes()
      setNotesByDate(groupByDate(notes))
    } catch (err) {
      console.error('Could not load notes:', err)
    } finally {
      setNotesLoading(false)
    }
  }

  function handleAuthenticated(authedUser) {
    setUser(authedUser)
    loadAllNotes()
  }

  function handleLogout() {
    setToken(null)
    setUser(null)
    setNotesByDate({})
  }

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem(COUNTRY_KEY, country)
  }, [country])

  useEffect(() => {
    localStorage.setItem(SHOW_HOLIDAYS_KEY, String(showHolidays))
  }, [showHolidays])

  // Load public holidays for the visible year (plus neighbors, since a
  // month grid can show a few days that spill into an adjacent year).
  useEffect(() => {
    if (!showHolidays) {
      setHolidaysByDate({})
      setHolidayStatus('idle')
      return
    }
    let cancelled = false
    async function loadHolidays() {
      setHolidayStatus('loading')
      const years = [year - 1, year, year + 1]
      try {
        const results = await Promise.all(years.map((y) => fetchHolidays(y, country)))
        if (cancelled) return
        const flat = results.flat()
        const map = {}
        flat.forEach((h) => {
          map[h.date] = h.name
        })
        setHolidaysByDate(map)
        setHolidayStatus(flat.length > 0 ? 'ok' : 'empty')
      } catch (err) {
        console.error('Could not load holidays:', err)
        if (!cancelled) {
          setHolidaysByDate({})
          setHolidayStatus('error')
        }
      }
    }
    loadHolidays()
    return () => {
      cancelled = true
    }
  }, [year, country, showHolidays])

  // Poll once a minute for due reminders on today's notes.
  useEffect(() => {
    if (!user) return
    const interval = setInterval(() => {
      const todayKey = toDateKey(new Date())
      const nowHHMM = currentTimeHHMM()
      const todaysNotes = notesByDate[todayKey] || []
      const due = todaysNotes.filter(
        (n) => n.reminderTime && n.reminderTime <= nowHHMM && !n.remindedAt,
      )
      if (due.length === 0) return

      setNotesByDate((prev) => {
        const list = prev[todayKey] || []
        return {
          ...prev,
          [todayKey]: list.map((n) =>
            due.some((d) => d.id === n.id) ? { ...n, remindedAt: Date.now() } : n,
          ),
        }
      })

      due.forEach((n) => {
        updateNoteApi(n.id, { remindedAt: Date.now() }).catch(() => {})
        showReminderNotification('DayCanvas reminder', n.text || 'Checklist item due')
      })
    }, 20000)

    return () => clearInterval(interval)
  }, [notesByDate, user])

  function goToPrevMonth() {
    const next = new Date(year, month - 1, 1)
    setYear(next.getFullYear())
    setMonth(next.getMonth())
  }

  function goToNextMonth() {
    const next = new Date(year, month + 1, 1)
    setYear(next.getFullYear())
    setMonth(next.getMonth())
  }

  function goToToday() {
    setYear(today.getFullYear())
    setMonth(today.getMonth())
  }

  function jumpToDate(date) {
    setYear(date.getFullYear())
    setMonth(date.getMonth())
    setSelectedDate(date)
  }

  function jumpToMonth(newYear, newMonth) {
    setYear(newYear)
    setMonth(newMonth)
  }

  async function handleAddNote(dateKey, noteData) {
    if (noteData.reminderTime) {
      await requestNotificationPermission()
    }
    try {
      const { note } = await createNoteApi({ ...noteData, dateKey })
      const mapped = mapApiNote(note)
      setNotesByDate((prev) => ({
        ...prev,
        [dateKey]: [...(prev[dateKey] || []), mapped],
      }))
    } catch (err) {
      console.error('Could not save note:', err)
    }
  }

  async function handleDeleteNote(noteId) {
    if (!selectedDate) return
    const key = toDateKey(selectedDate)
    const note = (notesByDate[key] || []).find((n) => n.id === noteId)
    if (!note) return

    setNotesByDate((prev) => ({
      ...prev,
      [key]: (prev[key] || []).filter((n) => n.id !== noteId),
    }))

    try {
      await deleteNoteApi(noteId)
    } catch (err) {
      console.error('Could not delete note on the server:', err)
    }

    setUndoData({ dateKey: key, note })
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    undoTimerRef.current = setTimeout(() => setUndoData(null), 6000)
  }

  async function handleUndoDelete() {
    if (!undoData) return
    const { dateKey, note } = undoData
    // eslint-disable-next-line no-unused-vars
    const { id, _id, createdAt, updatedAt, __v, ...noteFields } = note
    try {
      const { note: restored } = await createNoteApi({ ...noteFields, dateKey })
      setNotesByDate((prev) => ({
        ...prev,
        [dateKey]: [...(prev[dateKey] || []), mapApiNote(restored)],
      }))
    } catch (err) {
      console.error('Could not restore note:', err)
    }
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    setUndoData(null)
  }

  async function handleToggleItem(noteId, itemId) {
    if (!selectedDate) return
    const key = toDateKey(selectedDate)
    const note = (notesByDate[key] || []).find((n) => n.id === noteId)
    if (!note) return

    const updatedItems = note.items.map((i) =>
      i.id === itemId ? { ...i, checked: !i.checked } : i,
    )

    setNotesByDate((prev) => ({
      ...prev,
      [key]: (prev[key] || []).map((n) => (n.id === noteId ? { ...n, items: updatedItems } : n)),
    }))

    try {
      await updateNoteApi(noteId, { items: updatedItems })
    } catch (err) {
      console.error('Could not save checklist update:', err)
    }
  }

  // Import from a backup file: push every imported note to the backend,
  // then merge the server-confirmed results into local state.
  async function handleImportNotes(imported) {
    for (const [dateKey, notes] of Object.entries(imported)) {
      for (const note of notes) {
        // eslint-disable-next-line no-unused-vars
        const { id, _id, createdAt, updatedAt, __v, ...noteFields } = note
        try {
          const { note: saved } = await createNoteApi({ ...noteFields, dateKey })
          setNotesByDate((prev) => ({
            ...prev,
            [dateKey]: [...(prev[dateKey] || []), mapApiNote(saved)],
          }))
        } catch (err) {
          console.error('Could not import a note:', err)
        }
      }
    }
  }

  const selectedKey = selectedDate ? toDateKey(selectedDate) : null

  if (!authChecked) {
    return <div className="auth-screen auth-loading">Loading…</div>
  }

  if (!user) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />
  }

  return (
    <div className="page" data-theme={theme}>
      <header className="masthead">
        <div>
          <span className="masthead-eyebrow">Calendar Notes</span>
          <h1>DayCanvas</h1>
        </div>
        <div className="masthead-right">
          <p className="masthead-sub">
            Signed in as <strong>{user.name}</strong> ·{' '}
            <button type="button" className="logout-link" onClick={handleLogout}>
              Log out
            </button>
          </p>
          <ThemeSwitcher theme={theme} onChange={setTheme} />
          <HolidaySettings
            country={country}
            onCountryChange={setCountry}
            show={showHolidays}
            onToggleShow={setShowHolidays}
            status={holidayStatus}
          />
        </div>
      </header>

      {notesLoading && <p className="notes-loading-banner">Syncing your notes…</p>}

      <div className="workspace">
        <CalendarGrid
          year={year}
          month={month}
          notesByDate={notesByDate}
          holidaysByDate={holidaysByDate}
          onPrevMonth={goToPrevMonth}
          onNextMonth={goToNextMonth}
          onToday={goToToday}
          onJumpToMonth={jumpToMonth}
          onSelectDay={setSelectedDate}
        />
        <div className="side-column">
          <Sidebar notesByDate={notesByDate} onJumpToDate={jumpToDate} />
          <BackupControls notesByDate={notesByDate} onImportMerge={handleImportNotes} />
        </div>
      </div>

      {undoData && (
        <UndoToast
          message="Note deleted."
          onUndo={handleUndoDelete}
          onDismiss={() => {
            if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
            setUndoData(null)
          }}
        />
      )}

      {selectedDate && (
        <NoteModal
          date={selectedDate}
          notes={notesByDate[selectedKey] || []}
          onAddNote={handleAddNote}
          onDeleteNote={handleDeleteNote}
          onToggleItem={handleToggleItem}
          onClose={() => setSelectedDate(null)}
        />
      )}

      <footer className="note">
        Your notes are synced to your DayCanvas account and available on any device you log
        into. Reminders only fire while this tab is open. Holiday data comes from the public
        Nager.Date API.
      </footer>
    </div>
  )
}