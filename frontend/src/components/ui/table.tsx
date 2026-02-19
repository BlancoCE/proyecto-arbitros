import * as React from "react"

export const Table = ({ children }: any) => <table className="w-full text-sm text-left">{children}</table>
export const TableHeader = ({ children }: any) => <thead className="bg-gray-50 border-b">{children}</thead>
export const TableBody = ({ children }: any) => <tbody>{children}</tbody>
export const TableRow = ({ children }: any) => <tr className="border-b hover:bg-gray-50">{children}</tr>
export const TableHead = ({ children, className }: any) => <th className={`p-4 font-semibold ${className}`}>{children}</th>
export const TableCell = ({ children, className }: any) => <td className={`p-4 ${className}`}>{children}</td>