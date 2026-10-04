export function SpecTable({ rows }: { rows: [string, string][] }) {
  return (
    <table className="w-full border-collapse text-[0.9375rem]">
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label} className="border-b border-line">
            <th scope="row" className="w-2/5 py-3 pr-4 text-left font-normal text-muted">
              {label}
            </th>
            <td className="py-3">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
