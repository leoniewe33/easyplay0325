import { createServer } from 'node:http';
const hostname = 'localhost';
const port = 4000;
/*const requestHandler = (request, response) => {

  response.statusCode = 200;
  response.setHeader('Content-Type', 'text/plain');

  response.write('Hello World');

  response.end();
}
const server = createServer(requestHandler);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
*/

const requestHandler = (request, response) => {
    if(request.url == '/') {
        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/plain');
        response.write('Hello World 2');
        response.end();
    } else if (request.url == '/about') {
        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/plain');
        response.write('About me');
        response.end();
    } else {
        response.statusCode = 400;
        response.end('Pfad nicht gefunden');
    }
}

const server = createServer(requestHandler);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});