import * as dotenv from 'dotenv'
import { IndentationText, Project, QuoteKind } from 'ts-morph'
export default function init() {
  dotenv.config()
  const project = new Project({
    // Optionally specify compiler options, tsconfig.json, in-memory file system, and more here.
    // If you initialize with a tsconfig.json, then it will automatically populate the project
    // with the associated source files.
    // Read more: https://ts-morph.com/setup/
    manipulationSettings: {
      indentationText: IndentationText.Tab,
      useTrailingCommas: true,
      quoteKind: QuoteKind.Single,
    },
  })

  return project
}
