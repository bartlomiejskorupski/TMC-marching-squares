# TMC - Marching Squares Algorithm

React web application for visualizing marching squares algorithm.

[Documentation](DOCS.md)

## Requirements

- Node.js v18+
- npm v7+

## Installation

Clone the repository

```console
git clone https://github.com/bartlomiejskorupski/TMC-marching-squares.git
```

or download the ZIP file and unpack it.

Enter the project folder

```console
cd TMC-marching-squares
```
Install dependencies

```console
npm install
```

## Running locally

To host the application locally run the following command:

```console
npm run dev
```

The application is now hosted on http://localhost:5173/

## Building for deployment

To build the project run the following command:

```console
npm run build
```

Application files are now in the dist folder and can be hosted statically.

Example of hosting locally using http-server npm package:

```console
cd dist
http-server --port 3000
```

The application is now available at http://localhost:3000/.
