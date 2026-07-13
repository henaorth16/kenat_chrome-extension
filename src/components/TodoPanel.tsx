import { type FormEvent, useState } from 'react'
import { useApp } from '../context/AppContext'
import type { TodoItem } from '../lib/types'
import { uiLang } from '../lib/types'
import './TodoPanel.css'

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function TodoPanel() {
  const { todos, setTodos, dict, settings } = useApp()
  const [text, setText] = useState('')
  const chromeAm = uiLang(settings.language) === 'am'

  const sorted = [...todos].sort((a, b) => {
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

  return (
    <section className="todo-panel panel animate-in">
      <div className="panel-header-clean">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span className={chromeAm ? 'ethiopic' : ''}>{dict.todos}</span>
      </div>
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
        <p className={`empty ${chromeAm ? 'ethiopic' : ''}`}>{dict.emptyTodos}</p>
      ) : (
        <ul className="todo-list">
          {sorted.map((item) => (
            <li key={item.id} className={item.completed ? 'done' : ''}>
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
              <div className="todo-actions">
                <button
                  type="button"
                  className="icon-btn"
                  title={item.pinned ? dict.unpin : dict.pin}
                  onClick={() => patch(item.id, { pinned: !item.pinned })}
                >
                  {item.pinned ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
