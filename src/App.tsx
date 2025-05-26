import { useState } from 'react'
import RadarChart from './RadarChart'
import './App.css'

const DEFAULT_LABELS = [
  'Technical',
  'Leadership',
  'Collaboration',
  'Execution',
  'Growth',
]

const DEFAULT_VALUES = [3, 4, 2, 5, 3]
const DEFAULT_LEVEL_LABELS = [
  ['Adopts', 'Specializes', 'Evangelizes', 'Creates', 'Leads'], // Technical
  ['Learns', 'Mentors', 'Inspires', 'Drives', 'Transforms'],    // Leadership
  ['Joins', 'Supports', 'Facilitates', 'Aligns', 'Champions'],  // Collaboration
  ['Delivers', 'Improves', 'Optimizes', 'Owns', 'Innovates'],   // Execution
  ['Grows', 'Shares', 'Teaches', 'Guides', 'Elevates'],         // Growth
]

function App() {
  const [labels, setLabels] = useState<string[]>(DEFAULT_LABELS)
  const [values, setValues] = useState<number[]>(DEFAULT_VALUES)
  const [levelLabels, setLevelLabels] = useState<string[][]>(DEFAULT_LEVEL_LABELS)

  const handleLabelChange = (i: number, newLabel: string) => {
    setLabels(labels => labels.map((l, idx) => (idx === i ? newLabel : l)))
  }

  const handleValueChange = (i: number, newValue: number) => {
    // Always round to nearest tenth
    const rounded = Math.round(newValue * 10) / 10
    setValues(values => values.map((v, idx) => (idx === i ? rounded : v)))
  }

  const handleLevelLabelChange = (axisIdx: number, levelIdx: number, newLabel: string) => {
    setLevelLabels(levelLabels =>
      levelLabels.map((axisLevels, i) =>
        i === axisIdx
          ? axisLevels.map((lvl, j) => (j === levelIdx ? newLabel : lvl))
          : axisLevels
      )
    )
  }

  return (
    <div className="app-container">
      <h1>Engineering Ladder Builder</h1>
      <div className="controls">
        {labels.map((label, i) => (
          <div key={i} className="control-row">
            <input
              type="text"
              value={label}
              onChange={e => handleLabelChange(i, e.target.value)}
              className="label-input"
            />
            <input
              type="range"
              min={1}
              max={5}
              step={0.1}
              value={values[i]}
              onChange={e => handleValueChange(i, Number(e.target.value))}
              className="value-slider"
            />
            <input
              type="number"
              min={1}
              max={5}
              step={0.1}
              value={values[i].toFixed(1)}
              onChange={e => handleValueChange(i, Number(e.target.value))}
              className="value-number-input"
              style={{ width: 48, marginLeft: 8 }}
            />
          </div>
        ))}
      </div>
      <div className="level-labels-controls">
        <h2>Level Labels</h2>
        {labels.map((axisLabel, axisIdx) => (
          <div key={axisIdx} className="level-label-group">
            <strong>{axisLabel}</strong>
            <div className="level-label-row">
              {levelLabels[axisIdx].map((levelLabel, levelIdx) => (
                <input
                  key={levelIdx}
                  type="text"
                  value={levelLabel}
                  onChange={e => handleLevelLabelChange(axisIdx, levelIdx, e.target.value)}
                  className="level-label-input"
                  placeholder={`Level ${levelIdx + 1}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <RadarChart labels={labels} values={values} setValues={setValues} levelLabels={levelLabels} />
    </div>
  )
}

export default App
