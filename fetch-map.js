const fs = require('fs');
fetch('https://raw.githubusercontent.com/djaiss/mapsicon/master/all/au/vector.svg')
  .then(r => r.text())
  .then(svg => {
    const paths = [...svg.matchAll(/<path[^>]*d="([^"]+)"/g)].map(m => `<path fill="currentColor" d="${m[1]}" />`).join('\n');
    const code = `export default function AustraliaMap({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(0, 1000) scale(0.1, -0.1)">
        ${paths}
      </g>
    </svg>
  );
}`;
    fs.writeFileSync('src/components/customer/AustraliaMap.tsx', code);
  });
