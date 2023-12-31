// Copyright (c) 2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.
// Copyright (c) 2021. Sendanor <info@sendanor.fi>. All rights reserved.

import { PipelineRunner } from "./PipelineRunner";
import { JsonController } from "./controllers/step/json/JsonController";
import { CsvController } from "./controllers/step/csv/CsvController";
import { ScriptController } from "./controllers/step/script/ScriptController";
import { FileController } from "./controllers/step/file/FileController";
import { VariableController } from "./controllers/step/variable/VariableController";
import { GitController } from "./controllers/step/git/GitController";
import { AssertController } from "./controllers/step/assert/AssertController";
import { ConcatController } from "./controllers/step/concat/ConcatController";

export class PipelineDefaults {

    public static registerControllers () {
        PipelineRunner.registerController(ConcatController);
        PipelineRunner.registerController(AssertController);
        PipelineRunner.registerController(VariableController);
        PipelineRunner.registerController(GitController);
        PipelineRunner.registerController(FileController);
        PipelineRunner.registerController(JsonController);
        PipelineRunner.registerController(CsvController);
        PipelineRunner.registerController(ScriptController);
    }

}

export default PipelineDefaults;
