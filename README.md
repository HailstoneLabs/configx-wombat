# @hailstonelabs/configx-wombat

This package is used to pre-build some configs (e.g. asset) in Wombat dapp.

## Public to NPM

```
Login NPM: npm adduser
Publish latest version : npm publish
```

## Testing

Uncomment main() in [src/index.ts](./src/index.ts)

Example config will generated at [src/example/generatedConfig](./src/example/generatedConfig)

```
// uncomment it for testing purpose
//main()
```

```sh
$ yarn start:dev
```

## Use it to frontend repo locally

To install and set up the library locally

Full path example: etc. ...blockchain/wombat/configx-wombat/hailstonelabs-configx-wombat-v1.0.7.tgz

```sh
$ yarn pack
```

```sh
$ yarn add <FULL_PATH>
```

## Installation

To install and set up the library, run:

```sh
$ yarn add @hailstonelabs/configx-wombat
```

## Use

1. Create a configx.json

```json
{
  "abis": {
    "masterWombat": {
      "path": "",
      "address": {
        "56": "0x489833311676B566f888119c29bd997Dc6C95830",
        "42161": "0x62A83C6791A3d7950D823BB71a38e47252b6b6F4",
        "97": "0x8C0e9334DBFAC1b9184bC01Ef638BA705cc13EaF"
      }
    }
  }
}
```

2. Add a script below to package.json

```json
"postinstall": "configx-wombat"

```

3. run:

```sh
$ yarn postinstall or yarn install
```
