import React, { useEffect, useRef, useState } from "react"
import "../../styles/ripple-grid.css"

export interface GridCellNode {
  row: number
  col: number
  label?: string
}

export interface RippleGridProps {
  size?: number
  rows?: number
  cols?: number
  filledCells?: Array<GridCellNode>
  cellSize?: number
  cellColor?: string
  filledCellColor?: string
  pulseColor?: string
  borderColor?: string
  borderWidth?: number
  pulseScale?: number
  pulseDuration?: number
  rippleDelay?: number
  className?: string
  interactive?: boolean
  onCellClick?: (row: number, col: number, label?: string) => void
}

export function RippleGrid({
  size = 15,
  rows,
  cols,
  filledCells = [
    { row: 2, col: 4 },
    { row: 3, col: 12 },
    { row: 5, col: 8 },
    { row: 7, col: 18 },
    { row: 8, col: 25 },
    { row: 10, col: 14 },
    { row: 12, col: 6 },
    { row: 14, col: 22 },
  ],
  cellSize = 45,
  cellColor = "rgba(241, 245, 249, 0.35)",
  filledCellColor = "rgba(14, 165, 233, 0.6)",
  pulseColor = "#76cefa",
  borderColor = "rgba(203, 213, 225, 0.4)",
  borderWidth = 1,
  pulseScale = 1.2,
  pulseDuration = 350,
  rippleDelay = 40,
  className = "",
  interactive = true,
  onCellClick,
}: RippleGridProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const [gridDimensions, setGridDimensions] = useState<{ rows: number; cols: number }>({
    rows: rows || size,
    cols: cols || Math.floor((typeof window !== "undefined" ? window.innerWidth : 1200) / cellSize),
  })

  // Auto-calculate full screen grid dimensions on window resize if rows/cols not manually fixed
  useEffect(() => {
    const updateDimensions = () => {
      const computedCols = cols || Math.max(10, Math.ceil(window.innerWidth / cellSize))
      const computedRows = rows || Math.max(10, Math.ceil(window.innerHeight / cellSize))
      setGridDimensions({ rows: computedRows, cols: computedCols })
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [cellSize, cols, rows])

  useEffect(() => {
    const gridContainer = gridRef.current
    if (!gridContainer || !interactive) return

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.classList.contains("cell")) return

      const clickedRow = Number.parseInt(target.dataset.row || "0", 10)
      const clickedCol = Number.parseInt(target.dataset.col || "0", 10)

      if (onCellClick) {
        const found = filledCells.find((fc) => fc.row === clickedRow && fc.col === clickedCol)
        onCellClick(clickedRow, clickedCol, found?.label)
      }

      const cells = gridContainer.querySelectorAll(".cell")

      cells.forEach((cell) => {
        const htmlCell = cell as HTMLElement
        const row = Number.parseInt(htmlCell.dataset.row || "0", 10)
        const col = Number.parseInt(htmlCell.dataset.col || "0", 10)

        // Calculate Manhattan distance (|r1 - r2| + |c1 - c2|)
        const distance = Math.abs(row - clickedRow) + Math.abs(col - clickedCol)

        setTimeout(() => {
          htmlCell.classList.add("pulse")

          setTimeout(() => {
            htmlCell.classList.remove("pulse")
          }, pulseDuration + 200)
        }, distance * rippleDelay)
      })
    }

    gridContainer.addEventListener("click", handleClick)

    return () => {
      gridContainer.removeEventListener("click", handleClick)
    }
  }, [filledCells, interactive, onCellClick, pulseDuration, rippleDelay])

  const isFilled = (row: number, col: number) => {
    return filledCells.some((cell) => cell.row === row && cell.col === col)
  }

  const renderGrid = () => {
    const cells = []
    const totalRows = gridDimensions.rows
    const totalCols = gridDimensions.cols

    for (let row = 0; row < totalRows; row++) {
      for (let col = 0; col < totalCols; col++) {
        const filled = isFilled(row, col)
        cells.push(
          <div
            key={`${row}-${col}`}
            className={`cell ${filled ? "filled" : ""}`}
            data-row={row}
            data-col={col}
            style={
              {
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                backgroundColor: filled ? filledCellColor : cellColor,
                border: `${borderWidth}px solid ${borderColor}`,
                boxSizing: "border-box",
                cursor: interactive ? "pointer" : "default",
                "--cell-color": cellColor,
                "--filled-cell-color": filledCellColor,
                "--pulse-color": pulseColor,
                "--pulse-scale": pulseScale.toString(),
                "--pulse-duration": `${pulseDuration}ms`,
              } as React.CSSProperties
            }
          />
        )
      }
    }
    return cells
  }

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        ref={gridRef}
        className="grid gap-0 overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${gridDimensions.cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${gridDimensions.rows}, ${cellSize}px)`,
        }}
      >
        {renderGrid()}
      </div>
    </div>
  )
}
