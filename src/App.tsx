import { useState } from 'react'
import RadarChart from './RadarChart'
import './index.css'

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
    <div className="max-w-screen mx-auto p-8 font-sans bg-gray-50 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-8">Engineering Ladder Builder</h1>
      <div className="flex">
        <div>
          <div className="flex flex-col gap-4 mb-8">
            {labels.map((label, i) => (
              <div key={i} className="flex items-center gap-3">
                <input
                  type="text"
                  value={label}
                  onChange={e => handleLabelChange(i, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-base bg-white"
                  placeholder={`Label ${i + 1}`}
                />
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={0.1}
                  value={values[i]}
                  onChange={e => handleValueChange(i, Number(e.target.value))}
                  className="flex-2 w-40 accent-yellow-400"
                />
                <input
                  type="number"
                  min={1}
                  max={5}
                  step={0.1}
                  value={values[i].toFixed(1)}
                  onChange={e => handleValueChange(i, Number(e.target.value))}
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md text-right bg-white"
                />
              </div>
            ))}
          </div>
          <div className="my-8 p-4 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Level Labels</h2>
            {labels.map((axisLabel, axisIdx) => (
              <div key={axisIdx} className="mb-4">
                <strong className="block mb-1 text-gray-700">{axisLabel}</strong>
                <div className="flex gap-2">
                  {levelLabels[axisIdx].map((levelLabel, levelIdx) => (
                    <input
                      key={levelIdx}
                      type="text"
                      value={levelLabel}
                      onChange={e => handleLevelLabelChange(axisIdx, levelIdx, e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-200 rounded bg-gray-50 text-sm"
                      placeholder={`Level ${levelIdx + 1}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center items-center mt-8">
          <RadarChart labels={labels} values={values} setValues={setValues} levelLabels={levelLabels} />
        </div>
      </div>
    </div>
  )
}

export default App
