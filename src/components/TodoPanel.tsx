import { type FormEvent, useState } from 'react'
import { useApp } from '../context/AppContext'
import type { TodoItem } from '../lib/types'
import { uiLang } from '../lib/types'
import './TodoPanel.css'

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function TodoPanel() {
  const { todos, setTodos, dict, settings, selectedDate } = useApp()
  const [text, setText] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')

  const chromeAm = uiLang(settings.language) === 'am'

  // Filter todos that match the currently selected calendar date
  const currentTodos = todos.filter(
    (t) => t.year === selectedDate.year && t.month === selectedDate.month && t.day === selectedDate.day
  )

  const completedCount = todos.filter((t) => t.completed).length
  const totalCount = todos.length

  const sorted = [...currentTodos].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    return b.createdAt - a.createdAt
  })

  const add = (e: FormEvent) => {
    e.preventDefault()
    const value = text.trim()
    if (!value) return
    const item: TodoItem = {
      id: uid(),
      text: value,
      completed: false,
      pinned: false,
      createdAt: Date.now(),
      year: selectedDate.year,
      month: selectedDate.month,
      day: selectedDate.day,
    }
    void setTodos([item, ...todos])
    setText('')
  }

  const patch = (id: string, updates: Partial<TodoItem>) => {
    void setTodos(todos.map((t) => (t.id === id ? { ...t, ...updates } : t)))
  }

  const remove = (id: string) => {
    void setTodos(todos.filter((t) => t.id !== id))
  }

  const startEdit = (item: TodoItem) => {
    setEditingId(item.id)
    setEditingText(item.text)
  }

  const saveEdit = (id: string) => {
    if (!editingText.trim()) return
    patch(id, { text: editingText.trim() })
    setEditingId(null)
  }

  return (
    <section className="todo-panel widget-panel panel animate-in">
      <header className="widget-head">
        <div className="panel-header-clean">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span className={chromeAm ? 'ethiopic' : ''}>{dict.todos}</span>
        </div>
        <span className="widget-badge">
          {completedCount} / {totalCount}
        </span>
      </header>

      <form className="todo-form" onSubmit={add}>
        <input
          className={`field ${chromeAm ? 'ethiopic' : ''}`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={dict.addTodo}
          aria-label={dict.addTodo}
        />
        <button type="submit" className="btn-primary">
          +
        </button>
      </form>

      {sorted.length === 0 ? (
        <p className={`widget-empty ${chromeAm ? 'ethiopic' : ''}`}>{dict.emptyTodos}</p>
      ) : (
        <ul className="todo-list widget-list">
          {sorted.map((item) => (
            <li key={item.id} className={`widget-row todo-row ${item.completed ? 'done' : ''} ${item.id === editingId ? 'editing-row' : ''}`}>
              {item.id === editingId ? (
                <div className="todo-edit-wrap">
                  <input
                    className="field edit-todo-input"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(item.id)
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="icon-btn save-btn"
                    onClick={() => saveEdit(item.id)}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </button>
                </div>
              ) : (
                <>
                  <label>
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={(e) =>
                        patch(item.id, { completed: e.target.checked })
                      }
                    />
                    <span className={chromeAm ? 'ethiopic' : ''}>{item.text}</span>
                  </label>
                  <div className="todo-item-actions">
                    <button
                      type="button"
                      className="icon-btn"
                      title="Edit"
                      onClick={() => startEdit(item)}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="icon-btn"
                      title={item.pinned ? dict.unpin : dict.pin}
                      onClick={() => patch(item.id, { pinned: !item.pinned })}
                    >
                      {item.pinned ? (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                      ) : (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                      )}
                    </button>
                    <button
                      type="button"
                      className="icon-btn danger"
                      title={dict.delete}
                      onClick={() => remove(item.id)}
                    >
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
