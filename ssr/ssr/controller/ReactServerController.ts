// Copyright (c) 2021-2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { resolve as pathResolve } from "path";
import { ResponseEntity } from "../../../../core/request/types/ResponseEntity";
import { HelmetContextServiceImpl } from "../../frontend/services/HelmetContextServiceImpl";
import { FileSystemService } from "../services/FileSystemService";
import { LogService } from "../../../../core/LogService";
import { StaticReactAppService } from "../services/StaticReactAppService";
import { HelmetServerState } from "react-helmet-async";
import { HtmlManager } from "../services/HtmlManager";
import { CacheService } from "../../../../core/CacheService";
import { Html5 } from "../../../../core/html/Html5";

const LOG = LogService.createLogger('ReactServerController');

export class ReactServerController {

    private static _createErrorPage () : string {
        return Html5.createDocument(
            'Internal Server Error',
            '<h3>Internal Server Error</h3>',
            'en'
        ).toString();
    }

    private static _createInternalServerResponse () : ResponseEntity<string> {
        return (
            ResponseEntity.internalServerError<string>()
                          .body(ReactServerController._createErrorPage())
                          .headers({
                              'Server': 'hg-ssr-server',
                              'Cache-Control' : 'no-cache',
                              'Content-Type': 'text/html',
                              'Date': new(Date)().toUTCString(),
                              'Last-Modified': new(Date)().toUTCString(),
                          })
        );
    }

    public static async handleReactRequest (
        url           : string,
        appDir        : string,
        App           : any,
        indexFileName : string = './index.html'
    ) : Promise<ResponseEntity<string>> {

        const indexFile = pathResolve(appDir, indexFileName);

        LOG.debug(`Reading static HTML file for "${url}"`);
        let htmlString : string = '';
        try {
            htmlString = await FileSystemService.readTextFile(indexFile);
        } catch (err) {
            LOG.error(`Could not read "${indexFile}" for "${url}":`, err);
            return this._createInternalServerResponse();
        }

        LOG.debug(`Clearing internal caches for "${url}"`);
        await CacheService.clearCaches();

        LOG.debug(`Rendering ReactJS app for "${url}"`);
        let bodyString : string = '';
        try {
            bodyString = ReactServerController._renderHtmlString(url, htmlString, App);
        } catch (err) {
            LOG.error(`Could not render "${url}":`, err);
            return this._createInternalServerResponse();
        }

        // // Waits for next stick so that we make sure there isn't HTTP requests triggered
        // LOG.debug(`Waiting a moment for internal HTTP requests for "${url}"`);
        // const [promise, cancelWait] = this._waitUntilMs(1);
        // await promise;
        //
        // if (HttpService.hasOpenRequests()) {
        //     LOG.debug(`Waiting for HttpService to load resources for "${url}"`);
        //     await HttpService.waitUntilNoOpenRequests();
        //     LOG.debug(`Re-rendering after HTTP requests for "${url}"`);
        //     try {
        //         bodyString = ReactServerController._renderHtmlString(url, htmlString, App);
        //     } catch (err) {
        //         LOG.error(`Could not render "${url}":`, err);
        //         return ResponseEntity.internalServerError<string>().body('Internal Server Error');
        //     }
        // } else {
        //     LOG.debug(`HttpService was not loading any resources for "${url}"`);
        // }

        return (
            ResponseEntity.ok<string>()
                          .body( bodyString )
                          .headers({
                              'Server': 'hg-ssr-server',
                              'Cache-Control': 'no-cache',
                              'Content-Type': 'text/html',
                              'Date': new(Date)().toUTCString(),
                              'Last-Modified': new(Date)().toUTCString(),
                          })
        );

    }

    private static _renderHtmlString (
        url: string,
        htmlString: string,
        App: any
    ) : string {

        const helmetContextService = HelmetContextServiceImpl.create();
        const helmetContext = helmetContextService.getContext();

        let appString : string | undefined;
        try {
            appString = StaticReactAppService.renderString(url, App, helmetContext);
        } catch (err) {
            LOG.error(`Error while rendering app: `, err);
        }

        const helmet : HelmetServerState | undefined = helmetContext?.helmet;
        const manager : HtmlManager = new HtmlManager(htmlString);
        if (!helmet) {
            LOG.debug(`helmetContext = `, helmetContext);
            LOG.debug(`helmet = `, helmet);
            LOG.warn(`Warning! No helmet state detected`);
        } else {
            manager.setHtmlAttributes(helmet.htmlAttributes.toString());
            manager.setBodyAttributes(helmet.bodyAttributes.toString());
            manager.setTitle(helmet.title.toString());
            manager.setBase(helmet.base.toString());
            manager.appendMeta(helmet.meta.toString());
            manager.appendLink(helmet.link.toString());
            manager.appendStyle(helmet.style.toString());
            manager.appendScript(helmet.script.toString());
            manager.replaceNoScript(helmet.noscript.toString());
        }
        if (appString) {
            manager.replaceContentById( 'div', 'root', appString );
        } else {
            LOG.warn(`Warning! No app rendered`);
        }
        return manager.toString();
    }

    // private static _waitUntilMs (time: number) : [Promise<void>, VoidCallback] {
    //     let rejectPromise : any | undefined = undefined;
    //     let timeout : any | undefined = undefined;
    //     const cancel : VoidCallback = () => {
    //         if (rejectPromise !== undefined) {
    //             rejectPromise('cancel');
    //             rejectPromise = undefined;
    //         }
    //         if (timeout !== undefined) {
    //             clearTimeout(timeout);
    //             timeout = undefined;
    //         }
    //     };
    //     const promise : Promise<void> = new Promise((resolve, reject) => {
    //         try {
    //             rejectPromise = reject;
    //             timeout = setTimeout(() => {
    //                 try {
    //
    //                     if (timeout) {
    //                         timeout = undefined;
    //                     }
    //
    //                     if (rejectPromise) {
    //                         rejectPromise = undefined;
    //                     }
    //
    //                     resolve();
    //
    //                 } catch (err) {
    //                     reject(err);
    //                     rejectPromise = undefined;
    //                 }
    //             }, time);
    //         } catch(err) {
    //             reject(err);
    //             rejectPromise = undefined;
    //         }
    //     });
    //     return [ promise, cancel ];
    // }

}
