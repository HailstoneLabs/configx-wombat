#!/usr/bin/env node
import main from '..'
import { removeSync } from 'fs-extra'
import { CWD, OUTPUT_DIR } from '../constant/common'
import path from 'path'

removeSync(path.resolve(CWD, OUTPUT_DIR))
void main()
