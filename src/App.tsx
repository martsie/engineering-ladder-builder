import { LadderProvider, useLadderContext } from './LadderContext'
import RadarChart from './RadarChart'
import './index.css'
import { toPng } from 'html-to-image'
import { useRef } from 'react'

function AppContent() {
  const {
    topLabels, setTopLabels,
    values, setValues,
    levelLabels, setLevelLabels,
    topLabelOffsets, setTopLabelOffsets,
    levelLabelOffsets, setLevelLabelOffsets,
  } = useLadderContext()

  const chartRef = useRef<HTMLDivElement>(null)

  // Export context state as JSON
  const handleExport = () => {
    const data = {
      topLabels,
      values,
      levelLabels,
      topLabelOffsets,
      levelLabelOffsets,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ladder-config.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Import context state from JSON
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        if (data.topLabels) setTopLabels(data.topLabels)
        if (data.values) setValues(data.values)
        if (data.levelLabels) setLevelLabels(data.levelLabels)
        if (data.topLabelOffsets) setTopLabelOffsets(data.topLabelOffsets)
        if (data.levelLabelOffsets) setLevelLabelOffsets(data.levelLabelOffsets)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_err) {
        alert('Invalid JSON file.')
      }
    }
    reader.readAsText(file)
    // Reset file input so the same file can be imported again if needed
    e.target.value = ''
  }

  // Export chart to PNG
  const handleExportPng = async () => {
    if (!chartRef.current) return
    const dataUrl = await toPng(chartRef.current, { cacheBust: true, backgroundColor: '#f9fafb' })
    const link = document.createElement('a')
    link.download = 'ladder-chart.png'
    link.href = dataUrl
    link.click()
  }

  const handleTopLabelChange = (i: number, newLabel: string) => {
    setTopLabels(topLabels.map((l, idx) => (idx === i ? newLabel : l)))
  }

  const handleValueChange = (i: number, newValue: number) => {
    // Always round to nearest tenth
    const rounded = Math.round(newValue * 10) / 10
    setValues(values.map((v, idx) => (idx === i ? rounded : v)))
  }

  const handleLevelLabelChange = (axisIdx: number, levelIdx: number, newLabel: string) => {
    setLevelLabels(levelLabels.map((axisLevels, i) =>
      i === axisIdx
        ? axisLevels.map((lvl, j) => (j === levelIdx ? newLabel : lvl))
        : axisLevels
    ))
  }

  return (
    <div className="w-screen h-screen mx-auto p-8 font-sans bg-gray-50">
      <h1 className="text-3xl font-bold text-center mb-8">Engineering Ladder Chart Builder</h1>
      <div className="flex gap-4 mb-6">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
          onClick={handleExport}
        >
          Export config
        </button>
        <label className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold cursor-pointer">
          Import config
          <input
            type="file"
            accept="application/json"
            onChange={handleImport}
            className="hidden"
          />
        </label>
        <button
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 font-semibold"
          onClick={handleExportPng}
        >
          Export PNG
        </button>
      </div>
      <div className="lg:flex">
        <div>
          <div className="flex flex-col gap-4 mb-8">
            {topLabels.map((label, i) => (
              <div className="bg-white p-3 border rounded-md border-gray-200">
                <div key={i} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={label}
                    onChange={e => handleTopLabelChange(i, e.target.value)}
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
                    className="flex-2 accent-yellow-400"
                  />
                  <input
                    type="number"
                    min={1}
                    max={5}
                    step={0.1}
                    value={values[i].toFixed(1)}
                    onChange={e => handleValueChange(i, Number(e.target.value))}
                    className="px-2 py-1 border border-gray-300 rounded-md text-right bg-white"
                  />
                </div>
                <div className="mt-2 border-t border-gray-200 pt-2">
                  <div className="flex flex-wrap gap-2">
                    {levelLabels[i].map((levelLabel, levelIdx) => (
                      <input
                        key={levelIdx}
                        type="text"
                        value={levelLabel}
                        onChange={e => handleLevelLabelChange(i, levelIdx, e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-200 rounded bg-gray-50 text-sm"
                        placeholder={`Level ${levelIdx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center items-center mt-8" ref={chartRef}>
          <RadarChart />
        </div>
      </div>
      Inspired by <a href="https://github.com/jorgef/engineeringladders/tree/master" target="_blank" rel="noopener noreferrer" className="text-blue-500">jorgef/engineeringladders</a>
      <div className="mt-4 text-center text-gray-500 text-sm">
        <a href="https://github.com/martsie/engineering-ladder-builder" target="_blank" rel="noopener noreferrer" className="hover:underline">View on GitHub</a>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <LadderProvider>
      <AppContent />
    </LadderProvider>
  )
}
