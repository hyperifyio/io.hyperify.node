// Copyright (c) 2021. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { LogService } from "../../../../core/LogService";

const LOG = LogService.createLogger('HtmlManager');

/**
 *
 */
export class HtmlManager {

    private _htmlString : string;

    public constructor (htmlString : string) {
        this._htmlString = htmlString;
    }

    public replaceContentById (
        tag      : string,
        id       : string,
        content  : string
    ) : HtmlManager {
        return this._replaceStringIfExists(
            HtmlManager._createTag(tag, id),
            HtmlManager._createTag(tag, id, content)
        );
    }

    public setHtmlAttributes (htmlAttributesString: string) : HtmlManager {
        // noinspection HtmlRequiredLangAttribute
        this._replaceRegExpIfExists(/<html[^>]*>/, `<html ${htmlAttributesString}>`);
        return this;
    }

    public setBodyAttributes (htmlAttributesString: string) : HtmlManager {
        this._replaceRegExpIfExists(/<body[^>]*>/, `<body ${htmlAttributesString}>`);
        return this;
    }

    public setBase (baseString: string) : HtmlManager {
        return this._replaceRegExpOrAppendHead(/<base[^>]*>/, baseString);
    }

    public setTitle (titleString: string) : HtmlManager {
        return this._replaceRegExpOrAppendHead(/<title>.*<\/title>/, titleString);
    }

    public appendMeta (value: string) : HtmlManager {
        return this.appendToHead(value);
    }

    public appendLink (value: string) : HtmlManager {
        return this.appendToHead(value);
    }

    public appendStyle (value: string) : HtmlManager {
        return this.appendToHead(value);
    }

    public appendScript (value: string) : HtmlManager {
        return this.appendToBody(value);
    }

    public replaceNoScript (value: string) : HtmlManager {
        return this._replaceRegExpOrAppendBody(/<noscript[^>]*>.*<\/noscript>/, value);
    }

    public appendToHead (value: string) : HtmlManager {
        if (value) {
            return this._replaceStringIfExists('</head>', `${value}</head>`);
        }
        return this;
    }

    public appendToBody (value: string) : HtmlManager {
        if (value) {
            return this._replaceStringIfExists('</body>', `${value}</body>`);
        }
        return this;
    }

    public toString (): string {
        return this._htmlString;
    }

    private _replaceRegExpOrAppendHead (
        search   : RegExp,
        toString : string
    ) : HtmlManager {
        if (search.test(this._htmlString)) {
            this._htmlString = this._htmlString.replace(
                search,
                toString
            );
        } else {
            this.appendToHead(toString);
        }
        return this;
    }

    private _replaceRegExpOrAppendBody (
        search   : RegExp,
        toString : string
    ) : HtmlManager {
        if (search.test(this._htmlString)) {
            this._htmlString = this._htmlString.replace(
                search,
                toString
            );
        } else {
            this.appendToBody(toString);
        }
        return this;
    }

    private _replaceRegExpIfExists (
        search   : RegExp,
        toString : string
    ) : HtmlManager {
        if (search.test(this._htmlString)) {
            this._htmlString = this._htmlString.replace(
                search,
                toString
            );
        } else {
            LOG.warn(`Warning! Could not find regexp to modify: `, search);
        }
        return this;
    }

    private _replaceStringIfExists (
        search   : string,
        toString : string
    ) : HtmlManager {
        if (HtmlManager._hasString(search)) {
            this._htmlString = this._htmlString.replace(
                search,
                toString
            );
        } else {
            LOG.warn(`Warning! Could not find text to modify: `, search);
        }
        return this;
    }

    private static _hasString (value: string) : boolean {
        return value.indexOf(value) >= 0;
    }

    private static _createTag (tagName: string, idName: string, content?: string) {
        return `<${tagName} id="${idName}">${content ? content : ''}</${tagName}>`;
    }

}

export function isHtmlManager (value: any): value is HtmlManager {
    return value instanceof HtmlManager;
}


