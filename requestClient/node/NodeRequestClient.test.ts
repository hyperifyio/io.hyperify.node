
import { jest } from '@jest/globals';
import { HttpModule, NodeRequestClient } from "./NodeRequestClient";
import { RequestMethod } from "../../../core/request/types/RequestMethod";
import { EventEmitter } from "events";
import { LogLevel } from "../../../core/types/LogLevel";
import { ResponseEntity } from "../../../core/request/types/ResponseEntity";

interface MockHttpModule extends HttpModule {
    mockResponse(statusCode: number, body: string): void;
    mockClear() : void;
    getLastMockResponse() : any;
    getLastMockRequest() : any;
}

function createMockHttpModule (
    statusCode: number,
    body: string
) : MockHttpModule {
    let timeout : any = undefined;
    let response : any;
    let request : any;
    const http = {
        request: jest.fn((
            // @ts-ignore
            options, callback : any) => {

            const res : any = new EventEmitter();
            response = res;
            res.statusCode = statusCode;
            res.end = jest.fn();

            timeout = setTimeout(() => {
                timeout = undefined;
                res.emit('data', Buffer.from(body, 'utf8'));
                res.emit('end');
            }, 100);

            callback(res);

            const req : any = new EventEmitter();
            request = req;
            req.statusCode = statusCode;
            req.write = jest.fn();
            req.end = jest.fn();
            return req;
        }),
        getLastMockResponse() : any {
            return response;
        },
        getLastMockRequest() : any {
            return request;
        },
        mockResponse(s: number, b: string) {
            statusCode = s;
            body = b;
        },
        mockClear() {
            if (timeout !== undefined) {
                clearTimeout(timeout);
                timeout = undefined;
            }
        }
    } as unknown as MockHttpModule;
    return http;
}

describe('NodeRequestClient', () => {

    let http : MockHttpModule;
    let client : NodeRequestClient;

    beforeEach ( () => {
        NodeRequestClient.setLogLevel(LogLevel.NONE);
        http = createMockHttpModule(200, '');
        client = NodeRequestClient.create(http, http);
    });

    afterEach( () => {
        http.mockClear();
    });

    describe('textRequest', () => {

        it('should return a GET response when the request is successful', async () => {
            http.mockResponse(200, 'Hello world');
            const response = await client.textRequest(RequestMethod.GET, 'http://example.com');
            expect(response).toBe('Hello world');
            expect((http.request as any).mock.calls[0][0].headers['Content-Type']).toBe('text/plain');
            expect((http.request as any).mock.calls[0][0].hostname).toBe('example.com');
            expect((http.request as any).mock.calls[0][0].method).toBe('GET');
            expect((http.request as any).mock.calls[0][0].path).toBe('/');
            expect((http.request as any).mock.calls[0][0].port).toBe(80);
        });

        it('should return a POST response when the request is successful', async () => {
            http.mockResponse(200, 'Hello world');
            const response = await client.textRequest(RequestMethod.POST, 'http://example.com');
            expect(response).toBe('Hello world');

            expect((http.request as any).mock.calls[0][0].headers['Content-Type']).toBe('text/plain');
            expect((http.request as any).mock.calls[0][0].hostname).toBe('example.com');
            expect((http.request as any).mock.calls[0][0].method).toBe('POST');
            expect((http.request as any).mock.calls[0][0].path).toBe('/');
            expect((http.request as any).mock.calls[0][0].port).toBe(80);

        });

        it('should return a PUT response when the request is successful', async () => {
            http.mockResponse(200, 'Hello world');
            const response = await client.textRequest(RequestMethod.PUT, 'http://example.com');
            expect(response).toBe('Hello world');
            expect((http.request as any).mock.calls[0][0].headers['Content-Type']).toBe('text/plain');
            expect((http.request as any).mock.calls[0][0].hostname).toBe('example.com');
            expect((http.request as any).mock.calls[0][0].method).toBe('PUT');
            expect((http.request as any).mock.calls[0][0].path).toBe('/');
            expect((http.request as any).mock.calls[0][0].port).toBe(80);
        });

        it('should return a DELETE response when the request is successful', async () => {
            http.mockResponse(200, 'Hello world');
            const response = await client.textRequest(RequestMethod.DELETE, 'http://example.com');
            expect(response).toBe('Hello world');
            expect((http.request as any).mock.calls[0][0].headers['Content-Type']).toBe('text/plain');
            expect((http.request as any).mock.calls[0][0].hostname).toBe('example.com');
            expect((http.request as any).mock.calls[0][0].method).toBe('DELETE');
            expect((http.request as any).mock.calls[0][0].path).toBe('/');
            expect((http.request as any).mock.calls[0][0].port).toBe(80);
        });

        it('should throw an error when the request is unsuccessful', async () => {
            http.mockResponse(400, 'Hello world');
            try {
                await client.textRequest(RequestMethod.GET, 'http://example.com');
            } catch (error: any) {
                expect(error).toBeDefined();
                expect(error.getStatusCode()).toStrictEqual(400);
                expect(error.getBody()).toStrictEqual('Hello world');

                expect((http.request as any).mock.calls[0][0].headers['Content-Type']).toBe('text/plain');
                expect((http.request as any).mock.calls[0][0].hostname).toBe('example.com');
                expect((http.request as any).mock.calls[0][0].method).toBe('GET');
                expect((http.request as any).mock.calls[0][0].path).toBe('/');
                expect((http.request as any).mock.calls[0][0].port).toBe(80);

            }
        });

    });

    describe('jsonRequest', () => {

        it('should return a JSON GET response when the request is successful', async () => {
            http.mockResponse(200, JSON.stringify({hello: 'world'}));
            const response = await client.jsonRequest(RequestMethod.GET, 'http://get.json.example.com');
            expect(response).toStrictEqual({hello: 'world'});
            expect((http.request as any).mock.calls[0][0].headers['Content-Type']).toBe('application/json');
            expect((http.request as any).mock.calls[0][0].hostname).toBe('get.json.example.com');
            expect((http.request as any).mock.calls[0][0].method).toBe('GET');
            expect((http.request as any).mock.calls[0][0].path).toBe('/');
            expect((http.request as any).mock.calls[0][0].port).toBe(80);
        });

        it('should return a JSON POST response when the request is successful', async () => {
            http.mockResponse(200, JSON.stringify({hello: 'world'}));
            const response = await client.jsonRequest(RequestMethod.POST, 'http://post.json.example.com');
            expect(response).toStrictEqual({hello: 'world'});
            expect((http.request as any).mock.calls[0][0].headers['Content-Type']).toBe('application/json');
            expect((http.request as any).mock.calls[0][0].hostname).toBe('post.json.example.com');
            expect((http.request as any).mock.calls[0][0].method).toBe('POST');
            expect((http.request as any).mock.calls[0][0].path).toBe('/');
            expect((http.request as any).mock.calls[0][0].port).toBe(80);
        });

        it('should return a JSON PUT response when the request is successful', async () => {
            http.mockResponse(200, JSON.stringify({hello: 'world'}));
            const response = await client.jsonRequest(RequestMethod.PUT, 'http://put.json.example.com');
            expect(response).toStrictEqual({hello: 'world'});
            expect((http.request as any).mock.calls[0][0].headers['Content-Type']).toBe('application/json');
            expect((http.request as any).mock.calls[0][0].hostname).toBe('put.json.example.com');
            expect((http.request as any).mock.calls[0][0].method).toBe('PUT');
            expect((http.request as any).mock.calls[0][0].path).toBe('/');
            expect((http.request as any).mock.calls[0][0].port).toBe(80);
        });

        it('should return a JSON DELETE response when the request is successful', async () => {
            http.mockResponse(200, JSON.stringify({hello: 'world'}));
            const response = await client.jsonRequest(RequestMethod.DELETE, 'http://delete.json.example.com');
            expect(response).toStrictEqual({hello: 'world'});
            expect((http.request as any).mock.calls[0][0].headers['Content-Type']).toBe('application/json');
            expect((http.request as any).mock.calls[0][0].hostname).toBe('delete.json.example.com');
            expect((http.request as any).mock.calls[0][0].method).toBe('DELETE');
            expect((http.request as any).mock.calls[0][0].path).toBe('/');
            expect((http.request as any).mock.calls[0][0].port).toBe(80);
        });

        it('should throw an error when the request is unsuccessful', async () => {
            http.mockResponse(400, JSON.stringify({hello: 'world'}));
            try {
                await client.jsonRequest(RequestMethod.GET, 'http://error.example.com');
            } catch (error: any) {
                expect(error).toBeDefined();
                expect(error?.getStatusCode()).toBe(400);
                expect(error?.getBody()).toStrictEqual({hello: 'world'});
                expect((http.request as any).mock.calls[0][0].headers['Content-Type']).toBe('application/json');
                expect((http.request as any).mock.calls[0][0].hostname).toBe('error.example.com');
                expect((http.request as any).mock.calls[0][0].method).toBe('GET');
                expect((http.request as any).mock.calls[0][0].path).toBe('/');
                expect((http.request as any).mock.calls[0][0].port).toBe(80);
            }
        });

    });


    describe('textEntityRequest', () => {

        it('should return a GET response when the request is successful', async () => {
            http.mockResponse(200, 'Hello world');
            const response : ResponseEntity<any> = await client.textEntityRequest(RequestMethod.GET, 'http://get.test.entity.example.com');
            expect(response).toBeDefined();
            expect(response.getStatusCode()).toStrictEqual(200);
            expect(response.getBody()).toBe('Hello world');
            expect((http.request as any).mock.calls[0][0].headers['Content-Type']).toBe('text/plain');
            expect((http.request as any).mock.calls[0][0].hostname).toBe('get.test.entity.example.com');
            expect((http.request as any).mock.calls[0][0].method).toBe('GET');
            expect((http.request as any).mock.calls[0][0].path).toBe('/');
            expect((http.request as any).mock.calls[0][0].port).toBe(80);
        });

        it('should return a POST response when the request is successful', async () => {
            http.mockResponse(200, 'Hello world');
            const response = await client.textEntityRequest(RequestMethod.POST, 'http://post.test.entity.example.com');
            expect(response).toBeDefined();
            expect(response.getStatusCode()).toStrictEqual(200);
            expect(response.getBody()).toBe('Hello world');
            expect((http.request as any).mock.calls[0][0].headers['Content-Type']).toBe('text/plain');
            expect((http.request as any).mock.calls[0][0].hostname).toBe('post.test.entity.example.com');
            expect((http.request as any).mock.calls[0][0].method).toBe('POST');
            expect((http.request as any).mock.calls[0][0].path).toBe('/');
            expect((http.request as any).mock.calls[0][0].port).toBe(80);
        });

        it('should return a PUT response when the request is successful', async () => {
            http.mockResponse(200, 'Hello world');
            const response = await client.textEntityRequest(RequestMethod.PUT, 'http://put.test.entity.example.com');
            expect(response).toBeDefined();
            expect(response.getStatusCode()).toStrictEqual(200);
            expect(response.getBody()).toBe('Hello world');
            expect((http.request as any).mock.calls[0][0].headers['Content-Type']).toBe('text/plain');
            expect((http.request as any).mock.calls[0][0].hostname).toBe('put.test.entity.example.com');
            expect((http.request as any).mock.calls[0][0].method).toBe('PUT');
            expect((http.request as any).mock.calls[0][0].path).toBe('/');
            expect((http.request as any).mock.calls[0][0].port).toBe(80);
        });

        it('should return a DELETE response when the request is successful', async () => {
            http.mockResponse(200, 'Hello world');
            const response = await client.textEntityRequest(RequestMethod.DELETE, 'http://delete.test.entity.example.com');
            expect(response).toBeDefined();
            expect(response.getStatusCode()).toStrictEqual(200);
            expect(response.getBody()).toBe('Hello world');
            expect((http.request as any).mock.calls[0][0].headers['Content-Type']).toBe('text/plain');
            expect((http.request as any).mock.calls[0][0].hostname).toBe('delete.test.entity.example.com');
            expect((http.request as any).mock.calls[0][0].method).toBe('DELETE');
            expect((http.request as any).mock.calls[0][0].path).toBe('/');
            expect((http.request as any).mock.calls[0][0].port).toBe(80);
        });

        it('should throw an error when the request is unsuccessful', async () => {
            http.mockResponse(400, 'Hello world');
            try {
                await client.textEntityRequest(RequestMethod.GET, 'http://error.entity.example.com');
            } catch (error: any) {
                expect(error).toBeDefined();
                expect(error.getStatusCode()).toStrictEqual(400);
                expect(error.getBody()).toBe('Hello world');
                expect((http.request as any).mock.calls[0][0].headers['Content-Type']).toBe('text/plain');
                expect((http.request as any).mock.calls[0][0].hostname).toBe('error.entity.example.com');
                expect((http.request as any).mock.calls[0][0].method).toBe('GET');
                expect((http.request as any).mock.calls[0][0].path).toBe('/');
                expect((http.request as any).mock.calls[0][0].port).toBe(80);
            }
        });

    });

    describe('jsonEntityRequest', () => {

        it('should return a JSON GET response when the request is successful', async () => {
            http.mockResponse(200, JSON.stringify({hello: 'world'}));
            const response = await client.jsonEntityRequest(RequestMethod.GET, 'http://get.json.entity.example.com');
            expect(response).toBeDefined();
            expect(response.getStatusCode()).toStrictEqual(200);
            expect(response.getBody()).toStrictEqual({hello: 'world'});
            expect((http.request as any).mock.calls[0][0].headers['Content-Type']).toBe('application/json');
            expect((http.request as any).mock.calls[0][0].hostname).toBe('get.json.entity.example.com');
            expect((http.request as any).mock.calls[0][0].method).toBe('GET');
            expect((http.request as any).mock.calls[0][0].path).toBe('/');
            expect((http.request as any).mock.calls[0][0].port).toBe(80);
        });

        it('should return a JSON POST response when the request is successful', async () => {
            http.mockResponse(200, JSON.stringify({hello: 'world'}));
            const response = await client.jsonEntityRequest(RequestMethod.POST, 'http://post.json.entity.example.com');
            expect(response).toBeDefined();
            expect(response.getStatusCode()).toStrictEqual(200);
            expect(response.getBody()).toStrictEqual({hello: 'world'});
            expect((http.request as any).mock.calls[0][0].headers['Content-Type']).toBe('application/json');
            expect((http.request as any).mock.calls[0][0].hostname).toBe('post.json.entity.example.com');
            expect((http.request as any).mock.calls[0][0].method).toBe('POST');
            expect((http.request as any).mock.calls[0][0].path).toBe('/');
            expect((http.request as any).mock.calls[0][0].port).toBe(80);
        });

        it('should return a JSON PUT response when the request is successful', async () => {
            http.mockResponse(200, JSON.stringify({hello: 'world'}));
            const response = await client.jsonEntityRequest(RequestMethod.PUT, 'http://put.json.entity.example.com');
            expect(response).toBeDefined();
            expect(response.getStatusCode()).toStrictEqual(200);
            expect(response.getBody()).toStrictEqual({hello: 'world'});
            expect((http.request as any).mock.calls[0][0].headers['Content-Type']).toBe('application/json');
            expect((http.request as any).mock.calls[0][0].hostname).toBe('put.json.entity.example.com');
            expect((http.request as any).mock.calls[0][0].method).toBe('PUT');
            expect((http.request as any).mock.calls[0][0].path).toBe('/');
            expect((http.request as any).mock.calls[0][0].port).toBe(80);
        });

        it('should return a JSON DELETE response when the request is successful', async () => {
            http.mockResponse(200, JSON.stringify({hello: 'world'}));
            const response = await client.jsonEntityRequest(RequestMethod.DELETE, 'http://delete.json.entity.example.com');
            expect(response).toBeDefined();
            expect(response.getStatusCode()).toStrictEqual(200);
            expect(response.getBody()).toStrictEqual({hello: 'world'});
            expect((http.request as any).mock.calls[0][0].headers['Content-Type']).toBe('application/json');
            expect((http.request as any).mock.calls[0][0].hostname).toBe('delete.json.entity.example.com');
            expect((http.request as any).mock.calls[0][0].method).toBe('DELETE');
            expect((http.request as any).mock.calls[0][0].path).toBe('/');
            expect((http.request as any).mock.calls[0][0].port).toBe(80);
        });

        it('should throw an error when the request is unsuccessful', async () => {
            http.mockResponse(400, JSON.stringify({hello: 'world'}));
            try {
                await client.jsonEntityRequest(RequestMethod.GET, 'http://get.json.entity.error.example.com');
            } catch (error: any) {
                expect(error).toBeDefined();
                expect(error?.getStatusCode()).toBe(400);
                expect(error?.getBody()).toStrictEqual({hello: 'world'});
                expect((http.request as any).mock.calls[0][0].headers['Content-Type']).toBe('application/json');
                expect((http.request as any).mock.calls[0][0].hostname).toBe('get.json.entity.error.example.com');
                expect((http.request as any).mock.calls[0][0].method).toBe('GET');
                expect((http.request as any).mock.calls[0][0].path).toBe('/');
                expect((http.request as any).mock.calls[0][0].port).toBe(80);
            }
        });

    });

});
