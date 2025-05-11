import React from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { installationsData } from '../data/installationsData'
import { Installation } from '../types'

const THRESHOLDS = [500, 1000]
const COLORS = ['#22c55e', '#eab308', '#ef4444']
const ARC_ANGLE = 180

const extractYear = (d: string) => d.split('-')[0]
const sumByYear = (arr: Installation[], year: number) =>
  arr
    .filter(i => extractYear(i.date) === String(year))
    .reduce((s, i) => s + i.totalCollisions, 0)

const CollisionGrowthGauge: React.FC = () => {
  const CUR = 2025
  const PREV = CUR - 1
  const curr = sumByYear(installationsData, CUR)
  const prev = sumByYear(installationsData, PREV)
  const growth = curr - prev

  const zone =
    growth <= THRESHOLDS[0] ? 0 :
    growth <= THRESHOLDS[1] ? 1 : 2

  const data = [
    { value: 1, fill: COLORS[0] },
    { value: 1, fill: COLORS[1] },
    { value: 1, fill: COLORS[2] },
  ]

  const midAngles = [ -90 + 30, -90 + 90, -90 + 150 ]
  const arrowDeg = midAngles[zone]

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 text-center">
        Прирост выявленных коллизий ({PREV}→{CUR})
      </h2>

      <div className="h-[200px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              startAngle={180}
              endAngle={0}
              innerRadius="60%"
              outerRadius="100%"
              stroke="none"
              isAnimationActive
              animationDuration={600}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="origin-center transition-transform duration-700 ease-out"
            style={{ transform: `rotate(${arrowDeg}deg)` }}
          >
            <svg width="80" height="80" viewBox="-40 -40 80 80">
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="-30"
                stroke="#333"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <polygon
                points="0,-35 -5,-25 5,-25"
                fill="#333"
              />
            </svg>
          </div>
        </div>

        <div className="absolute inset-x-0 top-[60%] text-center">
          <div
            className={`text-2xl font-bold ${
              zone === 0 ? 'text-green-600'
              : zone === 1 ? 'text-yellow-500'
              : 'text-red-600'
            }`}
          >
            {growth >= 0 ? '+' : ''}
            {growth.toLocaleString()} шт.
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            с прошлого года
          </div>
        </div>
      </div>

      <div className="mt-2 flex justify-between text-sm px-4">
        <div className="text-green-600">0–500</div>
        <div className="text-yellow-500">500–1000</div>
        <div className="text-red-600">1000+</div>
      </div>
    </div>
  )
}

export default CollisionGrowthGauge