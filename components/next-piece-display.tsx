interface NextPieceDisplayProps {
  piece: number[][]
}

export default function NextPieceDisplay({ piece }: NextPieceDisplayProps) {
  // Color mapping for different piece types
  const colorMap: Record<number, string> = {
    0: "bg-gray-900", // Empty cell
    1: "bg-red-500", // I piece
    2: "bg-blue-500", // J piece
    3: "bg-orange-500", // L piece
    4: "bg-yellow-500", // O piece
    5: "bg-green-500", // S piece
    6: "bg-purple-500", // T piece
    7: "bg-teal-500", // Z piece
    8: "bg-pink-500", // P piece (pentomino)
    9: "bg-indigo-500", // F piece (pentomino)
    10: "bg-emerald-500", // X piece (pentomino)
    11: "bg-amber-500", // W piece (pentomino)
    12: "bg-rose-500", // Y piece (pentomino)
  }

  return (
    <div className="text-center">
      <h3 className="text-white text-lg font-medium mb-2">Next Piece</h3>
      <div className="inline-block bg-gray-900 p-2">
        <div className="grid grid-cols-5 gap-px">
          {piece.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`next-${rowIndex}-${colIndex}`}
                className={`w-5 h-5 ${cell ? colorMap[cell] : "bg-transparent"}`}
              />
            )),
          )}
        </div>
      </div>
    </div>
  )
}
