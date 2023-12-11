// Copyright (c) 2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { StaticReactAppService } from "./StaticReactAppService";
import { LogLevel } from "../../../../core/types/LogLevel";

StaticReactAppService.setLogLevel(LogLevel.NONE);

describe("StaticReactAppService", () => {

    describe("renderString", () => {

        it("should render the static React app to a string", () => {
            const url = "/test";
            const App = () => <div>Test</div>;
            const expectedResult = "<div>Test</div>";
            const result = StaticReactAppService.renderString(url, App, {});
            expect(result).toBe(expectedResult);
        });

        it("should throw an error if the url parameter is not a string", () => {
            const url = 123; // This is not a string
            const App : any = () : any => <div>Test</div>;
            // @ts-ignore
            expect(() => StaticReactAppService.renderString(url, App)).toThrow(TypeError);
        });

    });

});
