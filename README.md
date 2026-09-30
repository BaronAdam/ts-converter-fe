# ts-converter-fe

Truck Sim Time Converter: converts in-game time in American Truck Simulator and
Euro Truck Simulator 2 into real time (H:MM:SS).
Visit https://ts-converter.barondev.net/

Everything runs in the browser. There is no backend; the conversion lives in
[`ts-converter/src/app/domain/converter/conversion.ts`](ts-converter/src/app/domain/converter/conversion.ts).
The old Azure Functions API ([ts-converter-be](https://github.com/BaronAdam/ts-converter-be))
is archived.

## Conversion rates

In-game minutes that pass per real minute:

| Game | Where              | Rate |
| ---- | ------------------ | ---- |
| ATS  | in a city          | 3    |
| ATS  | outside a city     | 20   |
| ETS  | in a city          | 3    |
| ETS  | mainland Europe    | 19   |
| ETS  | United Kingdom     | 15   |

The result is truncated to whole seconds.

## Development

```bash
cd ts-converter
npm install
npm run dev      # http://localhost:3000
npm test
npm run lint
npm run build
```

## Azure cleanup

`scripts/teardown-backend.ps1` removes the Azure resources that only the old
backend used (run it with `-WhatIf` first).
